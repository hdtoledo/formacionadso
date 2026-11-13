import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2];
fs.mkdirSync(path.join(out, 'environments'), { recursive: true });

fs.writeFileSync(path.join(out, 'bruno.json'), JSON.stringify({
  version: '1', name: 'ADSO Backend - Sesión 09 UserRepository', type: 'collection', ignore: ['node_modules', '.git']
}, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'environments', 'Local.bru'), 'vars {\n  baseUrl: http://localhost:3000\n}\n');

const reqs = [
  ['Health Check', 'get', '/api/health', null, 'Antes de empezar: PostgreSQL debe aparecer healthy.', 'expect(res.body.services.postgres.status).to.equal("healthy");'],
  ['Crear Usuario (201 Created)', 'post', '/api/dev/users', { email: 'Nuevo.Aprendiz@MiSena.edu.co' },
    'Crea un usuario. Observe que el correo se guarda en minúsculas y que el UUID lo genera PostgreSQL.',
    'expect(res.status).to.equal(201);\n    expect(res.body.data.email).to.equal("nuevo.aprendiz@misena.edu.co");\n    expect(res.body.data).to.not.have.property("password_hash");'],
  ['Crear Duplicado en Mayúsculas (409 Conflict)', 'post', '/api/dev/users', { email: 'NUEVO.APRENDIZ@misena.edu.co' },
    'Mismo correo con otras mayúsculas: PostgreSQL responde 23505 (unique_violation) y la API lo traduce a 409.',
    'expect(res.status).to.equal(409);\n    expect(res.body.code).to.equal("EMAIL_ALREADY_EXISTS");'],
  ['Asignación Masiva de Rol (role ignorado)', 'post', '/api/dev/users', { email: 'intento.admin@misena.edu.co', role: 'admin' },
    'El atacante intenta crearse como admin. El controlador nunca toma el rol del body.',
    'expect(res.status).to.equal(201);\n    expect(res.body.data.role).to.equal("user");'],
  ['Correo Inválido (400 Bad Request)', 'post', '/api/dev/users', { email: 12345 },
    'Un número no es un correo: se rechaza antes de llegar a la base de datos.',
    'expect(res.status).to.equal(400);\n    expect(res.body.fieldErrors).to.have.property("email");'],
  ['Buscar por Email (200 OK)', 'get', '/api/dev/users/by-email?email=admin@sena.edu.co', null,
    'findByEmail con consulta parametrizada ($1).', 'expect(res.status).to.equal(200);\n    expect(res.body.data.role).to.equal("admin");'],
  ['Inyección SQL en Email (404 Not Found)', 'get', "/api/dev/users/by-email?email='OR'1'='1'--@x.co", null,
    "El payload 'OR'1'='1'-- viaja como TEXTO en $1: PostgreSQL busca un correo con ese valor literal y no encuentra nada.",
    'expect(res.status).to.equal(404);\n    expect(res.body.code).to.equal("USER_NOT_FOUND");'],
  ['Buscar por ID Inválido (400 Bad Request)', 'get', '/api/dev/users/123', null,
    'Un id que no es UUID se rechaza con 400 (sin validación, PostgreSQL lanzaría 22P02 y sería un 500).',
    'expect(res.status).to.equal(400);\n    expect(res.body.code).to.equal("INVALID_ID");'],
  ['Buscar por ID (200 OK)', 'get', '/api/dev/users/a0000000-0000-0000-0000-000000000001', null,
    'findById del administrador sembrado en la Sesión 06.', 'expect(res.status).to.equal(200);'],
  ['Verificar Cuenta (200 OK · Transacción)', 'patch', '/api/dev/users/b0000000-0000-0000-0000-000000000002/verify', null,
    'verifyUser: UPDATE is_verified + DELETE de tokens en una sola transacción. Compruebe en psql que el token desapareció.',
    'expect(res.status).to.equal(200);\n    expect(res.body.data.is_verified).to.equal(true);'],
  ['Re-verificar Cuenta (409 Conflict)', 'patch', '/api/dev/users/b0000000-0000-0000-0000-000000000002/verify', null,
    'La cuenta ya estaba activa: no se repite la operación.', 'expect(res.status).to.equal(409);\n    expect(res.body.code).to.equal("USER_ALREADY_VERIFIED");']
];

reqs.forEach(([name, method, url, body, docs, test], i) => {
  const seq = i + 1;
  const title = `${String(seq).padStart(2, '0')} - ${name}`;
  const parts = [
    `meta {\n  name: ${title}\n  type: http\n  seq: ${seq}\n}`,
    `${method} {\n  url: {{baseUrl}}${url}\n  body: ${body ? 'json' : 'none'}\n  auth: none\n}`
  ];
  if (body) {
    parts.push('headers {\n  Content-Type: application/json\n}');
    parts.push(`body:json {\n${JSON.stringify(body, null, 2).split('\n').map((l) => '  ' + l).join('\n')}\n}`);
  }
  parts.push(`tests {\n  test("${name}", function () {\n    ${test}\n  });\n}`);
  parts.push(`docs {\n  ${docs}\n}`);
  fs.writeFileSync(path.join(out, `${title}.bru`), parts.join('\n\n') + '\n');
});
console.log(`✓ ${reqs.length} peticiones Bruno en ${out}`);
