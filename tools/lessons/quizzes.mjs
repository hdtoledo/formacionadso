// Autoevaluaciones por lección (fuente única). Cada pregunta: q (enunciado), options, answer (índice) y why.
// El HTML de las opciones es contenido del autor (no entrada de usuarios).
export const QUIZZES = {
  s01: [
    { q: '¿Qué garantiza una llave foránea (FK) en la tabla <code>ventas</code>?',
      options: ['Que el valor sea único dentro de <code>ventas</code>', 'Que el valor exista como llave primaria en la tabla referenciada', 'Que la columna nunca acepte decimales', 'Que la fila se borre sola al pasar 24 horas'],
      answer: 1, why: 'La FK protege la integridad referencial: el motor rechaza una venta asociada a un cliente o producto que no existe.' },
    { q: '¿Qué hace <code>DELETE FROM usuarios;</code> ejecutado sin <code>WHERE</code>?',
      options: ['Nada: el motor exige WHERE', 'Borra solo la última fila insertada', 'Borra todas las filas de la tabla', 'Elimina la tabla y su estructura'],
      answer: 2, why: 'Sin WHERE la condición abarca todas las filas. Por eso en producción se escribe primero el SELECT con el mismo WHERE.' },
    { q: '¿Qué restricción impide registrar dos usuarios con el mismo número de documento?',
      options: ['<code>NOT NULL</code>', '<code>DEFAULT</code>', '<code>CHECK</code>', '<code>UNIQUE</code>'],
      answer: 3, why: 'UNIQUE crea un índice que rechaza valores repetidos en la columna. NOT NULL solo exige que haya un valor.' }
  ],
  s02: [
    { q: '¿Por qué <code>WHERE SUM(total) &gt; 100</code> produce un error?',
      options: ['Porque SUM solo funciona con enteros', 'Porque WHERE filtra filas antes de agrupar; para grupos se usa HAVING', 'Porque falta un ORDER BY', 'Porque SUM no existe en MySQL'],
      answer: 1, why: 'El orden lógico es FROM → WHERE → GROUP BY → HAVING. Las funciones de agregación solo existen después de agrupar.' },
    { q: 'Necesitas listar TODOS los clientes, incluso los que nunca compraron. ¿Qué JOIN usas?',
      options: ['<code>INNER JOIN</code> clientes y ventas', '<code>LEFT JOIN</code> desde clientes hacia ventas', '<code>CROSS JOIN</code>', 'Un WHERE con dos tablas'],
      answer: 1, why: 'LEFT JOIN conserva todas las filas de la tabla izquierda; los clientes sin ventas aparecen con columnas NULL.' },
    { q: '¿Qué devuelve <code>WHERE telefono = NULL</code>?',
      options: ['Los clientes sin teléfono', 'Un error de sintaxis', 'Ninguna fila: hay que usar <code>IS NULL</code>', 'Todas las filas'],
      answer: 2, why: 'NULL significa "desconocido": cualquier comparación con = da desconocido, nunca verdadero. Se usa IS NULL / IS NOT NULL.' }
  ],
  s03: [
    { q: 'Con <code>const usuario = { nombre: "Ana" }</code>, ¿qué pasa al ejecutar <code>usuario.nombre = "Luis"</code>?',
      options: ['TypeError: no se puede modificar una constante', 'Funciona: const impide reasignar la variable, no mutar el objeto', 'Crea una variable nueva', 'Solo funciona dentro de una función'],
      answer: 1, why: 'const fija la referencia. Para un objeto inmutable se usa Object.freeze o se crea una copia con spread.' },
    { q: '¿Qué devuelve <code>[1, 2, 3].map((n) =&gt; n * 2)</code>?',
      options: ['<code>[2, 4, 6]</code> en un arreglo nuevo, sin modificar el original', '<code>12</code>', 'El mismo arreglo modificado', '<code>undefined</code>'],
      answer: 0, why: 'map transforma cada elemento y devuelve un arreglo NUEVO del mismo tamaño. Para acumular un valor se usa reduce.' },
    { q: 'Tres consultas independientes tardan 1 s cada una. ¿Cómo las ejecutas en ~1 s?',
      options: ['Tres await seguidos', '<code>await Promise.all([a(), b(), c()])</code>', 'Un bucle for con await', 'setTimeout de 1 s'],
      answer: 1, why: 'Promise.all lanza las tres promesas a la vez y espera a que todas terminen. Con await en serie tardarían ~3 s.' }
  ],
  s04: [
    { q: '¿Qué código HTTP corresponde a un recurso creado correctamente con POST?',
      options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
      answer: 1, why: '201 indica que se creó un recurso nuevo. 204 se usa cuando la operación es exitosa pero no hay cuerpo de respuesta.' },
    { q: 'Olvidaste <code>app.use(express.json())</code>. ¿Qué vale <code>req.body</code> en un POST con JSON?',
      options: ['El objeto JSON enviado', 'Un texto plano con el JSON', '<code>undefined</code>', 'Un error 500 automático'],
      answer: 2, why: 'Sin el middleware nadie interpreta el cuerpo de la petición, así que req.body queda undefined.' },
    { q: '¿Qué verbo reemplaza el recurso COMPLETO y es idempotente?',
      options: ['<code>PATCH</code>', '<code>POST</code>', '<code>PUT</code>', '<code>GET</code>'],
      answer: 2, why: 'PUT reemplaza todo el recurso: repetirlo deja el mismo resultado. PATCH modifica solo algunos campos.' }
  ],
  s05: [
    { q: '¿Por qué <code>fetch</code> necesita dos <code>await</code>?',
      options: ['Por compatibilidad con navegadores antiguos', 'El primero recibe los encabezados (Response); el segundo lee y convierte el cuerpo', 'Para reintentar si falla', 'No es necesario: uno basta'],
      answer: 1, why: 'fetch resuelve apenas llegan los headers. res.json() es otra promesa que lee el stream del cuerpo y lo parsea.' },
    { q: 'El servidor responde 404. ¿Qué hace la promesa de <code>fetch</code>?',
      options: ['Se rechaza y entra al catch', 'Se resuelve normalmente; hay que revisar <code>res.ok</code>', 'Lanza un TypeError', 'Reintenta tres veces'],
      answer: 1, why: 'fetch solo se rechaza ante fallos de red. Los 4xx y 5xx llegan resueltos: se valida res.ok o res.status.' },
    { q: 'Vas a pintar con <code>innerHTML</code> el nombre de un producto que viene del servidor. ¿Qué haces?',
      options: ['Nada: los datos del servidor son seguros', 'Escaparlo con <code>escapeHTML()</code> o usar <code>textContent</code>', 'Convertirlo a mayúsculas', 'Guardarlo en localStorage primero'],
      answer: 1, why: 'Un nombre como &lt;img onerror=…&gt; ejecutaría código en el navegador de todos (XSS almacenado).' }
  ],
  extra: [
    { q: 'En Tailwind (mobile-first), ¿cuándo aplica <code>md:grid-cols-3</code>?',
      options: ['Solo en celulares', 'Desde 768 px de ancho hacia arriba', 'Solo entre 768 y 1024 px', 'Únicamente al imprimir'],
      answer: 1, why: 'Las clases sin prefijo aplican a todos los tamaños; cada prefijo (sm, md, lg) agrega reglas desde ese ancho en adelante.' },
    { q: 'Con la escala de espaciado de 4 px, ¿cuánto mide <code>p-4</code>?',
      options: ['4 px', '8 px', '16 px', '40 px'],
      answer: 2, why: 'Cada unidad equivale a 0.25 rem (4 px): p-4 = 1 rem = 16 px. Usar la escala da ritmo visual consistente.' },
    { q: '¿Cuál es el contraste mínimo WCAG AA para texto normal?',
      options: ['2:1', '3:1', '4.5:1', '10:1'],
      answer: 2, why: 'AA exige 4.5:1 para texto normal y 3:1 para texto grande. Por eso se evita el gris claro sobre blanco en párrafos.' }
  ],
  s06: [
    { q: '¿Por qué <code>verification_tokens</code> guarda <code>token_hash</code> y no el token original?',
      options: ['Para ocupar menos espacio', 'Si la base de datos se filtra, los hashes no sirven para activar cuentas ajenas', 'Porque PostgreSQL no acepta textos largos', 'Para que el token no expire'],
      answer: 1, why: 'El token original solo viaja en el correo. Al verificar se calcula su SHA-256 y se compara con el hash guardado.' },
    { q: '¿Qué índice debes crear manualmente en el esquema de autenticación?',
      options: ['Sobre <code>users(email)</code>', 'Sobre <code>verification_tokens(token_hash)</code>', 'Sobre la llave foránea <code>verification_tokens(user_id)</code>', 'Ninguno: PostgreSQL indexa todo'],
      answer: 2, why: 'PRIMARY KEY y UNIQUE crean su índice solos; las llaves foráneas no. Duplicar índices solo frena las escrituras.' },
    { q: 'Con <code>ON DELETE CASCADE</code>, ¿qué ocurre al eliminar un usuario que tiene tokens?',
      options: ['El motor rechaza el borrado', 'Sus tokens se eliminan automáticamente en la misma operación', 'Los tokens quedan con user_id NULL', 'Se eliminan todos los tokens de la tabla'],
      answer: 1, why: 'CASCADE propaga el borrado a las filas hijas; RESTRICT, en cambio, impediría borrar al usuario.' }
  ],
  s07: [
    { q: '¿Por qué los usuarios van en PostgreSQL y el contenido de la Landing en MongoDB?',
      options: ['Porque MongoDB es más nuevo', 'Los usuarios exigen ACID y relaciones estrictas; el contenido es polimórfico y cambia de forma', 'Porque PostgreSQL no guarda textos', 'Por costos de licencia'],
      answer: 1, why: 'Persistencia políglota: cada dato va al motor que mejor resuelve su problema.' },
    { q: '¿Qué operador incrementa <code>views</code> en 1 sin leer el documento antes?',
      options: ['<code>$set</code>', '<code>$inc</code>', '<code>$push</code>', '<code>$add</code>'],
      answer: 1, why: '$inc es atómico en el servidor: dos visitas simultáneas no pisan el valor una de la otra.' },
    { q: 'En el seed JSON, ¿cómo escribes una fecha para que Compass la importe como <code>Date</code>?',
      options: ['<code>"2026-10-16"</code>', '<code>new Date("2026-10-16")</code>', '<code>{ "$date": "2026-10-16T10:00:00.000Z" }</code>', '<code>Date(2026, 10, 16)</code>'],
      answer: 2, why: 'JSON no tiene tipo fecha: el formato Extended JSON ($date) indica a Compass y mongoimport que es un Date real.' }
  ],
  s08: [
    { q: '¿Por qué se usa un <code>pg.Pool</code> y no un cliente nuevo por cada petición?',
      options: ['Porque es obligatorio en Express', 'Abrir conexiones es costoso: el pool las reutiliza y limita cuántas abre', 'Porque el cliente no soporta SELECT', 'Para no usar variables de entorno'],
      answer: 1, why: 'Con miles de peticiones, abrir una conexión por cada una agotaría el servidor de PostgreSQL.' },
    { q: '¿Por qué no se usa <code>cors({ origin: "*" })</code> en el proyecto?',
      options: ['Porque es más lento', 'El navegador rechaza "*" cuando viajan cookies y además abre la API a cualquier sitio', 'Porque Express no lo soporta', 'Porque solo funciona con HTTPS'],
      answer: 1, why: 'Las cookies httpOnly de la Semana 3 exigen credentials: true y un origen explícito (CLIENT_URL).' },
    { q: 'Si falta <code>CLIENT_URL</code> en el archivo <code>.env</code>, ¿qué hace el servidor?',
      options: ['Arranca y usa "*"', 'Arranca y falla en la primera petición', 'No arranca e indica qué variable falta (fail-fast)', 'Lo lee de package.json'],
      answer: 2, why: 'Fallar al iniciar es mejor que fallar en plena petición de un usuario.' }
  ],
  s09: [
    { q: 'Envías <code>\' OR \'1\'=\'1\' --</code> a tu API, que usa <code>$1</code>. ¿Qué ocurre?',
      options: ['Devuelve todos los usuarios', 'Devuelve 404: el motor lo trata como un texto literal', 'Borra la tabla users', 'Responde 500'],
      answer: 1, why: 'Con placeholders el motor analiza el SQL primero (parse) y luego recibe el valor (bind): ya no puede cambiar la consulta.' },
    { q: '¿Cómo se ejecuta correctamente una transacción con el pool?',
      options: ['<code>pool.query("BEGIN")</code> y luego <code>pool.query(...)</code>', '<code>pool.connect()</code> y todas las sentencias con el mismo <code>client</code>, con <code>release()</code> en el finally', 'Con <code>Promise.all</code>', 'No se puede en Node.js'],
      answer: 1, why: 'Cada pool.query puede usar otra conexión. Sin release(), el pool se agota y la API se cuelga.' },
    { q: '¿Por qué el controlador nunca toma <code>role</code> del cuerpo de la petición?',
      options: ['Por rendimiento', 'Para evitar asignación masiva: cualquiera enviaría <code>"role": "admin"</code>', 'Porque role no existe en la tabla', 'Porque Bruno no lo permite'],
      answer: 1, why: 'Solo se copian los campos permitidos; el rol lo decide el servidor.' }
  ],
  s10: [
    { q: '¿Qué recibe el controlador con <code>?type[$ne]=banner</code>?',
      options: ['El texto "banner"', 'El objeto <code>{ $ne: "banner" }</code>: un operador que alteraría el filtro', 'Un error 400 automático de Express', 'undefined'],
      answer: 1, why: 'Por eso el tipo se valida como texto en una lista blanca y sanitizeFilter actúa como segunda capa.' },
    { q: 'Creaste un contenido y no aparece en <code>/api/content/published</code>. ¿Por qué?',
      options: ['Falló el índice', 'Todo contenido nuevo nace como borrador (<code>active: false</code>)', 'Mongoose tarda un minuto en publicar', 'Falta reiniciar el servidor'],
      answer: 1, why: 'El administrador decide cuándo se publica: nada llega a la Landing por accidente.' },
    { q: '¿Por qué el esquema rechaza <code>ctaUrl: "javascript:alert(1)"</code>?',
      options: ['Porque es demasiado largo', 'Para evitar un XSS cuando React lo use en el href del botón', 'Porque MongoDB no guarda dos puntos', 'Por el límite de 100 kb'],
      answer: 1, why: 'Validar en el servidor también protege al frontend: solo se aceptan https:// o rutas internas.' }
  ]
};

const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const START = '<!-- AUTOEVALUACION:inicio (generado por tools/lessons/quizzes.mjs) -->';
const END = '<!-- AUTOEVALUACION:fin -->';

export function quizSlide(lessonId, family, sessionLabel) {
  const quiz = QUIZZES[lessonId];
  if (!quiz) throw new Error(`Sin autoevaluación para ${lessonId}`);
  const cls = family === 'slide-content'
    ? 'slide-content flex-col justify-center py-4 sm:py-6 w-full'
    : 'slide-item hidden flex flex-col justify-center py-6';
  const questions = quiz.map((item) => `
          <div data-question data-answer="${item.answer}" data-explain="${escAttr(item.why)}">
            <p>${item.q}</p>
            <ul>${item.options.map((o) => `<li>${o}</li>`).join('')}</ul>
          </div>`).join('');
  return `      ${START}
      <section class="${cls}" data-title="Autoevaluación rápida" data-block-label="BLOQUE 3 · AUTOEVALUACIÓN">
        <div class="max-w-4xl mx-auto w-full space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold w-fit">
            <i data-lucide="brain-circuit" class="w-3.5 h-3.5 text-[#39A900]"></i><span>Autoevaluación · ${quiz.length} preguntas · sin IA ni apuntes</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">¿Qué tanto dominas ${sessionLabel}?</h2>
          <p class="text-xs sm:text-sm text-slate-600 max-w-3xl">Responde antes de la sustentación. Cada opción muestra al instante si es correcta y por qué: úsala para detectar qué repasar.</p>
          <div data-quiz class="grid gap-3">${questions}
          </div>
        </div>
      </section>
      ${END}`;
}

/** Inserta (o reemplaza) la autoevaluación antes de la última diapositiva. Idempotente. */
export function injectQuiz(html, lessonId, sessionLabel) {
  let out = html.replace(new RegExp(`\\n?\\s*${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}`), '');
  const family = /class="slide-item/.test(out) ? 'slide-item' : 'slide-content';
  const re = /<(section|div) class="slide-(item|content)[^"]*"/g;
  let last = -1, m;
  while ((m = re.exec(out))) last = m.index;
  if (last < 0) throw new Error('No se encontraron diapositivas');
  // Insertar antes de la última diapositiva y de los comentarios que la encabezan
  const lines = out.slice(0, out.lastIndexOf('\n', last) + 1).split('\n');
  lines.pop(); // fragmento vacío tras el último salto de línea
  while (lines.length && /^\s*<!--.*-->\s*$/.test(lines[lines.length - 1])) lines.pop();
  const insertAt = lines.join('\n').length + 1;
  return out.slice(0, insertAt) + quizSlide(lessonId, family, sessionLabel) + '\n\n' + out.slice(insertAt);
}
