// Generado por tools/build-downloads.mjs — no editar a mano.
// Paquetes de código del proyecto transversal por sesión (solo la sesión y proyecto acumulado).
window.ADSO_DOWNLOADS = [
  {
    "id": "s06",
    "num": "06",
    "week": 2,
    "title": "Base de datos relacional en PostgreSQL",
    "summary": "Tablas users y verification_tokens con UUID, token_hash SHA-256, trigger updated_at, índice de la llave foránea y semilla con hashes bcrypt reales.",
    "icon": "database",
    "lesson": "semana-02-arquitectura-persistencia/dia-06-postgresql-relacional/index.html",
    "added": [
      "database/migrations/01_auth_schema.sql",
      "database/seeds/01_test_seed.sql"
    ],
    "changed": [],
    "session": {
      "href": "semana-02-arquitectura-persistencia/dia-06-postgresql-relacional/codigo-sesion-06.zip",
      "bytes": 6529,
      "files": 3
    },
    "project": {
      "href": "semana-02-arquitectura-persistencia/dia-06-postgresql-relacional/proyecto-hasta-sesion-06.zip",
      "bytes": 6572,
      "files": 3
    }
  },
  {
    "id": "s07",
    "num": "07",
    "week": 2,
    "title": "Base de datos NoSQL en MongoDB",
    "summary": "Colección polimórfica contents (banners, servicios, testimonios y métricas) con validador, 5 índices y semilla en Extended JSON.",
    "icon": "leaf",
    "lesson": "semana-02-arquitectura-persistencia/dia-07-mongodb-nosql/index.html",
    "added": [
      "database/nosql/01_content_seed.json",
      "database/nosql/01_adso_polyglot_setup.js"
    ],
    "changed": [],
    "session": {
      "href": "semana-02-arquitectura-persistencia/dia-07-mongodb-nosql/codigo-sesion-07.zip",
      "bytes": 10854,
      "files": 3
    },
    "project": {
      "href": "semana-02-arquitectura-persistencia/dia-07-mongodb-nosql/proyecto-hasta-sesion-07.zip",
      "bytes": 16674,
      "files": 6
    }
  },
  {
    "id": "s08",
    "num": "08",
    "week": 2,
    "title": "Backend Express en capas con conexión dual",
    "summary": "Servidor Express (ES Modules) con pool de PostgreSQL, singleton de Mongoose, variables fail-fast, CORS con CLIENT_URL, errores estándar y GET /api/health.",
    "icon": "server",
    "lesson": "semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/index.html",
    "added": [
      "server/.env.example",
      "server/.gitignore",
      "server/package.json",
      "server/src/app.js",
      "server/src/config/db.js",
      "server/src/config/environment.js",
      "server/src/controllers/healthController.js",
      "server/src/middlewares/errorHandler.js",
      "server/src/routes/healthRoutes.js",
      "server/src/server.js"
    ],
    "changed": [],
    "session": {
      "href": "semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/codigo-sesion-08.zip",
      "bytes": 14341,
      "files": 11
    },
    "project": {
      "href": "semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/proyecto-hasta-sesion-08.zip",
      "bytes": 30362,
      "files": 17
    }
  },
  {
    "id": "s09",
    "num": "09",
    "week": 2,
    "title": "UserRepository y prevención de inyección SQL",
    "summary": "Repositorio con consultas parametrizadas, transacción de verificación, rutas de laboratorio /api/dev/users, migración 02 y colección Bruno de 11 casos.",
    "icon": "shield-check",
    "lesson": "semana-02-arquitectura-persistencia/dia-09-repositorio-usuarios-sqli/index.html",
    "added": [
      "database/migrations/02_hardening_auth_schema.sql",
      "database/seeds/02_fix_seed_credentials.sql",
      "database/seeds/99_reset_pruebas_sesion_09.sql",
      "server/bruno/01 - Health Check.bru",
      "server/bruno/02 - Crear Usuario (201 Created).bru",
      "server/bruno/03 - Crear Duplicado en Mayúsculas (409 Conflict).bru",
      "server/bruno/04 - Asignación Masiva de Rol (role ignorado).bru",
      "server/bruno/05 - Correo Inválido (400 Bad Request).bru",
      "server/bruno/06 - Buscar por Email (200 OK).bru",
      "server/bruno/07 - Inyección SQL en Email (404 Not Found).bru",
      "server/bruno/08 - Buscar por ID Inválido (400 Bad Request).bru",
      "server/bruno/09 - Buscar por ID (200 OK).bru",
      "server/bruno/10 - Verificar Cuenta (200 OK · Transacción).bru",
      "server/bruno/11 - Re-verificar Cuenta (409 Conflict).bru",
      "server/bruno/bruno.json",
      "server/bruno/environments/Local.bru",
      "server/src/controllers/devUserController.js",
      "server/src/middlewares/asyncHandler.js",
      "server/src/repositories/UserRepository.js",
      "server/src/routes/devUserRoutes.js",
      "server/src/utils/validators.js"
    ],
    "changed": [
      "server/src/app.js"
    ],
    "session": {
      "href": "semana-02-arquitectura-persistencia/dia-09-repositorio-usuarios-sqli/codigo-sesion-09.zip",
      "bytes": 22940,
      "files": 23
    },
    "project": {
      "href": "semana-02-arquitectura-persistencia/dia-09-repositorio-usuarios-sqli/proyecto-hasta-sesion-09.zip",
      "bytes": 51707,
      "files": 39
    }
  },
  {
    "id": "s10",
    "num": "10",
    "week": 2,
    "title": "Mongoose y CRUD del catálogo",
    "summary": "Modelo Content con discriminators, GET /api/content/published, CRUD de laboratorio con campos protegidos, defensa contra inyección NoSQL y colección Bruno de 12 casos.",
    "icon": "shapes",
    "lesson": "semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/index.html",
    "added": [
      "server/bruno-catalogo/01 - Contenidos Publicados (200 OK).bru",
      "server/bruno-catalogo/02 - Publicados por Tipo (200 OK).bru",
      "server/bruno-catalogo/03 - Inyección NoSQL en Tipo (400 Bad Request).bru",
      "server/bruno-catalogo/04 - Límite Fuera de Rango (400 Bad Request).bru",
      "server/bruno-catalogo/05 - Crear Servicio en Borrador (201 Created).bru",
      "server/bruno-catalogo/06 - Banner con Enlace JavaScript Malicioso (400 Bad Request).bru",
      "server/bruno-catalogo/07 - Código de Servicio Duplicado (409 Conflict).bru",
      "server/bruno-catalogo/08 - Listado Admin de Borradores (200 OK).bru",
      "server/bruno-catalogo/09 - Publicar Contenido (200 OK).bru",
      "server/bruno-catalogo/10 - Cambiar Tipo (422 Unprocessable Entity).bru",
      "server/bruno-catalogo/11 - Eliminar Contenido (204 No Content).bru",
      "server/bruno-catalogo/12 - Eliminar de Nuevo (404 Not Found).bru",
      "server/bruno-catalogo/bruno.json",
      "server/bruno-catalogo/environments/Local.bru",
      "server/src/controllers/contentController.js",
      "server/src/models/Content.js",
      "server/src/routes/contentRoutes.js",
      "server/src/routes/devContentRoutes.js"
    ],
    "changed": [
      "server/src/app.js",
      "server/src/config/db.js",
      "server/src/middlewares/errorHandler.js",
      "server/src/utils/validators.js"
    ],
    "session": {
      "href": "semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/codigo-sesion-10.zip",
      "bytes": 26918,
      "files": 23
    },
    "project": {
      "href": "semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/proyecto-hasta-sesion-10.zip",
      "bytes": 73275,
      "files": 58
    }
  }
];
