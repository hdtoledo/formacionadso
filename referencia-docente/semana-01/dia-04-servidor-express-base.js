/**
 * =============================================================================
 * SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (GARZÓN)
 * PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
 * FORMACIÓN: NIVELACIÓN TÉCNICA FULL STACK MERN + SQL
 * SESIÓN 04 | DÍA 4: PROTOCOLO HTTP Y SERVIDOR BASE EN EXPRESS
 * =============================================================================
 * ARCHIVO: dia-04-servidor-express-base.js
 * RUTA: referencia-docente/semana-01/dia-04-servidor-express-base.js
 * INSTRUCTOR: Ing. Hector David Toledo Garcia
 * EJECUCIÓN: node dia-04-servidor-express-base.js
 * =============================================================================
 */

import express from 'express';

// =============================================================================
// RETO 1: INICIALIZACIÓN DE EXPRESS, PUERTO Y MIDDLEWARE JSON
// =============================================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware esencial para procesar payloads JSON en el cuerpo (req.body):
app.use(express.json());

// Middleware de auditoría de peticiones en consola (Logging simple):
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('es-CO');
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// -----------------------------------------------------------------------------
// BASE DE DATOS EN MEMORIA (DATASET: TIENDA TECNOLÓGICA SENA CADPH)
// -----------------------------------------------------------------------------
let productos = [
  { id: 1, sku: "TEC-01", nombre: "Teclado Mecánico RGB", categoria: "HARDWARE", stock: 8, precio: 120000 },
  { id: 2, sku: "MON-02", nombre: "Monitor 24 pulg IPS", categoria: "PANTALLAS", stock: 3, precio: 580000 },
  { id: 3, sku: "USB-03", nombre: "Hub USB-C 7 en 1", categoria: "ACCESORIOS", stock: 0, precio: 65000 },
  { id: 4, sku: "SSD-04", nombre: "SSD NVMe 1TB PCIe 4.0", categoria: "ALMACENAMIENTO", stock: 5, precio: 320000 },
  { id: 5, sku: "CAB-05", nombre: "Cable Red Cat 6 10m", categoria: "REDES", stock: 12, precio: 28000 }
];

// Helper para formato de moneda:
const formatoCOP = (val) => `$${Number(val || 0).toLocaleString('es-CO')} COP`;


// =============================================================================
// RETO 2: HEALTH-CHECK DE SERVIDOR (GET /api/status)
// =============================================================================
app.get('/api/status', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Servidor Express ADSO en funcionamiento",
    instructor: "Ing. Hector David Toledo Garcia",
    sede: "SENA CADPH Garzón - Huila",
    entorno: process.env.NODE_ENV || "desarrollo",
    uptimeSegundos: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});


// =============================================================================
// RETO 3: LISTAR PRODUCTOS CON FILTROS QUERY (GET /api/productos)
// =============================================================================
app.get('/api/productos', (req, res) => {
  const { categoria, q, minPrecio, maxPrecio } = req.query;

  let resultado = [...productos];

  // Filtro por categoría:
  if (categoria) {
    resultado = resultado.filter(p => p.categoria.toUpperCase() === categoria.toUpperCase());
  }

  // Búsqueda flexible por texto:
  if (q) {
    const busqueda = q.toLowerCase();
    resultado = resultado.filter(p => p.nombre.toLowerCase().includes(busqueda) || p.sku.toLowerCase().includes(busqueda));
  }

  // Filtros opcionales de rango de precio:
  if (minPrecio) {
    resultado = resultado.filter(p => p.precio >= Number(minPrecio));
  }
  if (maxPrecio) {
    resultado = resultado.filter(p => p.precio <= Number(maxPrecio));
  }

  res.status(200).json({
    ok: true,
    total: resultado.length,
    filtrosAplicados: {
      categoria: categoria || null,
      busqueda: q || null
    },
    datos: resultado
  });
});


// =============================================================================
// RETO 4: CONSULTAR PRODUCTO POR ID (GET /api/productos/:id)
// =============================================================================
app.get('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: "El parámetro :id debe ser un valor numérico válido."
    });
  }

  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({
      ok: false,
      error: `Producto con ID ${id} no encontrado en el catálogo.`
    });
  }

  res.status(200).json({
    ok: true,
    datos: {
      ...producto,
      precioFormateado: formatoCOP(producto.precio)
    }
  });
});


// =============================================================================
// RETO 5: CREAR PRODUCTO CON VALIDACIÓN DEFENSIVA (POST /api/productos)
// =============================================================================
app.post('/api/productos', (req, res) => {
  const { sku, nombre, categoria, stock, precio } = req.body;

  // 1. Validación de presencia de campos:
  if (!sku || !nombre || !categoria || stock === undefined || precio === undefined) {
    return res.status(400).json({
      ok: false,
      error: "Campos requeridos faltantes. Debe enviar: { sku, nombre, categoria, stock, precio }."
    });
  }

  // 2. Validación de tipos numéricos y positivos:
  const stockNum = Number(stock);
  const precioNum = Number(precio);

  if (isNaN(stockNum) || stockNum < 0 || isNaN(precioNum) || precioNum <= 0) {
    return res.status(400).json({
      ok: false,
      error: "El stock debe ser mayor o igual a 0 y el precio debe ser un número positivo."
    });
  }

  // 3. Validación de unicidad de SKU:
  const existeSku = productos.some(p => p.sku.toUpperCase() === sku.toUpperCase());
  if (existeSku) {
    return res.status(409).json({
      ok: false,
      error: `Conflicto: Ya existe un producto con el SKU '${sku.toUpperCase()}'.`
    });
  }

  // 4. Asignación de ID y persistencia en memoria:
  const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  const nuevoProducto = {
    id: nuevoId,
    sku: sku.trim().toUpperCase(),
    nombre: nombre.trim(),
    categoria: categoria.trim().toUpperCase(),
    stock: stockNum,
    precio: precioNum
  };

  productos.push(nuevoProducto);

  res.status(201).json({
    ok: true,
    mensaje: "Producto registrado exitosamente en el catálogo",
    datos: nuevoProducto
  });
});


// =============================================================================
// RETO 6.1: ACTUALIZACIÓN PARCIAL DE STOCK (PATCH /api/productos/:id/stock)
// =============================================================================
app.patch('/api/productos/:id/stock', (req, res) => {
  const id = Number(req.params.id);
  const { nuevoStock } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ ok: false, error: "El ID debe ser numérico." });
  }

  const stockNum = Number(nuevoStock);
  if (nuevoStock === undefined || isNaN(stockNum) || stockNum < 0) {
    return res.status(400).json({
      ok: false,
      error: "Debe proveer un valor numérico 'nuevoStock' mayor o igual a 0."
    });
  }

  const producto = productos.find(p => p.id === id);
  if (!producto) {
    return res.status(404).json({
      ok: false,
      error: `Producto con ID ${id} no encontrado.`
    });
  }

  const stockAnterior = producto.stock;
  producto.stock = stockNum;

  res.status(200).json({
    ok: true,
    mensaje: `Stock actualizado con éxito para '${producto.nombre}'`,
    datos: {
      id: producto.id,
      nombre: producto.nombre,
      stock: producto.stock,
      stockAnterior,
      stockActual: producto.stock
    }
  });
});


// =============================================================================
// RETO BONUS: ELIMINAR PRODUCTO POR ID (DELETE /api/productos/:id)
// =============================================================================
app.delete('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ ok: false, error: "El ID debe ser numérico." });
  }

  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) {
    return res.status(404).json({
      ok: false,
      error: `Producto con ID ${id} no encontrado para eliminar.`
    });
  }

  const [eliminado] = productos.splice(indice, 1);

  res.status(200).json({
    ok: true,
    mensaje: `Producto '${eliminado.nombre}' (SKU: ${eliminado.sku}) eliminado con éxito.`,
    datos: eliminado
  });
});


// =============================================================================
// RETO 6.2: MIDDLEWARE GLOBAL CATCH-ALL (404 NOT FOUND)
// =============================================================================
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`,
    sugerencia: "Consulta los endpoints disponibles en /api/status o /api/productos"
  });
});


// =============================================================================
// ARRANQUE DEL SERVIDOR
// =============================================================================
app.listen(PORT, () => {
  console.log("=================================================================");
  console.log(`🚀 SERVIDOR MAESTRO ADSO ACTIVO EN: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/status`);
  console.log(`📦 Productos:    http://localhost:${PORT}/api/productos`);
  console.log("💡 Prueba los endpoints con Bruno usando la colección oficial.");
  console.log("=================================================================");
});
