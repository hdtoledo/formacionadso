# SENA · ADSO 2026 | Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)
## Sesión 05: Consumo de APIs REST con Fetch API, Tailwind CSS y Manipulación del DOM

¡Bienvenido al taller práctico modular de la Sesión 05! En este taller aprenderás a conectar una interfaz gráfica moderna (construida con **HTML5 + Tailwind CSS**) a un servidor backend en **Node.js/Express** utilizando la **Fetch API nativa** de JavaScript.

---

### 📂 Estructura de Archivos del Taller

```text
recursos/
├── package.json                # 📦 Configuración del backend Express y scripts npm
├── app.js                      # ⚙️ SERVIDOR BACKEND: API REST Express con CORS en puerto 3000
├── cliente.js                  # 💻 CLIENTE FRONTEND: Lógica de la SPA integral (07-crud-completo)
├── index.html                  # 🎛️ HUB PRINCIPAL: Panel de control con acceso a cada plantilla
│
├── 📂 PLANTILLAS BASE DE AULA (Para construir en vivo durante la clase):
│   ├── 01-status.html          # 🟢 PUNTO 1: Health Check (GET /api/status)
│   ├── 02-catalogo.html        # 🟢 PUNTO 2: Catálogo y Filtros (GET /api/productos?categoria=&q=)
│   ├── 03-buscar-id.html       # 🔵 PUNTO 3: Búsqueda por ID (GET /api/productos/:id - 200 vs 404)
│   ├── 04-crear-producto.html  # 🟣 PUNTO 4: Registrar Producto (POST /api/productos - e.preventDefault)
│   ├── 05-actualizar-stock.html# 🟠 PUNTO 5: Actualizar Stock (PATCH /api/productos/:id/stock)
│   └── 06-eliminar-producto.html# 🔴 PUNTO 6: Eliminar Producto (DELETE /api/productos/:id)
│
├── 📂 soluciones/               # 💡 VERSIONES 100% RESUELTAS (Para referencia del instructor):
│   ├── 01-status.html
│   ├── 02-catalogo.html
│   ├── 03-buscar-id.html
│   ├── 04-crear-producto.html
│   ├── 05-actualizar-stock.html
│   ├── 06-eliminar-producto.html
│   └── 07-crud-completo.html
│
└── 07-crud-completo.html       # 🚀 SPA INTEGRAL: Catálogo reactivo completo en una sola vista
```

---

### 🚀 Instrucciones de Ejecución Paso a Paso

#### 1. Encender el Servidor Backend (Node.js + Express)
Abre una terminal en esta carpeta (`recursos/`):
```bash
# 1. Instalar dependencias del servidor (express y cors)
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
- En VS Code, haz clic derecho sobre `index.html` (Hub Principal) o sobre cualquiera de las plantillas base (`01-status.html` a `06-eliminar-producto.html`).
- Selecciona **"Open with Live Server"**.
- Se abrirá en tu navegador en `http://127.0.0.1:5500`.

---

### 🎨 Metodología Pedagógica: Dinámica de Aula Paso a Paso

Las plantillas base contienen la estructura limpia de HTML5, el CDN oficial de Tailwind CSS y áreas de trabajo delimitadas con comentarios:

1. **Paso 1: Maquetación HTML + Tailwind CSS**
   - El instructor proyecta la diapositiva correspondiente (ej. Diapositiva 10 para Punto 1).
   - Se explican las clases utilitarias de Tailwind:
     - Centrado y ancho: `max-w-xl mx-auto`
     - Tarjeta con elevación: `bg-white p-6 rounded-2xl shadow border border-slate-200`
     - Espaciado y cuadrícula: `space-y-3` o `grid grid-cols-2 gap-3`
     - Inputs con enfoque: `border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2`
     - Botones con estado hover: `bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl`
     - Contenedores de salida para el DOM con `id` identificable (ej. `id="contenedor-resultado"`).
   - El aprendiz pega o escribe el bloque HTML y recarga la página para ver cómo Tailwind da forma a la interfaz.

2. **Paso 2: Lógica JavaScript Fetch y Manipulación del DOM**
   - Se explica la lógica asíncrona en el bloque `<script>`:
     - **1. Capturar elementos:** `document.getElementById('...')`
     - **2. Petición HTTP:** `const res = await fetch('http://localhost:3000/api/...')`
     - **3. Validación de respuesta:** `if (!res.ok) ...` y status (`200`, `201`, `400`, `404`, `409`)
     - **4. Deserialización JSON:** `const data = await res.json()`
     - **5. Renderizado en el DOM:** `contenedor.innerHTML = ...` usando clases Tailwind condicionales
     - **6. Escucha de eventos:** `btn.addEventListener('click', ...)` o `form.addEventListener('submit', ...)` con `e.preventDefault()`.
   - El aprendiz copia o escribe el script, pulsa el botón o envía el formulario, y valida en vivo cómo se comunica con `app.js`.

---
**Instructor:** Ing. Hector David Toledo Garcia  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)**
