# Herramientas internas del instructor

Scripts Node.js (ESM, sin dependencias externas) para mantener las lecciones coherentes con el código probado. Se ejecutan **desde la raíz del repositorio**.

## Arquitectura de una lección

Cada lección solo contiene sus diapositivas y metadatos. El chasis (cintillo, header, progreso, pie, índice con buscador, ayuda, temporizador y gestos táctiles) lo construye `assets/js/presenter.js`:

```html
<body data-lesson="s08" data-week="2" data-session="08"
      data-title="Arquitectura en Capas en Express & Conexión Dual" data-short="Express en capas">
  <main id="lesson-main" class="ls-main">
    <section class="slide-item" data-title="Hoja de Ruta del Montaje" data-block-label="HOJA DE RUTA DEL MONTAJE">…</section>
  </main>
  <script src="../../assets/js/presenter.js"></script>
</body>
```

- `data-title`: texto de la diapositiva en el índice lateral.
- `data-block-label`: etiqueta del bloque pedagógico que aparece en el pie y agrupa el índice.
- El portal (`assets/js/portal.js`) lee el avance que `presenter.js` guarda en `localStorage` (`adso:progress:v1`).

## Scripts

| Archivo | Uso |
|---|---|
| `lessons/build-lesson.mjs <s09\|s10>` | Genera `index.html` de una sesión desde su plantilla, insertando código real de `recursos/` y su autoevaluación. |
| `lessons/shell.mjs` | Estructura común (`<head>` de referencia + `<body>` con metadatos) usada por `build-lesson.mjs`. |
| `lessons/quizzes.mjs` | **Fuente única** de las autoevaluaciones (3 preguntas por lección) y el inyector idempotente. |
| `lessons/add-quizzes.mjs` | Inserta o actualiza la autoevaluación en las lecciones escritas a mano (S01–S08 y Extra). |
| `lessons/gen-bruno-s09.mjs`, `lessons/gen-bruno-s10.mjs` | Generan la colección Bruno de la sesión (carpeta destino como argumento). |
| `check-catalog.mjs` | Verifica que el catálogo del portal coincida con las lecciones: rutas, número de diapositivas, `data-lesson` y `data-title`. |
| `check-scripts.mjs` | Verifica la sintaxis de los `<script>` inline de uno o varios HTML. |
| `sync-referencia.mjs` | Sincroniza las copias embebidas en `referencia-docente/index.html` (`node tools/sync-referencia.mjs dia-04 dia-06`). |
| `lib-replace.mjs` | Utilidades compartidas (reemplazos exactos, escape HTML y de template literals). |

```powershell
node tools/lessons/build-lesson.mjs s10
node tools/lessons/add-quizzes.mjs
node tools/check-catalog.mjs
node tools/check-scripts.mjs semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/index.html
```

## Publicar una lección nueva

1. Crear la plantilla de diapositivas (cada `<section>` con `data-title` y `data-block-label`) y registrarla en `build-lesson.mjs`.
2. Agregar sus 3 preguntas en `lessons/quizzes.mjs`.
3. Agregar la entrada en `LESSONS` de `assets/js/portal.js`.
4. Ejecutar `build-lesson.mjs` y luego `check-catalog.mjs` (debe terminar en "Catálogo coherente").

## Marcadores de las plantillas

El código de las diapositivas nunca se escribe a mano: se extrae de `recursos/`.

- `{{BODY:ruta}}`: archivo completo sin la cabecera de comentarios.
- `{{HEAD:ruta}}`: imports y constantes iniciales.
- `{{FN:ruta:nombreFuncion}}`: una función con su comentario.
- `{{BLOCK:ruta:marcador}}`: desde la línea del marcador hasta el primer `}`.
- `{{SEC:ruta#inicio#fin}}`: desde la línea `inicio` (incluida) hasta la línea `fin` (excluida).
- `{{SQL:ruta#inicio#fin}}`: secciones de un script SQL.

## Componentes interactivos disponibles en cualquier diapositiva

- **Autoevaluación**: `<div data-quiz><div data-question data-answer="1" data-explain="…"><p>Pregunta</p><ul><li>A</li><li>B</li></ul></div></div>`.
- **Revelar respuesta**: `<details class="ls-reveal"><summary>Pista</summary><div class="ls-reveal__body">…</div></details>`.
- **Árboles de directorios** (`├──`, `└──`): el motor conserva los espacios y permite resaltar líneas con un clic.
- **Código**: todo `<pre>` recibe botón "Copiar" y scroll horizontal propio.
