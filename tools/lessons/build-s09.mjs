// Construye semana-02/.../dia-09-.../index.html a partir de:
//  - la estructura (cintillo, header, footer, drawer) de la Sesión 08
//  - la plantilla de diapositivas con marcadores
//  - los archivos reales de recursos/ (fuente única de verdad del código)
import fs from 'node:fs';
import path from 'node:path';
import { escHtml, tplEsc, stripHeader } from '../lib-replace.mjs';

const ROOT = 'semana-02-arquitectura-persistencia';
const S08 = `${ROOT}/dia-08-backend-express-arquitectura/index.html`;
const DIR = `${ROOT}/dia-09-repositorio-usuarios-sqli`;
const RES = `${DIR}/recursos`;
const TEMPLATE = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 's09-slides.template.html');

const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const src = (rel) => read(path.join(RES, rel.startsWith('database') ? '' : 'server', rel));

// ---------------------------------------------------------------- extractores
const extractors = {
  // Archivo sin cabecera
  BODY: (rel) => stripHeader(src(rel)).trimEnd(),
  // Imports y constantes iniciales (hasta el primer bloque /** de una función)
  HEAD: (rel) => stripHeader(src(rel)).split('\n/**\n')[0].trimEnd(),
  // Función con su comentario inmediatamente anterior
  FN: (rel, name) => {
    const lines = stripHeader(src(rel)).split('\n');
    const start = lines.findIndex((l) => new RegExp(`^(export )?async function ${name}\\(`).test(l));
    if (start < 0) throw new Error(`Función ${name} no encontrada en ${rel}`);
    let from = start;
    if (lines[from - 1]?.trim() === '*/') { while (!lines[from - 1].startsWith('/**')) from--; from--; }
    while (from > 0 && lines[from - 1].startsWith('//')) from--;
    const end = lines.findIndex((l, i) => i > start && l === '}');
    return lines.slice(from, end + 1).join('\n');
  },
  // Bloque que empieza en la línea con el marcador y termina en la primera línea "}"
  BLOCK: (rel, marker) => {
    const lines = src(rel).split('\n');
    const start = lines.findIndex((l) => l.includes(marker));
    if (start < 0) throw new Error(`Marcador "${marker}" no encontrado en ${rel}`);
    const end = lines.findIndex((l, i) => i > start && l.trim() === '}');
    return lines.slice(start, end + 1).join('\n');
  },
  // Secciones SQL: desde la cabecera que contiene startMarker hasta antes de la que contiene endMarker
  SQL: (spec) => {
    const [rel, startMarker, endMarker] = spec.split('#');
    const lines = src(rel).split('\n');
    const s = lines.findIndex((l) => l.includes(startMarker)) - 1;
    const e = lines.findIndex((l) => l.includes(endMarker)) - 1;
    if (s < 0 || e < 0) throw new Error(`Sección SQL no encontrada: ${spec}`);
    return lines.slice(s, e).join('\n').trimEnd();
  }
};

let slides = read(TEMPLATE).replace(/\{\{(BODY|HEAD|FN|BLOCK|SQL):([^}]+)\}\}/g, (_, kind, arg) => {
  if (kind === 'SQL') return escHtml(extractors.SQL(arg));
  const [rel, ...rest] = arg.split(':');
  return escHtml(extractors[kind](rel, rest.join(':')));
});

// ---------------------------------------------------------------- estructura base de S08
const base = read(S08);
const mainOpen = '<div id="slides-viewport" class="relative w-full flex-1 min-h-[580px] flex flex-col justify-center">';
let head = base.slice(0, base.indexOf(mainOpen) + mainOpen.length);
let tail = base.slice(base.indexOf('    </div>\n  </main>'), base.indexOf('  <!-- Scripts: Presenter Engine'));

const total = (slides.match(/<section class="slide-item/g) || []).length;
const titles = [...slides.matchAll(/data-title="([^"]+)"/g)].map((m) => m[1]);
if (titles.length !== total) throw new Error(`Cada diapositiva necesita data-title (${titles.length}/${total})`);

const swap = (text, pairs) => pairs.reduce((t, [a, b]) => {
  if (!t.includes(a)) throw new Error(`Texto base no encontrado: ${a.slice(0, 60)}`);
  return t.split(a).join(b);
}, text);

head = swap(head, [
  ['<title>Sesión 08 | Arquitectura en Capas en Express & Conexión Dual Simultánea | SENA ADSO</title>',
   '<title>Sesión 09 | Patrón Repositorio & Cero Inyección SQL | SENA ADSO</title>'],
  [base.match(/<meta name="description" content="[^"]+">/)[0],
   '<meta name="description" content="Sesión 09: Patrón Repositorio para usuarios en PostgreSQL con Node.js y Express, consultas parametrizadas contra inyección SQL, transacciones con pool.connect y pruebas con Bruno. SENA CADPH Garzón.">'],
  ['<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>',
   '<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-sql.min.js"></script>'],
  ['Sesión 08 · Día 8: Arquitectura en Capas en Express & Conexión Dual Simultánea',
   'Sesión 09 · Día 9: Patrón Repositorio & Cero Inyección SQL'],
  ['<a href="#slide-10" onclick="window.presenter?.goToSlide(9)"', '<a href="#slide-3" onclick="window.presenter?.goToSlide(2)"']
]);

const drawer = titles.map((t, i) => {
  const n = String(i + 1).padStart(2, '0');
  return `          <button onclick="window.presenter.goToSlide(${i}); window.presenter.toggleDrawer();" class="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between">
            <span>${n}. ${t}</span><span class="text-[10px] font-mono text-slate-400">${n}</span>
          </button>`;
}).join('\n');

const listStart = tail.indexOf('        <!-- Lista de 30 Diapositivas -->');
const listOpen = tail.indexOf('>', tail.indexOf('<div', listStart)) + 1;
const listClose = tail.indexOf('\n        </div>\n      </div>\n\n      <div class="border-t', listOpen);
tail = tail.slice(0, listStart) + `        <!-- Lista de ${total} Diapositivas -->\n        <div class="space-y-1 text-xs max-h-[70vh] overflow-y-auto pr-2 font-medium">\n${drawer}` + tail.slice(listClose);
tail = swap(tail, [
  ['SLIDE 01 / 30', `SLIDE 01 / ${String(total).padStart(2, '0')}`],
  ['1 / 30', `1 / ${total}`],
  ['Índice de Diapositivas (Sesión 08)', 'Índice de Diapositivas (Sesión 09)']
]);

// ---------------------------------------------------------------- visor de código (archivos reales)
const tabs = [
  ['repo', 'UserRepository.js', 'src/repositories/UserRepository.js', 'javascript'],
  ['ctrl', 'devUserController.js', 'src/controllers/devUserController.js', 'javascript'],
  ['routes', 'devUserRoutes.js', 'src/routes/devUserRoutes.js', 'javascript'],
  ['async', 'asyncHandler.js', 'src/middlewares/asyncHandler.js', 'javascript'],
  ['valid', 'validators.js', 'src/utils/validators.js', 'javascript'],
  ['app', 'app.js', 'src/app.js', 'javascript'],
  ['mig', '02_hardening_auth_schema.sql', 'database/migrations/02_hardening_auth_schema.sql', 'sql']
];
const snippetEntries = tabs.map(([key, , rel, lang]) => {
  const prefix = rel.startsWith('database') ? '' : 'server/';
  const code = rel.endsWith('.sql') ? src(rel).trimEnd() : `// ${prefix}${rel}\n` + stripHeader(src(rel)).trimEnd();
  return `      ${key}: { lang: '${lang}', code: \`${tplEsc(code).replace(/<\/script/gi, '<\\/script')}\` }`;
}).join(',\n');
const tabMeta = JSON.stringify(tabs.map(([key, label]) => ({ key, label })));

const scripts = `  <!-- Scripts: Presenter Engine & Visor de Código -->
  <script src="../../assets/js/presenter.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      window.presenter = new SlidePresenter();
      const cintilloFecha = document.getElementById('slide-cintillo-fecha');
      if (cintilloFecha) {
        cintilloFecha.textContent = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      renderCodeTabs();
      window.viewCodeTab('repo');
    });

    // Código generado desde recursos/ (el mismo que se probó contra PostgreSQL)
    const codeSnippets = {
${snippetEntries}
    };
    const codeTabs = ${tabMeta};
    let activeTabKey = 'repo';

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
  </script>
</body>
</html>
`;

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(`${DIR}/index.html`, `${head}\n\n${slides.trimEnd()}\n\n${tail}${scripts}`);
console.log(`✓ ${DIR}/index.html · ${total} diapositivas`);
