// Verifica que el catálogo del portal (assets/js/portal.js) coincida con las lecciones reales:
// que cada ruta exista, que el número de diapositivas sea correcto y que los metadatos de
// <body> estén completos. Uso (desde la raíz):  node tools/check-catalog.mjs
import fs from 'node:fs';

const portal = fs.readFileSync('assets/js/portal.js', 'utf8');
const entries = [...portal.matchAll(/\{ id: '([a-z0-9]+)'.*?slides: (\d+).*?\n\s*href: '([^']+)'/gs)]
  .map(([, id, slides, href]) => ({ id, slides: Number(slides), href }));

let problems = 0;
for (const { id, slides, href } of entries) {
  if (!fs.existsSync(href)) { console.error(`✗ ${id}: no existe ${href}`); problems++; continue; }
  const html = fs.readFileSync(href, 'utf8');
  const real = (html.match(/<(section|div) class="slide-(item|content)/g) || []).length;
  const lesson = (html.match(/<body[^>]*data-lesson="([^"]+)"/) || [])[1];
  const untitled = (html.match(/<(section|div) class="slide-(item|content)(?![^>]*data-title=)[^>]*>/g) || []).length;
  const issues = [];
  if (real !== slides) issues.push(`diapositivas: catálogo ${slides} vs real ${real}`);
  if (lesson !== id) issues.push(`data-lesson="${lesson}" (esperado "${id}")`);
  if (untitled) issues.push(`${untitled} diapositiva(s) sin data-title`);
  if (issues.length) { problems += issues.length; console.error(`✗ ${id}: ${issues.join(' · ')}`); }
  else console.log(`✓ ${id}: ${real} diapositivas`);
}
if (!entries.length) { console.error('✗ No se pudo leer el catálogo LESSONS'); problems++; }
process.exitCode = problems ? 1 : 0;
console.log(problems ? `\n${problems} problema(s)` : `\nCatálogo coherente (${entries.length} lecciones)`);
