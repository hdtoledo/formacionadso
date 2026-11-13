# Guía de Montaje en Aula · Sesión 09: Patrón Repositorio & Cero Inyección SQL
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Desarrollo Web Full Stack MERN

---

## 🎯 Objetivo de la Sesión
Construir la capa de acceso a datos de usuarios (`UserRepository`) sobre el esquema PostgreSQL de la Sesión 06 y el servidor Express de la Sesión 08, usando **consultas parametrizadas** contra la inyección SQL, **transacciones** con un cliente dedicado del pool, traducción de errores del motor (`23505` → `409`) y una colección **Bruno** que incluye un ataque real de inyección.

**Requisitos:** Sesión 06 (tablas `users` y `verification_tokens` en `adso_auth_db`) y Sesión 08 (servidor en `server/` funcionando con `/api/health`).

---

## 🏗️ 1. Archivos que se agregan hoy

```text
mi-proyecto-adso/
├── database/
│   ├── migrations/02_hardening_auth_schema.sql   (Hito 0)
│   └── seeds/
│       ├── 02_fix_seed_credentials.sql           (Hito 0)
│       └── 99_reset_pruebas_sesion_09.sql        (Hito 4: repetir pruebas)
└── server/
    ├── bruno/                                    (Hito 4: 11 peticiones)
    └── src/
        ├── repositories/UserRepository.js        (Hito 1)
        ├── middlewares/asyncHandler.js           (Hito 2)
        ├── utils/validators.js                   (Hito 2)
        ├── controllers/devUserController.js      (Hito 3)
        ├── routes/devUserRoutes.js               (Hito 3)
        └── app.js                                (Hito 3: se modifica)
```

No se instalan dependencias nuevas.

---

## 🛠️ 2. Hito 0 · Migración del esquema (solo si aplica)

Hágalo **solo si su base se creó antes de la corrección de la Sesión 06**, es decir, si su tabla `verification_tokens` tiene la columna `token` en lugar de `token_hash`. Para comprobarlo:

```powershell
psql -U postgres -d adso_auth_db -c "\d verification_tokens"
```

La migración es idempotente: ejecutarla dos veces no causa errores.

```powershell
psql -U postgres -d adso_auth_db -f database/migrations/02_hardening_auth_schema.sql
psql -U postgres -d adso_auth_db -f database/seeds/02_fix_seed_credentials.sql
git add database/
git commit -m "fix(db): migrar tokens a sha-256 y endurecer esquema de usuarios"
```

Qué cambia:
- `token` pasa a ser `token_hash CHAR(64)` (SHA-256). Los tokens antiguos se invalidan.
- Se eliminan los índices duplicados de `UNIQUE` y se garantiza `idx_tokens_user_id`.
- Correos en minúsculas con `chk_users_email_lower`, y trigger `updated_at`.
- La semilla recibe hashes bcrypt reales: `Admin2026*` y `Aprendiz2026*` (solo para desarrollo).

---

## 🧩 3. Hitos 1 a 3 · Repositorio y capa HTTP

Escriba cada archivo siguiendo el live coding del instructor (el código completo está en el visor de la diapositiva 20).

```powershell
New-Item -ItemType Directory -Force server/src/repositories, server/src/utils

# Hito 1
git add server/src/repositories
git commit -m "feat(repository): crear userrepository con consultas parametrizadas"

# Hito 2
git add server/src/middlewares/asyncHandler.js server/src/utils
git commit -m "feat(server): agregar asynchandler y validadores de entrada"

# Hito 3
git add server/src
git commit -m "feat(users): exponer rutas de laboratorio del repositorio en desarrollo"
```

Reglas que se revisan en la sustentación:
1. **Ningún valor externo se concatena en el SQL**, ni con `+` ni con template literals: siempre `$1, $2…`.
2. **Nunca `SELECT *`**: `password_hash` no debe salir del repositorio.
3. **Transacciones con `pool.connect()`**: `BEGIN`, `COMMIT`, `ROLLBACK` en el `catch` y `client.release()` en el `finally`.
4. **El rol nunca se toma del `req.body`** (asignación masiva).
5. Las rutas `/api/dev/users` solo se montan si `NODE_ENV` no es `production`.

---

## 🧪 4. Hito 4 · Pruebas con Bruno

1. Abra Bruno → **Open Collection** → seleccione `server/bruno/`.
2. Elija el entorno **Local** (`baseUrl = http://localhost:3000`).
3. Ejecute **Run Collection**: las 11 pruebas deben quedar en verde.

| # | Petición | Esperado |
|---|---|---|
| 01 | Health Check | 200 · PostgreSQL `healthy` |
| 02 | Crear usuario | 201 · correo en minúsculas |
| 03 | Duplicado en mayúsculas | 409 `EMAIL_ALREADY_EXISTS` |
| 04 | Asignación masiva de rol | 201 · `role: "user"` |
| 05 | Correo inválido | 400 `VALIDATION_ERROR` |
| 06 | Buscar por email | 200 |
| 07 | Inyección SQL en email | 404 `USER_NOT_FOUND` |
| 08 | ID inválido | 400 `INVALID_ID` |
| 09 | Buscar por ID | 200 |
| 10 | Verificar cuenta | 200 · token eliminado |
| 11 | Re-verificar cuenta | 409 `USER_ALREADY_VERIFIED` |

Para repetir la colección desde cero:

```powershell
psql -U postgres -d adso_auth_db -f database/seeds/99_reset_pruebas_sesion_09.sql
```

```powershell
git add server/bruno database/seeds/99_reset_pruebas_sesion_09.sql
git commit -m "test(api): coleccion bruno con casos de sqli y unique violation"
git push
```

---

## 🛡️ 5. Sustentación Individual (Live Mod sin IA)

**Rúbrica:** Repositorio 30% · Transacción 25% · Bruno 20% · Live Mod y Git 25%.

**Preguntas:**
1. ¿Por qué `' OR '1'='1' --` devuelve 404 en su API? Explique parse, bind y execute.
2. ¿Qué pasaría si en `verifyUser` usara `pool.query('BEGIN')` y olvidara `release()`?
3. ¿Por qué el controlador no toma `role` del body? ¿Qué vulnerabilidad evita?

**Reto en caliente:** agregue al repositorio `countByVerification()`, que devuelva `{ verified, pending }` con **una sola consulta** (`COUNT(*) FILTER (WHERE …)`), y expóngalo en `GET /api/dev/users/stats`, declarada **antes** de `/:id`.
