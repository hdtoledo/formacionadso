# 🎨 Taller Práctico de Aula: Tailwind CSS, UI/UX & Diseño Responsivo
## Evidencia de Desempeño y Producto en Clase (Sesión Extra - Semana 1)
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Centro:** Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón)  
**Ficha:** 2026 / 3293992 · **Instructor:** Ing. Héctor David Toledo García  

---

## 🎯 1. Objetivo del Taller
Construir tres interfaces web completas, modernas y 100% responsivas utilizando **HTML5 semántico**, el framework de utilidades **Tailwind CSS** y la librería de iconografía **Lucide Icons**, aplicando las reglas correctas de diseño de interfaces (UI), experiencia de usuario (UX), jerarquía visual y accesibilidad.

> **Nota Importante sobre la Evidencia:**  
> Para esta sesión adicional, **la evidencia obligatoria es lo realizado durante la clase**. Al finalizar la jornada, debes presentar las 3 interfaces terminadas y funcionales en tu navegador.

---

## 🚀 2. Puesta en Marcha en el Aula

1. Abre la carpeta del taller en **Visual Studio Code**.
2. Verifica que tengas instalada la extensión **Live Server**.
3. Haz clic derecho sobre `login.html`, `register.html` o `landing.html` y selecciona **"Open with Live Server"**.
4. ¡Listo! Puedes codificar y ver los cambios reflejados al instante en tu navegador.

---

## 📋 3. Especificación de los 3 Ejercicios a Desarrollar

### Ejercicio 1: Pantalla de Login (`login.html`)
* **Layout:** Tarjeta centrada horizontal y verticalmente en la pantalla con fondo degradado suave (`bg-gradient-to-br`).
* **Elementos Clave:**
  * Logotipo o icono institucional dentro de un contenedor estilizado (`rounded-2xl`, sombras y gradiente).
  * Título claro (`text-2xl font-extrabold`) y subtítulo de orientación al usuario.
  * Input de correo con icono integrado en el lateral izquierdo (`pl-10`).
  * Input de contraseña con icono de candado y botón para **mostrar/ocultar contraseña** interactivo.
  * Checkbox estilizado para "Recordar sesión por 30 días" y enlace "¿Olvidaste tu clave?".
  * Botón de envío primario con color de marca (`bg-sena-green hover:bg-sena-green-dark`), sombras de elevación y micro-interacción al hacer hover.
  * Botón secundario para acceso con cuenta de Google (SSO) y enlace hacia el registro.

### Ejercicio 2: Pantalla de Registro (`register.html`)
* **Layout Responsivo:** Tarjeta ancha adaptativa. En pantallas móviles una sola columna; a partir de `sm:` se divide en **2 columnas fluidas** con `grid grid-cols-1 sm:grid-cols-2 gap-4`.
* **Elementos Clave:**
  * Campos para: Nombres, Apellidos, Tipo de Documento (`select`), Número de Documento, Correo y Teléfono.
  * Medidor visual de fortaleza de contraseña con 3 barras que cambian de color (rojo/débil, amarillo/medio, verde/fuerte) según la longitud ingresada.
  * Campo de confirmación de contraseña.
  * Checkbox obligatorio de aceptación del Reglamento del Aprendiz SENA.
  * Botón de confirmación con estado de carga animado (`animate-spin`) y feedback de éxito.

### Ejercicio 3: Landing Page Moderna (`landing.html`)
* **Layout:** Página completa con estructura semántica (`header`, `main`, `section`, `footer`).
* **Elementos Clave:**
  * **Navbar Superior:** Fija (`sticky top-0 z-50`) con efecto de vidrio esmerilado (`backdrop-blur-md bg-white/90`), logotipo, enlaces de navegación y botones de login/registro. Menú móvil colapsable con hamburguesa.
  * **Hero Section:** Badge animado de convocatoria (`animate-ping`), título con tamaño escalado (`text-4xl sm:text-6xl font-black`), texto introductorio, botones CTA con animaciones y tarjeta representativa con código estilizado.
  * **Grid de Pilares:** 3 columnas (`grid grid-cols-1 md:grid-cols-3 gap-6`) con tarjetas que resaltan con bordes de colores al hacer `:hover` e iconos temáticos (SQL, Express, Tailwind).
  * **Sección de Métricas:** Fondo oscuro (`bg-sena-navy`), números en tipografía monoespaciada grande (`text-4xl sm:text-5xl font-mono text-emerald-400`).
  * **Banner CTA:** Sección de llamada a la acción con gradiente atractivo y botones de conversión.
  * **Footer:** 4 columnas con enlaces, datos institucionales y copyright.

---

## 🏆 4. Criterios de Evaluación Formativa en Aula (100%)

| Criterio Observable | Evidencia en el Código | Ponderación |
|---------------------|------------------------|:-----------:|
| **1. Maquetación del Login** | Tarjeta centrada, inputs con iconos, estados de enfoque (`focus:ring`), toggle de clave y feedback visual. | **30%** |
| **2. Maquetación del Registro** | Grid responsivo de 2 columnas, medidor de clave, selectores de documento y checkbox de términos. | **30%** |
| **3. Landing Page Completa** | Navbar fixed con blur, Hero impactante, Grid de 3 columnas, sección de métricas y footer semántico. | **40%** |
| **TOTAL** | **Calificación de la Sesión Extra de Aula** | **100%** |

---

## 💡 5. Reglas de Oro de UI/UX a Aplicar
1. **Regla de los 4px:** Todos los márgenes, paddings y gaps deben usar múltiplos de 4 (`p-2`=8px, `p-4`=16px, `p-6`=24px, `p-8`=32px).
2. **Jerarquía Visual:** Nunca dejes que dos textos compitan por el mismo peso. Si el título es `font-black text-2xl`, el subtítulo debe ser `font-normal text-slate-500 text-xs`.
3. **Contraste de Accesibilidad:** Los textos sobre fondo blanco deben tener suficiente oscuridad (`text-slate-800` o `text-slate-900`) para garantizar la lectura de cualquier usuario.
4. **Estados Interactivos Obligatorios:** Todo botón o enlace debe reaccionar al cursor con `hover:`, `active:` y transiciones suaves (`transition-all duration-200`).

---
*Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón) · Regional Huila*
