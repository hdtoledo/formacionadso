# SENA · ADSO 2026 | Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)
## Sesión 05: Consumo de APIs REST con Fetch API, Tailwind CSS y Manipulación del DOM

¡Bienvenido al taller práctico modular de la Sesión 05! En este taller aprenderás a conectar una interfaz gráfica moderna (construida con **HTML5 + Tailwind CSS**) a un servidor backend en **Node.js/Express** utilizando la **Fetch API nativa** de JavaScript.

---

### 📂 Estructura de Archivos del Taller

```text
├── package.json                # 📦 Configuración de dependencias (Express) y scripts npm
├── app.js                      # ⚙️ SERVIDOR BACKEND: API REST Express con CORS en puerto 3000
├── cliente.js                  # 💻 CLIENTE FRONTEND: Lógica de la SPA integral (07-crud-completo)
├── index.html                  # 🎛️ HUB PRINCIPAL: Panel de control con acceso a cada plantilla
├── 01-status.html              # 🟢 PUNTO 1: Health Check (GET /api/status)
├── 02-catalogo.html            # 🟢 PUNTO 2: Catálogo con Filtros Query (GET /api/productos?categoria=&q=)
├── 03-buscar-id.html           # 🔵 PUNTO 3: Búsqueda por ID (GET /api/productos/:id - 200 vs 404)
├── 04-crear-producto.html      # 🟣 PUNTO 4: Registrar Producto (POST /api/productos - e.preventDefault)
├── 05-actualizar-stock.html    # 🟠 PUNTO 5: Actualizar Stock (PATCH /api/productos/:id/stock)
├── 06-eliminar-producto.html   # 🔴 PUNTO 6: Eliminar Producto (DELETE /api/productos/:id con confirmación)
└── 07-crud-completo.html       # 🚀 SPA INTEGRAL: Catálogo reactivo completo en una sola vista
```

---

### 🚀 Instrucciones de Ejecución Paso a Paso

#### 1. Encender el Servidor Backend (Node.js + Express)
Abre una terminal en esta carpeta (`recursos/`):
```bash
# 1. Instalar dependencias del servidor
npm install

# 2. Iniciar el servidor Express en modo desarrollo con recarga automática
npm start
# (O alternativamente: node --watch app.js)
```

El servidor imprimirá en consola:
```text
======================================================
🚀 Servidor Express ADSO activo en: http://localhost:3000
📡 Endpoints listos para consumo con Fetch API
   - GET    http://localhost:3000/api/status
   - GET    http://localhost:3000/api/productos
   - GET    http://localhost:3000/api/productos/:id
   - POST   http://localhost:3000/api/productos
   - PATCH  http://localhost:3000/api/productos/:id/stock
   - DELETE http://localhost:3000/api/productos/:id
======================================================
```

#### 2. Abrir el Cliente Web (Frontend con Live Server)
- En VS Code, haz clic derecho sobre `index.html` (Hub Principal) o sobre cualquiera de las plantillas (`01-status.html` a `06-eliminar-producto.html`).
- Selecciona **"Open with Live Server"**.
- Se abrirá en tu navegador en `http://127.0.0.1:5500`.

---

### 🎨 Metodología Pedagógica: ¿Cómo se Estructuran las Plantillas?

Cada plantilla está diseñada bajo el principio de **"Menos es más"**, con un código limpio y legible de ~80 a 110 líneas:

1. **Estructura HTML con Tailwind CSS:**
   - Contenedor centrado: `max-w-xl mx-auto` (o `max-w-4xl` para el catálogo).
   - Tarjetas limpias: `bg-white p-6 rounded-2xl shadow border border-slate-200`.
   - Formularios y espaciado: `space-y-3` o `grid grid-cols-2 gap-3`.
   - Inputs estilizados: `border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2`.
   - Botones con estado hover: `bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl`.
   - Contenedor de salida en el DOM con `id` identificable (ej. `id="contenedor-resultado"`).

2. **JavaScript Paso a Paso:**
   - **PASO 1:** Captura de elementos por su ID (`document.getElementById`).
   - **PASO 2:** Event listeners (`click` o `submit` con `e.preventDefault()`).
   - **PASO 3:** Petición con `fetch()` hacia `http://localhost:3000/api/...` (`app.js`).
   - **PASO 4:** Validación defensiva (`res.ok`, status `200`, `201`, `400`, `404`, `409`).
   - **PASO 5:** Inyección dinámica de HTML en el DOM (`innerHTML`) usando clases Tailwind de alerta o ficha.

---
**Instructor:** Ing. Hector David Toledo Garcia  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)**
