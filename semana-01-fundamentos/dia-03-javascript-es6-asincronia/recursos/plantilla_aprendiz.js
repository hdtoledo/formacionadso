/**
 * =============================================================================
 * SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (GARZÓN)
 * PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
 * FORMACIÓN: NIVELACIÓN TÉCNICA FULL STACK MERN + SQL
 * SESIÓN 03 | DÍA 3: JAVASCRIPT MODERNO (ES6+) Y ASINCRONÍA
 * =============================================================================
 * ARCHIVO: plantilla_aprendiz.js
 * INSTRUCTOR: Ing. Hector David Toledo Garcia
 * INSTRUCCIONES:
 * 1. Lee cuidadosamente el dataset de pedidos e inventario provisto abajo.
 * 2. Resuelve cada uno de los 6 Retos Progresivos completando los bloques // TODO:.
 * 3. Ejecuta en tu terminal con: node plantilla_aprendiz.js
 * 4. Al finalizar, todos los retos deben mostrar estado [PASSED ✅].
 * =============================================================================
 */

console.clear();
console.log("=================================================================");
console.log("SENA CADPH GARZÓN · TALLER DE AULA SESIÓN 03: JAVASCRIPT ES6+");
console.log("Tecnólogo en Análisis y Desarrollo de Software (ADSO) - Ficha 2026");
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

// Helper para imprimir moneda colombiana:
const formatoCOP = (valor) => `$${Number(valor || 0).toLocaleString("es-CO")} COP`;


// =============================================================================
// RETO 1: DESESTRUCTURACIÓN ANIDADA Y CLONACIÓN INMUTABLE (Spread Operator)
// =============================================================================
/**
 * OBJETIVO:
 * 1. Toma el primer pedido (`pedidos[0]`).
 * 2. Usando desestructuración en una sola línea, extrae:
 *    - El ID del pedido como `nroPedido`.
 *    - El nombre del cliente como `titular`.
 *    - La ciudad del cliente como `municipio`.
 *    - El total del pedido.
 *    - Un parámetro por defecto `canalVenta = "PORTAL_WEB"`.
 * 3. Crea una copia INMUTABLE de `pedidos[0]` llamada `pedidoConImpuestos` usando el
 *    operador spread (...), agregando:
 *    - `iva`: 19% del total (redondeado con Math.round).
 *    - `granTotal`: total original + iva.
 *    - `despachado`: false.
 *    - `fechaEmision`: la fecha actual en formato ISO.
 * 4. Verifica que `pedidos[0] !== pedidoConImpuestos` (inmutabilidad preservada).
 */
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 1: Desestructuración y Clonación Inmutable");
console.log("-----------------------------------------------------------------");

// TODO: Escribe tu código aquí:
// const { ... } = pedidos[0];
// const pedidoConImpuestos = { ... };

let nroPedido, titular, municipio, totalReto1, canalVenta, pedidoConImpuestos;

// TODO: Descomenta e implementa:
/*
const {
  id: nroPedidoExt,
  cliente: { nombre: titularExt, ciudad: municipioExt },
  total: totalExt,
  canalVenta: canalVentaExt = "PORTAL_WEB"
} = pedidos[0];

nroPedido = nroPedidoExt;
titular = titularExt;
municipio = municipioExt;
totalReto1 = totalExt;
canalVenta = canalVentaExt;

pedidoConImpuestos = {
  ...pedidos[0],
  iva: Math.round(pedidos[0].total * 0.19),
  granTotal: pedidos[0].total + Math.round(pedidos[0].total * 0.19),
  despachado: false,
  fechaEmision: new Date().toISOString()
};
*/

// Verificación:
if (nroPedido && titular && pedidoConImpuestos && pedidoConImpuestos !== pedidos[0]) {
  console.log(`✅ [PASSED] Reto 1 Superado:`);
  console.log(`   Titular: ${titular} | Sede: ${municipio} | Canal: ${canalVenta}`);
  console.log(`   Total Base: ${formatoCOP(totalReto1)} | IVA 19%: ${formatoCOP(pedidoConImpuestos.iva)} | Gran Total: ${formatoCOP(pedidoConImpuestos.granTotal)}`);
} else {
  console.log("❌ [FAILED] Reto 1 Pendiente de completar.");
}
console.log("");


// =============================================================================
// RETO 2: FILTRADO Y MAPEO DECLARATIVO (DTOs Limpios para Frontend)
// =============================================================================
/**
 * OBJETIVO:
 * Los frameworks modernos (React, Vue) esperan datos limpios y formateados (DTOs).
 * A partir del array `pedidos`:
 * 1. Usa `.filter()` para obtener únicamente los pedidos que:
 *    - Tengan estado estrictamente igual a "PAGADO".
 *    - Pertenezcan al municipio "Garzón".
 * 2. Usa `.map()` para transformar cada pedido resultante en un objeto con el siguiente formato:
 *    {
 *      factura: "FAC-101",          // prefijo 'FAC-' + id
 *      cliente: "Carlos Perdomo",
 *      cantidadArticulos: 2,         // suma total de cantidades en p.items
 *      totalTexto: "$195.000 COP"   // usando formatoCOP()
 *    }
 */
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 2: Filtrado y Transformación Funcional (.filter + .map)");
console.log("-----------------------------------------------------------------");

let pedidosGarzonDTO = [];

// TODO: Escribe tu código aquí:
// pedidosGarzonDTO = pedidos
//   .filter(...)
//   .map(...);

// Verificación:
if (pedidosGarzonDTO.length === 2 && pedidosGarzonDTO[0].factura && pedidosGarzonDTO[0].totalTexto) {
  console.log("✅ [PASSED] Reto 2 Superado:");
  console.table(pedidosGarzonDTO);
} else {
  console.log("❌ [FAILED] Reto 2 Pendiente: Debe retornar 2 pedidos pagados de Garzón estructurados como DTOs.");
}
console.log("");


// =============================================================================
// RETO 3: REDUCCIÓN Y ANALÍTICA DE NEGOCIO (.reduce)
// =============================================================================
/**
 * OBJETIVO:
 * `.reduce()` es el núcleo de la agregación de datos en JavaScript.
 * Calcula las siguientes 3 métricas de negocio:
 *
 * 3.1 `recaudoEfectivo`:
 *     Suma acumulada del campo `total` de todos los pedidos con estado "PAGADO".
 *
 * 3.2 `conteoPorEstado`:
 *     Un objeto que cuente cuántos pedidos existen por cada estado.
 *     Ejemplo esperado: { PAGADO: 4, PENDIENTE: 1, CANCELADO: 1 }
 *
 * 3.3 `ticketPromedio`:
 *     El promedio de venta de los pedidos pagados (recaudoEfectivo / total pedidos pagados).
 */
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 3: Agregaciones Financieras y Conteo con .reduce()");
console.log("-----------------------------------------------------------------");

let recaudoEfectivo = 0;
let conteoPorEstado = {};
let ticketPromedio = 0;

// TODO: Escribe tu código aquí:
// recaudoEfectivo = pedidos.reduce(...);
// conteoPorEstado = pedidos.reduce(...);
// ticketPromedio = ...;

// Verificación:
if (recaudoEfectivo === 1583000 && conteoPorEstado.PAGADO === 4 && conteoPorEstado.CANCELADO === 1) {
  console.log("✅ [PASSED] Reto 3 Superado:");
  console.log(`   Recaudo Total Efectivo: ${formatoCOP(recaudoEfectivo)}`);
  console.log(`   Ticket Promedio Venta:  ${formatoCOP(ticketPromedio)}`);
  console.log("   Distribución por Estado:");
  console.table(conteoPorEstado);
} else {
  console.log("❌ [FAILED] Reto 3 Pendiente: Revisa el recaudo (esperado: $1.583.000 COP) y conteo por estados.");
}
console.log("");


// =============================================================================
// RETO 4: SIMULACIÓN DE SERVICIO ASÍNCRONO DE BODEGA (Promises)
// =============================================================================
/**
 * OBJETIVO:
 * Simular una consulta asíncrona a la base de datos de inventario con latencia de red.
 * Crea una función constructora `verificarStockBodega(sku, cantidadDeseada)` que retorne
 * una Promesa (`new Promise((resolve, reject) => { ... })`):
 *
 * Reglas de negocio:
 * 1. Simular una espera no bloqueante de 300 milisegundos con `setTimeout`.
 * 2. Si `cantidadDeseada <= 0`, rechazar con:
 *    `new Error("[400_BAD_REQUEST] La cantidad debe ser mayor a cero.")`
 * 3. Buscar el producto en el array `inventario` usando `.find()`.
 *    - Si NO existe, rechazar con:
 *      `new Error("[404_NOT_FOUND] El producto con SKU '${sku}' no existe en bodega.")`
 *    - Si existe, pero su `stock < cantidadDeseada`, rechazar con:
 *      `new Error("[409_OUT_OF_STOCK] Stock insuficiente para '${item.nombre}'. Disponible: ${item.stock}, Solicitado: ${cantidadDeseada}")`
 * 4. Si todo es correcto, resolver (`resolve`) con un objeto de aprobación:
 *    {
 *      sku: item.sku,
 *      nombre: item.nombre,
 *      categoria: item.categoria,
 *      cantidad: cantidadDeseada,
 *      precioUnitario: item.precio,
 *      subtotal: item.precio * cantidadDeseada,
 *      disponible: true
 *    }
 */
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 4: Construcción de Promesa con Latencia y Validación");
console.log("-----------------------------------------------------------------");

function verificarStockBodega(sku, cantidadDeseada) {
  return new Promise((resolve, reject) => {
    // TODO: Implementa aquí la lógica con setTimeout de 300ms
    setTimeout(() => {
      reject(new Error("TODO: Implementar verificarStockBodega"));
    }, 100);
  });
}

console.log("👉 Para probar tu función del Reto 4, se ejecutará dentro del Reto 5 y 6.\n");


// =============================================================================
// RETO 5: ORQUESTADOR TRANSACCIONAL ASYNC/AWAIT & CONTROL DEFENSIVO (try/catch/finally)
// =============================================================================
/**
 * OBJETIVO:
 * Escribir una función asíncrona profesional `procesarVentaExpress(sku, cantidad)`:
 * 1. Debe declarar el bloque `try...catch...finally`.
 * 2. En el `try`:
 *    - Hacer `await` a `verificarStockBodega(sku, cantidad)`.
 *    - Imprimir un mensaje verde de éxito con el total calculado.
 *    - Retornar `{ exito: true, datos: resultado }`.
 * 3. En el `catch (error)`:
 *    - Atrapar el error sin que la aplicación se caiga.
 *    - Imprimir el error en consola con `console.error("❌ Fallo en venta:", error.message)`.
 *    - Retornar `{ exito: false, motivo: error.message }`.
 * 4. En el `finally`:
 *    - Imprimir `console.log("🔒 Auditoría: Operación de bodega finalizada.")`.
 */
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 5: Consumo Asíncrono Defensivo con async/await");
console.log("-----------------------------------------------------------------");

async function procesarVentaExpress(sku, cantidad) {
  // TODO: Escribe el bloque try { ... } catch (error) { ... } finally { ... }
  return { exito: false, motivo: "TODO: Implementar procesarVentaExpress" };
}


// =============================================================================
// RETO 6 (NIVEL PRO): VERIFICACIÓN CONCURRENTE EN PARALELO (Promise.all)
// =============================================================================
/**
 * OBJETIVO - ARQUITECTURA SENIOR:
 * En un carrito de compras real, el usuario compra varios productos a la vez.
 * Si verificas uno por uno con `await` sucesivos (en serie), la latencia se triplica.
 *
 * Implementa la función `validarCarritoCompleto(itemsCarrito)`:
 * 1. Recibe un array de compras, por ejemplo:
 *    [
 *      { sku: "TEC-01", cantidad: 2 },
 *      { sku: "CAB-05", cantidad: 3 }
 *    ]
 * 2. Utiliza `.map()` para generar un array de Promesas llamando a `verificarStockBodega`.
 * 3. Ejecuta todas las verificaciones EN PARALELO usando `await Promise.all(...)`.
 * 4. Calcula y retorna la suma de los subtotales de todos los productos aprobados.
 * 5. Si cualquiera de los productos falla en bodega, `Promise.all` debe fallar inmediatamente
 *    (Fail-Fast) y ser atrapado por el bloque `try...catch`.
 */
console.log("-----------------------------------------------------------------");
console.log("📌 RETO 6 (Nivel PRO): Verificación de Carrito en Paralelo con Promise.all");
console.log("-----------------------------------------------------------------");

async function validarCarritoCompleto(itemsCarrito) {
  try {
    // TODO: Ejecuta las promesas concurrentemente con Promise.all:
    // const promesas = itemsCarrito.map(item => verificarStockBodega(item.sku, item.cantidad));
    // const resultados = await Promise.all(promesas);
    // const granTotal = resultados.reduce((acc, curr) => acc + curr.subtotal, 0);
    // return { ok: true, items: resultados, totalPagar: granTotal };
    return { ok: false, motivo: "TODO: Implementar validarCarritoCompleto" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


// =============================================================================
// SUITE DE PRUEBAS AUTOMATIZADA DE AULA (EJECUCIÓN GENERAL)
// =============================================================================
async function ejecutarSuiteDePruebas() {
  console.log("🚀 Iniciando pruebas de los Retos 4, 5 y 6...\n");

  console.log(">> Test 5.1: Venta exitosa (Stock suficiente):");
  const t1 = await procesarVentaExpress("TEC-01", 2);

  console.log("\n>> Test 5.2: Venta rechazada (Stock insuficiente):");
  const t2 = await procesarVentaExpress("USB-03", 1);

  console.log("\n>> Test 5.3: Venta rechazada (SKU inexistente):");
  const t3 = await procesarVentaExpress("NO-EXISTE", 1);

  console.log("\n-----------------------------------------------------------------");
  console.log(">> Test 6.1: Carrito Concurrente Válido en Paralelo:");
  const carritoValido = [
    { sku: "TEC-01", cantidad: 1 },
    { sku: "CAB-05", cantidad: 2 }
  ];
  const t6Valido = await validarCarritoCompleto(carritoValido);
  if (t6Valido.ok) {
    console.log(`✅ [PASSED] Carrito verificado en paralelo. Total a pagar: ${formatoCOP(t6Valido.totalPagar)}`);
  } else {
    console.log("❌ [FAILED] Carrito concurrente falló:", t6Valido);
  }

  console.log("\n>> Test 6.2: Carrito Concurrente con Falla (Debe abortar con Fail-Fast):");
  const carritoConFalla = [
    { sku: "TEC-01", cantidad: 1 },
    { sku: "USB-03", cantidad: 5 } // Agotado
  ];
  const t6Falla = await validarCarritoCompleto(carritoConFalla);
  if (!t6Falla.ok) {
    console.log(`✅ [PASSED] Fail-Fast correcto: Se abortó la compra por: ${t6Falla.error}`);
  } else {
    console.log("❌ [FAILED] Debió rechazar el carrito.");
  }

  console.log("\n=================================================================");
  console.log("🎯 REVISIÓN DE EVIDENCIA FINALIZADA");
  console.log("Sustenta los resultados con tu instructor en el aula.");
  console.log("=================================================================");
}

ejecutarSuiteDePruebas();
