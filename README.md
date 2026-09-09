# Plataforma de Lecciones Técnicas y Nivelación ADSO

**Servicio Nacional de Aprendizaje (SENA)**  
**Centro Agroempresarial y Desarrollo Pecuario del Huila (CADPH - Garzón)**  
**Regional Huila**  
**Instructor ADSO:** Ing. Hector David Toledo Garcia ([hdtoledo.dev](https://www.hdtoledo.dev/))  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)  
**Ecosistema:** Formación Profesional Integral · Nivelación Full Stack (MERN + SQL)  
**Portal en Vivo (GitHub Pages):** [https://hdtoledo.github.io/formacionadso/](https://hdtoledo.github.io/formacionadso/)

---

## 📌 1. Descripción del Proyecto

Esta plataforma web interactiva y modular ha sido desarrollada con **HTML5**, **Tailwind CSS** y **JavaScript Vanilla**, concebida específicamente como herramienta de apoyo pedagógico para instructores y aprendices del programa ADSO.

Su objetivo principal es nivelar y acelerar a los aprendices en el dominio de desarrollo de software Full Stack mediante:
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
NivelacionADSO/
├── .github/
│   └── workflows/
│       └── deploy.yml             # Automatización CI/CD para GitHub Pages
├── .gitignore                     # Filtro contra scripts basura, temporales y notas del instructor
├── .nojekyll                      # Deshabilita Jekyll para servir activos estáticos en GitHub Pages
├── 404.html                       # Página institucional de error con redirección automática
├── README.md                      # Documentación oficial del proyecto
├── planSesiones.md                # Matriz curricular de 8 semanas (40 sesiones, uso local)
├── index.html                     # Portal principal centrado con fecha dinámica y explorador semanal
├── assets/
│   ├── css/
│   │   └── presenter.css          # Estilos institucionales, animaciones y soporte videobeam
│   ├── js/
│   │   └── presenter.js           # Motor de diapositivas, temporizador con audio y atajos
│   ├── logo_green.png             # Logo oficial SENA verde
│   ├── logo_sena.png              # Variante institucional
│   └── logo_hd.png                # Marca de autoría técnica
└── semana-01-fundamentos/
    ├── dia-01-bd-sql-ddl-dml/
    │   ├── index.html             # Diapositivas de proyección (Sesión 01: Modelo Relacional & SQL)
    │   └── recursos/
    │       ├── plantilla_aprendiz.sql    # Plantilla starter para los aprendices en clase
    │       └── solucion_sistema_ventas.sql # Solución maestra probada en MySQL 8 InnoDB
    └── dia-02-consultas-sql-joins/
        ├── index.html             # Diapositivas de proyección (Sesión 02: Consultas SQL & JOINs)
        └── recursos/
            ├── plantilla_aprendiz.sql    # Datos sembrados y retos de laboratorio en aula
            └── solucion_consultas_joins.sql # Solucionario analítico y preguntas en caliente
```

---

## ⌨️ 5. Controles y Atajos de Teclado (Proyección Videobeam)

| Tecla | Acción |
|---|---|
| `Espacio` / `→` / `↓` | Avanzar a la siguiente diapositiva |
| `←` / `↑` | Retroceder a la diapositiva anterior |
| `F` | Alternar modo Pantalla Completa (*Full Screen*) |
| `T` | Iniciar / Pausar el temporizador del bloque en curso |
| `R` | Reiniciar el temporizador al tiempo original |
| `M` | Desplegar el menú selector de diapositivas |
| `?` | Abrir la ventana de ayuda con atajos |

---

## 🛡️ 6. Política de Scripts y Control de Calidad (`.gitignore`)

Para mantener limpio y seguro el repositorio pedagógico:
- **Solo se suben scripts oficiales aprobados** dentro de las carpetas de recursos designadas (`semana-XX/dia-YY/recursos/*.sql`).
- El archivo `.gitignore` bloquea automáticamente scripts temporales (`test_*.sql`, `temp.sql`, `prueba.sql`, `dump.sql`), archivos `.log`, volcados locales de bases de datos (`*.dump`, `*.sqlite`), la planeación interna (`planSesiones.md`) y archivos generados por editores o sistemas operativos.

---

## 🌐 7. Despliegue en GitHub Pages

El proyecto está 100% optimizado y preparado para desplegarse de manera inmediata y gratuita en **GitHub Pages**:

### Opción A: Automatización con GitHub Actions (Recomendada)
El repositorio ya incluye el flujo de trabajo en `.github/workflows/deploy.yml`:
1. En tu repositorio de GitHub, ve a **Settings** (Configuración) > **Pages**.
2. En la sección **Build and deployment** > **Source**, selecciona: **GitHub Actions**.
3. Cada vez que realices `git push` a la rama `master` (o `main`), el sitio se compilará y desplegará automáticamente en:
   ```text
   https://<tu-usuario>.github.io/<tu-repositorio>/
   ```

### Opción B: Despliegue directo desde la Rama (Branch)
1. En **Settings** > **Pages** > **Build and deployment** > **Source**, selecciona: **Deploy from a branch**.
2. En **Branch**, selecciona `master` (o `main`) y la carpeta `/ (root)`.
3. Haz clic en **Save**. En 1-2 minutos tu sitio estará en línea.

### Archivos clave para GitHub Pages:
- **`.nojekyll`:** Evita que el motor Jekyll ignore archivos o carpetas del proyecto.
- **`404.html`:** Maneja rutas inexistentes o módulos en construcción redirigiendo al portal con la identidad visual SENA.
- **Rutas Relativas:** Todos los enlaces, hojas de estilo, scripts e imágenes usan referencias relativas, garantizando que el sitio funcione tanto en la raíz de un dominio como en subdirectorios de GitHub Pages (`/nombre-repo/`).

---

## 💻 8. Ejecución en Servidor Local

1. **Clonar o abrir el directorio:**
   ```bash
   cd NivelacionADSO
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
