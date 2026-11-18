// Verifica que cada línea de código de los archivos de una sesión aparezca en las
// diapositivas proyectadas (sin contar el visor de archivos). Así ningún archivo
// queda explicado "a medias".  Uso:  node tools/check-coverage.mjs s09
import fs from 'node:fs';

const W2 = 'semana-02-arquitectura-persistencia';
const SETS = {
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

const set = SETS[process.argv[2]];
if (!set) { console.error(`Uso: node tools/check-coverage.mjs <${Object.keys(SETS).join('|')}>`); process.exit(1); }

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const html = fs.readFileSync(set.page, 'utf8').replace(/\r\n/g, '\n');
// Solo el contenido de las diapositivas: se excluye el <script> del visor de código
const slidesOnly = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const shown = new Set([...slidesOnly.matchAll(/<code[^>]*>([\s\S]*?)<\/code>/g)]
  .flatMap(([, c]) => decode(c).split('\n').map((l) => l.trim())));

let missingTotal = 0;
for (const file of set.files) {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n').map((l) => l.trim());
  // Se ignoran líneas vacías y la cabecera de comentarios del archivo (/** … */)
  const headerEnd = lines[0] === '/**' ? lines.indexOf('*/') + 1 : 0;
  const code = lines.slice(headerEnd).filter((l) => l && l !== '*/');
  const missing = code.filter((l) => !shown.has(l));
  missingTotal += missing.length;
  console.log(`${missing.length ? '✗' : '✓'} ${file.split('/').slice(-2).join('/')}: ${code.length - missing.length}/${code.length} líneas proyectadas`);
  missing.slice(0, 5).forEach((l) => console.log(`     falta: ${l.slice(0, 100)}`));
}
process.exitCode = missingTotal ? 1 : 0;
console.log(missingTotal ? `\n${missingTotal} línea(s) sin proyectar` : '\nCobertura completa: todo el código de la sesión aparece en las diapositivas');
