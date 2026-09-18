/**
 * ============================================================================
 * SERVICIO NACIONAL DE APRENDIZAJE - SENA
 * Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH - Garzón)
 * Tecnólogo en Análisis y Desarrollo de Software (ADSO 2026)
 * 
 * TALLER DE AULA - SESIÓN 05: CONSUMO CON FETCH API Y MANIPULACIÓN DEL DOM
 * Archivo: plantilla_aprendiz.js / app.js
 * Modalidad: Taller Asistido en Aula (Bloque 2)
 * ============================================================================
 * 
 * INSTRUCCIONES PEDAGÓGICAS:
 * Este archivo contiene la lógica de la aplicación cliente SPA. Tu objetivo es
 * conectar la interfaz gráfica (index.html) con la API REST de Express creada
 * en la Sesión 04 (http://localhost:3000/api/productos).
 * 
 * REGLAS TÉCNICAS OBLIGATORIAS:
 * 1. Usar async/await con la función nativa fetch() del navegador.
 * 2. Verificar SIEMPRE si la respuesta fue exitosa mediante "res.ok".
 *    (Recuerda: fetch NO dispara el bloque catch en errores 404 o 500).
 * 3. Prevenir la recarga de formularios con e.preventDefault().
 * 4. Manipular el DOM de manera eficiente utilizando Template Literals y querySelector.
 * 5. Notificar visualmente al usuario el resultado de cada acción (Toasts / Alertas).
 * 
 * ============================================================================
 */

// URL base de la API REST de Express construida en la Sesión 04
const API_URL = 'http://localhost:3000/api/productos';

// Estado global de la aplicación cliente en memoria
let estadoApp = {
  productos: [],
  categoriaActiva: 'TODAS',
  terminoBusqueda: '',
  conectadoABackend: false
};

// Referencias a elementos clave del DOM
const gridProductos = document.getElementById('grid-productos');
const estadoCarga = document.getElementById('estado-carga');
const estadoVacio = document.getElementById('estado-vacio');
const estadoError = document.getElementById('estado-error');
const conteoProductos = document.getElementById('conteo-productos');
const inputBusqueda = document.getElementById('input-busqueda');
const contenedorFiltros = document.getElementById('contenedor-filtros');
const modalProducto = document.getElementById('modal-producto');
const formProducto = document.getElementById('form-producto');
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnReintentar = document.getElementById('btn-reintentar');
const badgeConexion = document.getElementById('badge-conexion');
const textoConexion = document.getElementById('texto-conexion');
const toastContainer = document.getElementById('toast-container');

// ============================================================================
// RETO 1: Conexión con Fetch API y Renderizado de Tarjetas de Productos
// ============================================================================
/**
 * Realiza una petición GET a la API REST, parsea la respuesta JSON y delega
 * el renderizado de los productos en el contenedor del catálogo.
 * 
 * Puntos a resolver:
 * 1. Muestra el spinner de carga (estadoCarga) y oculta el grid y los errores.
 * 2. Ejecuta: const res = await fetch(API_URL);
 * 3. Valida: if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
 * 4. Parsea el payload: const data = await res.json();
 * 5. Guarda data.datos (o data) en estadoApp.productos y llama a aplicarFiltrosYRenderizar().
 * 6. Si la conexión falla, captura el error y llama a mostrarErrorConexion(error.message).
 */
async function cargarProductosDesdeAPI() {
  console.log('🔄 [Reto 1] Iniciando consulta con fetch a:', API_URL);

  // TODO: 1. Mostrar estado de carga y ocultar otros estados

  try {
    // TODO: 2. Realizar petición GET con fetch()
    // const res = await fetch(API_URL);

    // TODO: 3. Validar res.ok defensivamente
    // if (!res.ok) {
    //   throw new Error(`Error en el servidor: HTTP ${res.status}`);
    // }

    // TODO: 4. Parsear respuesta JSON y actualizar estadoApp
    // const data = await res.json();
    // estadoApp.productos = data.datos || data;
    // estadoApp.conectadoABackend = true;

    // TODO: 5. Actualizar badge de conexión y renderizar catálogo
    // actualizarBadgeConexion(true);
    // aplicarFiltrosYRenderizar();

  } catch (error) {
    console.error('❌ Error al consultar la API REST:', error);
    // TODO: 6. Manejar error visual llamando a mostrarErrorConexion(error.message);
  }
}

/**
 * Recibe un arreglo de productos y genera el HTML dinámico de cada tarjeta.
 * @param {Array} lista - Arreglo de objetos de productos
 */
function renderizarCatalogo(lista) {
  // TODO: 1. Limpiar el contenido anterior de gridProductos (innerHTML = '')
  
  // TODO: 2. Si la lista está vacía, mostrar estadoVacio y ocultar gridProductos

  // TODO: 3. Si hay productos, iterar la lista (map o forEach) y construir cada tarjeta
  // Formato sugerido para cada tarjeta:
  // - Nombre del producto, Categoría (badge), SKU (font-mono)
  // - Precio formateado en pesos colombianos (Intl.NumberFormat)
  // - Indicador de Stock con color (verde si > 5, ámbar si <= 5, rojo si 0)
  // - Botón rápido para actualizar Stock (+1 o editar, Reto 4)

  // TODO: 4. Insertar el HTML resultante en gridProductos y re-inicializar lucide icons
  // lucide.createIcons();
}

// ============================================================================
// RETO 2: Buscador en Tiempo Real y Filtrado por Categoría
// ============================================================================
/**
 * Filtra el arreglo local estadoApp.productos según:
 * 1. estadoApp.categoriaActiva (si es 'TODAS', no filtra por categoría).
 * 2. estadoApp.terminoBusqueda (coincidencia insensible a mayúsculas en nombre o SKU).
 * Finalmente pasa los elementos filtrados a renderizarCatalogo().
 */
function aplicarFiltrosYRenderizar() {
  // TODO: 1. Obtener los productos filtrados según categoriaActiva y terminoBusqueda
  // const filtrados = estadoApp.productos.filter(prod => { ... });

  // TODO: 2. Actualizar el texto del contador: `${filtrados.length} de ${estadoApp.productos.length} productos`
  
  // TODO: 3. Enviar los productos filtrados a renderizarCatalogo(filtrados)
}

// ============================================================================
// RETO 3: Formulario Modal y Envío POST con Headers application/json
// ============================================================================
/**
 * Manejador del evento 'submit' del formulario de nuevo producto.
 * @param {Event} e - Evento submit del formulario
 */
async function manejarCreacionProducto(e) {
  // TODO: 1. PREVENIR LA RECARGA DE PÁGINA OBLIGATORIAMENTE:
  e.preventDefault();

  // TODO: 2. Leer los datos del formulario usando new FormData(e.target) o los inputs directos
  // const formData = new FormData(formProducto);
  // const nuevoProducto = {
  //   nombre: formData.get('nombre').trim(),
  //   sku: formData.get('sku').trim().toUpperCase(),
  //   categoria: formData.get('categoria'),
  //   precio: Number(formData.get('precio')),
  //   stock: Number(formData.get('stock'))
  // };

  // TODO: 3. Validar en el cliente que ningún campo esté vacío y que precio > 0

  // TODO: 4. Realizar la petición POST con fetch() a API_URL
  // Recuerda configurar el objeto de opciones:
  // {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(nuevoProducto)
  // }

  // TODO: 5. Validar la respuesta con res.ok y status 201 Created:
  // if (!res.ok) {
  //   const errorData = await res.json();
  //   throw new Error(errorData.error || 'Error al crear producto');
  // }

  // TODO: 6. Si fue exitoso:
  // - Cerrar el modal
  // - Limpiar el formulario: formProducto.reset()
  // - Mostrar notificación Toast de éxito
  // - Recargar la lista de productos llamando a cargarProductosDesdeAPI()
}

// ============================================================================
// RETO 4: Actualización en Caliente de Stock con Método PATCH
// ============================================================================
/**
 * Actualiza el stock de un producto específico enviando una petición PATCH.
 * @param {number} id - ID del producto a modificar
 * @param {number} nuevoStock - Cantidad numérica del nuevo stock
 */
async function actualizarStockProducto(id, nuevoStock) {
  console.log(`📦 [Reto 4] Modificando stock de producto ID ${id} a: ${nuevoStock}`);

  // TODO: 1. Validar que nuevoStock sea un número válido y >= 0

  try {
    // TODO: 2. Ejecutar petición PATCH a `${API_URL}/${id}/stock`:
    // const res = await fetch(`${API_URL}/${id}/stock`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ stock: nuevoStock })
    // });

    // TODO: 3. Validar res.ok
    // if (!res.ok) throw new Error('No se pudo actualizar el stock en la API');

    // TODO: 4. Actualizar el producto en estadoApp.productos o recargar catálogo
    // Mostrar Toast de éxito: "Stock actualizado correctamente"

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    mostrarToast(error.message, 'error');
  }
}

// ============================================================================
// RETO 5 (PRO): Manejo Defensivo de Errores y Notificaciones Visuales (Toast)
// ============================================================================
/**
 * Muestra una notificación temporal flotante en la esquina inferior de la pantalla.
 * @param {string} mensaje - Texto a mostrar en la notificación
 * @param {'exito'|'error'|'info'} tipo - Tipo de notificación
 */
function mostrarToast(mensaje, tipo = 'info') {
  // TODO: Crear un elemento div con Tailwind para el toast,
  // agregarlo a toastContainer y removerlo automáticamente después de 3.5 segundos con setTimeout().
}

/**
 * Muestra el panel de error cuando no hay conexión con el servidor.
 * @param {string} mensaje - Mensaje detallado del error
 */
function mostrarErrorConexion(mensaje) {
  if (estadoCarga) estadoCarga.classList.add('hidden');
  if (gridProductos) gridProductos.classList.add('hidden');
  if (estadoVacio) estadoVacio.classList.add('hidden');
  if (estadoError) {
    estadoError.classList.remove('hidden');
    const msgEl = document.getElementById('mensaje-error');
    if (msgEl) msgEl.textContent = mensaje;
  }
  actualizarBadgeConexion(false);
}

function actualizarBadgeConexion(conectado) {
  if (!badgeConexion || !textoConexion) return;
  if (conectado) {
    badgeConexion.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 shadow-2xs';
    badgeConexion.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>API Conectada (:3000)</span>';
  } else {
    badgeConexion.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700 flex items-center gap-1.5 shadow-2xs';
    badgeConexion.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span><span>Sin conexión (:3000)</span>';
  }
}

// ============================================================================
// ASIGNACIÓN DE EVENT LISTENERS INICIALES
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Cargar productos desde la API al iniciar
  cargarProductosDesdeAPI();

  // 2. Control de Apertura/Cierre del Modal
  if (btnAbrirModal) btnAbrirModal.addEventListener('click', () => modalProducto.classList.remove('hidden'));
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => modalProducto.classList.add('hidden'));
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', () => modalProducto.classList.add('hidden'));

  // 3. Listener del Formulario Submit (Reto 3)
  if (formProducto) formProducto.addEventListener('submit', manejarCreacionProducto);

  // 4. Listener de Búsqueda por Texto (Reto 2)
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
      estadoApp.terminoBusqueda = e.target.value.trim().toLowerCase();
      aplicarFiltrosYRenderizar();
    });
  }

  // 5. Listener de Filtros por Categoría (Reto 2)
  if (contenedorFiltros) {
    contenedorFiltros.addEventListener('click', (e) => {
      const boton = e.target.closest('.btn-filtro');
      if (!boton) return;

      document.querySelectorAll('.btn-filtro').forEach(b => {
        b.className = 'btn-filtro px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 hover:bg-slate-200 text-slate-700';
      });
      boton.className = 'btn-filtro px-3 py-1.5 rounded-lg text-xs font-bold transition bg-[#00324D] text-white shadow-xs';

      estadoApp.categoriaActiva = boton.dataset.categoria;
      aplicarFiltrosYRenderizar();
    });
  }

  // 6. Botón de Reintentar Conexión
  if (btnReintentar) {
    btnReintentar.addEventListener('click', () => {
      cargarProductosDesdeAPI();
    });
  }
});
