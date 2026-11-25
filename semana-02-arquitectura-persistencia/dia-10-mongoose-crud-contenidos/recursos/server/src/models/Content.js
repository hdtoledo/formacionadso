/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Modelo Mongoose del catálogo polimórfico de la Landing Page
 * Archivo: server/src/models/Content.js
 * =============================================================================
 *
 * La colección "contents" (Sesión 07) guarda documentos de varios tipos.
 * Mongoose lo modela con DISCRIMINATORS:
 *   - ContentSchema: campos comunes a todos (active, tags, timestamps)
 *   - Un esquema por tipo con sus campos propios (banner, service, ...)
 *   - El campo "type" (discriminatorKey) decide qué esquema valida cada documento.
 */

import mongoose from 'mongoose';
import { config } from '../config/environment.js';

const { Schema } = mongoose;

export const CONTENT_TYPES = ['banner', 'service', 'testimonial', 'stat', 'event'];
export const CONTENT_CATEGORIES = ['software', 'agroindustria', 'seguridad', 'innovacion'];

// Solo https://... o rutas internas que empiecen por "/".
// Bloquea enlaces "javascript:alert(1)", que en un <a href> del frontend serían XSS,
// y "//otro-dominio.com" (empieza por "/" pero el navegador lo trata como dominio externo).
const HTTPS_URL = /^https:\/\/\S+$/;
const SAFE_LINK = /^(https:\/\/\S+|\/(?!\/)[\w\-./]*)$/;

// -----------------------------------------------------------------------------
// 1. Esquema base: lo que comparten TODOS los contenidos
// -----------------------------------------------------------------------------
const ContentSchema = new Schema(
  {
    // true = publicado en la Landing · false = borrador (por defecto, nada se publica solo)
    active: { type: Boolean, default: false },
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: [30, 'Cada etiqueta admite máximo 30 caracteres.'] }],
      default: undefined,
      validate: { validator: (tags) => tags.length <= 10, message: 'Máximo 10 etiquetas por contenido.' }
    }
  },
  {
    discriminatorKey: 'type',   // El campo que distingue banner, service, testimonial...
    collection: 'contents',     // La misma colección creada en la Sesión 07
    timestamps: true,           // createdAt y updatedAt automáticos
    strict: true,               // Campos no declarados en el esquema se descartan
    autoIndex: !config.isProduction // En producción los índices se crean con scripts, no al arrancar
  }
);

// Índices: mismos nombres y opciones que el script 01_adso_polyglot_setup.js (Sesión 07).
// Si los nombres no coincidieran, MongoDB rechazaría el índice "duplicado".
ContentSchema.index({ active: 1, priority: 1 }, { name: 'idx_active_priority' });
ContentSchema.index({ type: 1, active: 1 }, { name: 'idx_type_active' });
ContentSchema.index({ code: 1 }, { unique: true, sparse: true, name: 'idx_unique_service_code' });
ContentSchema.index({ category: 1 }, { sparse: true, name: 'idx_category' });
ContentSchema.index(
  { title: 'text', name: 'text', tags: 'text', description: 'text' },
  { name: 'idx_fulltext_search', default_language: 'spanish' }
);

export const Content = mongoose.model('Content', ContentSchema);

// -----------------------------------------------------------------------------
// 2. Discriminators: un esquema por tipo de contenido
// -----------------------------------------------------------------------------
Content.discriminator('banner', new Schema({
  title: {
    type: String, trim: true,
    required: [true, 'El título es obligatorio.'],
    minlength: [5, 'El título debe tener al menos 5 caracteres.'],
    maxlength: [120, 'El título admite máximo 120 caracteres.']
  },
  subtitle: { type: String, trim: true, maxlength: [200, 'El subtítulo admite máximo 200 caracteres.'] },
  ctaText: { type: String, trim: true, maxlength: [40, 'El texto del botón admite máximo 40 caracteres.'] },
  ctaUrl: { type: String, trim: true, match: [SAFE_LINK, 'El enlace debe ser https:// o una ruta interna que empiece por "/".'] },
  imageUrl: { type: String, trim: true, match: [HTTPS_URL, 'La imagen debe ser una URL https://.'] },
  priority: { type: Number, min: [1, 'La prioridad mínima es 1.'], default: 100 }
}));

Content.discriminator('service', new Schema({
  name: {
    type: String, trim: true,
    required: [true, 'El nombre es obligatorio.'],
    minlength: [5, 'El nombre debe tener al menos 5 caracteres.'],
    maxlength: [120, 'El nombre admite máximo 120 caracteres.']
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria.'],
    enum: { values: CONTENT_CATEGORIES, message: 'Categoría no permitida: {VALUE}.' }
  },
  description: {
    type: String, trim: true,
    required: [true, 'La descripción es obligatoria.'],
    minlength: [20, 'La descripción debe tener al menos 20 caracteres.'],
    maxlength: [500, 'La descripción admite máximo 500 caracteres.']
  },
  icon: { type: String, trim: true, match: [/^[a-z0-9-]{2,40}$/, 'El ícono debe ser un nombre de Lucide (ej. "server").'] },
  code: { type: String, trim: true, uppercase: true, match: [/^SRV-[A-Z]+-\d{2}$/, 'El código debe tener el formato SRV-AREA-01.'] },
  hours: { type: Number, min: [1, 'La intensidad mínima es 1 hora.'] },
  maxCapacity: { type: Number, min: [1, 'El cupo mínimo es 1.'] },
  views: { type: Number, min: 0, default: 0 },
  metadata: { type: Schema.Types.Mixed } // Datos libres por servicio (nivel, sector, herramientas...)
}));

Content.discriminator('testimonial', new Schema({
  author: {
    type: String, trim: true,
    required: [true, 'El autor es obligatorio.'],
    minlength: [3, 'El autor debe tener al menos 3 caracteres.'],
    maxlength: [80, 'El autor admite máximo 80 caracteres.']
  },
  role: { type: String, trim: true, maxlength: [80, 'El cargo admite máximo 80 caracteres.'] },
  company: { type: String, trim: true, maxlength: [80, 'La empresa admite máximo 80 caracteres.'] },
  quote: {
    type: String, trim: true,
    required: [true, 'El testimonio es obligatorio.'],
    minlength: [20, 'El testimonio debe tener al menos 20 caracteres.'],
    maxlength: [400, 'El testimonio admite máximo 400 caracteres.']
  },
  rating: {
    type: Number, min: [1, 'La calificación mínima es 1.'], max: [5, 'La calificación máxima es 5.'],
    validate: { validator: Number.isInteger, message: 'La calificación debe ser un número entero.' }
  },
  avatarUrl: { type: String, trim: true, match: [HTTPS_URL, 'El avatar debe ser una URL https://.'] },
  verified: { type: Boolean, default: false }
}));

Content.discriminator('stat', new Schema({
  metric: {
    type: String, trim: true,
    required: [true, 'El nombre de la métrica es obligatorio.'],
    minlength: [3, 'La métrica debe tener al menos 3 caracteres.'],
    maxlength: [60, 'La métrica admite máximo 60 caracteres.']
  },
  value: { type: Number, required: [true, 'El valor es obligatorio.'], min: [0, 'El valor no puede ser negativo.'] },
  prefix: { type: String, trim: true, maxlength: [3, 'El prefijo admite máximo 3 caracteres.'] },
  suffix: { type: String, trim: true, maxlength: [3, 'El sufijo admite máximo 3 caracteres.'] },
  label: { type: String, trim: true, maxlength: [120, 'La etiqueta admite máximo 120 caracteres.'] },
  order: { type: Number, min: [0, 'El orden mínimo es 0.'] }
}));

Content.discriminator('event', new Schema({
  title: {
    type: String, trim: true,
    required: [true, 'El título es obligatorio.'],
    minlength: [5, 'El título debe tener al menos 5 caracteres.'],
    maxlength: [120, 'El título admite máximo 120 caracteres.']
  },
  description: { type: String, trim: true, maxlength: [500, 'La descripción admite máximo 500 caracteres.'] },
  startsAt: { type: Date, required: [true, 'La fecha de inicio es obligatoria.'] },
  location: { type: String, trim: true, maxlength: [120, 'El lugar admite máximo 120 caracteres.'] }
}));
