# SENA · ADSO 2026 | Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)
## Sesión 05: Consumo de APIs REST con Fetch API y Manipulación del DOM

¡Bienvenido al proyecto práctico modular de la Sesión 05! En este taller aprenderás a conectar una interfaz gráfica web moderna (desarrollada con **HTML5 + Tailwind CSS**) a un servidor backend en **Node.js/Express** utilizando la **Fetch API nativa** de JavaScript.

---

### 📂 Estructura de Archivos del Proyecto

```text
├── package.json                # 📦 Configuración de dependencias (Express) y scripts npm
├── app.js                      # ⚙️ SERVIDOR BACKEND: API REST Express con CORS en puerto 3000
├── cliente.js                  # 💻 CLIENTE FRONTEND: Lógica SPA con Fetch API y estado reactivo
├── index.html                  # 🎛️ HUB PRINCIPAL: Panel de control con acceso a cada plantilla
├── 01-status.html              # 🟢 GET /api/status (Health Check, Uptime y Latencia)
├── 02-catalogo.html            # 🟢 GET /api/productos?categoria=&q= (Filtros y Búsqueda en DOM)
├── 03-buscar-id.html           # 🔵 GET /api/productos/:id (Parámetro de ruta, 200 OK vs 404 Not Found)
├── 04-crear-producto.html      # 🟣 POST /api/productos (Formulario controlado, e.preventDefault y JSON)
├── 05-actualizar-stock.html    # 🟠 PATCH /api/productos/:id/stock (Actualización parcial de atributos)
├── 06-eliminar-producto.html   # 🔴 DELETE /api/productos/:id (Eliminación con diálogo de confirmación)
└── 07-crud-completo.html       # 🚀 SPA INTEGRAL: Catálogo reactivo completo en una sola vista
```

---

### 🚀 Instrucciones de Ejecución Paso a Paso

#### 1. Instalar Dependencias y Encender el Servidor Backend
Abre una terminal en esta carpeta (`recursos/`):
```bash
# 1. Instalar Express y dependencias
npm install

# 2. Iniciar el servidor Express en modo desarrollo (vigilancia automática)
npm start
# (O alternativamente: node --watch app.js)
```
El servidor mostrará en consola:
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
- En VS Code, haz clic derecho sobre `index.html` (Hub Principal) y selecciona **"Open with Live Server"**.
- El navegador se abrirá en `http://127.0.0.1:5500/index.html`.
- Verás el indicador verde: `● API Conectada (:3000)`.

#### 3. Probar Cada Endpoint en las Plantillas
Navega a través de los botones del Hub para probar cada método HTTP (`GET`, `POST`, `PATCH`, `DELETE`) de forma aislada, viendo la solicitud saliente y la respuesta en tiempo real.

---

### 💡 ¿Dónde se Escribe el Código de JavaScript? (Servidor vs Cliente)

1. **Servidor Backend (`app.js`):**
   - Ejecutado por **Node.js** en la terminal.
   - Define las rutas REST (`app.get`, `app.post`, `app.patch`, `app.delete`) y responde con JSON.
   - Cuenta con soporte de **CORS** para recibir peticiones desde el navegador.

2. **Cliente Frontend (`cliente.js` y plantillas `.html`):**
   - Ejecutado por el **Navegador Web**.
   - Usa `fetch('http://localhost:3000/api/...')` para consumir los endpoints.
   - Modifica el DOM reactivamente usando `document.getElementById()` y Template Literals (`...`).

---
**Instructor:** Ing. Hector David Toledo Garcia  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Regional Huila - CADPH Garzón**
