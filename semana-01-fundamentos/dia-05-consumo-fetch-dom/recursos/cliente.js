/**
 * ============================================================================
 * SERVICIO NACIONAL DE APRENDIZAJE - SENA
 * Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH - Garzón)
 * Tecnólogo en Análisis y Desarrollo de Software (ADSO 2026)
 * 
 * TALLER DE AULA - SESIÓN 05: CONSUMO CON FETCH API Y MANIPULACIÓN DEL DOM
 * Archivo: cliente.js (Lógica de la SPA en el navegador)
 * ============================================================================
 */

// URL base de la API REST de Express
const API_URL = 'http://localhost:3000/api/productos';

// Estado global de la aplicación cliente en memoria
let estadoApp = {
  productos: [],
  categoriaActiva: 'TODAS',
  terminoBusqueda: '',
  conectadoABackend: false
};

// Referencias al DOM
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

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

// ============================================================================
// RETO 1: READ (GET) - Carga Inicial y Coordinación de Estados Visuales
// ============================================================================
async function cargarProductosDesdeAPI() {
  if (estadoCarga) estadoCarga.classList.remove('hidden');
  if (gridProductos) gridProductos.classList.add('hidden');
  if (estadoError) estadoError.classList.add('hidden');
  if (estadoVacio) estadoVacio.classList.add('hidden');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Error en servidor: HTTP ${res.status} (${res.statusText})`);
    }

    const data = await res.json();
    estadoApp.productos = data.datos || data.dato || data;
    estadoApp.conectadoABackend = true;

    actualizarBadgeConexion(true);
    if (estadoCarga) estadoCarga.classList.add('hidden');
    aplicarFiltrosYRenderizar();

  } catch (error) {
    console.error('Error al cargar catálogo:', error);
    mostrarErrorConexion(error.message);
  }
}

// ============================================================================
// RETO 2: RENDERIZADO DINÁMICO CON TEMPLATE LITERALS
// ============================================================================
function renderizarCatalogo(lista) {
  if (!gridProductos) return;
  gridProductos.innerHTML = '';

  if (!lista || lista.length === 0) {
    if (estadoVacio) estadoVacio.classList.remove('hidden');
    gridProductos.classList.add('hidden');
    return;
  }

  if (estadoVacio) estadoVacio.classList.add('hidden');
  gridProductos.classList.remove('hidden');

  const tarjetasHTML = lista.map(prod => {
    const badgeStock = prod.stock > 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                       prod.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                       'bg-rose-50 text-rose-700 border-rose-200';

    return `
      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">${prod.sku || 'SKU'}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${badgeStock}">Stock: ${prod.stock}</span>
          </div>
          <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mt-2">${prod.categoria}</span>
          <h3 class="font-bold text-slate-900 text-sm mt-0.5 truncate" title="${prod.nombre}">${prod.nombre}</h3>
          <div class="text-base font-extrabold text-[#00324D] mt-2">${formatoCOP.format(prod.precio)}</div>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button onclick="actualizarStockProducto(${prod.id}, ${prod.stock + 1})" class="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 transition" title="Aumentar stock en 1">
            +1 Stock
          </button>
          <button onclick="eliminarProductoConfirmado(${prod.id})" class="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg font-semibold transition">
            Eliminar
          </button>
        </div>
      </div>
    `;
  }).join('');

  gridProductos.innerHTML = tarjetasHTML;
}

// ============================================================================
// RETO 3: FILTROS LOCALES REACTIVOS
// ============================================================================
function aplicarFiltrosYRenderizar() {
  const termino = estadoApp.terminoBusqueda.toLowerCase().trim();
  const categoria = estadoApp.categoriaActiva;

  const filtrados = estadoApp.productos.filter(prod => {
    const coincideCategoria = categoria === 'TODAS' || prod.categoria.toUpperCase() === categoria.toUpperCase();
    const coincideTexto = !termino ||
      prod.nombre.toLowerCase().includes(termino) ||
      (prod.sku && prod.sku.toLowerCase().includes(termino));

    return coincideCategoria && coincideTexto;
  });

  if (conteoProductos) {
    conteoProductos.textContent = `${filtrados.length} de ${estadoApp.productos.length} productos`;
  }

  renderizarCatalogo(filtrados);
}

// ============================================================================
// RETO 4: CREATE (POST) - Formulario con FormData
// ============================================================================
async function manejarCreacionProducto(e) {
  e.preventDefault();

  const formData = new FormData(formProducto);
  const nuevoProducto = {
    sku: formData.get('sku') ? formData.get('sku').trim().toUpperCase() : '',
    nombre: formData.get('nombre').trim(),
    categoria: formData.get('categoria'),
    precio: Number(formData.get('precio')),
    stock: Number(formData.get('stock'))
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al guardar el producto');
    }

    if (modalProducto) modalProducto.classList.add('hidden');
    formProducto.reset();
    mostrarToast('Producto creado exitosamente', 'exito');
    await cargarProductosDesdeAPI();

  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

// ============================================================================
// RETO 5: UPDATE (PATCH) - Actualizar Stock
// ============================================================================
async function actualizarStockProducto(id, nuevoStock) {
  if (nuevoStock < 0 || isNaN(nuevoStock)) {
    mostrarToast('El stock no puede ser negativo', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoStock: Number(nuevoStock) })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el stock');

    const producto = estadoApp.productos.find(p => p.id === id);
    if (producto) producto.stock = nuevoStock;

    aplicarFiltrosYRenderizar();
    mostrarToast('Stock actualizado correctamente', 'exito');

  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

// ============================================================================
// RETO 6: DELETE - Borrado Seguro por ID
// ============================================================================
async function eliminarProductoConfirmado(id) {
  const confirmar = confirm(`¿Estás seguro de eliminar permanentemente el producto ID #${id}?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el producto');

    estadoApp.productos = estadoApp.productos.filter(p => p.id !== id);
    aplicarFiltrosYRenderizar();
    mostrarToast('Producto eliminado exitosamente', 'exito');

  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

// ============================================================================
// RETO 7: UX TOAST NOTIFICATIONS
// ============================================================================
function mostrarToast(mensaje, tipo = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  const estilos = tipo === 'exito' ? 'bg-emerald-800 text-white border-emerald-600' :
                  tipo === 'error' ? 'bg-rose-800 text-white border-rose-600' :
                  'bg-slate-800 text-white border-slate-600';

  toast.className = `px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg border flex items-center gap-2 pointer-events-auto transition-all transform ${estilos}`;
  toast.innerHTML = `
    <span>${tipo === 'exito' ? '✓' : tipo === 'error' ? '✕' : 'ℹ'}</span>
    <span>${mensaje}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

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
    textoConexion.textContent = 'API Conectada (:3000)';
  } else {
    badgeConexion.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700 flex items-center gap-1.5 shadow-2xs';
    textoConexion.textContent = 'Sin conexión (:3000)';
  }
}

// ============================================================================
// EVENT LISTENERS INICIALES
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  cargarProductosDesdeAPI();

  if (btnAbrirModal) btnAbrirModal.addEventListener('click', () => modalProducto?.classList.remove('hidden'));
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => modalProducto?.classList.add('hidden'));
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', () => modalProducto?.classList.add('hidden'));

  if (formProducto) formProducto.addEventListener('submit', manejarCreacionProducto);

  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
      estadoApp.terminoBusqueda = e.target.value.trim().toLowerCase();
      aplicarFiltrosYRenderizar();
    });
  }

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

  if (btnReintentar) {
    btnReintentar.addEventListener('click', () => {
      cargarProductosDesdeAPI();
    });
  }
});
