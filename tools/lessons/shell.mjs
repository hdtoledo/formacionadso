// Estructura común de una lección generada: <head> de referencia + <body> con metadatos
// para el shell de assets/js/presenter.js (v2). El shell (cintillo, header, pie, índice,
// ayuda y temporizador) lo construye el motor en el navegador.
import fs from 'node:fs';

const BASE_HEAD_FROM = 'semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/index.html';

const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * @param {object} lesson { lesson, week, session, title, short, pageTitle, description, extraHead }
 * @param {string} slides HTML de las diapositivas (cada una con data-title y data-block-label)
 * @param {string} scripts HTML de los scripts propios de la lección (después de presenter.js)
 */
export function renderLesson(lesson, slides, scripts) {
  const base = fs.readFileSync(BASE_HEAD_FROM, 'utf8').replace(/\r\n/g, '\n');
  let head = base.slice(0, base.indexOf('<body'));
  head = head
    .replace(/<title>[^<]*<\/title>/, `<title>${lesson.pageTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escAttr(lesson.description)}">`);
  if (lesson.extraHead && !head.includes(lesson.extraHead)) {
    head = head.replace('</head>', `  ${lesson.extraHead}\n</head>`);
  }

  const total = (slides.match(/<section class="slide-item/g) || []).length;
  const titled = (slides.match(/<section class="slide-item[^>]*data-title="/g) || []).length;
  const labeled = (slides.match(/<section class="slide-item[^>]*data-block-label="/g) || []).length;
  if (titled !== total || labeled !== total) {
    throw new Error(`Cada diapositiva necesita data-title y data-block-label (${titled}/${labeled}/${total})`);
  }

  const body = `<body data-lesson="${lesson.lesson}" data-week="${lesson.week}" data-session="${escAttr(lesson.session)}" data-title="${escAttr(lesson.title)}" data-short="${escAttr(lesson.short)}">
  <main id="lesson-main" class="ls-main">
    <div id="slides-viewport" class="relative w-full flex-1 flex flex-col justify-center">

${slides.trimEnd()}

    </div>
  </main>

  <script src="../../assets/js/presenter.js"></script>
${scripts.trimEnd()}
</body>
</html>
`;
  return { html: head + body, total };
}
