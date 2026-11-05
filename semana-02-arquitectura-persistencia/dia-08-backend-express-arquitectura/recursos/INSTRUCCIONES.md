# Guía de Montaje en Aula · Sesión 08: Backend I (Arquitectura en Capas & Conexión Dual)
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Nivelación Técnica

---

## 🎯 Objetivo de la Sesión
Construir desde cero el servidor backend en **Node.js/Express** bajo una **arquitectura en capas desacoplada**, configurando la **conexión dual simultánea** a PostgreSQL (`pg.Pool`) y MongoDB Atlas (`mongoose.connect`), implementando un endpoint de diagnóstico de salud (`GET /api/health`) con cálculo de latencias, y versionando el progreso en el **repositorio personal de GitHub** mediante 4 commits atómicos.

---

## 🏗️ 1. Estructura del Proyecto en su Repositorio Personal Git

Dentro de su repositorio `mi-proyecto-adso/`, cree el subárbol `server/`:

```bash
# 1. Asegúrese de estar en la raíz de su repositorio
cd mi-proyecto-adso

# 2. Crear estructura modular del backend
mkdir -p server/src/{config,controllers,routes,services,models,middlewares}

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
│   ├── nosql/01_content_seed.json          (Día 07 - MongoDB BSON)
│   └── nosql/01_adso_polyglot_setup.js     (Día 07 - Script Setup)
└── server/                                 (Hoy - Sesión 08)
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── src/
        ├── app.js                          (Configuración Express & Middlewares)
        ├── server.js                       (Arranque HTTP & Graceful Shutdown)
        ├── config/
        │   ├── environment.js              (Variables con dotenv & validación)
        │   └── db.js                       (Pool PostgreSQL + Singleton Mongoose)
        ├── controllers/
        │   └── healthController.js         (Controlador de estado de salud)
        ├── routes/
        │   └── healthRoutes.js             (Enrutador modular)
        ├── middlewares/                    (Middlewares de error y seguridad)
        ├── services/                       (Lógica de negocio)
        └── models/                         (Modelos de datos - Días 09 y 10)
```

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
  "keywords": ["sena", "adso", "express", "postgresql", "mongodb", "polyglot"],
  "author": "Aprendiz ADSO - CADPH Garzón",
  "license": "ISC",
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

```bash
npm install express pg mongoose dotenv cors morgan
```

---

## 🔐 3. Configuración de Variables de Entorno (`.env`)

Cree el archivo `server/.env` con sus credenciales reales locales y de Atlas:

```env
# Puerto del Servidor Express
PORT=3000
NODE_ENV=development

# Conexión PostgreSQL (Base de Datos Relacional - Día 06)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=adso_polyglot_db
PG_USER=postgres
PG_PASSWORD=postgres
PG_MAX_POOL=10
PG_IDLE_TIMEOUT=30000

# Conexión MongoDB Atlas (Base de Datos NoSQL - Día 07)
MONGO_URI=mongodb+srv://adso_user:Secret2026@cluster0.abcde.mongodb.net/adso_polyglot_db?retryWrites=true&w=majority
```

Cree también `server/.env.example` (plantilla sin contraseñas para GitHub):

```env
PORT=3000
NODE_ENV=development
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=adso_polyglot_db
PG_USER=postgres
PG_PASSWORD=tu_contraseña_aqui
PG_MAX_POOL=10
PG_IDLE_TIMEOUT=30000
MONGO_URI=mongodb+srv://usuario:password@cluster0.abcde.mongodb.net/adso_polyglot_db?retryWrites=true&w=majority
```

Cree `server/.gitignore`:
```text
node_modules/
.env
npm-debug.log*
.DS_Store
```

---

## 🧪 4. Endpoint de Salud (`GET /api/health`)

El endpoint debe verificar en vivo la conectividad hacia ambos motores y retornar:

```json
{
  "status": "healthy",
  "timestamp": "2026-11-05T21:40:00.000Z",
  "uptime": "124.5s",
  "services": {
    "server": { "status": "online", "port": 3000 },
    "postgresql": {
      "status": "connected",
      "latency": "14ms",
      "activeConnections": 1
    },
    "mongodb": {
      "status": "connected",
      "readyState": 1,
      "latency": "42ms"
    }
  }
}
```

---

## 📦 5. Los 4 Commits Canónicos en GitHub Personal

Ejecute cada hito y confirme con la convención **Conventional Commits v1.0.0**:

```bash
# Hito 1: Scaffolding Express y estructura en capas
git add server/
git commit -m "feat(server): scaffolding express arquitectura en capas y variables dotenv"

# Hito 2: Pool de PostgreSQL
git commit -m "feat(db): configuracion de pool concurrente pg.Pool para postgresql"

# Hito 3: Conexión Mongoose a MongoDB Atlas
git commit -m "feat(db): conexion singleton mongoose y eventos de estado"

# Hito 4: Endpoint de diagnóstico de salud y pruebas
git commit -m "feat(health): endpoint /api/health con diagnostico dual de latencias"
git push -u origin main
```

---

## 🛡️ 6. Sustentación Individual (Live Mod sin IA)

El instructor llamará a cada aprendiz frente a consola para validar autoría:
1. **Prueba 1:** Ejecutar `curl -i http://localhost:3000/api/health` y explicar la respuesta JSON de latencias.
2. **Prueba 2 (Resiliencia):** Detener temporalmente el servicio de PostgreSQL o desconectar Internet y mostrar que el servidor maneja el error con código HTTP 503 sin que el proceso de Node.js se caiga.
3. **Prueba 3 (Auditoría Git):** Constatar en el repositorio de GitHub los 4 commits atómicos de la Sesión 08.
