/**
 * =============================================================================
 * SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (GARZÓN)
 * PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
 * FORMACIÓN: NIVELACIÓN TÉCNICA FULL STACK MERN + SQL
 * SESIÓN 03 | DÍA 3: JAVASCRIPT MODERNO (ES6+) Y ASINCRONÍA
 * =============================================================================
 * ARCHIVO: dia-03-taller-es6-asincronia.js
 * RUTA: referencia-docente/semana-01/dia-03-taller-es6-asincronia.js
 * INSTRUCTOR: Ing. Hector David Toledo Garcia
 * EJECUCIÓN: node dia-03-taller-es6-asincronia.js
 * =============================================================================
 */

console.clear();
console.log("=================================================================");
console.log("SENA CADPH GARZÓN · SOLUCIONARIO OFICIAL SESIÓN 03: JAVASCRIPT ES6+");
console.log("Tecnólogo en Análisis y Desarrollo de Software (ADSO) - Ficha 2026");
console.log("Instructor: Ing. Hector David Toledo Garcia");
console.log("=================================================================\n");

// -----------------------------------------------------------------------------
// DATASET DE AULA: TIENDA AGROTECNOLÓGICA Y FERRETERA DEL HUILA
// -----------------------------------------------------------------------------
const inventario = [
  { sku: "TEC-01", nombre: "Teclado Mecánico RGB", categoria: "HARDWARE", stock: 8, precio: 120000 },
  { sku: "MON-02", nombre: "Monitor 24 pulg IPS", categoria: "PANTALLAS", stock: 3, precio: 580000 },
  { sku: "USB-03", nombre: "Hub USB-C 7 en 1", categoria: "ACCESORIOS", stock: 0, precio: 65000 },
  { sku: "SSD-04", nombre: "SSD NVMe 1TB PCIe 4.0", categoria: "ALMACENAMIENTO", stock: 5, precio: 320000 },
  { sku: "CAB-05", nombre: "Cable Red Cat 6 10m", categoria: "REDES", stock: 12, precio: 28000 },
  { sku: "MOU-06", nombre: "Mouse Inalámbrico Pro", categoria: "ACCESORIOS", stock: 6, precio: 75000 }
];

const pedidos = [
  {
    id: 101,
    cliente: { nombre: "Carlos Perdomo", ciudad: "Garzón", tipo: "FRECUENTE" },
    total: 195000,
    estado: "PAGADO",
    items: [
      { sku: "TEC-01", cant: 1, precioUnit: 120000 },
      { sku: "MOU-06", cant: 1, precioUnit: 75000 }
    ]
  },
  {
    id: 102,
    cliente: { nombre: "Mariana Rojas", ciudad: "Neiva", tipo: "NUEVO" },
    total: 580000,
    estado: "PENDIENTE",
    items: [
      { sku: "MON-02", cant: 1, precioUnit: 580000 }
    ]
  },
  {
    id: 103,
    cliente: { nombre: "Julian Andrade", ciudad: "Garzón", tipo: "FRECUENTE" },
    total: 93000,
    estado: "PAGADO",
    items: [
      { sku: "CAB-05", cant: 1, precioUnit: 28000 },
      { sku: "USB-03", cant: 1, precioUnit: 65000 }
    ]
  },
  {
    id: 104,
    cliente: { nombre: "Sofia Garzón", ciudad: "Pitalito", tipo: "VIP" },
    total: 1220000,
    estado: "PAGADO",
    items: [
      { sku: "MON-02", cant: 2, precioUnit: 580000 },
      { sku: "CAB-05", cant: 2, precioUnit: 30000 }
    ]
  },
  {
    id: 105,
    cliente: { nombre: "David Toledo", ciudad: "Garzón", tipo: "FRECUENTE" },
    total: 320000,
    estado: "CANCELADO",
    items: [
      { sku: "SSD-04", cant: 1, precioUnit: 320000 }
    ]
  },
  {
    id: 106,
    cliente: { nombre: "Valentina Ortiz", ciudad: "Neiva", tipo: "NUEVO" },
    total: 75000,
    estado: "PAGADO",
    items: [
      { sku: "MOU-06", cant: 1, precioUnit: 75000 }
    ]
  }
];

// Helper de formato monetario:
const formatoCOP = (valor) => `$${Number(valor || 0).toLocaleString("es-CO")} COP`;


// =============================================================================
// RETO 1: DESESTRUCTURACIÓN ANIDADA Y CLONACIÓN INMUTABLE (Spread Operator)
// =============================================================================
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 1: Desestructuración y Clonación Inmutable");
console.log("-----------------------------------------------------------------");

const {
  id: nroPedido,
  cliente: { nombre: titular, ciudad: municipio },
  total: totalReto1,
  canalVenta = "PORTAL_WEB"
} = pedidos[0];

const ivaCalculado = Math.round(pedidos[0].total * 0.19);
const pedidoConImpuestos = {
  ...pedidos[0],
  iva: ivaCalculado,
  granTotal: pedidos[0].total + ivaCalculado,
  despachado: false,
  fechaEmision: new Date().toISOString()
};

console.log(`Cliente extraído: ${titular} | Municipio: ${municipio} | Canal: ${canalVenta}`);
console.log(`Subtotal: ${formatoCOP(totalReto1)} | IVA (19%): ${formatoCOP(pedidoConImpuestos.iva)} | Gran Total: ${formatoCOP(pedidoConImpuestos.granTotal)}`);
console.log("Objeto Original preservado:", pedidos[0].id, "Total:", pedidos[0].total);
console.log("¿Son referencias distintas en memoria?", pedidos[0] !== pedidoConImpuestos ? "SÍ (Inmutabilidad preservada ✅)" : "NO ❌");
console.log("");


// =============================================================================
// RETO 2: FILTRADO Y MAPEO DECLARATIVO (DTOs Limpios para Frontend)
// =============================================================================
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 2: Filtrado y Transformación Funcional (.filter + .map)");
console.log("-----------------------------------------------------------------");

const pedidosGarzonDTO = pedidos
  .filter(p => p.estado === "PAGADO" && p.cliente.ciudad === "Garzón")
  .map(p => ({
    factura: `FAC-${p.id}`,
    cliente: p.cliente.nombre,
    cantidadArticulos: p.items.reduce((sum, item) => sum + item.cant, 0),
    totalTexto: formatoCOP(p.total)
  }));

console.log("Pedidos pagados en la sede Garzón formateados como DTOs:");
console.table(pedidosGarzonDTO);
console.log("");


// =============================================================================
// RETO 3: REDUCCIÓN Y ANALÍTICA DE NEGOCIO (.reduce)
// =============================================================================
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 3: Agregaciones Financieras y Conteo con .reduce()");
console.log("-----------------------------------------------------------------");

// 3.1 Recaudo total de pedidos PAGADOS
const recaudoEfectivo = pedidos.reduce((acc, p) => {
  return p.estado === "PAGADO" ? acc + p.total : acc;
}, 0);

// 3.2 Conteo por estado de pedido
const conteoPorEstado = pedidos.reduce((acc, p) => {
  acc[p.estado] = (acc[p.estado] || 0) + 1;
  return acc;
}, {});

// 3.3 Ticket promedio
const ticketPromedio = Math.round(recaudoEfectivo / (conteoPorEstado.PAGADO || 1));

// 3.4 Agrupación por ciudad (Técnica senior indispensable)
const pedidosPorCiudad = pedidos.reduce((grupos, p) => {
  const ciudad = p.cliente.ciudad;
  if (!grupos[ciudad]) grupos[ciudad] = [];
  grupos[ciudad].push({
    id: p.id,
    cliente: p.cliente.nombre,
    total: formatoCOP(p.total),
    estado: p.estado
  });
  return grupos;
}, {});

console.log(`Recaudo Total Efectivo: ${formatoCOP(recaudoEfectivo)}`);
console.log(`Ticket Promedio Venta:  ${formatoCOP(ticketPromedio)}`);
console.log("Distribución por Estado:");
console.table(conteoPorEstado);
console.log("Agrupación por Ciudad (Map de Objetos):", Object.keys(pedidosPorCiudad));
console.log("");


// =============================================================================
// RETO 4: SIMULACIÓN DE SERVICIO ASÍNCRONO DE BODEGA (Promises)
// =============================================================================
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 4: Construcción de Promesa con Latencia y Validación");
console.log("-----------------------------------------------------------------");

function verificarStockBodega(sku, cantidadDeseada) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (cantidadDeseada <= 0) {
        reject(new Error(`[400_BAD_REQUEST] La cantidad debe ser mayor a cero. Recibido: ${cantidadDeseada}`));
        return;
      }

      const item = inventario.find(p => p.sku === sku);

      if (!item) {
        reject(new Error(`[404_NOT_FOUND] El producto con SKU '${sku}' no existe en bodega.`));
        return;
      }

      if (item.stock < cantidadDeseada) {
        reject(new Error(`[409_OUT_OF_STOCK] Stock insuficiente para '${item.nombre}'. Disponible: ${item.stock}, Solicitado: ${cantidadDeseada}`));
        return;
      }

      // Descuento inmutable de inventario en memoria:
      item.stock -= cantidadDeseada;

      resolve({
        sku: item.sku,
        nombre: item.nombre,
        categoria: item.categoria,
        cantidad: cantidadDeseada,
        precioUnitario: item.precio,
        subtotal: item.precio * cantidadDeseada,
        stockRestante: item.stock,
        disponible: true
      });
    }, 300); // 300ms de latencia no bloqueante
  });
}

console.log("Servicio asíncrono 'verificarStockBodega' compilado y listo.\n");


// =============================================================================
// RETO 5: ORQUESTADOR TRANSACCIONAL ASYNC/AWAIT & CONTROL DEFENSIVO (try/catch/finally)
// =============================================================================
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 5: Consumo Asíncrono Defensivo con async/await");
console.log("-----------------------------------------------------------------");

async function procesarVentaExpress(sku, cantidad) {
  try {
    const resultado = await verificarStockBodega(sku, cantidad);
    console.log(`✅ [VENTA APROBADA]: ${resultado.nombre} (x${resultado.cantidad}) -> Total: ${formatoCOP(resultado.subtotal)} | Stock restante: ${resultado.stockRestante}`);
    return { exito: true, datos: resultado };
  } catch (error) {
    console.error(`❌ [VENTA RECHAZADA]: ${error.message}`);
    return { exito: false, motivo: error.message };
  } finally {
    console.log(`🔒 [AUDITORÍA]: Operación de bodega finalizada para '${sku}'.`);
  }
}


// =============================================================================
// RETO 6 (NIVEL PRO): VERIFICACIÓN CONCURRENTE EN PARALELO (Promise.all)
// =============================================================================
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 6 (Nivel PRO): Verificación de Carrito en Paralelo con Promise.all");
console.log("-----------------------------------------------------------------");

async function validarCarritoCompleto(itemsCarrito) {
  try {
    // 1. Mapea cada ítem a una promesa de consulta a bodega:
    const promesas = itemsCarrito.map(item => verificarStockBodega(item.sku, item.cantidad));

    // 2. Dispara todas las consultas EN PARALELO (Fail-Fast):
    const resultados = await Promise.all(promesas);

    // 3. Si todas tuvieron éxito, totaliza con reduce:
    const granTotal = resultados.reduce((acc, curr) => acc + curr.subtotal, 0);

    return {
      ok: true,
      articulosAprobados: resultados.length,
      totalPagar: granTotal,
      detalles: resultados
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


// =============================================================================
// SUITE DE PRUEBAS COMPLETA DE AULA
// =============================================================================
async function ejecutarSuiteDocente() {
  console.log("🚀 Iniciando Suite de Casos de Prueba...\n");

  console.log(">> Test 5.1: Venta exitosa (Stock suficiente):");
  await procesarVentaExpress("TEC-01", 2);

  console.log("\n>> Test 5.2: Venta rechazada (Stock insuficiente):");
  await procesarVentaExpress("USB-03", 1);

  console.log("\n>> Test 5.3: Venta rechazada (SKU inexistente):");
  await procesarVentaExpress("NO-EXISTE", 1);

  console.log("\n-----------------------------------------------------------------");
  console.log(">> Test 6.1: Carrito Concurrente Válido en Paralelo con Promise.all:");
  const carritoValido = [
    { sku: "TEC-01", cantidad: 1 },
    { sku: "CAB-05", cantidad: 2 }
  ];
  const resValido = await validarCarritoCompleto(carritoValido);
  if (resValido.ok) {
    console.log(`✅ [PASSED] Carrito verificado en paralelo. Total: ${formatoCOP(resValido.totalPagar)}`);
  } else {
    console.log("❌ [FAILED] Carrito concurrente falló:", resValido);
  }

  console.log("\n>> Test 6.2: Carrito Concurrente con Falla (Aborto Atómico con Fail-Fast):");
  const carritoConFalla = [
    { sku: "MON-02", cantidad: 1 },
    { sku: "USB-03", cantidad: 3 } // Agotado
  ];
  const resFalla = await validarCarritoCompleto(carritoConFalla);
  if (!resFalla.ok) {
    console.log(`✅ [PASSED] Fail-Fast correcto: Se abortó la compra por: ${resFalla.error}`);
  }

  console.log("\n=================================================================");
  console.log("🎯 REVISIÓN DE EVIDENCIA FINALIZADA CON ÉXITO");
  console.log("=================================================================");
}

ejecutarSuiteDocente();
