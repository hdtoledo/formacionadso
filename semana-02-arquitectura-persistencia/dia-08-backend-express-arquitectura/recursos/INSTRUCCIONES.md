# Guía de Montaje en Aula · Sesión 08: Backend I (Arquitectura en Capas & Conexión Dual)
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Desarrollo Web Full Stack MERN

---

## 🎯 Objetivo de la Sesión
Construir desde cero el servidor backend en **Node.js/Express** bajo una **arquitectura en capas desacoplada**, configurando la **conexión dual simultánea** a PostgreSQL (`pg.Pool`) y MongoDB Atlas (`mongoose.connect`), implementando un endpoint de diagnóstico de salud (`GET /api/health`) con cálculo de latencias, un **manejo de errores con formato estándar**, y versionando el progreso en el **repositorio personal de GitHub** mediante 4 commits atómicos.

---

## 🏗️ 1. Estructura del Proyecto en su Repositorio Personal Git

Dentro de su repositorio `mi-proyecto-adso/`, cree el subárbol `server/`:

```powershell
# 1. Asegúrese de estar en la raíz de su repositorio
cd mi-proyecto-adso

# 2. Crear estructura modular del backend
# PowerShell (Windows):
New-Item -ItemType Directory -Force server/src/config, server/src/controllers, server/src/routes, server/src/middlewares
# Git Bash / Linux / macOS:
# mkdir -p server/src/{config,controllers,routes,middlewares}

# 3. Inicializar entorno Node.js en server/
cd server
npm init -y
```

El árbol resultante debe reflejar la separación limpia de responsabilidades:

```text
mi-proyecto-adso/
├── database/
│   ├── migrations/01_auth_schema.sql       (Día 06 - PostgreSQL)
│   ├── seeds/01_test_seed.sql              (Día 06 - PostgreSQL)
│   ├── nosql/01_content_seed.json          (Día 07 - MongoDB)
│   └── nosql/01_adso_polyglot_setup.js     (Día 07 - Script Setup)
└── server/                                 (Hoy - Sesión 08)
    ├── .env                                (Privado: NUNCA se sube a GitHub)
    ├── .env.example                        (Plantilla pública sin contraseñas)
    ├── .gitignore
    ├── package.json
    └── src/
        ├── app.js                          (Pipeline Express: CORS, JSON, rutas, errores)
        ├── server.js                       (Arranque HTTP & Graceful Shutdown)
        ├── config/
        │   ├── environment.js              (Variables con dotenv & validación fail-fast)
        │   └── db.js                       (Pool PostgreSQL + Singleton Mongoose)
        ├── controllers/
        │   └── healthController.js         (Diagnóstico dual de salud)
        ├── routes/
        │   └── healthRoutes.js             (Enrutador modular)
        └── middlewares/
            └── errorHandler.js             (404 + errores con formato estándar)
```

> Las carpetas `repositories/` (Sesión 09), `models/` (Sesión 10) y `services/` (Semana 3) se crean en la sesión en que se usan por primera vez.

---

## 📦 2. Dependencias y Configuración de `package.json`

En `server/package.json`, configure **ES Modules** (`"type": "module"`) y los scripts de ejecución:

```json
{
  "name": "adso-polyglot-backend",
  "version": "1.0.0",
  "description": "Backend API REST con persistencia políglota PostgreSQL y MongoDB Atlas - SENA ADSO CADPH",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "mongoose": "^8.7.0",
    "morgan": "^1.10.0",
    "pg": "^8.13.0"
  }
}
```

Instale las dependencias oficiales:

```powershell
npm install express pg mongoose dotenv cors morgan
```

---

## 🔐 3. Configuración de Variables de Entorno

Cree `server/.env.example` (este **sí** se sube a GitHub; nunca lleva contraseñas reales):

```env
PORT=3000
NODE_ENV=development

# Origen autorizado por CORS (frontend Vite + React de la Semana 4)
CLIENT_URL=http://localhost:5173

PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=adso_auth_db
PG_USER=postgres
PG_PASSWORD=<tu_contraseña_local>
PG_MAX_POOL=10
PG_IDLE_TIMEOUT=30000

MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/adso_polyglot_db?retryWrites=true&w=majority
```

Luego cópielo como `server/.env` y reemplace los valores `<...>` por sus credenciales reales:

```powershell
Copy-Item .env.example .env
```

Cree `server/.gitignore` **antes del primer commit**:

```text
node_modules/
.env
npm-debug.log*
.DS_Store
```

> **Fail-fast:** si falta alguna de `PG_HOST`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`, `MONGO_URI` o `CLIENT_URL`, el servidor se niega a arrancar y le indica cuál falta.

---

## 🧪 4. Endpoint de Salud (`GET /api/health`)

El endpoint verifica en paralelo ambos motores. Con todo funcionando responde **200 OK**:

```json
{
  "status": "healthy",
  "timestamp": "2026-11-05T17:00:00.000Z",
  "environment": "development",
  "services": {
    "api": { "status": "up", "uptime_seconds": 128 },
    "postgres": {
      "status": "healthy",
      "latency_ms": 3,
      "pool_stats": { "total_count": 1, "idle_count": 1, "waiting_count": 0 }
    },
    "mongodb": { "status": "healthy", "connection_state": "connected", "latency_ms": 84 }
  }
}
```

Si un motor falla responde **503** con `"status": "degraded"` (uno caído) o `"unhealthy"` (ambos caídos). El campo `error` muestra el detalle técnico **solo en desarrollo**; en producción muestra `"unavailable"` para no filtrar información interna.

Cualquier ruta inexistente responde con el **formato estándar de error** que usaremos en todo el proyecto:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "La ruta solicitada no existe en este servidor.",
  "code": "ROUTE_NOT_FOUND",
  "timestamp": "2026-11-05T17:00:00.000Z",
  "path": "/api/no-existe"
}
```

---

## 📦 5. Los 4 Commits Canónicos en GitHub Personal

Ejecute cada hito y confirme con la convención **Conventional Commits v1.0.0**:

```powershell
# Hito 1: Servidor base (package.json, environment.js, app.js, server.js, errorHandler.js)
git add server/
git commit -m "feat(server): inicializar express con esm y pipeline de middlewares"

# Hito 2: Pool de PostgreSQL en src/config/db.js
git add server/src/config/db.js
git commit -m "feat(db): configurar pool de conexion singleton a postgresql con pg"

# Hito 3: Singleton de Mongoose en src/config/db.js
git add server/src/config/db.js
git commit -m "feat(db): integrar singleton de mongoose para conexion a mongodb atlas"

# Hito 4: Endpoint de salud y cierre ordenado
git add server/
git commit -m "feat(health): implementar endpoint de salud dual con latencias y graceful shutdown"
git push -u origin main
```

Antes de cada `git commit`, ejecute `git status` y verifique que **`.env` no aparece** en la lista.

---

## 🛡️ 6. Sustentación Individual (Live Mod sin IA)

El instructor llamará a cada aprendiz frente a consola para validar autoría:
1. **Prueba 1:** Ejecutar `curl -i http://localhost:3000/api/health` y explicar la respuesta JSON de latencias.
2. **Prueba 2 (Resiliencia):** Cambiar `PG_PASSWORD` por un valor incorrecto o detener PostgreSQL y mostrar que el servidor responde **503** sin que el proceso de Node.js se caiga.
3. **Prueba 3 (Fail-fast):** Comentar `CLIENT_URL` en `.env` y explicar por qué el servidor no arranca.
4. **Prueba 4 (Auditoría Git):** Constatar en GitHub los 4 commits atómicos y que `.env` no está versionado.
