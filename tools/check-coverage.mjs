// Verifica que cada línea de código de los archivos de una sesión aparezca en las
// diapositivas proyectadas (sin contar el visor de archivos). Así ningún archivo
// queda explicado "a medias".  Uso:  node tools/check-coverage.mjs s09|s10
//
// Cada entrada es la ruta de un archivo NUEVO (se exigen todas sus líneas) o
// { file, base } para un archivo MODIFICADO: se exigen solo las líneas que no
// existían en la versión de la sesión anterior (base).
import fs from 'node:fs';

const W2 = 'semana-02-arquitectura-persistencia';
const S08 = `${W2}/dia-08-backend-express-arquitectura/recursos/server`;
const S09 = `${W2}/dia-09-repositorio-usuarios-sqli/recursos/server`;
const S10 = `${W2}/dia-10-mongoose-crud-contenidos/recursos/server`;
const SETS = {
  s10: {
    page: `${W2}/dia-10-mongoose-crud-contenidos/index.html`,
    files: [
      ...['src/models/Content.js', 'src/controllers/contentController.js', 'src/routes/contentRoutes.js',
        'src/routes/devContentRoutes.js', 'bruno-catalogo/05 - Crear Servicio en Borrador (201 Created).bru']
        .map((f) => `${S10}/${f}`),
      { file: `${S10}/src/config/db.js`, base: `${S08}/src/config/db.js` },
      { file: `${S10}/src/middlewares/errorHandler.js`, base: `${S08}/src/middlewares/errorHandler.js` },
      { file: `${S10}/src/utils/validators.js`, base: `${S09}/src/utils/validators.js` },
      { file: `${S10}/src/app.js`, base: `${S09}/src/app.js` }
    ]
  },
  s09: {
    page: `${W2}/dia-09-repositorio-usuarios-sqli/index.html`,
    files: [
      `${W2}/dia-08-backend-express-arquitectura/recursos/server/src/middlewares/errorHandler.js`,
      ...['src/repositories/UserRepository.js', 'src/middlewares/asyncHandler.js', 'src/utils/validators.js',
        'src/controllers/devUserController.js', 'src/routes/devUserRoutes.js', 'src/app.js',
        'bruno/02 - Crear Usuario (201 Created).bru']
        .map((f) => `${W2}/dia-09-repositorio-usuarios-sqli/recursos/server/${f}`),
      ...['migrations/02_hardening_auth_schema.sql', 'seeds/02_fix_seed_credentials.sql', 'seeds/99_reset_pruebas_sesion_09.sql']
        .map((f) => `${W2}/dia-09-repositorio-usuarios-sqli/recursos/database/${f}`)
    ]
  }
};

const lesson = process.argv[2];
if (!Object.hasOwn(SETS, lesson)) { console.error(`Uso: node tools/check-coverage.mjs <${Object.keys(SETS).join('|')}>`); process.exit(1); }
const set = SETS[lesson];

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const html = fs.readFileSync(set.page, 'utf8').replace(/\r\n/g, '\n');
// Solo el contenido de las diapositivas: se excluye el <script> del visor de código
const mainStart = html.indexOf('<main');
const mainEnd = html.indexOf('</main>');
if (mainStart < 0 || mainEnd <= mainStart) throw new Error(`Etiqueta <main> no encontrada en ${set.page}`);
const slidesOnly = html.slice(mainStart, mainEnd);
const shown = new Set([...slidesOnly.matchAll(/<code[^>]*>([\s\S]*?)<\/code>/g)]
  .flatMap(([, c]) => decode(c).split('\n').map((l) => l.trim())));

// Líneas de código de un archivo, sin vacías ni la cabecera de comentarios (/** … */)
const codeLines = (file) => {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n').map((l) => l.trim());
  const headerEnd = lines[0] === '/**' ? lines.indexOf('*/') + 1 : 0;
  return lines.slice(headerEnd).filter((l) => l && l !== '*/');
};

let missingTotal = 0;
for (const entry of set.files) {
  const { file, base } = typeof entry === 'string' ? { file: entry } : entry;
  const previous = base ? new Set(codeLines(base)) : new Set();
  const code = codeLines(file).filter((l) => !previous.has(l));
  const missing = code.filter((l) => !shown.has(l));
  missingTotal += missing.length;
  const label = `${file.split('/').slice(-2).join('/')}${base ? ' (líneas nuevas)' : ''}`;
  console.log(`${missing.length ? '✗' : '✓'} ${label}: ${code.length - missing.length}/${code.length} líneas proyectadas`);
  missing.slice(0, 5).forEach((l) => console.log(`     falta: ${l.slice(0, 100)}`));
}
process.exitCode = missingTotal ? 1 : 0;
console.log(missingTotal ? `\n${missingTotal} línea(s) sin proyectar` : '\nCobertura completa: todo el código de la sesión aparece en las diapositivas');
