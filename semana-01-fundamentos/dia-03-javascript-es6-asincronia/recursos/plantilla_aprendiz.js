/**
 * =============================================================================
 * SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (GARZÓN)
 * PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
 * FORMACIÓN: NIVELACIÓN TÉCNICA FULL STACK MERN + SQL
 * SESIÓN 03 | DÍA 3: JAVASCRIPT MODERNO (ES6+) Y ASINCRONÍA
 * =============================================================================
 * ARCHIVO: plantilla_aprendiz.js
 * INSTRUCCIONES:
 * Resuelve los 5 retos propuestos completando el código donde se indica TODO.
 * Ejecuta este script en terminal con: node plantilla_aprendiz.js
 * =============================================================================
 */

console.log("=================================================================");
console.log("SENA CADPH GARZÓN · TALLER DE AULA SESIÓN 03: JAVASCRIPT ES6+");
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
// Extrae de 'pedidos[0]' el cliente, la ciudad y el total usando destructuring.
// Luego crea un nuevo objeto 'pedidoConIva' clonando el pedido original con el
// operador spread (...), agregando la propiedad 'iva' (19% del total) y 'totalConIva'.
console.log("--- RETO 1: Desestructuración y Clonación Inmutable ---");

// TODO: Escribe tu código aquí
// const { ... } = pedidos[0];
// const pedidoConIva = { ... };

// console.log("Cliente:", cliente, "| Ciudad:", ciudad);
// console.log("Pedido con IVA:", pedidoConIva);
console.log("👉 Completa el Reto 1\n");


// -----------------------------------------------------------------------------
// RETO 2: FILTRADO Y TRANSFORMACIÓN FUNCIONAL (filter + map)
// -----------------------------------------------------------------------------
// A partir del array 'pedidos':
// 1. Filtra solo los pedidos con estado "PAGADO" pertenecientes a la ciudad "Garzón".
// 2. Transforma el resultado con .map() para que devuelva un nuevo array de objetos
//    con la estructura: { nroPedido: id, titular: cliente, valor: total }
console.log("--- RETO 2: Métodos de Arrays (filter + map) ---");

// TODO: Escribe tu código aquí
// const pedidosGarzonPagados = pedidos.filter(...).map(...);
// console.log("Pedidos pagados en Garzón:", pedidosGarzonPagados);
console.log("👉 Completa el Reto 2\n");


// -----------------------------------------------------------------------------
// RETO 3: REDUCCIÓN Y AGREGACIÓN ESTADÍSTICA (reduce)
// -----------------------------------------------------------------------------
// Calcula con .reduce():
// 1. El recaudo total de todos los pedidos con estado "PAGADO".
// 2. Un objeto resumen que cuente cuántos pedidos hay por cada estado.
//    Ejemplo de salida esperada: { PAGADO: 4, PENDIENTE: 1, CANCELADO: 1 }
console.log("--- RETO 3: Acumulación con reduce ---");

// TODO: Escribe tu código aquí
// const granTotalRecaudo = pedidos.reduce(...);
// const resumenPorEstado = pedidos.reduce(...);
// console.log("Recaudo Total ($):", granTotalRecaudo);
// console.log("Conteo por Estado:", resumenPorEstado);
console.log("👉 Completa el Reto 3\n");


// -----------------------------------------------------------------------------
// RETO 4: SIMULACIÓN DE SERVICIO ASÍNCRONO CON PROMESAS
// -----------------------------------------------------------------------------
// Construye una función 'consultarDisponibilidad(sku, cantidadSolicitada)' que
// retorne una Promesa con setTimeout de 800ms:
// - Si el producto no existe en 'inventario': rechazar (reject) con error: "Producto no encontrado".
// - Si existe pero el stock es menor a la cantidad: rechazar con: "Stock insuficiente".
// - Si existe y hay stock: resolver (resolve) con objeto: { sku, nombre, disponible: true, unidadesRestantes: stock - cantidad }
console.log("--- RETO 4: Promesa de Consulta de Stock ---");

function consultarDisponibilidad(sku, cantidadSolicitada) {
  return new Promise((resolve, reject) => {
    // TODO: Implementa la lógica con setTimeout de 800ms
    setTimeout(() => {
      // lógica aquí...
      resolve({ mensaje: "TODO: Implementar disponibilidad" });
    }, 500);
  });
}


// -----------------------------------------------------------------------------
// RETO 5: CONSUMO ASÍNCRONO CON ASYNC/AWAIT Y TRY...CATCH DEFENSIVO
// -----------------------------------------------------------------------------
// Crea una función async 'procesarCompra(sku, cantidad)' que invoque con 'await'
// a 'consultarDisponibilidad'.
// - Debe manejar el éxito imprimiendo un mensaje verde institucional de confirmación.
// - Debe capturar cualquier rechazo con 'try...catch' e imprimir el error en consola.
console.log("--- RETO 5: Consumo con async/await y try/catch ---");

async function procesarCompra(sku, cantidad) {
  // TODO: Escribe aquí el bloque try...catch con await
  try {
    const resultado = await consultarDisponibilidad(sku, cantidad);
    console.log("✅ Compra procesada con éxito:", resultado);
  } catch (error) {
    console.error("❌ Error en compra:", error);
  }
}

// Pruebas automáticas:
// Caso A (Éxito):
procesarCompra("TEC-01", 2);

// Caso B (Sin stock):
procesarCompra("USB-03", 1);

// Caso C (Producto inexistente):
procesarCompra("XYZ-99", 5);
