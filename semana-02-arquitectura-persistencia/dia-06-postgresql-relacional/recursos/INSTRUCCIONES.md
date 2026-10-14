# Taller de Aula: PostgreSQL Relacional en Profundidad (Sesión 06)

**Centro Agroempresarial y Desarrollo Pecuario del Huila (SENA Garzón)**  
**Tecnólogo en Análisis y Desarrollo de Software (ADSO)**  
**Módulo:** Persistencia Relacional con PostgreSQL, Identidad y Tokens de Verificación  

---

## 🎯 Objetivo de la Sesión
Diseñar e implementar el modelo de base de datos relacional para el sistema de identidades, roles (`admin` / `user`) y confirmación de cuentas vía correo electrónico con **Resend**, aplicando identificadores criptográficos universales (**UUIDv4**), restricciones de dominio, llaves foráneas con borrado en cascada e índices de alto rendimiento.

---

## 📦 Contenido del Paquete

1. `plantilla_aprendiz.sql`: Script base estructurado con comentarios paso a paso para completar los 5 retos de laboratorio.
2. `INSTRUCCIONES.md`: Esta guía metodológica y rúbrica de sustentación.

---

## 🚀 Requisitos Previos

- Tener instalado y en ejecución **PostgreSQL 14+** (vía pgAdmin, DBeaver, CLI `psql` o una instancia Cloud en [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com)).
- Contar con una base de datos de trabajo creada (ej. `adso_polyglot_db` o `formacion_adso`).

---

## 📝 Los 5 Retos del Laboratorio (70 Minutos)

- **Reto 1 (DDL `users`):** Creación de la tabla de usuarios con `UUID PRIMARY KEY DEFAULT gen_random_uuid()`, validación de `email UNIQUE`, hash de contraseña, restricción `CHECK (role IN ('admin', 'user'))` y marcas de tiempo `TIMESTAMPTZ`.
- **Reto 2 (DDL `verification_tokens`):** Creación de la tabla de tokens temporales de verificación vinculada a `users(id)` mediante llave foránea estricta con `ON DELETE CASCADE`.
- **Reto 3 (Optimización con Índices):** Creación de índices `B-Tree` únicos para acelerar las búsquedas por email en el Login y por token durante la activación de cuenta.
- **Reto 4 (Transacciones ACID):** Inserción atómica con bloque `BEGIN ... COMMIT` simulando el registro de un nuevo usuario junto a la emisión de su token con expiración calculada a 24 horas (`NOW() + INTERVAL '24 hours'`).
- **Reto 5 (Consultas y Pruebas de Integridad):** Consulta analítica con `INNER JOIN` calculando las horas restantes del token y prueba de borrado en cascada.

---

## ⏱️ Rúbrica de Sustentación Individual (Bloque 3 · 40 Minutos)

| Criterio | Porcentaje | Indicador de Logro |
|---|---|---|
| **Estructura DDL y UUIDs** | 30% | Tablas creadas sin errores sintácticos con tipos de datos óptimos y `gen_random_uuid()`. |
| **Integridad y Restricciones** | 30% | Llave foránea funcionando con `ON DELETE CASCADE` y restricción de dominio para roles. |
| **Transacciones e Índices** | 20% | Bloque transaccional ejecutado exitosamente e índices verificados con `\d`. |
| **Modificación en Caliente** | 20% | Capacidad del aprendiz de aplicar un `ALTER TABLE` o consulta solicitada por el instructor en vivo sin IA. |
