// Inserta o actualiza la autoevaluación de cada lección escrita a mano (S01–S08 y Extra).
// S09 y S10 la reciben al generarse con build-lesson.mjs.
// Uso (desde la raíz):  node tools/lessons/add-quizzes.mjs
import fs from 'node:fs';
import { injectQuiz } from './quizzes.mjs';

const TARGETS = {
  s01: ['semana-01-fundamentos/dia-01-bd-sql-ddl-dml/index.html', 'la Sesión 01'],
  s02: ['semana-01-fundamentos/dia-02-consultas-sql-joins/index.html', 'la Sesión 02'],
  s03: ['semana-01-fundamentos/dia-03-javascript-es6-asincronia/index.html', 'la Sesión 03'],
  s04: ['semana-01-fundamentos/dia-04-http-express-servidor-base/index.html', 'la Sesión 04'],
  s05: ['semana-01-fundamentos/dia-05-consumo-fetch-dom/index.html', 'la Sesión 05'],
  extra: ['semana-01-fundamentos/dia-extra-tailwindcss-ui-ux/index.html', 'la Sesión Extra'],
  s06: ['semana-02-arquitectura-persistencia/dia-06-postgresql-relacional/index.html', 'la Sesión 06'],
  s07: ['semana-02-arquitectura-persistencia/dia-07-mongodb-nosql/index.html', 'la Sesión 07'],
  s08: ['semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/index.html', 'la Sesión 08']
};

for (const [id, [file, label]] of Object.entries(TARGETS)) {
  const html = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const updated = injectQuiz(html, id, label);
  fs.writeFileSync(file, updated);
  const total = (updated.match(/<(section|div) class="slide-(item|content)/g) || []).length;
  console.log(`✓ ${id}: ${total} diapositivas`);
}
