/**
 * ============================================================================
 * AGROHUILA S.A.S. - SERVIDOR REST API (EXPRESS)
 * Evidencia de Aprendizaje: Consumo con Fetch API & Manipulación del DOM
 * Programa: Tecnólogo en Análisis y Desarrollo de Software (ADSO) - Ficha 2026
 * SENA Regional Huila - Centro Agroempresarial y Desarrollo Pecuario (CADPH)
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Permite peticiones desde Live Server (127.0.0.1:5500)
app.use(express.json()); // Permite recibir y parsear cuerpos JSON en POST y PATCH

// Logger en consola para depuración durante la práctica
app.use((req, res, next) => {
  const hora = new Date().toLocaleTimeString('es-CO');
  console.log(`[${hora}] ${req.method} ${req.originalUrl}`);
  next();
});

// Base de datos en memoria: Inventario de Insumos Agropecuarios
let insumos = [
  {
    id: 1,
    sku: "FER-101",
    nombre: "Fertilizante NPK 17-6-18 Café Especial (50kg)",
    categoria: "FERTILIZANTES",
    precio: 145000,
    stock: 24,
    descripcion: "Fórmula de alta solubilidad para floración y llenado de grano en cafetales del Huila."
  },
  {
    id: 2,
    sku: "MAQ-202",
    nombre: "Despulpadora Ecológica de Café Cap. 300kg/h",
    categoria: "MAQUINARIA",
    precio: 1850000,
    stock: 6,
    descripcion: "Cilindro en acero inoxidable con motor eléctrico de 1.5 HP y bajo consumo de agua."
  },
  {
    id: 3,
    sku: "HER-203",
    nombre: "Tijera Podadora Forjada para Ramas de Café",
    categoria: "HERRAMIENTAS",
    precio: 48000,
    stock: 35,
    descripcion: "Acero al carbono templado con mango ergonómico antideslizante."
  },
  {
    id: 4,
    sku: "BIO-301",
    nombre: "Micorrizas Biológicas Nativas Activadas (1kg)",
    categoria: "BIOINSUMOS",
    precio: 32000,
    stock: 50,
    descripcion: "Inóculo para enraizamiento acelerado de almácigos y renovación de cafetales."
  },
  {
    id: 5,
    sku: "VET-401",
    nombre: "Suplemento Mineral Becerros Huila (20kg)",
    categoria: "VETERINARIA",
    precio: 89000,
    stock: 12,
    descripcion: "Sales mineralizadas con fósforo al 8% y zinc para levante en ganadería doble propósito."
  },
  {
    id: 6,
    sku: "BIO-302",
    nombre: "Trampa de Feromonas para Broca del Café (Pack x5)",
    categoria: "BIOINSUMOS",
    precio: 25000,
    stock: 0, // Insumo con stock agotado para pruebas visuales en el frontend
    descripcion: "Atrayente etológico ecológico para monitoreo y control en lotes cafeteros."
  }
];

// Contador autoincremental para nuevos IDs
let proximoId = 7;

// ============================================================================
// RUTAS / ENDPOINTS DE LA API REST AGROHUILA
// ============================================================================

/**
 * 1. GET /api/status
 * Health check del servidor de AgroHuila.
 */
app.get('/api/status', (req, res) => {
  res.status(200).json({
    ok: true,
    empresa: "AgroHuila S.A.S.",
    lema: "Tecnología e Insumos para el Campo Opita",
    version: "1.0.0",
    fecha: new Date().toISOString(),
    servidor: "Express en Node.js",
    estado: "OPERATIVO",
    uptime: `${process.uptime().toFixed(1)} segundos`
  });
});

/**
 * 2. GET /api/insumos
 * Retorna la lista completa de insumos. Soporta filtros:
 * - ?categoria=FERTILIZANTES
 * - ?q=cafe (búsqueda por nombre o sku)
 */
app.get('/api/insumos', (req, res) => {
  const { categoria, q } = req.query;
  let resultado = [...insumos];

  if (categoria && categoria.trim() !== '') {
    resultado = resultado.filter(
      item => item.categoria.toUpperCase() === categoria.trim().toUpperCase()
    );
  }

  if (q && q.trim() !== '') {
    const termino = q.trim().toLowerCase();
    resultado = resultado.filter(
      item =>
        item.nombre.toLowerCase().includes(termino) ||
        item.sku.toLowerCase().includes(termino)
    );
  }

  res.status(200).json({
    ok: true,
    total: resultado.length,
    filtrosAplicados: { categoria: categoria || 'TODAS', q: q || null },
    data: resultado
  });
});

/**
 * 3. GET /api/insumos/:id
 * Consulta un insumo por su ID numérico.
 */
app.get('/api/insumos/:id', (req, res) => {
  const idBuscado = Number(req.params.id);

  if (isNaN(idBuscado)) {
    return res.status(400).json({
      ok: false,
      error: "El ID solicitado debe ser un valor numérico válido."
    });
  }

  const insumo = insumos.find(item => item.id === idBuscado);

  if (!insumo) {
    return res.status(404).json({
      ok: false,
      error: `Insumo con ID #${idBuscado} no encontrado en el inventario de AgroHuila.`
    });
  }

  res.status(200).json({
    ok: true,
    data: insumo
  });
});

/**
 * 4. POST /api/insumos
 * Registra un nuevo insumo en el inventario.
 * Requiere: { sku, nombre, categoria, precio, stock, descripcion? }
 */
app.post('/api/insumos', (req, res) => {
  const { sku, nombre, categoria, precio, stock, descripcion } = req.body;

  // Validación de campos requeridos
  if (!sku || !nombre || !categoria || precio === undefined || stock === undefined) {
    return res.status(400).json({
      ok: false,
      error: "Faltan datos obligatorios. Requeridos: sku, nombre, categoria, precio y stock."
    });
  }

  const skuNormalizado = String(sku).trim().toUpperCase();

  // Validación de SKU único (Regla de negocio: no duplicar código de insumo)
  const existeSku = insumos.some(item => item.sku.toUpperCase() === skuNormalizado);
  if (existeSku) {
    return res.status(409).json({
      ok: false,
      error: `Conflicto: Ya existe un insumo registrado con el SKU '${skuNormalizado}'. Debe ser único.`
    });
  }

  const precioNum = Number(precio);
  const stockNum = Number(stock);

  if (isNaN(precioNum) || precioNum <= 0) {
    return res.status(400).json({
      ok: false,
      error: "El precio debe ser un número mayor a 0."
    });
  }

  if (isNaN(stockNum) || stockNum < 0) {
    return res.status(400).json({
      ok: false,
      error: "El stock inicial no puede ser negativo."
    });
  }

  const nuevoInsumo = {
    id: proximoId++,
    sku: skuNormalizado,
    nombre: String(nombre).trim(),
    categoria: String(categoria).trim().toUpperCase(),
    precio: precioNum,
    stock: stockNum,
    descripcion: descripcion ? String(descripcion).trim() : "Sin descripción adicional."
  };

  insumos.push(nuevoInsumo);

  console.log(`[AgroHuila] 🌾 Nuevo insumo registrado: [${nuevoInsumo.sku}] ${nuevoInsumo.nombre}`);

  res.status(201).json({
    ok: true,
    mensaje: "Insumo agropecuario registrado exitosamente en AgroHuila.",
    data: nuevoInsumo
  });
});

/**
 * 5. PATCH /api/insumos/:id/stock
 * Actualización parcial del stock de un insumo existente.
 * Requiere: { nuevoStock }
 */
app.patch('/api/insumos/:id/stock', (req, res) => {
  const idBuscado = Number(req.params.id);
  const { nuevoStock } = req.body;

  if (isNaN(idBuscado)) {
    return res.status(400).json({
      ok: false,
      error: "El ID proporcionado debe ser un número entero."
    });
  }

  const indice = insumos.findIndex(item => item.id === idBuscado);
  if (indice === -1) {
    return res.status(404).json({
      ok: false,
      error: `Insumo con ID #${idBuscado} no encontrado para actualizar existencias.`
    });
  }

  const stockNum = Number(nuevoStock);
  if (nuevoStock === undefined || isNaN(stockNum) || stockNum < 0) {
    return res.status(400).json({
      ok: false,
      error: "El campo 'nuevoStock' es obligatorio y debe ser un entero mayor o igual a 0."
    });
  }

  const stockAnterior = insumos[indice].stock;
  insumos[indice].stock = stockNum;

  console.log(`[AgroHuila] 📦 Stock actualizado ID #${idBuscado}: ${stockAnterior} -> ${stockNum}`);

  res.status(200).json({
    ok: true,
    mensaje: `Stock actualizado con éxito para el insumo '${insumos[indice].nombre}'.`,
    id: idBuscado,
    stockAnterior: stockAnterior,
    nuevoStock: stockNum,
    insumo: insumos[indice]
  });
});

/**
 * 6. DELETE /api/insumos/:id
 * Elimina un insumo del catálogo por su ID.
 */
app.delete('/api/insumos/:id', (req, res) => {
  const idBuscado = Number(req.params.id);

  if (isNaN(idBuscado)) {
    return res.status(400).json({
      ok: false,
      error: "El ID a eliminar debe ser numérico."
    });
  }

  const indice = insumos.findIndex(item => item.id === idBuscado);
  if (indice === -1) {
    return res.status(404).json({
      ok: false,
      error: `No existe ningún insumo con ID #${idBuscado} para dar de baja.`
    });
  }

  const insumoEliminado = insumos.splice(indice, 1)[0];
  console.log(`[AgroHuila] 🗑️ Insumo dado de baja: [${insumoEliminado.sku}] ${insumoEliminado.nombre}`);

  res.status(200).json({
    ok: true,
    mensaje: `El insumo [${insumoEliminado.sku}] '${insumoEliminado.nombre}' fue dado de baja satisfactoriamente.`,
    id: idBuscado
  });
});

// Manejo de ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: `Ruta inexistente: ${req.method} ${req.path}. Consulta la documentación de la API de AgroHuila.`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log("====================================================================");
  console.log(`🌾 SERVIDOR AGROHUILA S.A.S. ACTIVO EN: http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles para la evidencia:`);
  console.log(`   - GET    http://localhost:${PORT}/api/status`);
  console.log(`   - GET    http://localhost:${PORT}/api/insumos`);
  console.log(`   - GET    http://localhost:${PORT}/api/insumos/:id`);
  console.log(`   - POST   http://localhost:${PORT}/api/insumos`);
  console.log(`   - PATCH  http://localhost:${PORT}/api/insumos/:id/stock`);
  console.log(`   - DELETE http://localhost:${PORT}/api/insumos/:id`);
  console.log("====================================================================");
});
