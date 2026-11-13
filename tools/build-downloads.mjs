// Genera los paquetes de código descargables del proyecto transversal (Semana 2 en adelante):
//   - codigo-sesion-XX.zip          → solo lo que la sesión agrega o modifica
//   - proyecto-hasta-sesion-XX.zip  → mi-proyecto-adso/ completo al cierre de la sesión
// y assets/js/downloads-data.js, que el portal usa para pintar la sección "Código por sesión".
// Uso (desde la raíz):  node tools/build-downloads.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const W2 = 'semana-02-arquitectura-persistencia';
const S06_SQL = 'referencia-docente/semana-02/dia-06-postgresql-usuarios.sql';

// ----------------------------------------------------------------------------- ZIP mínimo
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
// Fecha fija (13/11/2026 08:00) para que el .zip sea reproducible
const DOS_TIME = (8 << 11);
const DOS_DATE = ((2026 - 1980) << 9) | (11 << 5) | 13;

function buildZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const comp = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8); local.writeUInt16LE(DOS_TIME, 10); local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10); central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14); central.writeUInt32LE(crc, 16); central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, comp);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + comp.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, end]);
}

// ----------------------------------------------------------------------------- utilidades
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const listFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const full = path.posix.join(dir, d.name);
  return d.isDirectory() ? (d.name === 'node_modules' ? [] : listFiles(full)) : [full];
});
// Copia todos los archivos de un directorio de recursos hacia una ruta destino del proyecto
const fromDir = (srcDir, destPrefix) => listFiles(srcDir).map((f) => [path.posix.join(destPrefix, path.posix.relative(srcDir, f)), () => read(f)]);

// Divide el script de referencia de la Sesión 06 en migración (estructura) y semilla (datos)
function splitS06() {
  const lines = read(S06_SQL).split('\n');
  const at = (marker) => lines.findIndex((l) => l.includes(marker));
  const seedStart = at('-- RETO 4:') - 1;    // incluye la línea de guiones previa
  const answers = at('-- SOLUCIÓN A PREGUNTAS') - 1; // material docente: no se distribuye
  const body = lines.slice(at('-- 0. HABILITAR') - 1, seedStart).join('\n').trimEnd();
  const seed = lines.slice(seedStart, answers).join('\n').trimEnd();
  const header = (title, use) => `-- ==============================================================================
-- SENA CADPH Garzón · Regional Huila · ADSO — Proyecto transversal
-- ${title}
-- ==============================================================================
-- ${use}
-- ==============================================================================
`;
  return {
    migration: header('Sesión 06 · Migración 01: esquema de autenticación (database/migrations/01_auth_schema.sql)',
      'Ejecución:  psql -U postgres -d adso_auth_db -f database/migrations/01_auth_schema.sql') + '\n' + body + '\n',
    seed: header('Sesión 06 · Semilla 01: datos de prueba (database/seeds/01_test_seed.sql)',
      'SOLO DESARROLLO LOCAL. Ejecución:  psql -U postgres -d adso_auth_db -f database/seeds/01_test_seed.sql') + '\n' + seed + '\n'
  };
}

// ----------------------------------------------------------------------------- sesiones
const SESSIONS = [
  {
    id: 's06', num: '06', week: 2, dir: `${W2}/dia-06-postgresql-relacional`,
    title: 'Base de datos relacional en PostgreSQL',
    summary: 'Tablas users y verification_tokens con UUID, token_hash SHA-256, trigger updated_at, índice de la llave foránea y semilla con hashes bcrypt reales.',
    icon: 'database',
    files: () => {
      const { migration, seed } = splitS06();
      return [
        ['database/migrations/01_auth_schema.sql', () => migration],
        ['database/seeds/01_test_seed.sql', () => seed],
        ['docs/sesion-06-INSTRUCCIONES.md', () => read(`${W2}/dia-06-postgresql-relacional/recursos/INSTRUCCIONES.md`)]
      ];
    },
    steps: [
      'psql -U postgres -c "CREATE DATABASE adso_auth_db;"',
      'psql -U postgres -d adso_auth_db -f database/migrations/01_auth_schema.sql',
      'psql -U postgres -d adso_auth_db -f database/seeds/01_test_seed.sql'
    ]
  },
  {
    id: 's07', num: '07', week: 2, dir: `${W2}/dia-07-mongodb-nosql`,
    title: 'Base de datos NoSQL en MongoDB',
    summary: 'Colección polimórfica contents (banners, servicios, testimonios y métricas) con validador, 5 índices y semilla en Extended JSON.',
    icon: 'leaf',
    files: () => [
      ['database/nosql/01_content_seed.json', () => read(`${W2}/dia-07-mongodb-nosql/recursos/01_content_seed.json`)],
      ['database/nosql/01_adso_polyglot_setup.js', () => read(`${W2}/dia-07-mongodb-nosql/recursos/01_adso_polyglot_setup.js`)],
      ['docs/sesion-07-INSTRUCCIONES.md', () => read(`${W2}/dia-07-mongodb-nosql/recursos/INSTRUCCIONES.md`)]
    ],
    steps: [
      'Compass → base adso_polyglot_db → colección contents → Add Data → Import JSON → database/nosql/01_content_seed.json',
      'o bien:  mongosh "<su MONGO_URI>" --file database/nosql/01_adso_polyglot_setup.js'
    ]
  },
  {
    id: 's08', num: '08', week: 2, dir: `${W2}/dia-08-backend-express-arquitectura`,
    title: 'Backend Express en capas con conexión dual',
    summary: 'Servidor Express (ES Modules) con pool de PostgreSQL, singleton de Mongoose, variables fail-fast, CORS con CLIENT_URL, errores estándar y GET /api/health.',
    icon: 'server',
    files: () => [
      ...fromDir(`${W2}/dia-08-backend-express-arquitectura/recursos/server`, 'server'),
      ['docs/sesion-08-INSTRUCCIONES.md', () => read(`${W2}/dia-08-backend-express-arquitectura/recursos/INSTRUCCIONES.md`)]
    ],
    steps: [
      'cd server',
      'npm install',
      'Copy-Item .env.example .env   # complete PG_PASSWORD y MONGO_URI',
      'npm run dev   # luego abra http://localhost:3000/api/health'
    ]
  },
  {
    id: 's09', num: '09', week: 2, dir: `${W2}/dia-09-repositorio-usuarios-sqli`,
    title: 'UserRepository y prevención de inyección SQL',
    summary: 'Repositorio con consultas parametrizadas, transacción de verificación, rutas de laboratorio /api/dev/users, migración 02 y colección Bruno de 11 casos.',
    icon: 'shield-check',
    files: () => [
      ...fromDir(`${W2}/dia-09-repositorio-usuarios-sqli/recursos/database`, 'database'),
      ...fromDir(`${W2}/dia-09-repositorio-usuarios-sqli/recursos/server`, 'server'),
      ['docs/sesion-09-INSTRUCCIONES.md', () => read(`${W2}/dia-09-repositorio-usuarios-sqli/recursos/INSTRUCCIONES.md`)]
    ],
    steps: [
      'psql -U postgres -d adso_auth_db -f database/migrations/02_hardening_auth_schema.sql   # solo si su esquema es anterior',
      'psql -U postgres -d adso_auth_db -f database/seeds/02_fix_seed_credentials.sql',
      'cd server ; npm run dev',
      'Bruno → Open Collection → server/bruno → Run Collection'
    ]
  },
  {
    id: 's10', num: '10', week: 2, dir: `${W2}/dia-10-mongoose-crud-contenidos`,
    title: 'Mongoose y CRUD del catálogo',
    summary: 'Modelo Content con discriminators, GET /api/content/published, CRUD de laboratorio con campos protegidos, defensa contra inyección NoSQL y colección Bruno de 12 casos.',
    icon: 'shapes',
    files: () => [
      ...fromDir(`${W2}/dia-10-mongoose-crud-contenidos/recursos/server`, 'server'),
      ['docs/sesion-10-INSTRUCCIONES.md', () => read(`${W2}/dia-10-mongoose-crud-contenidos/recursos/INSTRUCCIONES.md`)]
    ],
    steps: [
      'cd server ; npm run dev',
      'Abra http://localhost:3000/api/content/published',
      'Bruno → Open Collection → server/bruno-catalogo → Run Collection'
    ]
  }
];

// ----------------------------------------------------------------------------- README de cada paquete
function readme(session, kind, files) {
  const scope = kind === 'project'
    ? `Proyecto **mi-proyecto-adso** completo al cierre de la Sesión ${session.num}. Incluye todo lo construido desde la Sesión 06.`
    : `Archivos que la **Sesión ${session.num}** agrega o modifica en mi-proyecto-adso. Cópielos sobre su proyecto respetando las mismas rutas.`;
  return `# Sesión ${session.num} · ${session.title}

**SENA CADPH Garzón · ADSO — Desarrollo Web Full Stack MERN**

${scope}

${session.summary}

## Cómo usarlo (PowerShell)

\`\`\`powershell
${session.steps.join('\n')}
\`\`\`

## Contenido

${files.map((f) => `- \`${f}\``).join('\n')}

## Importante

- Este paquete sirve para **ponerse al día o comparar** con su propio montaje. La evidencia de la sesión sigue siendo **su repositorio personal en GitHub con sus propios commits**.
- \`server/.env\` nunca viene en el paquete ni se sube a GitHub: créelo a partir de \`server/.env.example\`.
- Las contraseñas de la semilla (\`Admin2026*\`, \`Aprendiz2026*\`) son públicas y **solo para desarrollo local**.
`;
}

// ----------------------------------------------------------------------------- construcción
const project = new Map(); // ruta → contenido acumulado
const data = [];
for (const session of SESSIONS) {
  const files = session.files().map(([dest, get]) => [dest, get()]);
  const added = [];
  const changed = [];
  for (const [dest, content] of files) {
    if (dest.startsWith('docs/')) { project.set(dest, content); continue; }
    if (project.has(dest)) { if (project.get(dest) !== content) changed.push(dest); }
    else added.push(dest);
    project.set(dest, content);
  }

  const sessionNames = files.map(([d]) => d).sort();
  const projectNames = [...project.keys()].sort();
  const sessionRoot = `sesion-${session.num}`;
  const projectRoot = 'mi-proyecto-adso';

  const sessionZip = buildZip([
    { name: `${sessionRoot}/README.md`, data: Buffer.from(readme(session, 'session', sessionNames)) },
    ...files.sort(([a], [b]) => a.localeCompare(b)).map(([d, c]) => ({ name: `${sessionRoot}/${d}`, data: Buffer.from(c) }))
  ]);
  const projectZip = buildZip([
    { name: `${projectRoot}/README.md`, data: Buffer.from(readme(session, 'project', projectNames)) },
    ...projectNames.map((d) => ({ name: `${projectRoot}/${d}`, data: Buffer.from(project.get(d)) }))
  ]);

  const sessionFile = `${session.dir}/codigo-sesion-${session.num}.zip`;
  const projectFile = `${session.dir}/proyecto-hasta-sesion-${session.num}.zip`;
  fs.writeFileSync(sessionFile, sessionZip);
  fs.writeFileSync(projectFile, projectZip);

  data.push({
    id: session.id, num: session.num, week: session.week, title: session.title, summary: session.summary, icon: session.icon,
    lesson: `${session.dir}/index.html`,
    added: added.filter((f) => !f.startsWith('docs/')),
    changed,
    session: { href: sessionFile, bytes: sessionZip.length, files: sessionNames.length },
    project: { href: projectFile, bytes: projectZip.length, files: projectNames.length }
  });
  console.log(`✓ S${session.num}: sesión ${sessionNames.length} archivos (${(sessionZip.length / 1024).toFixed(1)} KB) · proyecto ${projectNames.length} archivos (${(projectZip.length / 1024).toFixed(1)} KB) · +${added.length} nuevos, ${changed.length} modificados`);
}

const js = `// Generado por tools/build-downloads.mjs — no editar a mano.
// Paquetes de código del proyecto transversal por sesión (solo la sesión y proyecto acumulado).
window.ADSO_DOWNLOADS = ${JSON.stringify(data, null, 2)};
`;
fs.writeFileSync('assets/js/downloads-data.js', js);
console.log('✓ assets/js/downloads-data.js');
