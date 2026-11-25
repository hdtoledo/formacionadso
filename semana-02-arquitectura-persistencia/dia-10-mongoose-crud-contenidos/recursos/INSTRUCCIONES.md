# Guía de Montaje en Aula · Sesión 10: Mongoose & CRUD del Catálogo
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Desarrollo Web Full Stack MERN

---

## 🎯 Objetivo de la Sesión
Cerrar la Semana 2 conectando la colección `contents` (Sesión 07) al backend con **Mongoose**: modelo con **discriminators** por `type`, ruta pública `GET /api/content/published` para la Landing Page, CRUD de laboratorio con campos protegidos y defensa contra la **inyección NoSQL**.

**Requisitos:** Sesión 07 (colección `contents` con el seed importado en **Extended JSON**) y Sesiones 08 y 09 (servidor con `asyncHandler`, `AppError` y rutas `/api/dev`).

> Si importó el seed antes de la corrección de la Sesión 07, sus fechas quedaron como texto. Vuelva a importar `01_content_seed.json` (versión con `{ "$date": ... }`) o ejecute de nuevo `01_adso_polyglot_setup.js`.

---

## ✅ 0. Preparación

| Necesita | Viene de | Cómo comprobarlo |
|---|---|---|
| Colección `contents` con 10 documentos y 5 índices | S07 | Compass → `adso_polyglot_db.contents` → pestaña *Indexes* |
| `MONGO_URI` terminada en `/adso_polyglot_db` | S08 | `server/.env` |
| Mongoose instalado y conexión dual | S08 | `server/src/config/db.js` |
| `AppError`, `asyncHandler` y rutas de laboratorio | S08 · S09 | `server/src/middlewares/` y `server/src/app.js` |

Se trabaja con **dos terminales, ambas en la carpeta `server`**: la 1 solo ejecuta `npm run dev`; la 2, validaciones y `git`.

```powershell
# Terminal 1 · server
npm run dev
# Terminal 2 · server
(Invoke-RestMethod http://localhost:3000/api/health).services   # postgres y mongodb → healthy
```

En la terminal **_MONGOSH** de Compass: `db.contents.countDocuments()` → `10`. Si no da 10, vuelva a ejecutar `database/nosql/01_adso_polyglot_setup.js` de la Sesión 07 (borra y recrea la colección con su semilla).

No se instalan dependencias nuevas (Mongoose viene de la Sesión 08).

---

## 🏗️ 1. Archivos de la sesión

```text
server/
├── bruno-catalogo/                       (Hito 5: 12 peticiones)
└── src/
    ├── models/Content.js                 (Hito 1: CREAR, en 3 partes)
    ├── config/db.js                      (Hito 2: MODIFICAR)
    ├── middlewares/errorHandler.js       (Hito 2: MODIFICAR)
    ├── utils/validators.js               (Hito 3: MODIFICAR)
    ├── controllers/contentController.js  (Hito 3: CREAR, en 3 partes)
    ├── routes/contentRoutes.js           (Hito 4: CREAR · público)
    ├── routes/devContentRoutes.js        (Hito 4: CREAR · laboratorio)
    └── app.js                            (Hito 4: MODIFICAR)
```

---

## 🧩 2. Hitos paso a paso

Todos los comandos se ejecutan en la **Terminal 2, carpeta `server`**.

### Hito 1 · `src/models/Content.js` (CREAR, en 3 partes)

```powershell
New-Item -ItemType Directory -Force src/models
```

| Parte | Contenido | Ubicación en el archivo |
|---|---|---|
| 1 | imports, `CONTENT_TYPES`, `CONTENT_CATEGORIES`, `HTTPS_URL`, `SAFE_LINK`, `ContentSchema`, sus 5 índices y `export const Content = mongoose.model(...)` | Inicio |
| 2 | discriminators `banner` y `service` | Debajo de `mongoose.model(...)` |
| 3 | discriminators `testimonial`, `stat` y `event` | Al final |

```powershell
node --input-type=module -e "import mongoose from 'mongoose'; import { config } from './src/config/environment.js'; const { Content } = await import('./src/models/Content.js'); await mongoose.connect(config.mongo.uri); console.log(Object.keys(Content.discriminators), await Content.countDocuments()); await mongoose.disconnect();"
# → [ 'banner', 'service', 'testimonial', 'stat', 'event' ] 10
git add src/models ; git commit -m "feat(models): modelo content con discriminators por tipo"
```

### Hito 2 · Blindaje: `src/config/db.js` y `src/middlewares/errorHandler.js` (MODIFICAR)

- **`db.js`**: agregue `mongoose.set('sanitizeFilter', true)` y `mongoose.set('strictQuery', true)` con su comentario **debajo de `const { Pool } = pg;`** y antes de `// 1. Singleton pg.Pool`.
- **`errorHandler.js`**: ① agregue la función `fromMongooseError(err)` **debajo de `notFoundHandler`**; ② en `errorHandler`, **reemplace** el bloque `if (err instanceof AppError) { … }` por `const appError = err instanceof AppError ? err : fromMongooseError(err); if (appError) { … }`.

```powershell
node --input-type=module -e "const { mongoose } = await import('./src/config/db.js'); console.log(mongoose.get('sanitizeFilter'), mongoose.get('strictQuery')); process.exit(0);"
# → true true
node --check src/middlewares/errorHandler.js
git add src/config/db.js src/middlewares/errorHandler.js ; git commit -m "feat(server): sanitizefilter y traduccion de errores de mongoose"
```

### Hito 3 · `src/utils/validators.js` (MODIFICAR) y `src/controllers/contentController.js` (CREAR, en 3 partes)

- **`validators.js`**: ① `import { AppError } from '../middlewares/errorHandler.js';` al inicio; ② `OBJECT_ID_REGEX` junto a las otras expresiones e `isObjectId` debajo de `isUuid`; ③ `parseLimit` al final.

| Parte del controlador | Contenido | Ubicación |
|---|---|---|
| 1 | imports, `PROTECTED_FIELDS`, `pickEditable`, `assertContentType`, `invalidId`, `contentNotFound` | Inicio |
| 2 | `getPublishedContents` y `listContents` | Debajo de `contentNotFound` |
| 3 | `createContent`, `updateContent` y `deleteContent` | Al final |

```powershell
node --input-type=module -e "const v = await import('./src/utils/validators.js'); console.log(v.isObjectId('6710a1b2c3d4e5f6a7b8c9d0'), v.isObjectId('123'), v.parseLimit(undefined)); try { v.parseLimit('500') } catch (e) { console.log(e.statusCode, e.fieldErrors) }"
# → true false 20
# → 400 { limit: 'Debe ser un número entero entre 1 y 50.' }
node --input-type=module -e "const c = await import('./src/controllers/contentController.js'); console.log(Object.keys(c)); process.exit(0);"
# → createContent, deleteContent, getPublishedContents, listContents, updateContent
git add src/utils/validators.js src/controllers/contentController.js ; git commit -m "feat(content): controlador crud con campos protegidos y limite"
```

### Hito 4 · Rutas (CREAR) y `src/app.js` (MODIFICAR)

- **`app.js`**: ① import de `contentRoutes` debajo de `healthRoutes` e import de `devContentRoutes` debajo de `devUserRoutes`; ② `app.use('/api/content', contentRoutes)` **fuera** del `if` (es pública) y `app.use('/api/dev/content', devContentRoutes)` **dentro** de `if (!config.isProduction)`.

```powershell
node --check src/routes/contentRoutes.js
node --check src/routes/devContentRoutes.js
(Invoke-RestMethod http://localhost:3000/api/content/published).meta
# → count 10 · limit 20
(Invoke-WebRequest 'http://localhost:3000/api/content/published?type[$ne]=banner' -SkipHttpErrorCheck).Content
# → 400 "VALIDATION_ERROR" con fieldErrors.type   (comillas simples: con dobles, PowerShell trata $ne como variable)
git add src/routes/contentRoutes.js src/routes/devContentRoutes.js src/app.js ; git commit -m "feat(content): ruta publica published y crud de laboratorio"
```

**Errores frecuentes**

| Mensaje | Causa |
|---|---|
| `Index already exists with a different name` | Un nombre de índice de `Content.js` no coincide con el de la Sesión 07 |
| `MongooseServerSelectionError` | `MONGO_URI` incorrecta o su IP no está en la *Access List* de Atlas |
| `"code":"ROUTE_NOT_FOUND"` en `/api/content/published` | Falta montar `contentRoutes` en `app.js` o quedó después de `notFoundHandler` |
| La inyección devuelve 200 con datos | Falta `assertContentType` en el controlador **y** `sanitizeFilter` en `db.js` |

Reglas que se revisan en la sustentación:
1. **Mismos nombres de índice** que el script de la Sesión 07 (`idx_active_priority`, `idx_type_active`, `idx_unique_service_code`, `idx_category`, `idx_fulltext_search`).
2. **Por defecto, todo contenido nuevo nace como borrador** (`active: false`).
3. **El tipo se valida como texto contra la lista blanca** antes de usarlo en un filtro, y `sanitizeFilter` está activo en `db.js`.
4. **El cliente no escribe** `_id`, `type` (en actualizaciones), `createdAt`, `updatedAt`, `views` ni llaves de primer nivel que empiecen por `$`. El campo libre `metadata` nunca se usa como filtro (en la Semana 7, Zod lo validará completo).
5. **Todo listado tiene límite** (máximo 50).
6. Las rutas `/api/dev/content` solo se montan si `NODE_ENV` no es `production`.
7. **`ctaUrl` solo acepta `https://` o rutas internas**: `javascript:` y `//otro-dominio.com` se rechazan.

---

## 🧪 3. Hito 5 · Pruebas con Bruno

### 3.1 Crear la colección

1. Bruno → **Create Collection**. *Name:* `ADSO Backend - Sesión 10 Catálogo MongoDB` · *Location:* `mi-proyecto-adso\server` · *Folder Name:* `bruno-catalogo`.
2. **Settings → Environments → Create** → `Local` con `baseUrl = http://localhost:3000` → **Save**.
3. **Seleccione el entorno `Local`** en la esquina superior derecha.
4. Por cada caso: clic derecho en la colección → **New Request** → nombre, método y URL; **Body → JSON** si envía datos; aserciones en **Tests**.
5. En la 05, pestaña **Script → Post Response**: `if (res.status === 201) bru.setVar("contentId", res.body.data._id);`. La petición 08 lo verifica en **Tests** (`bru.getVar("contentId")`) y las peticiones 09 a 12 usan `{{contentId}}` en la URL; el `if` evita guardar un valor inválido si la creación falla.

### 3.2 Qué envía y qué debe responder cada caso

Todas las URL empiezan por `{{baseUrl}}`. Los conteos corresponden a la semilla de la Sesión 07 (10 documentos publicados).

| # | Envía | Debe responder | Demuestra |
|---|---|---|---|
| 01 | `GET /api/content/published` | 200 · solo `active: true` · `meta: { count: 10, limit: 20 }` | Filtro de publicados y límite por defecto |
| 02 | `GET /api/content/published?type=service` | 200 · solo `type: "service"` (4) | Filtro por discriminator con lista blanca |
| 03 | `GET /api/content/published?type[$ne]=banner` | 400 · `VALIDATION_ERROR`, `fieldErrors.type`, sin `data` | Sin validación devolvería los 8 que no son banners |
| 04 | `GET /api/content/published?limit=500` | 400 · `fieldErrors.limit` | `parseLimit` acepta de 1 a 50 |
| 05 | `POST /api/dev/content` · servicio `SRV-DATA-05` con `"views": 999999` | 201 · `type: "service"`, `active: false`, `views: 0`; guarda `contentId` | Borrador por defecto y campo protegido |
| 06 | `POST /api/dev/content` · banner con `"ctaUrl": "javascript:alert(document.cookie)"` | 400 · `fieldErrors.ctaUrl` | `SAFE_LINK` evita un XSS en React |
| 07 | `POST /api/dev/content` · servicio con `"code": "SRV-SOFT-01"` | 409 · `DUPLICATE_KEY`, `fieldErrors.code` | Índice único → 11000 → 409 |
| 08 | `GET /api/dev/content?active=false` | 200 · solo borradores, incluye `{{contentId}}` | El listado admin sí muestra borradores |
| 09 | `PATCH /api/dev/content/{{contentId}}` · `{ "active": true }` | 200 · `active: true` | `doc.set` + `doc.save` valida todo |
| 10 | `PATCH /api/dev/content/{{contentId}}` · `{ "type": "banner" }` | 422 · `CONTENT_TYPE_IMMUTABLE` | Regla de negocio, no error de formato |
| 11 | `DELETE /api/dev/content/{{contentId}}` | 204 sin cuerpo | La colección queda como estaba |
| 12 | `DELETE /api/dev/content/{{contentId}}` | 404 · `CONTENT_NOT_FOUND` | Id válido pero inexistente |

### 3.3 Ejecutar y repetir

**Run Collection** → **12 Passed, 0 Failed**. La colección se limpia sola (la 05 crea y la 11 borra), así que puede repetirse.

Si una corrida se interrumpe a mitad, el servicio `SRV-DATA-05` queda guardado y la 05 responderá 409. Bórrelo en la terminal **_MONGOSH** de Compass:

```javascript
db.contents.deleteOne({ code: "SRV-DATA-05" })
```

**Verificación end-to-end políglota:** con el servidor arriba, ejecute también la colección `bruno/` de la Sesión 09 (antes, su script de reinicio): `bruno/` → 11 Passed (PostgreSQL), `bruno-catalogo/` → 12 Passed (MongoDB) y `GET /api/health` con ambas bases `healthy`.

```powershell
git add bruno-catalogo ; git commit -m "test(api): coleccion bruno del catalogo con nosql injection"
git push
```

---

## 🛡️ 4. Sustentación Individual (Live Mod sin IA)

**Rúbrica:** Modelo 30% · CRUD seguro 25% · Bruno 20% · Live Mod y Git 25%.

**Preguntas:**
1. ¿Qué recibe el controlador cuando alguien pide `?type[$ne]=banner`, y qué dos capas lo detienen?
2. ¿Por qué `ctaUrl` rechaza `javascript:` si la API no ejecuta ese enlace?
3. ¿Por qué un contenido recién creado no aparece en `/api/content/published`?

**Reto en caliente:** agregue al discriminator `banner` el campo `featured: { type: Boolean, default: false }`. Cree un banner con `featured: true` desde Bruno, publíquelo (`active: true`) y muéstrelo en Compass.  
**Bonus:** permita `GET /api/content/published?featured=true`, validando que el valor sea exactamente `"true"` o `"false"`.
