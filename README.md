# Plataforma de Lecciones Técnicas · Desarrollo Web Full Stack con MERN

**Servicio Nacional de Aprendizaje (SENA)**  
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH - Garzón)**  
**Regional Huila**  
**Instructor ADSO:** Ing. Hector David Toledo Garcia ([hdtoledo.dev](https://www.hdtoledo.dev/))  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Ecosistema:** Formación Profesional Integral · Desarrollo Web Full Stack (MERN + SQL)  
**Portal en Vivo (GitHub Pages):** [https://hdtoledo.github.io/formacionadso/](https://hdtoledo.github.io/formacionadso/)

---

## 📌 1. Descripción del Proyecto

Esta plataforma web interactiva y modular ha sido desarrollada con **HTML5**, **Tailwind CSS** y **JavaScript Vanilla**, concebida específicamente como herramienta de apoyo pedagógico para instructores y aprendices del programa ADSO.

Su objetivo principal es formar y acelerar a los aprendices en el dominio de desarrollo de software Full Stack mediante:
- **Proyección optimizada en Video-beam** para ambientes de formación y salas de sistemas.
- **Live Coding paso a paso** guiado por el instructor (código desde cero, erradicando la dependencia pasiva de IA generativa).
- **Ejercitación práctica en aula** con casos de negocio reales.
- **Sustentación individual en caliente** con modificación de código en vivo y control de versiones con Git.

---

## 🎯 2. Alcance Universal de Formación

El esquema formativo está estandarizado para **todas las fichas y jornadas de ADSO** (Diurna, Nocturna, Mixta, Fines de semana):
- **Duración:** 8 Semanas intensivas.
- **Total de Sesiones:** 40 Sesiones estructuradas día a día.
- **Dinamismo Temporal:** Sin fechas de calendario rígidas; la interfaz toma dinámicamente la fecha actual del sistema para la sesión en desarrollo.

### ⏱️ Metodología de Aula en 3 Bloques

| Bloque | Denominación | Duración Estándar | Propósito Pedagógico |
|---|---|---|---|
| **Bloque 1** | **Teoría & Live Coding** | ~110 min | Explicación conceptual concisa + codificación en vivo por el instructor línea por línea. |
| **Bloque 2** | **Taller Práctico Asistido** | ~70 min | Reto de laboratorio en parejas o individual sobre el caso de negocio en el IDE/DBMS. |
| **Bloque 3** | **Evidencia & Sustentación** | ~40 min | Revisión en vivo puesto por puesto, modificación en caliente y registro en Git. |

---

## 🏛️ 3. Identidad Visual Institucional SENA

La plataforma implementa estrictamente las directrices del manual de imagen institucional y el estándar de diseño web **SIGAF365** del CADPH Garzón:

- **Verde SENA Principal:** `#39A900` (PANTONE 361 C)
- **Verde SENA Hover:** `#2D8200`
- **Azul SENA Institucional:** `#00324D`
- **Azul Oscuro Borde / Cintillo:** `#00263A`
- **Gris de Fondo:** `#F8FAFC` / `#FFFFFF`
- **Tipografía de Interfaz:** `Plus Jakarta Sans`, sans-serif
- **Tipografía de Código / Terminal:** `JetBrains Mono`, monospace
- **Logo Oficial:** Disponible en `assets/logo_green.png`

---

## 📂 4. Estructura del Repositorio

```text
formacionadso/
├── .gitignore                     # Filtro contra scripts basura, temporales y notas del instructor
├── .nojekyll                      # Deshabilita Jekyll para servir activos estáticos en GitHub Pages
├── 404.html                       # Página institucional de error con redirección automática
├── README.md                      # Documentación oficial del proyecto
├── planSesiones.md                # Matriz curricular de 8 semanas (40 sesiones, uso local)
├── index.html                     # Portal principal centrado con fecha dinámica y explorador semanal
├── assets/
│   ├── css/
│   │   ├── presenter.css          # Sistema visual de las lecciones: shell, transiciones, código, árboles y autoevaluación
│   │   └── portal.css             # Componentes del portal (menú, avance, recursos, animaciones de scroll)
│   ├── js/
│   │   ├── presenter.js           # Motor de lecciones: shell único, navegación, índice, temporizador y avance
│   │   └── portal.js              # Catálogo único de lecciones: menú, hero, estado, recursos y atajos del portal
│   ├── logo_green.png             # Logo oficial SENA verde
│   ├── logo_sena.png              # Variante institucional
│   └── logo_hd.png                # Marca de autoría técnica
├── referencia-docente/            # Repositorio de referencia del instructor (no visible a aprendices)
│   ├── index.html                 # Portal web privado del docente para proyectar código de referencia
│   ├── semana-01/
│   │   ├── dia-01-sistema-ventas.sql       # Script de referencia validado en MySQL 8 InnoDB
│   │   ├── dia-02-consultas-joins.sql      # Consultas analíticas y preguntas de sustentación
│   │   ├── dia-03-taller-es6-asincronia.js # Solución técnica validada en Node.js
│   │   ├── dia-04-servidor-express-base.js # Servidor API Express base con 6 retos resueltos
│   │   └── dia-05-catalogo-fetch-dom.html  # SPA Cliente en Vanilla JS con Fetch API y DOM
│   └── semana-02/
│       ├── dia-06-postgresql-usuarios.sql  # Esquema users + verification_tokens (validado en PostgreSQL)
│       └── dia-07-mongodb-catalogo.json    # Consultas MQL de referencia sobre la colección contents
├── semana-02-arquitectura-persistencia/
│   ├── dia-06-postgresql-relacional/      # Sesión 06: UUID, token_hash SHA-256, trigger, índices y ACID
│   ├── dia-07-mongodb-nosql/              # Sesión 07: Atlas, Compass, seed polimórfico (Extended JSON) y MQL
│   ├── dia-08-backend-express-arquitectura/
│   │   ├── index.html                     # Sesión 08: Express en capas y conexión dual PostgreSQL + MongoDB
│   │   └── recursos/server/               # Backend de referencia (config, controllers, routes, middlewares)
│   ├── dia-09-repositorio-usuarios-sqli/
│   │   ├── index.html                     # Sesión 09: UserRepository, inyección SQL y transacciones
│   │   └── recursos/                      # Migración 02, semillas, archivos nuevos del server y colección Bruno
│   └── dia-10-mongoose-crud-contenidos/
│       ├── index.html                     # Sesión 10: Mongoose con discriminators, CRUD e inyección NoSQL
│       └── recursos/                      # Archivos nuevos y modificados del server y colección bruno-catalogo
└── semana-01-fundamentos/
    ├── dia-01-bd-sql-ddl-dml/
    │   ├── index.html             # Diapositivas de proyección (Sesión 01: Modelo Relacional & SQL)
    │   └── recursos/
    │       └── plantilla_aprendiz.sql    # Plantilla starter para los aprendices en clase
    ├── dia-02-consultas-sql-joins/
    │   ├── index.html             # Diapositivas de proyección (Sesión 02: Consultas SQL & JOINs)
    │   └── recursos/
    │       └── plantilla_aprendiz.sql    # Datos sembrados y retos de laboratorio en aula
    ├── dia-03-javascript-es6-asincronia/
    │   ├── index.html             # Diapositivas de proyección (Sesión 03: JavaScript ES6+ & Asincronía)
    │   └── recursos/
    │       └── plantilla_aprendiz.js     # Taller starter de 5 retos progresivos
    ├── dia-04-http-express-servidor-base/
    │   ├── index.html             # Diapositivas de proyección (Sesión 04: Express & Bruno Client)
    │   └── recursos/
    │       ├── package.json              # Configuración de dependencias (Express) y scripts
    │       ├── plantilla_servidor.js     # Servidor base starter para aprendices
    │       ├── test_api.js               # Suite de 9 pruebas automatizadas para la API
    │       └── bruno-collection/         # Colección oficial de Bruno (.bru) para Git
    ├── dia-05-consumo-fetch-dom/
    │   ├── index.html             # Diapositivas de proyección (Sesión 05: Fetch API & DOM)
    │   └── recursos/
    │       ├── index.html                # Interfaz gráfica starter para aprendices
    │       └── app.js                    # Taller starter con 5 retos progresivos
    └── dia-extra-tailwindcss-ui-ux/
        ├── index.html             # Diapositivas de proyección (Sesión Extra: Tailwind CSS & UI/UX)
        ├── dia-extra-tailwindcss-taller.zip # Taller empaquetado para aprendices
        ├── recursos/              # Plantillas starter (Login, Register, Landing)
        └── soluciones/            # Soluciones de referencia docente completas
```

---

## ⌨️ 5. Controles y Atajos de Teclado (Proyección Videobeam)

**En las lecciones:**

| Tecla | Acción |
|---|---|
| `→` / `Espacio` / `Av Pág` | Siguiente diapositiva |
| `←` / `Re Pág` | Diapositiva anterior |
| `Inicio` / `Fin` | Primera / última diapositiva |
| `M` | Índice lateral con buscador (agrupado por bloque pedagógico) |
| `F` | Pantalla completa |
| `T` / `R` | Iniciar-pausar / reiniciar el temporizador (en el índice hay presets de 110′, 70′ y 40′ por bloque) |
| `?` | Ventana de ayuda con atajos |
| `Esc` | Cerrar índice o ayuda |

En celular o tableta se navega deslizando horizontalmente. Cada diapositiva tiene enlace propio (`#slide-N`) y el portal recuerda el avance de cada lección en el navegador (botón **Continuar**).

**En el portal:** `1`–`9`, `0` y `-` abren las lecciones en orden; `/` o `Ctrl + K` enfocan el buscador.

---

## 🛡️ 6. Política Pedagógica de Recursos y Evaluación de Aula

Para garantizar el aprendizaje significativo y erradicar la copia pasiva:
- **Vista de los Aprendices:** En el portal web y las diapositivas de proyección solo se publican y enlazan las **plantillas starter** (`plantilla_aprendiz.sql`, `plantilla_aprendiz.js`), guiando la ejercitación activa durante el Bloque 2.
- **Carpeta de Referencia Docente (`referencia-docente/`):** Aloja los scripts de referencia técnica del instructor por semana. El instructor valida las evidencias puesto por puesto mediante preguntas en caliente y pruebas de modificación en vivo antes de retroalimentar y compartir la referencia oficial.
- **Filtros `.gitignore`:** Bloquea automáticamente volcados locales, scripts temporales y notas privadas del instructor.

---

## 🌐 7. Despliegue en GitHub Pages

El sitio es estático (no necesita compilación) y se publica directamente desde la rama `master`:

1. En **Settings** > **Pages** > **Build and deployment** > **Source**, selecciona: **Deploy from a branch**.
2. En **Branch**, selecciona `master` y la carpeta `/ (root)`.
3. Haz clic en **Save**. Cada `git push` a `master` publica el sitio en 1-2 minutos en:
   ```text
   https://<tu-usuario>.github.io/<tu-repositorio>/
   ```

> No se usa un flujo propio de GitHub Actions: con la publicación desde la rama ya activa, un segundo despliegue en paralelo compite por el mismo entorno `github-pages` y puede fallar.

### Archivos clave para GitHub Pages:
- **`.nojekyll`:** Evita que el motor Jekyll ignore archivos o carpetas del proyecto.
- **`404.html`:** Maneja rutas inexistentes o módulos en construcción redirigiendo al portal con la identidad visual SENA.
- **Rutas Relativas:** Todos los enlaces, hojas de estilo, scripts e imágenes usan referencias relativas, garantizando que el sitio funcione tanto en la raíz de un dominio como en subdirectorios de GitHub Pages (`/nombre-repo/`).

---

## 💻 8. Ejecución en Servidor Local

1. **Clonar o abrir el directorio:**
   ```bash
   cd formacionadso
   ```
2. **Ejecutar servidor local:**
   - Puedes abrir directamente `index.html` en tu navegador.
   - O con Python:
     ```bash
     python -m http.server 8080
     ```
   - Abre tu navegador en: `http://localhost:8080`

---

## 📄 9. Licencia y Créditos

- **Institución:** Servicio Nacional de Aprendizaje (SENA) - Regional Huila.
- **Centro:** Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH Garzón).
- **Instructor ADSO & Dirección Técnica:** **Ing. Hector David Toledo Garcia** ([hdtoledo.dev](https://www.hdtoledo.dev/)).
- **Repositorio Oficial:** [github.com/hdtoledo/formacionadso](https://github.com/hdtoledo/formacionadso)
- **Portal Web en Producción:** [hdtoledo.github.io/formacionadso](https://hdtoledo.github.io/formacionadso/)
- **Uso:** Material de formación profesional integral bajo los lineamientos pedagógicos y tecnológicos del SENA.
