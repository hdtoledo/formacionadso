// Genera la colección Bruno de una sesión desde tools/lessons/bruno-cases.mjs.
// Uso (desde la raíz del repositorio):  node tools/lessons/gen-bruno.mjs s09|s10
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, bruName, toBru } from './bruno-cases.mjs';

const DIRS = {
  s09: 'semana-02-arquitectura-persistencia/dia-09-repositorio-usuarios-sqli/recursos',
  s10: 'semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/recursos'
};

const lesson = process.argv[2];
if (!Object.hasOwn(COLLECTIONS, lesson) || !Object.hasOwn(DIRS, lesson)) {
  console.error(`Uso: node tools/lessons/gen-bruno.mjs <${Object.keys(COLLECTIONS).join('|')}>`);
  process.exit(1);
}
const col = COLLECTIONS[lesson];

// Se construyen y validan todos los .bru en memoria antes de tocar el disco
const generated = col.cases.map((c, i) => [`${bruName(c, i)}.bru`, toBru(c, i)]);

const out = path.join(DIRS[lesson], col.folder);
fs.mkdirSync(path.join(out, 'environments'), { recursive: true });

// Se eliminan las peticiones anteriores: un caso renombrado no debe quedar duplicado
for (const entry of fs.readdirSync(out, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.bru')) fs.unlinkSync(path.join(out, entry.name));
}

fs.writeFileSync(path.join(out, 'bruno.json'), JSON.stringify({
  version: '1', name: col.name, type: 'collection', ignore: ['node_modules', '.git']
}, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'environments', 'Local.bru'), 'vars {\n  baseUrl: http://localhost:3000\n}\n');

for (const [filename, content] of generated) fs.writeFileSync(path.join(out, filename), content);
console.log(`✓ ${col.cases.length} peticiones Bruno en ${out}`);
