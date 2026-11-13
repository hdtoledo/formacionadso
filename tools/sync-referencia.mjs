// Sincroniza las copias embebidas (codigo: `...`) del portal docente con los archivos reales.
import fs from 'node:fs';
import { tplEsc } from './lib-replace.mjs';

const portal = 'referencia-docente/index.html';
let html = fs.readFileSync(portal, 'utf8');
const crlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

const findClosingBacktick = (s, from) => {
  for (let i = from; i < s.length; i++) {
    if (s[i] !== '`') continue;
    let bs = 0;
    for (let j = i - 1; s[j] === '\\'; j--) bs++;
    if (bs % 2 === 0) return i;
  }
  return -1;
};

let pos = 0, synced = 0;
const re = /archivo: "([^"]+)"/g;
let m;
const edits = [];
while ((m = re.exec(html))) {
  const rel = m[1];
  const start = html.indexOf('codigo: `', m.index);
  if (start < 0) continue;
  const bodyStart = start + 'codigo: `'.length;
  const bodyEnd = findClosingBacktick(html, bodyStart);
  const source = `referencia-docente/${rel}`;
  if (!fs.existsSync(source)) { console.log(`· sin archivo fuente: ${source}`); continue; }
  const only = process.argv.slice(2); if (only.length && !only.some((o) => rel.includes(o))) continue;
  if (rel.includes('dia-05')) { console.log('· ' + rel + ': extracto curado, se revisa a mano'); continue; }
  const content = tplEsc(fs.readFileSync(source, 'utf8').replace(/\r\n/g, '\n').trimEnd()).replace(/<\/script/gi, '<\\/script');
  const current = html.slice(bodyStart, bodyEnd);
  if (current === content) { console.log(`= ${rel} ya sincronizado`); continue; }
  edits.push({ bodyStart, bodyEnd, content, rel });
}
for (const e of edits.reverse()) {
  html = html.slice(0, e.bodyStart) + e.content + html.slice(e.bodyEnd);
  console.log(`✓ ${e.rel} sincronizado`);
  synced++;
}
fs.writeFileSync(portal, crlf ? html.replace(/\n/g, '\r\n') : html);
console.log('total sincronizados:', synced);
