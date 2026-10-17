# Guía de Montaje en Aula · Sesión 07: Persistencia NoSQL con MongoDB Atlas & Compass
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila**  
**Programa:** Análisis y Desarrollo de Software (ADSO) — Nivelación Técnica

---

## 🎯 Objetivo de la Sesión
Aprovisionar la persistencia NoSQL documental para los contenidos dinámicos y flexibles de la Landing Page del proyecto formativo, integrando **MongoDB Atlas** en la nube con **MongoDB Compass** en el entorno local, y versionando el proceso en el **repositorio personal de GitHub** mediante 4 commits atómicos.

---

## 🏗️ 1. Estructura en su Repositorio Personal Git

Dentro de su repositorio local `mi-proyecto-adso/`, cree el subárbol NoSQL:

```bash
# 1. Crear carpeta de persistencia NoSQL
mkdir -p database/nosql

# 2. Crear archivo de semillas de contenidos
touch database/nosql/01_content_seed.json
```

Copie la colección de documentos polimórficos (`01_content_seed.json`) suministrada en el aula.

---

## ☁️ 2. Aprovisionamiento en MongoDB Atlas (Paso a Paso)

1. **Registro / Inicio de Sesión:** Ingrese a [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Crear Clúster Gratuito:**
   - Seleccione **M0 Free Tier** (512 MB de almacenamiento, compartido, 100% gratuito).
   - Proveedor: **AWS**. Región: **us-east-1** (N. Virginia) o más cercana.
   - Nombre del Clúster: `Cluster0` o `adso-cluster`.
3. **Seguridad 1 · Database Access (Credenciales):**
   - Vaya a **Security > Database Access**.
   - Clic en **Add New Database User**.
   - Método de autenticación: **Password**.
   - Username: `adso_user`.
   - Autogenerar o asignar una contraseña segura (e.g., `Secret2026`).
   - Privilegios: `Built-in Role > Read and write to any database`.
4. **Seguridad 2 · Network Access (IP Whitelist):**
   - Vaya a **Security > Network Access**.
   - Clic en **Add IP Address**.
   - Para desarrollo en el aula SENA: clic en **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. **Obtener Connection String SRV:**
   - En **Database Deployments**, clic en el botón **Connect**.
   - Seleccione **Compass**.
   - Copie la URI generada (reemplazando `<password>` por su contraseña real):
     ```text
     mongodb+srv://adso_user:Secret2026@cluster0.abcde.mongodb.net/adso_polyglot_db?retryWrites=true&w=majority
     ```

---

## 🧭 3. Operación en MongoDB Compass

1. Abra **MongoDB Compass** en su equipo.
2. Pegue la URI SRV en la barra de conexión y presione **Connect**.
3. Clic en **Create Database**:
   - Database Name: `adso_polyglot_db`
   - Collection Name: `contents`
4. Clic en **Add Data > Import JSON or CSV File**.
5. Seleccione su archivo `database/nosql/01_content_seed.json`.

---

## 🔍 4. Retos de Consultas MQL (MongoDB Query Language)

Ejecute en la barra de filtro de Compass las siguientes consultas:

```javascript
// Reto 1: Filtrar todos los servicios activos
{ type: "service", active: true }

// Reto 2: Filtrar servicios de software o agroindustria
{ type: "service", category: { $in: ["software", "agroindustria"] } }

// Reto 3: Servicios con más de 400 visitas
{ type: "service", views: { $gt: 400 } }

// Reto 4: Banners activos ordenados por prioridad
Filter: { type: "banner", active: true }
Sort: { priority: 1 }

// Reto 5: Testimonios con calificación de 5 estrellas
{ type: "testimonial", rating: { $gte: 5 } }
```

---

## 📦 5. Los 4 Commits Canónicos en GitHub Personal

Ejecute cada hito y confirme con la convención **Conventional Commits v1.0.0**:

```bash
# Hito 1: Semillas BSON
git add database/nosql/01_content_seed.json
git commit -m "feat(nosql): estructura database/nosql y seed de contenidos"

# Hito 2: Configuración Atlas (Notas o doc de configuración en README)
git commit -m "config(atlas): cluster m0 atlas y whitelist de red"

# Hito 3: Base de datos y colección creada
git commit -m "feat(compass): creacion de adso_polyglot_db y coleccion contents"

# Hito 4: Pruebas MQL y push a GitHub
git commit -m "test(mql): validacion de consultas filtradas y esquema polimorfico"
git push -u origin main
```

---

## 🛡️ 6. Sustentación Individual (Live Mod)
El instructor solicitará aleatoriamente una de las siguientes modificaciones en vivo sin IA:
1. Insertar un documento de tipo `"announcement"` con fecha de caducidad.
2. Construir una consulta MQL que filtre por tags y proyecte únicamente los campos `title` y `category`.
3. Explicar técnicamente por qué este catálogo dinámico no causaría bloqueos de tabla `ALTER TABLE` a diferencia de PostgreSQL.
