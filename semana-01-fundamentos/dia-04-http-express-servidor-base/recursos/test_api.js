/**
 * =============================================================================
 * SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (GARZÓN)
 * PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
 * SESIÓN 04 | TEST SUITE AUTOMATIZADA PARA SERVIDOR EXPRESS
 * =============================================================================
 * ARCHIVO: test_api.js
 * EJECUCIÓN: node test_api.js (requiere que el servidor esté corriendo en puerto 3000)
 * =============================================================================
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.clear();
console.log("=================================================================");
console.log("🧪 SUITE DE PRUEBAS AUTOMATIZADA: API EXPRESS SESIÓN 04");
console.log(`📡 URL Objetivo: ${BASE_URL}`);
console.log("=================================================================\n");

let passed = 0;
let failed = 0;

async function assertTest(nombre, fn) {
  try {
    await fn();
    console.log(`✅ [PASSED] ${nombre}`);
    passed++;
  } catch (err) {
    console.log(`❌ [FAILED] ${nombre}`);
    console.log(`   Motivo: ${err.message}\n`);
    failed++;
  }
}

async function runTests() {
  // Test 1: Health Check (GET /api/status)
  await assertTest("Reto 2: GET /api/status retorna 200 y { ok: true }", async () => {
    const res = await fetch(`${BASE_URL}/api/status`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error("La propiedad 'ok' no es verdadera");
  });

  // Test 2: Listar productos (GET /api/productos)
  await assertTest("Reto 3.1: GET /api/productos retorna lista de productos", async () => {
    const res = await fetch(`${BASE_URL}/api/productos`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.datos) || data.datos.length < 5) {
      throw new Error(`Se esperaban al menos 5 productos en el array 'datos'`);
    }
  });

  // Test 3: Filtrar productos por categoría (GET /api/productos?categoria=HARDWARE)
  await assertTest("Reto 3.2: GET /api/productos?categoria=HARDWARE filtra correctamente", async () => {
    const res = await fetch(`${BASE_URL}/api/productos?categoria=HARDWARE`);
    const data = await res.json();
    if (!data.datos || data.datos.length === 0) throw new Error("No retornó productos para la categoría HARDWARE");
    const todosHardware = data.datos.every(p => p.categoria.toUpperCase() === 'HARDWARE');
    if (!todosHardware) throw new Error("Existen productos que no corresponden a HARDWARE");
  });

  // Test 4: Buscar producto por ID existente (GET /api/productos/1)
  await assertTest("Reto 4.1: GET /api/productos/1 retorna 200 y producto con ID 1", async () => {
    const res = await fetch(`${BASE_URL}/api/productos/1`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (!data.datos || data.datos.id !== 1) throw new Error("No retornó el producto con ID 1");
  });

  // Test 5: Buscar producto por ID inexistente (GET /api/productos/999 -> 404)
  await assertTest("Reto 4.2: GET /api/productos/999 retorna 404 Not Found", async () => {
    const res = await fetch(`${BASE_URL}/api/productos/999`);
    if (res.status !== 404) throw new Error(`Status esperado 404, recibido ${res.status}`);
    const data = await res.json();
    if (data.ok !== false) throw new Error("Se esperaba { ok: false }");
  });

  // Test 6: Crear producto con validación (POST /api/productos)
  await assertTest("Reto 5.1: POST /api/productos crea producto y retorna 201", async () => {
    const nuevo = {
      sku: `MOUSE-${Date.now().toString().slice(-4)}`,
      nombre: "Mouse Gamer Óptico",
      categoria: "ACCESORIOS",
      stock: 10,
      precio: 85000
    };
    const res = await fetch(`${BASE_URL}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });
    if (res.status !== 201) throw new Error(`Status esperado 201 Created, recibido ${res.status}`);
    const data = await res.json();
    if (!data.datos || !data.datos.id) throw new Error("El nuevo producto no tiene ID asignado");
  });

  // Test 7: Rechazo por campos faltantes (POST /api/productos -> 400)
  await assertTest("Reto 5.2: POST sin campos requeridos retorna 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "Incompleto" })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400 Bad Request, recibido ${res.status}`);
  });

  // Test 8: Actualizar Stock (PATCH /api/productos/1/stock)
  await assertTest("Reto 6.1: PATCH /api/productos/1/stock actualiza y retorna 200", async () => {
    const res = await fetch(`${BASE_URL}/api/productos/1/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoStock: 25 })
    });
    if (res.status !== 200) throw new Error(`Status esperado 200 OK, recibido ${res.status}`);
    const data = await res.json();
    if (data.datos.stock !== 25) throw new Error("El stock no fue actualizado a 25");
  });

  // Test 9: Ruta inexistente (GET /api/ruta-fantasma -> 404 Catch-All)
  await assertTest("Reto 6.2: Middleware 404 Catch-All para rutas inexistentes", async () => {
    const res = await fetch(`${BASE_URL}/api/ruta-inexistente-adso`);
    if (res.status !== 404) throw new Error(`Status esperado 404, recibido ${res.status}`);
  });

  // Test 10 [BONUS LIVE MOD]: Eliminar Producto (DELETE /api/productos/5)
  try {
    const resDel = await fetch(`${BASE_URL}/api/productos/5`, { method: "DELETE" });
    if (resDel.status === 200 || resDel.status === 204) {
      console.log("🌟 [BONUS LIVE MOD PASSED] Endpoint DELETE /api/productos/:id implementado correctamente.");
    }
  } catch {
    // Bonus opcional
  }

  console.log("\n=================================================================");
  console.log(`📊 RESULTADOS: ${passed} Pasadas | ${failed} Fallidas`);
  if (failed === 0) {
    console.log("🎉 ¡FELICITACIONES! Todos los endpoints cumplen con el estándar REST.");
  } else {
    console.log("⚠️ Hay retos pendientes de resolver en tu servidor Express.");
  }
  console.log("=================================================================");
}

runTests().catch(err => {
  console.error("❌ Error de conexión: ¿El servidor Express está encendido?", err.message);
});
