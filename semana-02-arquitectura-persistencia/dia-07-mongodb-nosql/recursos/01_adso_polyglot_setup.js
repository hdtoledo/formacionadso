/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Programa de Formación: Análisis y Desarrollo de Software (ADSO)
 * Sesión 07: Persistencia NoSQL con MongoDB Atlas, BSON & MQL
 * Script Integral de Configuración y Aprovisionamiento de Base de Datos
 * Archivo: database/nosql/01_adso_polyglot_setup.js
 * =============================================================================
 * 
 * FORMAS DE EJECUCIÓN:
 * 1. Desde la Terminal mongosh (CLI):
 *    mongosh "mongodb+srv://adso_user:Secret2026@cluster0.../adso_polyglot_db" --file 01_adso_polyglot_setup.js
 * 
 * 2. Desde la Terminal _MONGOSH integrada en MongoDB Compass:
 *    Copie y pegue todo el contenido de este script y presione Enter.
 * 
 * 3. Desde un script Node.js o automatización CI/CD:
 *    load("database/nosql/01_adso_polyglot_setup.js")
 * =============================================================================
 */

// 1. Conexión y selección de base de datos canónica
const DB_NAME = "adso_polyglot_db";
const COLL_NAME = "contents";

print("🚀 [ADSO SENA] Iniciando aprovisionamiento NoSQL en base de datos: " + DB_NAME);
db = db.getSiblingDB(DB_NAME);

// 2. Limpieza segura previa (Idempotencia para laboratorios de aula)
print("🧹 [ADSO SENA] Verificando colección existente '" + COLL_NAME + "'...");
try {
  db[COLL_NAME].drop();
  print("   ✓ Colección anterior eliminada para garantizar estado limpio y reproducible.");
} catch (e) {
  print("   ℹ La colección no existía previamente, procediendo a su creación.");
}

// 3. Creación de la Colección con Validación de Esquema JSON Schema
// Permite polimorfismo pero impone tipos obligatorios de calidad enterprise
print("🛡️ [ADSO SENA] Creando colección '" + COLL_NAME + "' con JSON Schema Validator...");
db.createCollection(COLL_NAME, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "active", "createdAt", "updatedAt"],
      properties: {
        _id: {
          bsonType: "objectId",
          description: "Identificador único inmutable generado por el motor"
        },
        type: {
          enum: ["banner", "service", "testimonial", "stat", "event"],
          description: "Discriminador polimórfico del contenido (obligatorio)"
        },
        active: {
          bsonType: "bool",
          description: "Bandera booleana de estado (Soft Delete / publicación)"
        },
        title: {
          bsonType: "string",
          description: "Título principal para banners y eventos"
        },
        name: {
          bsonType: "string",
          description: "Nombre descriptivo para servicios tecnológicos"
        },
        code: {
          bsonType: "string",
          description: "Código de catálogo único (e.g., SRV-SOFT-01)"
        },
        hours: {
          bsonType: ["int", "double"],
          minimum: 1,
          description: "Intensidad horaria del servicio formativo"
        },
        views: {
          bsonType: ["int", "double"],
          minimum: 0,
          description: "Contador de métricas y visitas"
        },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Etiquetas de indexación y búsqueda"
        },
        createdAt: {
          bsonType: "date",
          description: "Marca temporal ISO de inserción en el clúster"
        },
        updatedAt: {
          bsonType: "date",
          description: "Marca temporal ISO de última modificación"
        }
      }
    }
  },
  validationAction: "warn" // En aula avisa para facilitar aprendizaje sin bloquear
});
print("   ✓ Validador de esquema JSON configurado con éxito.");

// 4. Creación de Índices Estratégicos para Alta Concurrencia
print("⚡ [ADSO SENA] Creando índices B-Tree y de texto para la Landing Page...");

// Índice 1: Consultas de la Landing Page (banners y servicios activos por prioridad)
db[COLL_NAME].createIndex(
  { active: 1, priority: 1 },
  { name: "idx_active_priority" }
);

// Índice 2: Clave única dispersa para código de servicio (SRV-...)
db[COLL_NAME].createIndex(
  { code: 1 },
  { unique: true, sparse: true, name: "idx_unique_service_code" }
);

// Índice 3: Agrupación por tipo polimórfico y estado
db[COLL_NAME].createIndex(
  { type: 1, active: 1 },
  { name: "idx_type_active" }
);

// Índice 4: Búsqueda rápida por categoría tecnológica
db[COLL_NAME].createIndex(
  { category: 1 },
  { sparse: true, name: "idx_category" }
);

// Índice 5: Full-Text Search en español para el buscador de la Landing
db[COLL_NAME].createIndex(
  { title: "text", name: "text", tags: "text", description: "text" },
  { name: "idx_fulltext_search", default_language: "spanish" }
);
print("   ✓ 5 Índices estratégicos construidos.");

// 5. Semilla Oficial de 10 Documentos BSON Polimórficos
print("🌱 [ADSO SENA] Insertando lote canónico de 10 documentos polimórficos...");

const seedData = [
  // --- BANNERS PRINCIPALES DEL HERO ---
  {
    type: "banner",
    title: "Innovación Tecnológica y Persistencia Políglota en ADSO",
    subtitle: "Formación integral con PostgreSQL para autenticación y MongoDB para catálogos dinámicos.",
    ctaText: "Explorar Módulos",
    ctaUrl: "/catalog",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    priority: 1,
    active: true,
    tags: ["tecnologia", "adso", "sena", "fullstack"],
    createdAt: new Date("2026-10-16T10:00:00.000Z"),
    updatedAt: new Date("2026-10-16T10:00:00.000Z")
  },
  {
    type: "banner",
    title: "Centro Agroempresarial y Desarrollo Pecuario del Huila - Garzón",
    subtitle: "Ambientes de formación avanzada en desarrollo de software, agroindustria y biotecnología.",
    ctaText: "Conocer CADPH",
    ctaUrl: "/sedes/garzon",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    priority: 2,
    active: true,
    tags: ["sena", "huila", "garzon", "agroempresa"],
    createdAt: new Date("2026-10-16T10:05:00.000Z"),
    updatedAt: new Date("2026-10-16T10:05:00.000Z")
  },

  // --- SERVICIOS TECNOLÓGICOS Y FORMATIVOS ---
  {
    type: "service",
    name: "Laboratorio de Desarrollo Web Full Stack & Microservicios",
    category: "software",
    description: "Scaffolding de arquitecturas backend modernas con Express, Node.js, pools relacionales PostgreSQL y almacenamiento documental en MongoDB.",
    icon: "server",
    code: "SRV-SOFT-01",
    hours: 120,
    maxCapacity: 30,
    views: 450,
    active: true,
    metadata: {
      level: "avanzado",
      instructor: "Equipo Técnico ADSO Garzón",
      prerequisites: ["JavaScript ES6+", "SQL Relacional", "Git & GitHub"]
    },
    tags: ["backend", "express", "postgresql", "mongodb", "nodejs"],
    createdAt: new Date("2026-10-16T10:15:00.000Z"),
    updatedAt: new Date("2026-10-16T10:15:00.000Z")
  },
  {
    type: "service",
    name: "Sistemas de Trazabilidad Agropecuaria y Blockchain",
    category: "agroindustria",
    description: "Diseño de modelos de persistencia documental para el seguimiento de lotes de café de origen, cacao y piscicultura en la cuenca del Río Suaza.",
    icon: "sprout",
    code: "SRV-AGRO-02",
    hours: 80,
    maxCapacity: 25,
    views: 320,
    active: true,
    metadata: {
      level: "intermedio",
      sector: "Caficultura & Piscicultura Huila",
      certification: "Sello Verde SENA CADPH"
    },
    tags: ["agroindustria", "trazabilidad", "cafe", "huila", "iot"],
    createdAt: new Date("2026-10-16T10:20:00.000Z"),
    updatedAt: new Date("2026-10-16T10:20:00.000Z")
  },
  {
    type: "service",
    name: "Auditoría de Ciberseguridad & Mitigación IDOR / OWASP",
    category: "seguridad",
    description: "Hardening de bases de datos relacionales y no relacionales, análisis de permisos, prevención de SQLi, NoSQL Injection y control de acceso seguro.",
    icon: "shield-check",
    code: "SRV-SEC-03",
    hours: 60,
    maxCapacity: 20,
    views: 580,
    active: true,
    metadata: {
      level: "avanzado",
      framework: "OWASP Top 10 API Security",
      tools: ["Bruno", "Postman", "Compass", "pgAdmin"]
    },
    tags: ["ciberseguridad", "owasp", "seguridad", "nosql-injection"],
    createdAt: new Date("2026-10-16T10:25:00.000Z"),
    updatedAt: new Date("2026-10-16T10:25:00.000Z")
  },
  {
    type: "service",
    name: "Desarrollo Frontend React SPA con Tailwind CSS",
    category: "software",
    description: "Construcción de interfaces interactivas, componentes desacoplados, consumo de APIs REST con Axios y autenticación segura por cookies httpOnly.",
    icon: "layout",
    code: "SRV-FRONT-04",
    hours: 90,
    maxCapacity: 30,
    views: 610,
    active: true,
    metadata: {
      level: "intermedio",
      framework: "React 18 + Vite",
      styling: "Tailwind CSS v3/v4"
    },
    tags: ["react", "vite", "tailwind", "frontend", "ui-ux"],
    createdAt: new Date("2026-10-16T10:30:00.000Z"),
    updatedAt: new Date("2026-10-16T10:30:00.000Z")
  },

  // --- TESTIMONIOS INSTITUCIONALES Y EMPRESARIALES ---
  {
    type: "testimonial",
    author: "Laura Camila Dussán",
    role: "Aprendiz ADSO Ficha 2826845",
    company: "CADPH Garzón",
    quote: "Aprender a combinar PostgreSQL para el login con UUIDs y MongoDB para los contenidos de la Landing nos dio una perspectiva real de cómo operan plataformas como Uber y Mercado Libre.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    verified: true,
    active: true,
    tags: ["testimonio", "adso", "aprendiz"],
    createdAt: new Date("2026-10-16T10:40:00.000Z"),
    updatedAt: new Date("2026-10-16T10:40:00.000Z")
  },
  {
    type: "testimonial",
    author: "Ing. Carlos Hernán Mora",
    role: "Líder Técnico de Software",
    company: "HuilaTech Solutions",
    quote: "La persistencia políglota es el estándar en proyectos serios. Ver que los aprendices del SENA Garzón configuran clústeres en Atlas y escriben consultas MQL optimizadas nos da confianza para contratarlos.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    verified: true,
    active: true,
    tags: ["testimonio", "empresa", "reclutamiento"],
    createdAt: new Date("2026-10-16T10:45:00.000Z"),
    updatedAt: new Date("2026-10-16T10:45:00.000Z")
  },

  // --- MÉTRICAS DE IMPACTO Y ESTADÍSTICAS ---
  {
    type: "stat",
    metric: "Aprendices Capacitados",
    value: 1250,
    prefix: "+",
    suffix: "",
    label: "Formación técnica de alto impacto en el Huila",
    order: 1,
    active: true,
    createdAt: new Date("2026-10-16T10:50:00.000Z"),
    updatedAt: new Date("2026-10-16T10:50:00.000Z")
  },
  {
    type: "stat",
    metric: "Disponibilidad del Clúster",
    value: 99.9,
    prefix: "",
    suffix: "%",
    label: "SLA de infraestructura Cloud en MongoDB Atlas M0",
    order: 2,
    active: true,
    createdAt: new Date("2026-10-16T10:55:00.000Z"),
    updatedAt: new Date("2026-10-16T10:55:00.000Z")
  }
];

const insertResult = db[COLL_NAME].insertMany(seedData);
print("   ✓ Documentos insertados exitosamente: " + Object.keys(insertResult.insertedIds).length);

// 6. Auditoría y Reporte Automático de Verificación
print("\n=============================================================================");
print("📊 [ADSO SENA] REPORTE DE ESTADO DEL CLÚSTER MONGODB ATLAS");
print("=============================================================================");

const totalDocs = db[COLL_NAME].countDocuments();
print("• Total de documentos en 'contents': " + totalDocs);

// Agrupación y conteo por tipo polimórfico
const breakdown = db[COLL_NAME].aggregate([
  { $group: { _id: "$type", cantidad: { $sum: 1 } } },
  { $sort: { cantidad: -1 } }
]).toArray();

print("• Distribución polimórfica:");
breakdown.forEach(item => {
  print("   - " + item._id.toUpperCase() + ": " + item.cantidad + " documentos");
});

// Verificación de índices creados
const indexes = db[COLL_NAME].getIndexes();
print("• Índices activos (" + indexes.length + "):");
indexes.forEach(idx => {
  print("   - " + idx.name + " ⟶ " + JSON.stringify(idx.key));
});

// Prueba de consulta rápida idéntica a la que hará el backend Express en la Sesión 10
const sampleHero = db[COLL_NAME].find(
  { type: "banner", active: true },
  { title: 1, priority: 1, _id: 0 }
).sort({ priority: 1 }).limit(1).toArray();

if (sampleHero.length > 0) {
  print("• Simulación Endpoint Landing Page:");
  print("   ✓ Banner Hero listo: \"" + sampleHero[0].title + "\"");
}

print("\n🎉 [ADSO SENA] ¡Aprovisionamiento NoSQL completado con éxito al 100%!");
print("   La base de datos '" + DB_NAME + "' está lista para ser consumida por Express en la Sesión 08 & 10.\n");
