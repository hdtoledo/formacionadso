// Utilidad: aplica pares [buscar, reemplazar] exactos sobre un archivo; falla si alguno no coincide exactamente una vez.
import fs from 'node:fs';

export function applyPairs(file, pairs, { dryRun = false } = {}) {
  let text = fs.readFileSync(file, 'utf8');
  const crlf = text.includes('\r\n');
  if (crlf) text = text.replace(/\r\n/g, '\n');
  let failed = 0;
  for (const [from, to] of pairs) {
    // Tolerante a espacios al final de cada línea (los editores suelen recortarlos)
    const pattern = from.split('\n').map((l) => l.replace(/[ \t]+$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[ \\t]*\\n');
    const re = new RegExp(pattern, 'g');
    const occurrences = (text.match(re) || []).length;
    if (occurrences !== 1) {
      console.error(`✗ ${occurrences} coincidencias en ${file}:\n   ${from.slice(0, 120).replace(/\n/g, '⏎')}`);
      failed++;
      continue;
    }
    text = text.replace(new RegExp(pattern), () => to);
  }
  if (failed) throw new Error(`${failed} reemplazos fallaron en ${file}; no se escribió nada.`);
  if (!dryRun) fs.writeFileSync(file, crlf ? text.replace(/\n/g, '\r\n') : text);
  console.log(`✓ ${pairs.length} reemplazos en ${file}`);
  return text;
}

export const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const tplEsc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
export const stripHeader = (s) => s.replace(/^\/\*\*[\s\S]*?\*\/\r?\n\r?\n/, '');
