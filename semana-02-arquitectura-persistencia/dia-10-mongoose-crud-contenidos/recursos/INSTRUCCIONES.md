# Guía de Montaje en Aula · Sesión 10: Mongoose & CRUD del Catálogo
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Desarrollo Web Full Stack MERN

---

## 🎯 Objetivo de la Sesión
Cerrar la Semana 2 conectando la colección `contents` (Sesión 07) al backend con **Mongoose**: modelo con **discriminators** por `type`, ruta pública `GET /api/content/published` para la Landing Page, CRUD de laboratorio con campos protegidos y defensa contra la **inyección NoSQL**.

**Requisitos:** Sesión 07 (colección `contents` con el seed importado en **Extended JSON**) y Sesiones 08 y 09 (servidor con `asyncHandler`, `AppError` y rutas `/api/dev`).

> Si importó el seed antes de la corrección de la Sesión 07, sus fechas quedaron como texto. Vuelva a importar `01_content_seed.json` (versión con `{ "$date": ... }`) o ejecute de nuevo `01_adso_polyglot_setup.js`.

---

## 🏗️ 1. Archivos de la sesión

```text
server/
├── bruno-catalogo/                       (Hito 5: 12 peticiones)
└── src/
    ├── models/Content.js                 (Hito 1)
    ├── config/db.js                      (Hito 2: se modifica)
    ├── middlewares/errorHandler.js       (Hito 2: se modifica)
    ├── utils/validators.js               (Hito 3: se agregan isObjectId y parseLimit)
    ├── controllers/contentController.js  (Hito 3)
    ├── routes/contentRoutes.js           (Hito 4: público)
    ├── routes/devContentRoutes.js        (Hito 4: laboratorio)
    └── app.js                            (Hito 4: se modifica)
```

No se instalan dependencias nuevas (Mongoose viene de la Sesión 08).

---

## 🧩 2. Hitos y commits

```powershell
# Hito 1 · Modelo
New-Item -ItemType Directory -Force server/src/models
git add server/src/models
git commit -m "feat(models): modelo content con discriminators por tipo"

# Hito 2 · Blindaje (sanitizeFilter + errores de Mongoose)
git add server/src/config/db.js server/src/middlewares/errorHandler.js
git commit -m "feat(server): sanitizefilter y traduccion de errores de mongoose"

# Hito 3 · Controlador
git add server/src/controllers/contentController.js server/src/utils
git commit -m "feat(content): controlador crud con campos protegidos y limite"

# Hito 4 · Rutas
git add server/src
git commit -m "feat(content): ruta publica published y crud de laboratorio"

# Hito 5 · Pruebas
git add server/bruno-catalogo
git commit -m "test(api): coleccion bruno del catalogo con nosql injection"
git push
```

Reglas que se revisan en la sustentación:
1. **Mismos nombres de índice** que el script de la Sesión 07 (`idx_active_priority`, `idx_type_active`, `idx_unique_service_code`, `idx_category`, `idx_fulltext_search`).
2. **Todo contenido nuevo nace como borrador** (`active: false`).
3. **El tipo se valida como texto contra la lista blanca** antes de usarlo en un filtro, y `sanitizeFilter` está activo en `db.js`.
4. **El cliente no escribe** `_id`, `type` (en actualizaciones), `createdAt`, `updatedAt`, `views` ni llaves que empiecen por `$`.
5. **Todo listado tiene límite** (máximo 50).
6. Las rutas `/api/dev/content` solo se montan si `NODE_ENV` no es `production`.

---

## 🧪 3. Pruebas con Bruno

1. Abra Bruno → **Open Collection** → `server/bruno-catalogo/` → entorno **Local**.
2. **Run Collection**: las 12 pruebas deben quedar en verde. La colección se limpia sola: la petición 05 guarda el `_id` creado en `contentId` y la 11 lo elimina.

| # | Petición | Esperado |
|---|---|---|
| 01 | Contenidos publicados | 200 · solo `active: true` |
| 02 | Publicados por tipo | 200 · solo `service` |
| 03 | Inyección NoSQL `?type[$ne]=banner` | 400 |
| 04 | Límite fuera de rango | 400 |
| 05 | Crear servicio en borrador | 201 · `active: false`, `views: 0` |
| 06 | Banner con enlace `javascript:` | 400 `fieldErrors.ctaUrl` |
| 07 | Código de servicio duplicado | 409 `DUPLICATE_KEY` |
| 08 | Publicar contenido | 200 |
| 09 | Cambiar tipo | 422 `CONTENT_TYPE_IMMUTABLE` |
| 10 | Listado admin de borradores | 200 |
| 11 | Eliminar contenido | 204 |
| 12 | Eliminar de nuevo | 404 |

**Verificación end-to-end políglota:** con el servidor arriba, ejecute la colección de la Sesión 09 (PostgreSQL) y esta (MongoDB). `GET /api/health` debe mostrar ambas bases `healthy`.

---

## 🛡️ 4. Sustentación Individual (Live Mod sin IA)

**Rúbrica:** Modelo 30% · CRUD seguro 25% · Bruno 20% · Live Mod y Git 25%.

**Preguntas:**
1. ¿Qué recibe el controlador cuando alguien pide `?type[$ne]=banner`, y qué dos capas lo detienen?
2. ¿Por qué `ctaUrl` rechaza `javascript:` si la API no ejecuta ese enlace?
3. ¿Por qué un contenido recién creado no aparece en `/api/content/published`?

**Reto en caliente:** agregue al discriminator `banner` el campo `featured: { type: Boolean, default: false }`. Cree un banner con `featured: true` desde Bruno, publíquelo (`active: true`) y muéstrelo en Compass.  
**Bonus:** permita `GET /api/content/published?featured=true`, validando que el valor sea exactamente `"true"` o `"false"`.
