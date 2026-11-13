import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2];
fs.mkdirSync(path.join(out, 'environments'), { recursive: true });
fs.writeFileSync(path.join(out, 'bruno.json'), JSON.stringify({
  version: '1', name: 'ADSO Backend - Sesión 10 Catálogo MongoDB', type: 'collection', ignore: ['node_modules', '.git']
}, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'environments', 'Local.bru'), 'vars {\n  baseUrl: http://localhost:3000\n}\n');

const service = {
  type: 'service', name: 'Analítica de Datos para el Agro', category: 'agroindustria',
  description: 'Tableros de producción agrícola con datos abiertos del Huila.', icon: 'bar-chart',
  code: 'SRV-DATA-05', hours: 40, views: 999999
};

const reqs = [
  ['Contenidos Publicados (200 OK)', 'get', '/api/content/published', null,
    'Ruta pública de la Landing Page: solo devuelve documentos con active: true.',
    'expect(res.status).to.equal(200);\n    expect(res.body.data.every((c) => c.active === true)).to.equal(true);'],
  ['Publicados por Tipo (200 OK)', 'get', '/api/content/published?type=service', null,
    'Filtro por discriminator. El tipo se valida contra una lista blanca.',
    'expect(res.status).to.equal(200);\n    expect(res.body.data.every((c) => c.type === "service")).to.equal(true);'],
  ['Inyección NoSQL en Tipo (400 Bad Request)', 'get', '/api/content/published?type[$ne]=banner', null,
    'Express convierte ?type[$ne]=banner en el objeto { $ne: "banner" }. Sin validación, MongoDB devolvería todo lo que NO es banner.',
    'expect(res.status).to.equal(400);\n    expect(res.body.fieldErrors).to.have.property("type");'],
  ['Límite Fuera de Rango (400 Bad Request)', 'get', '/api/content/published?limit=500', null,
    'Ningún listado devuelve más de 50 documentos.',
    'expect(res.status).to.equal(400);\n    expect(res.body.fieldErrors).to.have.property("limit");'],
  ['Crear Servicio en Borrador (201 Created)', 'post', '/api/dev/content', service,
    'Se crea con active: false (borrador). views: 999999 se ignora porque es un campo protegido. Guarda el _id en la variable contentId.',
    'expect(res.status).to.equal(201);\n    expect(res.body.data.active).to.equal(false);\n    expect(res.body.data.views).to.equal(0);',
    'bru.setVar("contentId", res.body.data._id);'],
  ['Banner con Enlace JavaScript Malicioso (400 Bad Request)', 'post', '/api/dev/content',
    { type: 'banner', title: 'Banner malicioso', ctaUrl: 'javascript:alert(document.cookie)' },
    'El esquema solo acepta enlaces https:// o rutas internas: bloquea un XSS futuro en el <a href> de React.',
    'expect(res.status).to.equal(400);\n    expect(res.body.fieldErrors).to.have.property("ctaUrl");'],
  ['Código de Servicio Duplicado (409 Conflict)', 'post', '/api/dev/content', { ...service, code: 'SRV-SOFT-01' },
    'idx_unique_service_code (Sesión 07) rechaza el duplicado: MongoDB responde 11000 y la API lo traduce a 409.',
    'expect(res.status).to.equal(409);\n    expect(res.body.code).to.equal("DUPLICATE_KEY");'],
  ['Publicar Contenido (200 OK)', 'patch', '/api/dev/content/{{contentId}}', { active: true },
    'Actualización parcial: doc.set + doc.save ejecuta todas las validaciones. Revise que ahora aparece en la petición 01.',
    'expect(res.status).to.equal(200);\n    expect(res.body.data.active).to.equal(true);'],
  ['Cambiar Tipo (422 Unprocessable Entity)', 'patch', '/api/dev/content/{{contentId}}', { type: 'banner' },
    'El discriminator de un documento no cambia: la petición es válida pero la regla de negocio la impide.',
    'expect(res.status).to.equal(422);\n    expect(res.body.code).to.equal("CONTENT_TYPE_IMMUTABLE");'],
  ['Listado Admin de Borradores (200 OK)', 'get', '/api/dev/content?active=false', null,
    'Vista del panel administrativo: incluye borradores (active: false).',
    'expect(res.status).to.equal(200);\n    expect(res.body.data.every((c) => c.active === false)).to.equal(true);'],
  ['Eliminar Contenido (204 No Content)', 'delete', '/api/dev/content/{{contentId}}', null,
    'Borrado exitoso sin cuerpo de respuesta.', 'expect(res.status).to.equal(204);'],
  ['Eliminar de Nuevo (404 Not Found)', 'delete', '/api/dev/content/{{contentId}}', null,
    'El documento ya no existe.', 'expect(res.status).to.equal(404);\n    expect(res.body.code).to.equal("CONTENT_NOT_FOUND");']
];

reqs.forEach(([name, method, url, body, docs, test, post], i) => {
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
  if (post) parts.push(`script:post-response {\n  ${post}\n}`);
  parts.push(`tests {\n  test("${name}", function () {\n    ${test}\n  });\n}`);
  parts.push(`docs {\n  ${docs}\n}`);
  fs.writeFileSync(path.join(out, `${title}.bru`), parts.join('\n\n') + '\n');
});
console.log(`✓ ${reqs.length} peticiones Bruno en ${out}`);
