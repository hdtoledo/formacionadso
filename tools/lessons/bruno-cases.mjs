// =============================================================================
// Fuente única de las colecciones Bruno de las sesiones con API.
// De aquí salen:
//   1. Los archivos .bru reales           → node tools/lessons/gen-bruno.mjs s09|s10
//   2. Las tarjetas "Envía / Debe responder" de las diapositivas → {{BRUNO:1-6}} en la plantilla
// Así la explicación de la lección y la colección probada nunca se desincronizan.
// =============================================================================
import { escHtml } from '../lib-replace.mjs';

const ADMIN = 'a0000000-0000-0000-0000-000000000001';
const APRENDIZ = 'b0000000-0000-0000-0000-000000000002';

const NEW_SERVICE = {
  type: 'service', name: 'Analítica de Datos para el Agro', category: 'agroindustria',
  description: 'Tableros de producción agrícola con datos abiertos del Huila.', icon: 'bar-chart',
  code: 'SRV-DATA-05', hours: 40, views: 999999
};

export const COLLECTIONS = {
  s09: {
    folder: 'server/bruno',
    name: 'ADSO Backend - Sesión 09 UserRepository',
    cases: [
      { file: 'Health Check', title: 'Health Check', status: 200, method: 'get', url: '/api/health',
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.services.postgres.status).to.equal("healthy");'],
        docs: ['Envía: GET sin body.', 'Debe responder: 200 con services.postgres.status = "healthy".', 'Si falla, revise server/.env antes de seguir: sin PostgreSQL ninguna prueba funcionará.'],
        respond: '{ "services": { "postgres": { "status": "healthy" } } }',
        why: 'Punto de partida: si PostgreSQL no está <em>healthy</em>, ninguna otra prueba tiene sentido.' },
      { file: 'Crear Usuario (201 Created)', title: 'Crear usuario', status: 201, method: 'post', url: '/api/dev/users',
        body: { email: 'Nuevo.Aprendiz@MiSena.edu.co' },
        tests: ['expect(res.status).to.equal(201);', 'expect(res.body.success).to.equal(true);', 'expect(res.body.data.email).to.equal("nuevo.aprendiz@misena.edu.co");',
          'expect(res.body.data.role).to.equal("user");', 'expect(res.body.data.is_verified).to.equal(false);', 'expect(res.body.data).to.not.have.property("password_hash");'],
        docs: ['Envía: { "email": "Nuevo.Aprendiz@MiSena.edu.co" } (con mayúsculas a propósito).', 'Debe responder: 201 con data.id (UUID generado por PostgreSQL), email en minúsculas, role "user", is_verified false y SIN password_hash.', 'Demuestra: normalizeEmail + RETURNING con columnas explícitas.'],
        respond: '{ "success": true, "data": {\n  "id": "…uuid…",\n  "email": "nuevo.aprendiz@misena.edu.co",\n  "role": "user", "is_verified": false } }',
        why: 'El correo se guarda en minúsculas y la respuesta <strong>no</strong> trae <code class="font-mono">password_hash</code>.' },
      { file: 'Crear Duplicado en Mayúsculas (409 Conflict)', title: 'Duplicado en mayúsculas', status: 409, method: 'post', url: '/api/dev/users',
        body: { email: 'NUEVO.APRENDIZ@misena.edu.co' },
        tests: ['expect(res.status).to.equal(409);', 'expect(res.body.success).to.equal(false);', 'expect(res.body.code).to.equal("EMAIL_ALREADY_EXISTS");'],
        docs: ['Envía: el mismo correo de la 02 con otras mayúsculas. Requiere haber ejecutado la 02.', 'Debe responder: 409 con code "EMAIL_ALREADY_EXISTS" en el formato estándar de error.', 'Demuestra: PostgreSQL lanza 23505 (uq_users_email) y el repositorio lo traduce a AppError 409.'],
        respond: '{ "success": false, "statusCode": 409,\n  "code": "EMAIL_ALREADY_EXISTS" }',
        why: 'Necesita la 02. PostgreSQL lanza <code class="font-mono">23505</code> y el repositorio lo traduce a 409.' },
      { file: 'Asignación Masiva de Rol (role ignorado)', title: 'Asignación masiva de rol', status: 201, method: 'post', url: '/api/dev/users',
        body: { email: 'intento.admin@misena.edu.co', role: 'admin' },
        tests: ['expect(res.status).to.equal(201);', 'expect(res.body.data.email).to.equal("intento.admin@misena.edu.co");', 'expect(res.body.data.role).to.equal("user");'],
        docs: ['Envía: un correo nuevo y "role": "admin" (intento de auto-ascenso).', 'Debe responder: 201 con role "user". El campo role del body se ignora.', 'Demuestra: el controlador solo toma email de req.body (defensa contra asignación masiva).'],
        respond: '{ "success": true, "data": {\n  "email": "intento.admin@misena.edu.co",\n  "role": "user" } }',
        why: 'El atacante pide ser admin y queda como <code class="font-mono">user</code>: el controlador solo lee <code class="font-mono">email</code>.' },
      { file: 'Correo Inválido (400 Bad Request)', title: 'Correo inválido', status: 400, method: 'post', url: '/api/dev/users',
        body: { email: 12345 },
        tests: ['expect(res.status).to.equal(400);', 'expect(res.body.code).to.equal("VALIDATION_ERROR");', 'expect(res.body.fieldErrors).to.have.property("email");'],
        docs: ['Envía: { "email": 12345 } (un número, no un texto).', 'Debe responder: 400 con code "VALIDATION_ERROR" y fieldErrors.email.', 'Demuestra: isValidEmail rechaza la entrada antes de tocar la base de datos.'],
        respond: '{ "success": false, "statusCode": 400,\n  "code": "VALIDATION_ERROR",\n  "fieldErrors": { "email": "Debe ser un correo…" } }',
        why: '<code class="font-mono">isValidEmail</code> lo rechaza antes de llegar a la base de datos.' },
      { file: 'Buscar por Email (200 OK)', title: 'Buscar por email', status: 200, method: 'get', url: '/api/dev/users/by-email?email=ADMIN@sena.edu.co',
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.data.email).to.equal("admin@sena.edu.co");', 'expect(res.body.data.role).to.equal("admin");', 'expect(res.body.data).to.not.have.property("password_hash");'],
        docs: ['Envía: GET con ?email=ADMIN@sena.edu.co (en mayúsculas).', 'Debe responder: 200 con el administrador de la semilla (email en minúsculas, role "admin") y SIN password_hash.', 'Demuestra: findByEmail parametrizado ($1) + normalizeEmail.'],
        respond: '{ "success": true, "data": {\n  "email": "admin@sena.edu.co",\n  "role": "admin" } }',
        why: 'Se busca en MAYÚSCULAS y lo encuentra: <code class="font-mono">normalizeEmail</code> + <code class="font-mono">$1</code>.' },
      { file: 'Inyección SQL en Email (404 Not Found)', title: 'Inyección SQL en email', status: 404, method: 'get', url: "/api/dev/users/by-email?email='OR'1'='1'--@x.co",
        tests: ['expect(res.status).to.equal(404);', 'expect(res.body.code).to.equal("USER_NOT_FOUND");', 'expect(res.body).to.not.have.property("data");'],
        docs: ["Envía: ?email='OR'1'='1'--@x.co (sin espacios para que pase el validador de formato).", 'Debe responder: 404 USER_NOT_FOUND y ningún dato de usuario.', "Con SQL concatenado la consulta sería WHERE email = ''OR'1'='1'--@x.co' y devolvería 200 con el primer usuario de la tabla. Con $1 PostgreSQL busca ese texto literal y no encuentra nada."],
        respond: '{ "success": false, "statusCode": 404,\n  "code": "USER_NOT_FOUND" }',
        why: 'Con SQL concatenado respondería <strong>200 con el primer usuario</strong>. Con <code class="font-mono">$1</code> el payload es solo texto: 0 filas.' },
      { file: 'Buscar por ID Inválido (400 Bad Request)', title: 'ID inválido', status: 400, method: 'get', url: '/api/dev/users/123',
        tests: ['expect(res.status).to.equal(400);', 'expect(res.body.code).to.equal("INVALID_ID");'],
        docs: ['Envía: GET con un id que no es UUID (123).', 'Debe responder: 400 con code "INVALID_ID".', 'Demuestra: sin isUuid, PostgreSQL lanzaría 22P02 (invalid_text_representation) y la API respondería 500.'],
        respond: '{ "success": false, "statusCode": 400,\n  "code": "INVALID_ID" }',
        why: 'Sin <code class="font-mono">isUuid</code>, PostgreSQL lanzaría <code class="font-mono">22P02</code> y la API respondería 500.' },
      { file: 'Buscar por ID (200 OK)', title: 'Buscar por ID', status: 200, method: 'get', url: `/api/dev/users/${ADMIN}`,
        tests: ['expect(res.status).to.equal(200);', `expect(res.body.data.id).to.equal("${ADMIN}");`, 'expect(res.body.data.email).to.equal("admin@sena.edu.co");', 'expect(res.body.data).to.not.have.property("password_hash");'],
        docs: [`Envía: GET con el UUID del administrador sembrado en la Sesión 06 (${ADMIN}).`, 'Debe responder: 200 con id, email "admin@sena.edu.co", role "admin" y SIN password_hash.', 'Demuestra: findById usa la clave primaria (users_pkey).'],
        respond: `{ "success": true, "data": {\n  "id": "${ADMIN}",\n  "email": "admin@sena.edu.co" } }`,
        why: 'UUID del administrador sembrado en la Sesión 06. Búsqueda por clave primaria.' },
      { file: 'Verificar Cuenta (200 OK · Transacción)', title: 'Verificar cuenta', status: 200, method: 'patch', url: `/api/dev/users/${APRENDIZ}/verify`,
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.data.email).to.equal("aprendiz.adso@misena.edu.co");', 'expect(res.body.data.is_verified).to.equal(true);'],
        docs: [`Envía: PATCH sin body al UUID del aprendiz sembrado (${APRENDIZ}).`, 'Debe responder: 200 con email "aprendiz.adso@misena.edu.co" e is_verified true.', `Compruebe en psql que la transacción también borró sus tokens: SELECT count(*) FROM verification_tokens WHERE user_id = '${APRENDIZ}';  → 0`],
        respond: '{ "success": true, "data": {\n  "email": "aprendiz.adso@misena.edu.co",\n  "is_verified": true } }',
        why: 'Transacción: UPDATE + DELETE de tokens. En psql, sus tokens deben quedar en 0.' },
      { file: 'Re-verificar Cuenta (409 Conflict)', title: 'Re-verificar cuenta', status: 409, method: 'patch', url: `/api/dev/users/${APRENDIZ}/verify`,
        tests: ['expect(res.status).to.equal(409);', 'expect(res.body.code).to.equal("USER_ALREADY_VERIFIED");'],
        docs: ['Envía: exactamente la misma petición de la 10. Requiere haber ejecutado la 10.', 'Debe responder: 409 con code "USER_ALREADY_VERIFIED".', 'Demuestra: verifyUser devolvió null (WHERE is_verified = FALSE no encontró filas) y el controlador distinguió "ya verificado" (409) de "no existe" (404).'],
        respond: '{ "success": false, "statusCode": 409,\n  "code": "USER_ALREADY_VERIFIED" }',
        why: 'Necesita la 10. El controlador distingue "ya verificada" (409) de "no existe" (404).' }
    ]
  },

  s10: {
    folder: 'server/bruno-catalogo',
    name: 'ADSO Backend - Sesión 10 Catálogo MongoDB',
    cases: [
      { file: 'Contenidos Publicados (200 OK)', title: 'Contenidos publicados', status: 200, method: 'get', url: '/api/content/published',
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.data.length).to.be.greaterThan(0);', 'expect(res.body.data.every((c) => c.active === true)).to.equal(true);', 'expect(res.body.meta.limit).to.equal(20);'],
        docs: ['Envía: GET sin parámetros (ruta pública de la Landing Page).', 'Debe responder: 200 con data[] (solo active: true) y meta { count, limit: 20 }. Con la semilla de la Sesión 07: count 10.', 'Demuestra: el filtro { active: true } y el límite por defecto de parseLimit.'],
        respond: '{ "success": true,\n  "data": [ …solo "active": true… ],\n  "meta": { "count": 10, "limit": 20 } }',
        why: 'Con la semilla de la Sesión 07 hay 10 publicados. Ningún listado sale sin <code class="font-mono">limit</code>.' },
      { file: 'Publicados por Tipo (200 OK)', title: 'Publicados por tipo', status: 200, method: 'get', url: '/api/content/published?type=service',
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.data.length).to.be.greaterThan(0);', 'expect(res.body.data.every((c) => c.active === true)).to.equal(true);', 'expect(res.body.data.every((c) => c.type === "service")).to.equal(true);'],
        docs: ['Envía: GET con ?type=service.', 'Debe responder: 200 solo con servicios publicados (4 con la semilla de la Sesión 07).', 'Demuestra: filtro por discriminator validado contra la lista blanca CONTENT_TYPES.'],
        respond: '{ "success": true,\n  "data": [ …solo "type": "service"… ],\n  "meta": { "count": 4, "limit": 20 } }',
        why: '<code class="font-mono">"service"</code> está en la lista blanca <code class="font-mono">CONTENT_TYPES</code>: pasa al filtro.' },
      { file: 'Inyección NoSQL en Tipo (400 Bad Request)', title: 'Inyección NoSQL en tipo', status: 400, method: 'get', url: '/api/content/published?type[$ne]=banner',
        tests: ['expect(res.status).to.equal(400);', 'expect(res.body.code).to.equal("VALIDATION_ERROR");', 'expect(res.body.fieldErrors).to.have.property("type");', 'expect(res.body).to.not.have.property("data");'],
        docs: ['Envía: ?type[$ne]=banner. Express lo convierte en el objeto { $ne: "banner" }.', 'Debe responder: 400 VALIDATION_ERROR con fieldErrors.type y ningún dato.', 'Sin validación, MongoDB devolvería los 8 contenidos que NO son banners: el atacante controlaría el filtro.'],
        respond: '{ "success": false, "statusCode": 400,\n  "code": "VALIDATION_ERROR",\n  "fieldErrors": { "type": "Debe ser uno de: banner, …" } }',
        why: 'Sin validación devolvería los <strong>8 que no son banners</strong>. <code class="font-mono">assertContentType</code> exige texto de la lista blanca.' },
      { file: 'Límite Fuera de Rango (400 Bad Request)', title: 'Límite fuera de rango', status: 400, method: 'get', url: '/api/content/published?limit=500',
        tests: ['expect(res.status).to.equal(400);', 'expect(res.body.code).to.equal("VALIDATION_ERROR");', 'expect(res.body.fieldErrors).to.have.property("limit");'],
        docs: ['Envía: ?limit=500.', 'Debe responder: 400 con fieldErrors.limit = "Debe ser un número entero entre 1 y 50.".', 'Demuestra: parseLimit pone un tope; nadie puede pedir la colección completa.'],
        respond: '{ "success": false, "statusCode": 400,\n  "code": "VALIDATION_ERROR",\n  "fieldErrors": { "limit": "Debe ser un número entero entre 1 y 50." } }',
        why: '<code class="font-mono">parseLimit</code> acepta de 1 a 50: nadie puede descargar la colección completa.' },
      { file: 'Crear Servicio en Borrador (201 Created)', title: 'Crear servicio (borrador)', status: 201, method: 'post', url: '/api/dev/content',
        body: NEW_SERVICE, post: 'if (res.status === 201) bru.setVar("contentId", res.body.data._id);',
        tests: ['expect(res.status).to.equal(201);', 'expect(res.body.data.type).to.equal("service");', 'expect(res.body.data.code).to.equal("SRV-DATA-05");', 'expect(res.body.data.active).to.equal(false);', 'expect(res.body.data.views).to.equal(0);'],
        docs: ['Envía: un servicio completo con "views": 999999 (intento de inflar métricas).', 'Debe responder: 201 con _id, type "service", active false (borrador) y views 0: views es un campo protegido.', 'El script post-response guarda data._id en la variable {{contentId}}, que usan la petición 08 (en Tests) y las peticiones 09 a 12 (en la URL).'],
        respond: '{ "success": true, "data": {\n  "_id": "…objectId…", "type": "service",\n  "code": "SRV-DATA-05",\n  "active": false, "views": 0 } }',
        why: 'Nace como <strong>borrador</strong> y <code class="font-mono">views</code> queda en 0. Guarda el <code class="font-mono">_id</code> en <code class="font-mono">{{contentId}}</code>.' },
      { file: 'Banner con Enlace JavaScript Malicioso (400 Bad Request)', title: 'Banner con enlace javascript:', status: 400, method: 'post', url: '/api/dev/content',
        body: { type: 'banner', title: 'Banner malicioso', ctaUrl: 'javascript:alert(document.cookie)' },
        tests: ['expect(res.status).to.equal(400);', 'expect(res.body.code).to.equal("VALIDATION_ERROR");', 'expect(res.body.fieldErrors).to.have.property("ctaUrl");'],
        docs: ['Envía: un banner con ctaUrl "javascript:alert(document.cookie)".', 'Debe responder: 400 VALIDATION_ERROR con fieldErrors.ctaUrl.', 'Demuestra: SAFE_LINK solo acepta https:// o rutas internas; bloquea un XSS futuro en el <a href> de React.'],
        respond: '{ "success": false, "statusCode": 400,\n  "code": "VALIDATION_ERROR",\n  "fieldErrors": { "ctaUrl": "El enlace debe ser https://…" } }',
        why: '<code class="font-mono">SAFE_LINK</code> bloquea el enlace: en el botón de React sería un XSS.' },
      { file: 'Código de Servicio Duplicado (409 Conflict)', title: 'Código duplicado', status: 409, method: 'post', url: '/api/dev/content',
        body: { ...NEW_SERVICE, code: 'SRV-SOFT-01' },
        tests: ['expect(res.status).to.equal(409);', 'expect(res.body.code).to.equal("DUPLICATE_KEY");', 'expect(res.body.fieldErrors).to.have.property("code");'],
        docs: ['Envía: el mismo servicio con code "SRV-SOFT-01", que ya existe en la semilla de la Sesión 07.', 'Debe responder: 409 DUPLICATE_KEY con fieldErrors.code.', 'Demuestra: idx_unique_service_code rechaza el duplicado (error 11000) y errorHandler lo traduce a 409.'],
        respond: '{ "success": false, "statusCode": 409,\n  "code": "DUPLICATE_KEY",\n  "fieldErrors": { "code": "Ya existe un registro…" } }',
        why: '<code class="font-mono">SRV-SOFT-01</code> ya existe: MongoDB lanza <code class="font-mono">11000</code> y la API responde 409.' },
      { file: 'Listado Admin de Borradores (200 OK)', title: 'Listado admin de borradores', status: 200, method: 'get', url: '/api/dev/content?active=false',
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.data.every((c) => c.active === false)).to.equal(true);', 'expect(res.body.data.some((c) => c._id === bru.getVar("contentId"))).to.equal(true);'],
        docs: ['Envía: GET /api/dev/content?active=false (vista del panel administrativo).', 'Debe responder: 200 solo con borradores, entre ellos el servicio creado en la 05.', 'Demuestra: la ruta pública nunca muestra borradores; el listado admin sí.'],
        respond: '{ "success": true,\n  "data": [ { "_id": "{{contentId}}",\n    "active": false, … } ] }',
        why: 'El borrador de la 05 aparece aquí, pero <strong>no</strong> en la ruta pública 01.' },
      { file: 'Publicar Contenido (200 OK)', title: 'Publicar contenido', status: 200, method: 'patch', url: '/api/dev/content/{{contentId}}',
        body: { active: true },
        tests: ['expect(res.status).to.equal(200);', 'expect(res.body.data._id).to.equal(bru.getVar("contentId"));', 'expect(res.body.data.active).to.equal(true);'],
        docs: ['Envía: PATCH con { "active": true } al contenido de la 05.', 'Debe responder: 200 con active true. Si vuelve a ejecutar la 01, ahora aparece en la Landing.', 'Demuestra: doc.set + doc.save ejecuta todas las validaciones del discriminator.'],
        respond: '{ "success": true, "data": {\n  "_id": "{{contentId}}", "active": true } }',
        why: 'Pasa de borrador a publicado. <code class="font-mono">doc.save()</code> vuelve a validar todo el documento.' },
      { file: 'Cambiar Tipo (422 Unprocessable Entity)', title: 'Cambiar tipo', status: 422, method: 'patch', url: '/api/dev/content/{{contentId}}',
        body: { type: 'banner' },
        tests: ['expect(res.status).to.equal(422);', 'expect(res.body.code).to.equal("CONTENT_TYPE_IMMUTABLE");'],
        docs: ['Envía: PATCH con { "type": "banner" } a un servicio.', 'Debe responder: 422 CONTENT_TYPE_IMMUTABLE.', 'Demuestra: la petición es válida, pero la regla de negocio impide cambiar el discriminator.'],
        respond: '{ "success": false, "statusCode": 422,\n  "code": "CONTENT_TYPE_IMMUTABLE" }',
        why: 'Petición bien formada, regla de negocio violada: <strong>422</strong>, no 400.' },
      { file: 'Eliminar Contenido (204 No Content)', title: 'Eliminar contenido', status: 204, method: 'delete', url: '/api/dev/content/{{contentId}}',
        tests: ['expect(res.status).to.equal(204);'],
        docs: ['Envía: DELETE al contenido de la 05.', 'Debe responder: 204 sin cuerpo.', 'Deja la colección como estaba: la prueba se limpia sola.'],
        respond: '(sin cuerpo)',
        why: 'Borrado exitoso. Deja la colección como estaba antes de la 05.' },
      { file: 'Eliminar de Nuevo (404 Not Found)', title: 'Eliminar de nuevo', status: 404, method: 'delete', url: '/api/dev/content/{{contentId}}',
        tests: ['expect(res.status).to.equal(404);', 'expect(res.body.code).to.equal("CONTENT_NOT_FOUND");'],
        docs: ['Envía: el mismo DELETE de la 11.', 'Debe responder: 404 CONTENT_NOT_FOUND.', 'Demuestra: el controlador distingue "id mal formado" (400) de "no existe" (404).'],
        respond: '{ "success": false, "statusCode": 404,\n  "code": "CONTENT_NOT_FOUND" }',
        why: 'El id es válido pero el documento ya no existe: 404, no 400.' }
    ]
  }
};

const pad = (n) => String(n).padStart(2, '0');
const indent = (s, n) => s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');

/** Nombre del archivo .bru (sin extensión) de un caso. */
export function bruName(c, i) {
  if (!c.file || /[/\\]|\.\./.test(c.file)) throw new Error(`Nombre de archivo inválido en caso ${i + 1}: "${c.file}"`);
  return `${pad(i + 1)} - ${c.file}`;
}

/** Contenido de un archivo .bru. */
export function toBru(c, i) {
  const name = bruName(c, i);
  const parts = [
    `meta {\n  name: ${name}\n  type: http\n  seq: ${i + 1}\n}`,
    `${c.method} {\n  url: {{baseUrl}}${c.url}\n  body: ${c.body ? 'json' : 'none'}\n  auth: none\n}`
  ];
  if (c.body) {
    parts.push('headers {\n  Content-Type: application/json\n}');
    parts.push(`body:json {\n${indent(JSON.stringify(c.body, null, 2), 2)}\n}`);
  }
  if (c.post) parts.push(`script:post-response {\n${indent(c.post, 2)}\n}`);
  parts.push(`tests {\n  test(${JSON.stringify(c.file)}, function () {\n${indent(c.tests.join('\n'), 4)}\n  });\n}`);
  parts.push(`docs {\n${indent(c.docs.join('\n'), 2)}\n}`);
  return parts.join('\n\n') + '\n';
}

// ----------------------------------------------------------------- tarjetas de las diapositivas
const WRAP = 'style="white-space:pre-wrap;word-break:break-all"';
const badge = (s) => (s < 300 ? 'bg-emerald-100 text-emerald-800' : s === 400 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800');
// Body corto en una línea; si es largo, una propiedad por línea para que se pueda transcribir
const sendText = (c) => {
  const line = `${c.method.toUpperCase()} {{baseUrl}}${c.url}`;
  if (!c.body) return c.method === 'get' ? line : `${line}\n(sin body)`;
  const compact = JSON.stringify(c.body, null, 1).replace(/\n\s*/g, ' ');
  return `${line}\n${compact.length <= 60 ? compact : JSON.stringify(c.body, null, 2)}`;
};

function card(c, i) {
  return `            <article class="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 min-w-0">
              <div class="flex items-center justify-between gap-2"><h3 class="font-bold text-slate-900">${pad(i + 1)} · ${escHtml(c.title)}</h3><span class="px-2 py-0.5 rounded-full font-mono font-extrabold ${badge(c.status)}">${escHtml(String(c.status))}</span></div>
              <div><span class="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Envía</span>
                <pre class="mt-0.5 bg-slate-900 text-sky-200 rounded-lg p-2 font-mono text-[10.5px] leading-snug whitespace-pre-wrap break-all" ${WRAP}><code ${WRAP}>${escHtml(sendText(c))}</code></pre></div>
              <div><span class="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Debe responder</span>
                <pre class="mt-0.5 bg-slate-900 text-emerald-200 rounded-lg p-2 font-mono text-[10.5px] leading-snug whitespace-pre-wrap break-all" ${WRAP}><code ${WRAP}>${escHtml(c.respond)}</code></pre></div>
              <p class="text-slate-600">${c.why}</p>
            </article>`;
}

/** Tarjetas de los casos from..to (numeración 1-based, inclusiva). */
export function renderCards(lesson, from, to) {
  if (!Object.hasOwn(COLLECTIONS, lesson)) throw new Error(`Sin colección Bruno para ${lesson}`);
  const col = COLLECTIONS[lesson];
  if (!col) throw new Error(`Sin colección Bruno para ${lesson}`);
  const out = [];
  for (let i = from - 1; i < to; i++) {
    if (!col.cases[i]) throw new Error(`Caso ${i + 1} inexistente en ${lesson}`);
    out.push(card(col.cases[i], i));
  }
  return out.join('\n');
}
