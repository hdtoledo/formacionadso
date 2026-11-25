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
| `lessons/bruno-cases.mjs` | **Fuente única** de las colecciones Bruno (S09 y S10): método, URL, body, aserciones y la explicación "Envía / Debe responder" de cada caso. |
| `lessons/gen-bruno.mjs <s09\|s10>` | Escribe la colección Bruno de la sesión en su carpeta de `recursos/` desde `bruno-cases.mjs`. |
| `check-coverage.mjs <s09\|s10>` | Verifica que todo el código de la sesión se proyecte en las diapositivas: archivos nuevos completos y, en los modificados, las líneas nuevas respecto de la sesión anterior. |
| `build-downloads.mjs` | Genera por sesión (S06 en adelante) `codigo-sesion-XX.zip` (solo lo que agrega o modifica) y `proyecto-hasta-sesion-XX.zip` (`mi-proyecto-adso/` acumulado), más `assets/js/downloads-data.js` para la sección "Código del proyecto por sesión" del portal. ZIP reproducible (fecha fija) y sin dependencias. |
| `check-catalog.mjs` | Verifica que el catálogo del portal coincida con las lecciones: rutas, número de diapositivas, `data-lesson` y `data-title`. |
| `check-scripts.mjs` | Verifica la sintaxis de los `<script>` inline de uno o varios HTML. |
| `sync-referencia.mjs` | Sincroniza las copias embebidas en `referencia-docente/index.html` (`node tools/sync-referencia.mjs dia-04 dia-06`). |
| `lib-replace.mjs` | Utilidades compartidas (reemplazos exactos, escape HTML y de template literals). |

```powershell
node tools/lessons/gen-bruno.mjs s10
node tools/lessons/build-lesson.mjs s10
node tools/check-coverage.mjs s10
node tools/lessons/add-quizzes.mjs
node tools/build-downloads.mjs
node tools/check-catalog.mjs
node tools/check-scripts.mjs semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/index.html
```

## Publicar una lección nueva

1. Crear la plantilla de diapositivas (cada `<section>` con `data-title` y `data-block-label`) y registrarla en `build-lesson.mjs`.
2. Agregar sus 3 preguntas en `lessons/quizzes.mjs`.
3. Agregar la entrada en `LESSONS` de `assets/js/portal.js`.
4. Si la sesión aporta código al proyecto transversal, agregarla a `SESSIONS` en `build-downloads.mjs` (archivos de `recursos/` y pasos de ejecución).
5. Ejecutar `build-lesson.mjs`, `build-downloads.mjs` y luego `check-catalog.mjs` (debe terminar en "Catálogo coherente").

## Marcadores de las plantillas

El código de las diapositivas nunca se escribe a mano: se extrae de `recursos/`.

- `{{BODY:ruta}}`: archivo completo sin la cabecera de comentarios.
- `{{HEAD:ruta}}`: imports y constantes iniciales.
- `{{FN:ruta:nombreFuncion}}`: una función con su comentario.
- `{{BLOCK:ruta:marcador}}`: desde la línea del marcador hasta el primer `}`.
- `{{SEC:ruta#inicio#fin}}`: desde la línea `inicio` (incluida) hasta la línea `fin` (excluida). Si un marcador cae dentro de un comentario `/** … */` o bajo un separador `// -----`, el corte incluye el comentario completo.
- `{{TAIL:ruta#inicio}}`: desde la línea `inicio` hasta el final del archivo (mismo ajuste de comentarios).
- `{{SQL:ruta#inicio#fin}}`: secciones de un script SQL.
- `{{BRUNO:1-6}}`: tarjetas "Envía / Debe responder" de los casos 1 a 6 de la colección de la sesión (`bruno-cases.mjs`).
- Las rutas son relativas a `recursos/server/` (o a `recursos/` si empiezan por `database`); `@s08/…` toma el archivo de la Sesión 08.

## Componentes interactivos disponibles en cualquier diapositiva

- **Autoevaluación**: `<div data-quiz><div data-question data-answer="1" data-explain="…"><p>Pregunta</p><ul><li>A</li><li>B</li></ul></div></div>`.
- **Revelar respuesta**: `<details class="ls-reveal"><summary>Pista</summary><div class="ls-reveal__body">…</div></details>`.
- **Árboles de directorios** (`├──`, `└──`): el motor conserva los espacios y permite resaltar líneas con un clic.
- **Código**: todo `<pre>` recibe botón "Copiar" y scroll horizontal propio.
