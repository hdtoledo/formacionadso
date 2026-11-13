// Genera index.html de una lección desde su plantilla y el código REAL de recursos/.
// Uso (desde la raíz del repositorio):  node tools/lessons/build-lesson.mjs s09
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escHtml, tplEsc, stripHeader } from '../lib-replace.mjs';
import { renderLesson } from './shell.mjs';
import { injectQuiz } from './quizzes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = 'semana-02-arquitectura-persistencia';
const PRISM_SQL = '<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-sql.min.js"></script>';

const LESSONS = {
  s09: {
    dir: `${ROOT}/dia-09-repositorio-usuarios-sqli`,
    template: 's09-slides.template.html',
    meta: {
      lesson: 's09', week: 2, session: '09',
      title: 'Patrón Repositorio & Cero Inyección SQL', short: 'Repositorio & SQLi',
      pageTitle: 'Sesión 09 | Patrón Repositorio & Cero Inyección SQL | SENA ADSO',
      description: 'Sesión 09: Patrón Repositorio para usuarios en PostgreSQL con Node.js y Express, consultas parametrizadas contra inyección SQL, transacciones con pool.connect y pruebas con Bruno. SENA CADPH Garzón.',
      extraHead: PRISM_SQL
    },
    defaultTab: 'repo',
    tabs: [
      ['repo', 'UserRepository.js', 'src/repositories/UserRepository.js', 'javascript'],
      ['ctrl', 'devUserController.js', 'src/controllers/devUserController.js', 'javascript'],
      ['routes', 'devUserRoutes.js', 'src/routes/devUserRoutes.js', 'javascript'],
      ['async', 'asyncHandler.js', 'src/middlewares/asyncHandler.js', 'javascript'],
      ['valid', 'validators.js', 'src/utils/validators.js', 'javascript'],
      ['app', 'app.js', 'src/app.js', 'javascript'],
      ['mig', '02_hardening_auth_schema.sql', 'database/migrations/02_hardening_auth_schema.sql', 'sql']
    ]
  },
  s10: {
    dir: `${ROOT}/dia-10-mongoose-crud-contenidos`,
    template: 's10-slides.template.html',
    meta: {
      lesson: 's10', week: 2, session: '10',
      title: 'Mongoose & CRUD del Catálogo', short: 'Mongoose & CRUD',
      pageTitle: 'Sesión 10 | Mongoose & CRUD del Catálogo | SENA ADSO',
      description: 'Sesión 10: Modelo Mongoose con discriminators para el catálogo polimórfico, ruta pública de contenidos publicados, CRUD seguro y defensa contra inyección NoSQL. SENA CADPH Garzón.',
      extraHead: PRISM_SQL
    },
    defaultTab: 'model',
    tabs: [
      ['model', 'Content.js', 'src/models/Content.js', 'javascript'],
      ['ctrl', 'contentController.js', 'src/controllers/contentController.js', 'javascript'],
      ['pub', 'contentRoutes.js', 'src/routes/contentRoutes.js', 'javascript'],
      ['dev', 'devContentRoutes.js', 'src/routes/devContentRoutes.js', 'javascript'],
      ['valid', 'validators.js', 'src/utils/validators.js', 'javascript'],
      ['err', 'errorHandler.js', 'src/middlewares/errorHandler.js', 'javascript'],
      ['db', 'db.js', 'src/config/db.js', 'javascript'],
      ['app', 'app.js', 'src/app.js', 'javascript']
    ]
  }
};

const key = process.argv[2];
const cfg = LESSONS[key];
if (!cfg) {
  console.error(`Uso: node tools/lessons/build-lesson.mjs <${Object.keys(LESSONS).join('|')}>`);
  process.exit(1);
}

const RES = `${cfg.dir}/recursos`;
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const src = (rel) => read(path.join(RES, rel.startsWith('database') ? '' : 'server', rel));

// ---------------------------------------------------------------- extractores de código
const extractors = {
  BODY: (rel) => stripHeader(src(rel)).trimEnd(),
  HEAD: (rel) => stripHeader(src(rel)).split('\n/**\n')[0].trimEnd(),
  FN: (rel, name) => {
    const lines = stripHeader(src(rel)).split('\n');
    const start = lines.findIndex((l) => new RegExp(`^(export )?(async )?function ${name}\\(`).test(l));
    if (start < 0) throw new Error(`Función ${name} no encontrada en ${rel}`);
    let from = start;
    if (lines[from - 1]?.trim() === '*/') { while (!lines[from - 1].startsWith('/**')) from--; from--; }
    while (from > 0 && lines[from - 1].startsWith('//')) from--;
    const end = lines.findIndex((l, i) => i > start && l === '}');
    return lines.slice(from, end + 1).join('\n');
  },
  BLOCK: (rel, marker) => {
    const lines = src(rel).split('\n');
    const start = lines.findIndex((l) => l.includes(marker));
    if (start < 0) throw new Error(`Marcador "${marker}" no encontrado en ${rel}`);
    const end = lines.findIndex((l, i) => i > start && l.trim() === '}');
    return lines.slice(start, end + 1).join('\n');
  },
  SEC: (spec) => {
    const [rel, startMarker, endMarker] = spec.split('#');
    const lines = src(rel).split('\n');
    const s = lines.findIndex((l) => l.includes(startMarker));
    const e = lines.findIndex((l, i) => i > s && l.includes(endMarker));
    if (s < 0 || e < 0) throw new Error(`Sección no encontrada: ${spec}`);
    return lines.slice(s, e).join('\n').trimEnd();
  },
  SQL: (spec) => {
    const [rel, startMarker, endMarker] = spec.split('#');
    const lines = src(rel).split('\n');
    const s = lines.findIndex((l) => l.includes(startMarker)) - 1;
    const e = lines.findIndex((l) => l.includes(endMarker)) - 1;
    if (s < 0 || e < 0) throw new Error(`Sección SQL no encontrada: ${spec}`);
    return lines.slice(s, e).join('\n').trimEnd();
  }
};

const rawSlides = read(path.join(HERE, cfg.template)).replace(/\{\{(BODY|HEAD|FN|BLOCK|SQL|SEC):([^}]+)\}\}/g, (_, kind, arg) => {
  if (kind === 'SQL' || kind === 'SEC') return escHtml(extractors[kind](arg));
  const [rel, ...rest] = arg.split(':');
  return escHtml(extractors[kind](rel, rest.join(':')));
});

// Autoevaluación antes de la diapositiva de cierre
const slides = injectQuiz(rawSlides, cfg.meta.lesson, `la Sesión ${cfg.meta.session}`);

// ---------------------------------------------------------------- visor de código
const snippetEntries = cfg.tabs.map(([k, , rel, lang]) => {
  const prefix = rel.startsWith('database') ? '' : 'server/';
  const code = rel.endsWith('.sql') ? src(rel).trimEnd() : `// ${prefix}${rel}\n` + stripHeader(src(rel)).trimEnd();
  return `      ${k}: { lang: '${lang}', code: \`${tplEsc(code).replace(/<\/script/gi, '<\\/script')}\` }`;
}).join(',\n');
const tabMeta = JSON.stringify(cfg.tabs.map(([k, label]) => ({ key: k, label })));

const scripts = `  <script>
    // Visor de código: generado desde recursos/ (el mismo código que se probó contra las bases de datos)
    const codeSnippets = {
${snippetEntries}
    };
    const codeTabs = ${tabMeta};
    let activeTabKey = '${cfg.defaultTab}';

    const TAB_ACTIVE = 'px-3 py-1 bg-slate-900 text-emerald-300 rounded-lg border border-slate-700 cursor-pointer font-bold shrink-0';
    const TAB_IDLE = 'px-3 py-1 bg-white text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors shrink-0';

    function renderCodeTabs() {
      const container = document.getElementById('code-tabs');
      if (!container) return;
      codeTabs.forEach(({ key, label }) => {
        const btn = document.createElement('button');
        btn.id = 'tab-btn-' + key;
        btn.type = 'button';
        btn.textContent = label;
        btn.className = TAB_IDLE;
        btn.addEventListener('click', () => window.viewCodeTab(key));
        container.appendChild(btn);
      });
    }

    window.viewCodeTab = function (tabKey) {
      const snippet = codeSnippets[tabKey];
      const codeBox = document.getElementById('active-code-box');
      if (!snippet || !codeBox) return;
      activeTabKey = tabKey;
      codeTabs.forEach(({ key }) => {
        const btn = document.getElementById('tab-btn-' + key);
        if (btn) btn.className = key === tabKey ? TAB_ACTIVE : TAB_IDLE;
      });
      codeBox.className = 'language-' + snippet.lang;
      codeBox.textContent = snippet.code;
      if (window.Prism && typeof window.Prism.highlightElement === 'function') {
        window.Prism.highlightElement(codeBox);
      }
    };

    window.copyActiveCodeTab = function () {
      const snippet = codeSnippets[activeTabKey];
      if (!snippet || !navigator.clipboard) return;
      navigator.clipboard.writeText(snippet.code).then(() => {
        const btnText = document.getElementById('text-copy-tab');
        if (!btnText) return;
        btnText.textContent = '¡Archivo Copiado!';
        setTimeout(() => { btnText.textContent = 'Copiar Archivo Activo'; }, 2200);
      });
    };

    document.addEventListener('DOMContentLoaded', () => {
      renderCodeTabs();
      window.viewCodeTab('${cfg.defaultTab}');
    });
  </script>`;

const { html, total } = renderLesson(cfg.meta, slides, scripts);
fs.writeFileSync(`${cfg.dir}/index.html`, html);
console.log(`✓ ${cfg.dir}/index.html · ${total} diapositivas`);
