// Verifica la sintaxis de todos los <script> inline de los HTML recibidos.
import fs from 'node:fs';
let bad = 0;
for (const file of process.argv.slice(2)) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = re.exec(html))) {
    i++;
    if (/type=["'](application\/ld\+json|text\/template|module)["']/i.test(m[1])) continue;
    try { new Function(m[2]); } catch (e) { bad++; console.error(`✗ ${file} script #${i}: ${e.message}`); }
  }
  console.log(`· ${file}: ${i} scripts revisados`);
}
process.exitCode = bad ? 1 : 0;
