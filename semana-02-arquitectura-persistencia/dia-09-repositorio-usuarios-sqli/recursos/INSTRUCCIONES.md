# Guía de Montaje en Aula · Sesión 09: Patrón Repositorio & Cero Inyección SQL
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Desarrollo Web Full Stack MERN

---

## 🎯 Objetivo de la Sesión
Construir la capa de acceso a datos de usuarios (`UserRepository`) sobre el esquema PostgreSQL de la Sesión 06 y el servidor Express de la Sesión 08, usando **consultas parametrizadas** contra la inyección SQL, **transacciones** con un cliente dedicado del pool, traducción de errores del motor (`23505` → `409`) y una colección **Bruno** que incluye un ataque real de inyección.

**Requisitos:** Sesión 06 (tablas `users` y `verification_tokens` en `adso_auth_db`) y Sesión 08 (servidor en `server/` funcionando con `/api/health`).

---

## ✅ 0. Preparación: verifique la Sesión 08

Esta sesión **agrega** archivos al servidor de la Sesión 08; no lo reemplaza. Antes de escribir código compruebe:

| Archivo (Sesión 08) | Para qué lo usa la Sesión 09 |
|---|---|
| `server/.env` | `PG_DATABASE=adso_auth_db` y su contraseña real de PostgreSQL |
| `server/src/config/db.js` | Exporta el `pool` que importa el repositorio |
| `server/src/middlewares/errorHandler.js` | Exporta **`AppError`**, que usan el repositorio (409) y el controlador (400/404) |
| `server/src/app.js` | Donde se montan las rutas nuevas |

```powershell
cd server
npm run dev
# En otra terminal:
(Invoke-RestMethod http://localhost:3000/api/health).services.postgres.status   # → healthy
node --check src/middlewares/errorHandler.js
(Invoke-WebRequest http://localhost:3000/api/no-existe -SkipHttpErrorCheck).Content   # → "code":"ROUTE_NOT_FOUND"
```

> Si su `errorHandler.js` no contiene `export class AppError` (en la Sesión 08 se proyectó solo un extracto), cópielo completo desde la diapositiva **"errorHandler.js: la pieza que usa toda la sesión"** o desde el paquete **"Proyecto hasta la Sesión 08"** del portal. Sin ese archivo, el repositorio falla con `ERR_MODULE_NOT_FOUND`.

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

Cada diapositiva de live coding indica el **archivo**, la **acción** (CREAR, CONTINUAR o MODIFICAR) y **dónde** va el fragmento. Todos los comandos de validación se ejecutan desde la carpeta `server`.

```powershell
New-Item -ItemType Directory -Force src/repositories, src/utils
```

### Hito 1 · `server/src/repositories/UserRepository.js` (CREAR, en 4 partes)

| Parte | Contenido | Ubicación en el archivo |
|---|---|---|
| 1 | imports (`pool`, `AppError`), `PG_UNIQUE_VIOLATION`, `normalizeEmail`, `createUser` | Inicio |
| 2 | `findByEmail`, `findById` | Debajo de `createUser` |
| 3 | `verifyUser` (transacción) | Debajo de `findById` |
| 4 | `export const UserRepository = { createUser, findByEmail, findById, verifyUser };` | Última línea |

```powershell
node --check src/repositories/UserRepository.js
node --input-type=module -e "const { UserRepository } = await import('./src/repositories/UserRepository.js'); console.log(await UserRepository.findByEmail('ADMIN@sena.edu.co')); process.exit(0);"
# → objeto con email 'admin@sena.edu.co', role 'admin', is_verified true y SIN password_hash
git add src/repositories ; git commit -m "feat(repository): crear userrepository con consultas parametrizadas"
```

### Hito 2 · `server/src/middlewares/asyncHandler.js` y `server/src/utils/validators.js` (CREAR)

```powershell
node --check src/middlewares/asyncHandler.js
node --input-type=module -e "const v = await import('./src/utils/validators.js'); console.log(v.isValidEmail('ana@sena.edu.co'), v.isValidEmail(123), v.isUuid('123'));"
# → true false false
git add src/middlewares/asyncHandler.js src/utils ; git commit -m "feat(server): agregar asynchandler y validadores de entrada"
```

### Hito 3 · Capa HTTP

| Archivo | Acción | Detalle |
|---|---|---|
| `server/src/controllers/devUserController.js` | CREAR (2 partes) | Parte 1: imports, `DEV_PLACEHOLDER_HASH`, *helpers*, `createDevUser`, `getDevUserByEmail`. Parte 2: `getDevUserById`, `verifyDevUser` |
| `server/src/routes/devUserRoutes.js` | CREAR | `/by-email` **antes** de `/:id` |
| `server/src/app.js` | MODIFICAR | ① `import devUserRoutes from './routes/devUserRoutes.js';` debajo de `import healthRoutes …` ② bloque `if (!config.isProduction) { app.use('/api/dev/users', devUserRoutes); }` después de `/api/health` y **antes** de `notFoundHandler` |

```powershell
node --check src/controllers/devUserController.js
node --check src/routes/devUserRoutes.js
npm run dev
# En otra terminal:
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/dev/users -ContentType 'application/json' -Body '{"email":"Prueba.Uno@MiSena.edu.co"}'
# → success True · email prueba.uno@misena.edu.co · role user · is_verified False
(Invoke-WebRequest -Method Post -Uri http://localhost:3000/api/dev/users -ContentType 'application/json' -Body '{"email":"PRUEBA.UNO@misena.edu.co"}' -SkipHttpErrorCheck).Content
# → "statusCode":409 … "code":"EMAIL_ALREADY_EXISTS"
git add src ; git commit -m "feat(users): exponer rutas de laboratorio del repositorio en desarrollo"
```

**Errores frecuentes**

| Mensaje | Causa |
|---|---|
| `ERR_MODULE_NOT_FOUND … middlewares\errorHandler.js` | Falta `errorHandler.js` de la Sesión 08 (ver sección 0) |
| `does not provide an export named 'UserRepository'` | Falta la Parte 4 del repositorio |
| `"code":"ROUTE_NOT_FOUND"` en `/api/dev/users` | El bloque de rutas quedó después de `notFoundHandler` en `app.js` |
| `password authentication failed` | `PG_PASSWORD` incorrecto en `server/.env` |

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
