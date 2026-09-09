/**
 * =============================================================================
 * SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (GARZÓN)
 * PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
 * FORMACIÓN: NIVELACIÓN TÉCNICA FULL STACK MERN + SQL
 * SESIÓN 03 | DÍA 3: JAVASCRIPT MODERNO (ES6+) Y ASINCRONÍA
 * =============================================================================
 * ARCHIVO: solucion_taller_es6_asincronia.js
 * AUTOR: Ing. Hector David Toledo Garcia - Instructor Líder ADSO
 * EJECUCIÓN: node solucion_taller_es6_asincronia.js
 * =============================================================================
 */

console.log("=================================================================");
console.log("SENA CADPH GARZÓN · SOLUCIONARIO OFICIAL SESIÓN 03: JAVASCRIPT ES6+");
console.log("Instructor: Ing. Hector David Toledo Garcia");
console.log("=================================================================\n");

// -----------------------------------------------------------------------------
// BASE DE DATOS EN MEMORIA (DATASET DE TIENDA FORMATIVA ADSO)
// -----------------------------------------------------------------------------
const pedidos = [
  { id: 101, cliente: "Carlos Perdomo", ciudad: "Garzón", total: 185000, estado: "PAGADO", productos: ["Teclado Mecánico", "Mouse Pad"] },
  { id: 102, cliente: "Mariana Rojas", ciudad: "Neiva", total: 420000, estado: "PENDIENTE", productos: ["Monitor 24 pulg"] },
  { id: 103, cliente: "Julian Andrade", ciudad: "Garzón", total: 95000, estado: "PAGADO", productos: ["Cable HDMI", "Hub USB-C"] },
  { id: 104, cliente: "Sofia Garzón", ciudad: "Pitalito", total: 1250000, estado: "PAGADO", productos: ["Portátil Lenovo", "Funda"] },
  { id: 105, cliente: "David Toledo", ciudad: "Garzón", total: 310000, estado: "CANCELADO", productos: ["SSD NVMe 1TB"] },
  { id: 106, cliente: "Valentina Ortiz", ciudad: "Neiva", total: 78000, estado: "PAGADO", productos: ["Mouse Gamer"] }
];

const inventario = [
  { sku: "TEC-01", nombre: "Teclado Mecánico", stock: 8, precio: 120000 },
  { sku: "MON-02", nombre: "Monitor 24 pulg", stock: 3, precio: 420000 },
  { sku: "USB-03", nombre: "Hub USB-C", stock: 0, precio: 45000 },
  { sku: "SSD-04", nombre: "SSD NVMe 1TB", stock: 5, precio: 310000 }
];

// -----------------------------------------------------------------------------
// RETO 1: DESESTRUCTURACIÓN Y COPIA INMUTABLE CON SPREAD OPERATOR
// -----------------------------------------------------------------------------
console.log("--- RETO 1: Desestructuración y Clonación Inmutable ---");

const { cliente, ciudad, total } = pedidos[0];
console.log(`Cliente extraído: ${cliente} | Ciudad: ${ciudad} | Subtotal: $${total.toLocaleString('es-CO')}`);

const ivaCalculado = Math.round(total * 0.19);
const pedidoConIva = {
  ...pedidos[0],
  iva: ivaCalculado,
  totalConIva: total + ivaCalculado,
  fechaCalculo: new Date().toISOString()
};

console.log("Objeto Original Inmutable:", pedidos[0]);
console.log("Objeto Clonado con IVA:", pedidoConIva);
console.log("¿Son referencias distintas?", pedidos[0] !== pedidoConIva ? "SÍ (Inmutabilidad preservada ✅)" : "NO ❌");
console.log("\n-----------------------------------------------------------------\n");

// -----------------------------------------------------------------------------
// RETO 2: FILTRADO Y TRANSFORMACIÓN FUNCIONAL (filter + map)
// -----------------------------------------------------------------------------
console.log("--- RETO 2: Métodos Declarativos de Arrays (filter + map) ---");

const pedidosGarzonPagados = pedidos
  .filter(p => p.estado === "PAGADO" && p.ciudad === "Garzón")
  .map(({ id, cliente, total }) => ({
    nroPedido: id,
    titular: cliente,
    valorFormateado: `$${total.toLocaleString('es-CO')}`
  }));

console.log("Pedidos pagados en la sede Garzón:");
console.table(pedidosGarzonPagados);
console.log("\n-----------------------------------------------------------------\n");

// -----------------------------------------------------------------------------
// RETO 3: REDUCCIÓN Y AGREGACIÓN ESTADÍSTICA (reduce)
// -----------------------------------------------------------------------------
console.log("--- RETO 3: Acumulación Estadística con reduce ---");

// 3.1 Recaudo total de pedidos PAGADOS
const granTotalRecaudo = pedidos.reduce((acumulador, pedido) => {
  return pedido.estado === "PAGADO" ? acumulador + pedido.total : acumulador;
}, 0);

console.log(`Recaudo Total Efectivo (PAGADOS): $${granTotalRecaudo.toLocaleString('es-CO')} COP`);

// 3.2 Conteo por estado de pedido
const resumenPorEstado = pedidos.reduce((conteo, pedido) => {
  conteo[pedido.estado] = (conteo[pedido.estado] || 0) + 1;
  return conteo;
}, {});

console.log("Distribución de Estados de Pedido:");
console.table(resumenPorEstado);

// 3.3 Agrupación de pedidos por ciudad
const pedidosPorCiudad = pedidos.reduce((grupos, pedido) => {
  const ciudadKey = pedido.ciudad;
  if (!grupos[ciudadKey]) {
    grupos[ciudadKey] = [];
  }
  grupos[ciudadKey].push(pedido.cliente);
  return grupos;
}, {});

console.log("Clientes clasificados por Ciudad:");
console.log(pedidosPorCiudad);
console.log("\n-----------------------------------------------------------------\n");

// -----------------------------------------------------------------------------
// RETO 4: SIMULACIÓN DE SERVICIO ASÍNCRONO CON PROMESAS
// -----------------------------------------------------------------------------
console.log("--- RETO 4: Simulación Asíncrona de Verificación de Inventario ---");

function consultarDisponibilidad(sku, cantidadSolicitada) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = inventario.find(prod => prod.sku === sku);

      if (!item) {
        reject(new Error(`[404_NOT_FOUND] El producto con SKU '${sku}' no existe en el catálogo.`));
        return;
      }

      if (item.stock < cantidadSolicitada) {
        reject(new Error(`[409_STOCK_INSUFFICIENT] Stock insuficiente para '${item.nombre}'. Solicitado: ${cantidadSolicitada}, Disponible: ${item.stock}`));
        return;
      }

      resolve({
        sku: item.sku,
        nombre: item.nombre,
        precioUnitario: item.precio,
        cantidadSolicitada,
        totalAPagar: item.precio * cantidadSolicitada,
        unidadesRestantesEnBodega: item.stock - cantidadSolicitada,
        disponible: true
      });
    }, 400); // Latencia simulada de 400ms
  });
}

// -----------------------------------------------------------------------------
// RETO 5: CONSUMO CON ASYNC/AWAIT, CONTROL DE EXCEPCIONES Y PARALELISMO
// -----------------------------------------------------------------------------
console.log("--- RETO 5: Orquestador con async/await y try...catch defensivo ---");

async function procesarCompra(sku, cantidad) {
  try {
    console.log(`⏳ Solicitando verificación en bodega para ${sku} (x${cantidad})...`);
    const resultado = await consultarDisponibilidad(sku, cantidad);
    console.log(`✅ [VENTA APROBADA]:`, {
      producto: resultado.nombre,
      unidades: resultado.cantidadSolicitada,
      total: `$${resultado.totalAPagar.toLocaleString('es-CO')}`,
      quedanEnBodega: resultado.unidadesRestantesEnBodega
    });
    return resultado;
  } catch (error) {
    console.error(`❌ [VENTA RECHAZADA]:`, error.message);
    return null;
  }
}

// Demostración secuencial y concurrente
async function ejecutarCasosDePrueba() {
  console.log(">> Ejecutando Caso 1 (Éxito)...");
  await procesarCompra("TEC-01", 2);

  console.log("\n>> Ejecutando Caso 2 (Fallo por Stock Agotado)...");
  await procesarCompra("USB-03", 1);

  console.log("\n>> Ejecutando Caso 3 (Fallo por Código Inexistente)...");
  await procesarCompra("XYZ-99", 5);

  console.log("\n-----------------------------------------------------------------");
  console.log("--- RETO EXTRA PRO: Ejecución Concurrente con Promise.allSettled ---");
  console.log("Verificando múltiples productos simultáneamente sin bloquear el hilo principal...");

  const solicitudes = [
    consultarDisponibilidad("MON-02", 1),
    consultarDisponibilidad("SSD-04", 2),
    consultarDisponibilidad("USB-03", 2) // Este fallará
  ];

  const resultadosLote = await Promise.allSettled(solicitudes);
  resultadosLote.forEach((res, index) => {
    if (res.status === "fulfilled") {
      console.log(`✔️ Lote [${index + 1}] Exitoso: ${res.value.nombre} -> Total $${res.value.totalAPagar.toLocaleString('es-CO')}`);
    } else {
      console.log(`⚠️ Lote [${index + 1}] Rechazado: ${res.reason.message}`);
    }
  });

  console.log("\n=================================================================");
  console.log("✅ TALLER SESIÓN 03 FINALIZADO CON ÉXITO - SENA CADPH GARZÓN");
  console.log("=================================================================");
}

ejecutarCasosDePrueba();
