/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Controlador del catálogo de contenidos (MongoDB)
 * Archivo: server/src/controllers/contentController.js
 * =============================================================================
 */

import { Content, CONTENT_TYPES } from '../models/Content.js';
import { AppError } from '../middlewares/errorHandler.js';
import { isObjectId, parseLimit } from '../utils/validators.js';

// Campos que el cliente NUNCA puede escribir (los gestiona el servidor)
const PROTECTED_FIELDS = ['_id', 'type', 'createdAt', 'updatedAt', '__v', 'views'];

// Copia solo los campos editables. Las llaves que empiezan por "$" se descartan:
// un body como { "$set": {...} } no debe convertirse en un operador de MongoDB.
const pickEditable = (body) =>
  Object.fromEntries(
    Object.entries(body ?? {}).filter(([key]) => !PROTECTED_FIELDS.includes(key) && !key.startsWith('$'))
  );

// El tipo debe ser TEXTO y estar en la lista blanca.
// ?type[$ne]=banner llega como objeto { $ne: 'banner' }: sin esta validación sería inyección NoSQL.
const assertContentType = (type) => {
  if (typeof type !== 'string' || !CONTENT_TYPES.includes(type)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', {
      type: `Debe ser uno de: ${CONTENT_TYPES.join(', ')}.`
    });
  }
};

const invalidId = () => new AppError(400, 'INVALID_ID', 'El identificador debe ser un ObjectId válido.');
const contentNotFound = () => new AppError(404, 'CONTENT_NOT_FOUND', 'El contenido solicitado no existe.');

/**
 * GET /api/content/published?type=service&limit=20   (PÚBLICO)
 * Contenidos visibles en la Landing Page: solo active: true.
 */
export async function getPublishedContents(req, res) {
  const filter = { active: true };
  if (req.query.type !== undefined) {
    assertContentType(req.query.type);
    filter.type = req.query.type;
  }
  const limit = parseLimit(req.query.limit);

  // Ordenar por priority solo funciona dentro de los banners: en MongoDB, los documentos
  // SIN el campo quedan ANTES que los números en orden ascendente. Por eso se agrupa por type primero.
  const data = await Content.find(filter)
    .sort({ type: 1, priority: 1, createdAt: -1 })
    .limit(limit)
    .select('-__v')
    .lean(); // Objetos JS planos: más rápido para solo lectura

  res.json({ success: true, data, meta: { count: data.length, limit } });
}

/**
 * GET /api/dev/content?active=false&type=banner&limit=20   (LABORATORIO · admin en la Semana 3)
 * Incluye borradores: es la vista del panel administrativo.
 */
export async function listContents(req, res) {
  const filter = {};
  if (req.query.type !== undefined) {
    assertContentType(req.query.type);
    filter.type = req.query.type;
  }
  if (req.query.active !== undefined) {
    if (req.query.active !== 'true' && req.query.active !== 'false') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', { active: 'Debe ser true o false.' });
    }
    filter.active = req.query.active === 'true';
  }
  const limit = parseLimit(req.query.limit);

  const data = await Content.find(filter).sort({ updatedAt: -1 }).limit(limit).select('-__v').lean();
  res.json({ success: true, data, meta: { count: data.length, limit } });
}

/**
 * POST /api/dev/content   Body: { "type": "service", ...campos del tipo }
 */
export async function createContent(req, res) {
  const { type } = req.body ?? {};
  assertContentType(type);

  // El discriminator correcto valida los campos propios del tipo
  const ContentModel = Content.discriminators[type];
  const doc = await ContentModel.create(pickEditable(req.body));

  res.status(201).json({ success: true, data: doc.toObject({ versionKey: false }) });
}

/**
 * PATCH /api/dev/content/:id   Body: campos a modificar (actualización parcial)
 */
export async function updateContent(req, res) {
  const { id } = req.params;
  if (!isObjectId(id)) throw invalidId();

  const doc = await Content.findById(id); // Devuelve la instancia del discriminator correcto
  if (!doc) throw contentNotFound();

  if (req.body?.type !== undefined && req.body.type !== doc.type) {
    throw new AppError(422, 'CONTENT_TYPE_IMMUTABLE', 'El tipo de un contenido no se puede cambiar; cree uno nuevo.');
  }

  // doc.set + doc.save ejecuta TODAS las validaciones del esquema y actualiza updatedAt
  doc.set(pickEditable(req.body));
  await doc.save();

  res.json({ success: true, data: doc.toObject({ versionKey: false }) });
}

/**
 * DELETE /api/dev/content/:id
 */
export async function deleteContent(req, res) {
  const { id } = req.params;
  if (!isObjectId(id)) throw invalidId();

  const deleted = await Content.findByIdAndDelete(id);
  if (!deleted) throw contentNotFound();

  res.status(204).end(); // 204 No Content: borrado exitoso, sin cuerpo
}
