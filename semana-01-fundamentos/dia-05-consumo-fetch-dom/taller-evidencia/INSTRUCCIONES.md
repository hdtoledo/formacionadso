# 🌾 Taller Práctico Evaluativo: AgroHuila S.A.S.
## Evidencia de Aprendizaje: Consumo con Fetch API & Manipulación del DOM
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Centro:** Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)  
**Ficha:** 2026 / 3293992 · **Sesión:** Semana 01 - Día 05  
**Instructor:** Ing. Héctor David Toledo García  

---

## 🎯 1. Contexto del Caso Empresarial
La empresa ficticia **AgroHuila S.A.S.**, dedicada a la comercialización mayorista y minorista de insumos agrícolas, herramientas de caficultura y productos veterinarios en el sur del Huila, necesita construir la interfaz web cliente (Frontend) para interactuar con su API REST construida en Express.

El equipo de backend ya te ha suministrado el servidor operativo (`server.js`) con las reglas de negocio y los datos en memoria. Tu misión como desarrollador frontend es **programar la lógica JavaScript con `fetch()` y manipulación del DOM** en cada una de las plantillas modulares maquetadas con Tailwind CSS.

---

## ⚙️ 2. Preparación del Entorno de Trabajo

### Paso 1: Encender el Servidor Backend (Express)
1. Abre una terminal de comandos en esta carpeta (`taller-evidencia`).
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor con recarga automática:
   ```bash
   npm run dev
   # o alternativamente:
   npm start
   ```
4. Debe imprimir en la terminal:
   ```text
   🌾 SERVIDOR AGROHUILA S.A.S. ACTIVO EN: http://localhost:3000
   ```

### Paso 2: Ejecutar el Frontend con Live Server
1. Abre VS Code en esta misma carpeta.
2. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.
3. Se abrirá en tu navegador en `http://127.0.0.1:5500/index.html`.
4. El indicador superior cambiará a verde: `● Servidor Conectado (AgroHuila S.A.S.)`.

---

## 📡 3. Especificación de Endpoints del Servidor

| Verbo | Endpoint | Descripción | Status Esperados |
|-------|----------|-------------|-------------------|
| `GET` | `/api/status` | Diagnóstico de salud y uptime de AgroHuila. | `200 OK` |
| `GET` | `/api/insumos` | Catálogo de insumos. Admite `?categoria=` y `?q=`. | `200 OK` |
| `GET` | `/api/insumos/:id` | Búsqueda de insumo por ID numérico. | `200 OK` o `404 Not Found` |
| `POST` | `/api/insumos` | Registrar insumo `{ sku, nombre, categoria, precio, stock, descripcion }`. | `201 Created` o `409 Conflict` (SKU duplicado) |
| `PATCH` | `/api/insumos/:id/stock` | Modificación parcial de existencias `{ nuevoStock }`. | `200 OK` o `404 Not Found` |
| `DELETE` | `/api/insumos/:id` | Baja definitiva de un insumo del catálogo. | `200 OK` o `404 Not Found` |

---

## 📋 4. Retos a Desarrollar (Las 6 Plantillas)

Abre cada archivo `.html` y completa la sección `<script>` siguiendo los comentarios `PASO 1`, `PASO 2`...:

1. **`01-status.html` (Diagnóstico):**
   - Consume `GET /api/status`.
   - Mide la latencia con `performance.now()`.
   - Renderiza el estado operativo, nombre y uptime en el contenedor `#resultado-servidor`.

2. **`02-catalogo.html` (Catálogo Reactivo & Filtros):**
   - Consume `GET /api/insumos` con `URLSearchParams`.
   - Filtra por categorías (FERTILIZANTES, MAQUINARIA, HERRAMIENTAS, BIOINSUMOS, VETERINARIA).
   - Inyecta las tarjetas con Template Literals. Si el stock es 0, añade el badge de agotado.

3. **`03-buscar-id.html` (Consulta por ID):**
   - Lee el ID del input numérico y ejecuta `GET /api/insumos/:id`.
   - Si `res.status === 200`, renderiza la ficha técnica detallada.
   - Si `res.status === 404`, muestra una caja de advertencia sin recargar la página.

4. **`04-crear-producto.html` (Registro con Formulario):**
   - Captura el evento `submit` con `e.preventDefault()`.
   - Envía el body serializado con `JSON.stringify()` y la cabecera `'Content-Type': 'application/json'`.
   - Maneja el status `201 Created` y limpia los campos con `form.reset()`.
   - Si el SKU ya existe, captura el error `409 Conflict` y notifica al usuario.

5. **`05-actualizar-stock.html` (Actualización Parcial):**
   - Envía una petición `PATCH` a `/api/insumos/:id/stock` enviando `{ nuevoStock }`.
   - Muestra en pantalla el stock anterior vs. el nuevo recibido de la API.

6. **`06-eliminar-producto.html` (Baja de Insumo):**
   - Solicita confirmación con `window.confirm()`.
   - Envía la petición `DELETE /api/insumos/:id`.
   - Muestra el mensaje de confirmación devuelto por la API.

---

## 🏆 5. Criterios de Evaluación y Calificación (Rúbrica al 100%)

| Criterio Observable | Evidencia Técnica Esperada | Peso |
|---------------------|----------------------------|:----:|
| **1. Consumo GET y validación** | `fetch()`, validación `if (!res.ok)` y lectura de datos JSON en `01` y `02`. | **20%** |
| **2. Manipulación Reactiva del DOM** | Template Literals, renderizado de grillas y badges condicionales de stock. | **20%** |
| **3. Formulario POST con preventDefault** | Interceptación de formulario, headers JSON y manejo de 201 Created vs 409 Conflict. | **25%** |
| **4. Peticiones PATCH y DELETE** | Modificación parcial de inventario y borrado destructivo con confirmación previa. | **20%** |
| **5. UX Defensiva y Sustentación Live Mod** | Notificaciones flotantes / alertas de error y aprobación de la modificación en caliente en aula. | **15%** |
| **TOTAL** | **Calificación del Taller Práctico** | **100%** |

---

## 🚀 6. Sustentación Individual ("Live Mod" en Videobeam)
Para verificar la autoría de tu código, el instructor te asignará en caliente una modificación en vivo (3 a 5 minutos) sobre tu solución:
- **LM 1:** Si el stock es 0, pinta el borde de la tarjeta en rojo grueso y deshabilita el botón.
- **LM 2:** Agrega un filtro por rango de precio (ej. solo insumos menores a $50.000 COP).
- **LM 3:** En el formulario POST, valida que el nombre tenga al menos 6 caracteres antes de disparar `fetch`.
- **LM 4:** Agrega un botón `-1 Stock` (PATCH) que descuente inventario sin permitir números negativos.
- **LM 5:** Abre Chrome DevTools (pestaña Network), simula un error 409 por SKU duplicado y explica la respuesta del servidor.
- **LM 6:** Agrega un botón para ordenar los insumos de mayor a menor precio con `Array.prototype.sort()`.

---
*Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH) · Regional Huila*
