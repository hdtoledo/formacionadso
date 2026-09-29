import express from "express";

// 1. Crear instancia de aplicación Express
const app = express();

// 2. Interceptar Content-Type: application/json
app.use(express.json());

// 3. Middleware de CORS (Cross-Origin Resource Sharing)
// Permite que el navegador (Live Server en :5500) consuma esta API (:3000) sin restricciones
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Definir el puerto de conexión
const PORT = process.env.PORT || 3000;

// Ruta raíz de bienvenida
app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: "Bienvenido a la API REST del ADSO - Sesión 05",
    rutasDisponibles: [
      "GET    /api/status",
      "GET    /api/productos (soporta ?categoria= y ?q=)",
      "GET    /api/productos/:id",
      "POST   /api/productos",
      "PATCH  /api/productos/:id/stock",
      "DELETE /api/productos/:id"
    ]
  });
});

// ENDPOINT 1: Health Check del Servidor
app.get('/api/status', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Servidor Express ADSO en funcionamiento",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// BASE DE DATOS SIMULADA EN MEMORIA
let productos = [
  { id: 1, sku: "HW-001",  nombre: "Teclado Mecánico RGB", categoria: "HARDWARE",      stock: 8,  precio: 120000 },
  { id: 2, sku: "PAN-002", nombre: "Monitor 24 pulg IPS",   categoria: "PANTALLAS",     stock: 3,  precio: 580000 },
  { id: 3, sku: "ACC-003", nombre: "Hub USB-C 7 en 1",      categoria: "ACCESORIOS",    stock: 0,  precio: 65000 },
  { id: 4, sku: "ALM-004", nombre: "SSD NVMe 1TB PCIe",     categoria: "ALMACENAMIENTO",stock: 5,  precio: 320000 },
  { id: 5, sku: "RED-005", nombre: "Cable Red Cat 6 10m",   categoria: "REDES",         stock: 12, precio: 28000 }
];

// ENDPOINT 2: GET - Retornar Catálogo con Filtros Opcionales (?categoria= y ?q=)
app.get('/api/productos', (req, res) => {
  const { categoria, q } = req.query;
  let resultado = productos;

  // Filtrado por categoría si se especificó
  if (categoria && categoria.toUpperCase() !== 'TODAS') {
    resultado = resultado.filter(p => 
      p.categoria.toUpperCase() === categoria.toUpperCase()
    );
  }

  // Filtrado por término de búsqueda (nombre o SKU) si se especificó
  if (q) {
    const termino = q.toLowerCase().trim();
    resultado = resultado.filter(p => 
      p.nombre.toLowerCase().includes(termino) ||
      (p.sku && p.sku.toLowerCase().includes(termino))
    );
  }

  res.status(200).json({
    ok: true,
    total: resultado.length,
    totalCatalogo: productos.length,
    filtros: { categoria: categoria || "todos", q: q || null },
    datos: resultado
  });
});

// ENDPOINT 3: GET por ID (:id)
app.get('/api/productos/:id', (req, res) => {
  const idBuscado = Number(req.params.id);
  const producto = productos.find(p => p.id === idBuscado);

  if (!producto) {
    return res.status(404).json({
      ok: false,
      error: `Producto con el ID: ${idBuscado} no existe!`
    });
  }

  res.status(200).json({
    ok: true,
    mensaje: "Producto encontrado",
    dato: producto,
    datos: producto
  });
});

// ENDPOINT 4: POST - Crear Nuevo Producto
app.post('/api/productos', (req, res) => {
  const { sku, nombre, precio, categoria, stock } = req.body;

  // Validación defensiva en servidor
  if (!nombre || !precio || !categoria || Number(precio) <= 0) {
    return res.status(400).json({
      ok: false,
      error: "El nombre, categoría y precio positivo (> 0) son obligatorios."
    });
  }

  // Asignar o validar SKU único
  const skuFinal = (sku || `PRD-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
  if (productos.some(p => p.sku === skuFinal)) {
    return res.status(409).json({
      ok: false,
      error: `Conflicto: Ya existe un producto registrado con el SKU ${skuFinal}.`
    });
  }

  // Generar ID autoincremental
  const nuevo = {
    id: productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    sku: skuFinal,
    nombre: nombre.trim(),
    precio: Number(precio),
    categoria: categoria.toUpperCase(),
    stock: Number(stock) || 0
  };

  productos.push(nuevo);

  res.status(201).json({
    ok: true,
    mensaje: "Producto creado exitosamente",
    dato: nuevo,
    datos: nuevo
  });
});

// ENDPOINT 5: PATCH - Modificación Parcial de Stock
app.patch('/api/productos/:id/stock', (req, res) => {
  const id = Number(req.params.id);
  const stockRecibido = req.body.nuevoStock !== undefined ? req.body.nuevoStock : req.body.nuevostock;

  // 1. Validar existencia del producto (404)
  const producto = productos.find(p => p.id === id);
  if (!producto) {
    return res.status(404).json({
      ok: false,
      error: `Producto con ID ${id} no encontrado`
    });
  }

  // 2. Validar que nuevoStock sea numérico y >= 0 (400)
  if (stockRecibido === undefined || typeof stockRecibido !== 'number' || stockRecibido < 0 || isNaN(stockRecibido)) {
    return res.status(400).json({
      ok: false,
      error: "El nuevo stock debe ser un número entero mayor o igual a 0"
    });
  }

  const anterior = producto.stock;
  producto.stock = stockRecibido;

  res.status(200).json({
    ok: true,
    mensaje: "Stock ha sido actualizado correctamente",
    stockAnterior: anterior,
    stockActual: producto.stock,
    dato: producto,
    datos: producto
  });
});

// ENDPOINT 6: DELETE - Eliminación por ID
app.delete('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  // 1. Si no existe, responder 404
  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: `Producto con ID ${id} no encontrado para eliminar`
    });
  }

  // 2. Eliminar elemento del array
  const [eliminado] = productos.splice(index, 1);

  // 3. Responder 200 OK con el registro eliminado
  res.status(200).json({
    ok: true,
    mensaje: "Producto eliminado exitosamente",
    dato: eliminado,
    datos: eliminado
  });
});

// MIDDLEWARE CATCH-ALL PARA RUTAS NO REGISTRADAS (404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Endpoint no encontrado en el servidor ADSO",
    metodo: req.method,
    rutaSolicitada: req.originalUrl,
    sugerencia: "Consulte la documentación de la API en /api/status"
  });
});

// Escuchar en el puerto configurado
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Servidor Express ADSO activo en: http://localhost:${PORT}`);
  console.log(`📡 Endpoints listos para consumo con Fetch API`);
  console.log(`   - GET    http://localhost:${PORT}/api/status`);
  console.log(`   - GET    http://localhost:${PORT}/api/productos`);
  console.log(`   - GET    http://localhost:${PORT}/api/productos/:id`);
  console.log(`   - POST   http://localhost:${PORT}/api/productos`);
  console.log(`   - PATCH  http://localhost:${PORT}/api/productos/:id/stock`);
  console.log(`   - DELETE http://localhost:${PORT}/api/productos/:id`);
  console.log(`======================================================\n`);
});