# Herramientas internas del instructor

Scripts Node.js (ESM, sin dependencias externas) para mantener las lecciones sincronizadas con el código probado. Se ejecutan **desde la raíz del repositorio**.

| Archivo | Uso |
|---|---|
| `lessons/build-s09.mjs`, `lessons/build-s10.mjs` | Generan `index.html` de la sesión a partir de su plantilla (`sXX-slides.template.html`), la estructura de la Sesión 08 y los archivos reales de `recursos/`. |
| `lessons/gen-bruno-s09.mjs`, `lessons/gen-bruno-s10.mjs` | Generan la colección Bruno de la sesión. Recibe la carpeta destino como argumento. |
| `check-scripts.mjs` | Verifica la sintaxis de los `<script>` inline de uno o varios HTML. |
| `sync-referencia.mjs` | Sincroniza las copias embebidas en `referencia-docente/index.html`. Acepta filtros: `node tools/sync-referencia.mjs dia-04 dia-06`. |
| `lib-replace.mjs` | Utilidades compartidas (reemplazos exactos, escape HTML y de template literals). |

```powershell
node tools/lessons/build-s10.mjs
node tools/lessons/gen-bruno-s10.mjs semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/recursos/server/bruno-catalogo
node tools/check-scripts.mjs semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/index.html
```

## Marcadores de las plantillas

El código de las diapositivas nunca se escribe a mano: se extrae de `recursos/`.

- `{{BODY:ruta}}`: archivo completo sin la cabecera de comentarios.
- `{{HEAD:ruta}}`: imports y constantes iniciales.
- `{{FN:ruta:nombreFuncion}}`: una función con su comentario.
- `{{BLOCK:ruta:marcador}}`: desde la línea del marcador hasta el primer `}`.
- `{{SEC:ruta#inicio#fin}}`: desde la línea `inicio` (incluida) hasta la línea `fin` (excluida).
- `{{SQL:ruta#inicio#fin}}`: secciones de un script SQL.

Cada diapositiva declara `data-title` (índice lateral) y `data-block-label` (etiqueta del pie, leída por `assets/js/presenter.js`).
