# Sesión Extra · Git & GitHub en Equipos Reales (2 a 4 personas)

**SENA Regional Huila · CADPH Garzón · Tecnólogo ADSO**
**Objetivo:** organizar un proyecto colaborativo con el estándar de la industria: roles claros, ramas (`main`, `develop`, `feat/*`, `fix/*`), protección de ramas, Pull Requests con Code Review, merges limpios y resolución de conflictos sin perder código.

---

## 1. Requisitos previos

1. **Git instalado** y verificado en PowerShell:
   ```powershell
   git --version
   ```
   Salida esperada: `git version 2.4x.x.windows.1` (o superior).
2. **Cuenta activa en GitHub** para cada integrante del equipo (con correo institucional o personal verificado).
3. **Identidad configurada en su equipo local** (una sola vez por computador):
   ```powershell
   git config --global user.name "Nombre Apellido"
   git config --global user.email "su-correo@ejemplo.com"
   git config --global init.defaultBranch main
   ```
   Verifique que quedó guardada:
   ```powershell
   git config --global --list
   ```

---

## 2. ¿Quién lidera el proyecto? Roles para equipos de 2 a 4 personas

En la industria **no existe un "dueño que programa todo"**, pero **sí existe un responsable del repositorio** para evitar que `main` se rompa:

| Rol | Responsabilidad principal | Lo que NO hace |
|---|---|---|
| **Tech Lead / Maintainer** (1 persona, se puede rotar por sprint) | Crea el repo, agrega colaboradores, configura protección de `main` y `develop`, revisa PRs, aprueba merges y coordina la integración. | No sube código ajeno por WhatsApp, no trabaja directo en `main` y no aprueba sus propios PRs. |
| **Developer** (1 a 3 personas) | Crea su rama `feat/...` desde `develop`, hace commits atómicos, abre PR con evidencia, revisa PRs de compañeros y mantiene su rama al día. | No hace `git push origin main`, no usa `--force` en ramas compartidas ni sube `.env`. |

### Regla de los 4 ojos (revisión cruzada según tamaño del equipo)
- **Equipo de 2 personas (A = Tech Lead, B = Dev):** B revisa los PRs de A, y A revisa los PRs de B. Nadie se aprueba solo.
- **Equipo de 3 personas (A = Tech Lead, B = Backend, C = Frontend):** B → revisa A · C → revisa B · A → revisa C.
- **Equipo de 4 personas (A = Tech Lead, B = Backend, C = Frontend, D = Datos/QA):** cada PR requiere al menos 1 aprobación de otro integrante antes de hacer *Squash and merge*.

---

## 3. Estrategia de ramas y convención de nombres

Usamos **Git Flow simplificado** (el estándar más práctico para equipos ADSO de 2 a 4 personas):

| Rama | Propósito | ¿Se puede hacer `push` directo? |
|---|---|---|
| `main` | Versión estable lista para presentar o desplegar a producción. | **NO** (protegida; solo recibe PR desde `develop` o `hotfix/*`). |
| `develop` | Rama de integración donde se unen las funcionalidades probadas del equipo. | **NO** (protegida; solo recibe PR aprobados desde `feat/*` o `fix/*`). |
| `feat/<modulo-tarea>` | Nueva funcionalidad (ej. `feat/auth-login`, `feat/catalogo-filtros`). | Sí (es su rama de trabajo). Se borra tras el merge. |
| `fix/<problema>` | Corrección de un fallo encontrado en `develop` (ej. `fix/validacion-precio`). | Sí. Se borra tras el merge. |
| `hotfix/<urgente>` | Arreglo crítico directo sobre `main` (luego se sincroniza con `develop`). | Sí, vía PR urgente. |

### Convención de commits (Conventional Commits)
Formato: `tipo(alcance): descripcion corta en imperativo`
- `feat(auth): agregar validacion de correo en registro`
- `fix(catalogo): corregir filtro por categoria vacia`
- `docs(readme): documentar pasos de instalacion en windows`
- `chore(git): agregar plantilla de pull request y gitignore`

Evite mensajes inútiles como `"cambios"`, `"final"`, `"ahora si funciona"` o `"asdf"`.

---

## 4. Laboratorio paso a paso en equipo (PowerShell + GitHub)

Cada equipo realizará esta práctica completa con un repositorio real llamado `equipo-XX-git-lab` (reemplace `XX` por el número de su grupo).

### Paso 1 · Tech Lead: crear el repositorio y la rama `develop`

1. En GitHub: clic en **+** → **New repository**.
   - *Repository name:* `equipo-XX-git-lab`
   - *Visibility:* Public (para que el instructor pueda revisarlo)
   - Marque **Add a README file** y en *.gitignore template* elija **Node**.
   - Clic en **Create repository**.
2. Clone el repositorio en su equipo (PowerShell):
   ```powershell
   git clone https://github.com/<usuario-lead>/equipo-XX-git-lab.git
   cd equipo-XX-git-lab
   ```
3. Copie los archivos base (`.gitignore`, `.github/pull_request_template.md`), agregue la sección `## Equipo` al final de `README.md`, haga el commit base en `main` y luego cree `develop` (**antes** de activar la protección de ramas):
   ```powershell
   New-Item -ItemType Directory -Force .github
   # Copie .gitignore y .github/pull_request_template.md en el repositorio
   Add-Content README.md "`n## Equipo`n"
   git add .gitignore .github/pull_request_template.md README.md
   git commit -m "chore(repo): agregar gitignore, plantilla pr y seccion equipo"
   git push origin main

   git switch -c develop
   git push -u origin develop
   ```
   **Verificación:** en GitHub, `main` ya contiene `.gitignore`, `.github/pull_request_template.md` y la sección `## Equipo`, y el selector de ramas muestra `main` y `develop`.

### Paso 2 · Tech Lead: agregar colaboradores y proteger ramas

1. En GitHub: **Settings → Collaborators → Add people** → agregue el usuario de GitHub de cada integrante (cada compañero debe aceptar la invitación en su correo o en notificaciones de GitHub).
2. En **Settings → Branches → Add branch protection rule** (o **Rules → Rulesets**):
   - *Branch name pattern:* `main`
   - Active **Require a pull request before merging** → **Require approvals (1)**.
   - Active **Do not allow bypassing the above settings** (así ni el Tech Lead puede dañar `main` por accidente).
   - Repita la regla para `develop`.
   - En **Settings → General → Pull Requests**, active **Automatically delete head branches**.

### Paso 3 · Todo el equipo: clonar y verificar ramas

Cada integrante (excepto el Tech Lead, que ya clonó) ejecuta en PowerShell:
```powershell
git clone https://github.com/<usuario-lead>/equipo-XX-git-lab.git
cd equipo-XX-git-lab
git branch -a
```
Salida esperada:
```text
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/develop
  remotes/origin/main
```

### Paso 4 · Cada Developer: sincronizar `develop` y crear su rama

**Regla de oro:** nunca cree una rama nueva sin traer primero los últimos cambios de `develop`.
```powershell
git switch develop
git pull origin develop
git switch -c feat/perfil-<su-nombre>
```
Ejemplo: `git switch -c feat/perfil-laura`.
**Verificación:** `git branch` debe mostrar el asterisco `*` en su rama `feat/...`, nunca en `main` ni `develop`.

### Paso 5 · Cada Developer: trabajar, verificar y subir su rama

1. Cree una carpeta `integrantes/` y un archivo propio `integrantes/<su-nombre>.md` con su nombre, rol y módulo asignado.
2. Además, edite la sección `## Equipo` al final de `README.md` agregando su línea (esto nos servirá para practicar un conflicto controlado en el Paso 8).
3. Revise qué cambió antes de guardar:
   ```powershell
   git status
   git diff
   ```
4. Haga un commit atómico y suba su rama:
   ```powershell
   git add integrantes/<su-nombre>.md README.md
   git commit -m "feat(equipo): agregar ficha de <su-nombre> y actualizar readme"
   git push -u origin feat/perfil-<su-nombre>
   ```
   **Verificación:** GitHub muestra un banner amarillo *"Compare & pull request"*.

### Paso 6 · GitHub: abrir el Pull Request y hacer Code Review

1. Clic en **Compare & pull request**.
2. **CRÍTICO:** verifique la dirección de las flechas arriba:
   `base: develop` ← `compare: feat/perfil-<su-nombre>` (¡NO hacia `main`!).
3. Complete la plantilla del PR (qué resuelve, cómo se probó, checklist) y en **Reviewers** asigne a un compañero.
4. El **revisor** abre la pestaña **Files changed**, revisa línea por línea y deja al menos 1 comentario constructivo:
   - Si falta algo → **Request changes** (el autor corrige en su misma rama, hace otro `commit` y `git push`; el PR se actualiza solo).
   - Si todo está bien → **Approve**.

### Paso 7 · Integrar (Squash and Merge) y sincronizar al equipo

1. Con el PR aprobado en verde, clic en **Squash and merge** → **Confirm squash and merge**.
2. La rama remota `feat/...` se borra automáticamente (o clic en **Delete branch**).
3. En su PowerShell, vuelva a `develop`, descargue el cambio integrado y borre su rama local vieja:
   ```powershell
   git switch develop
   git pull origin develop
   git branch -d feat/perfil-<su-nombre>
   ```

### Paso 8 · Conflicto controlado en `README.md` (y cómo resolverlo)

Cuando el integrante 1 fusiona su PR con cambios en `README.md`, el PR del integrante 2 mostrará: *"This branch has conflicts that must be resolved"*.

**Cómo resolverlo desde la rama `feat/...` del integrante 2 (PowerShell):**
```powershell
git fetch origin
git merge origin/develop
```
Git avisará: `CONFLICT (content): Merge conflict in README.md`.

1. Abra `README.md` en VS Code. Verá los marcadores:
   ```markdown
   <<<<<<< HEAD
   - Carlos Pérez · Backend
   =======
   - Laura Gómez · Tech Lead
   >>>>>>> origin/develop
   ```
2. **NO borre el trabajo de su compañero.** Deje ambas líneas y elimine los marcadores `<<<<<<<`, `=======` y `>>>>>>>`:
   ```markdown
   - Laura Gómez · Tech Lead
   - Carlos Pérez · Backend
   ```
3. Guarde, marque como resuelto y suba a su misma rama:
   ```powershell
   git add README.md
   git commit -m "chore(merge): resolver conflicto en readme integrando cambios de develop"
   git push
   ```
**Verificación:** recargue el PR en GitHub. El aviso rojo desaparece y el botón de merge vuelve a ponerse verde.

### Paso 9 · Release del sprint (`develop` → `main`)

Cuando todas las tareas del sprint están integradas y probadas en `develop`, el **Tech Lead** abre un PR de `base: main` ← `compare: develop`, otro integrante lo aprueba y se hace **Create a merge commit** (conserva el historial completo de la entrega).

---

## 5. Errores comunes y cómo salir sin dañar el repositorio

| Error / Situación | Causa | Solución segura (PowerShell) |
|---|---|---|
| `rejected (fetch first / non-fast-forward)` | Alguien subió cambios a esa rama antes que usted. | `git pull origin <rama>` → resolver si hay conflicto → `git push`. Nunca `git push --force` en ramas compartidas. |
| Hice commits directo en `develop` o `main` por descuido (antes de hacer push) | Olvidó crear la rama `feat/...` antes de editar. | `git switch -c feat/mi-tarea` (mueve su trabajo a una rama nueva) y luego `git branch -f develop origin/develop` (o `main origin/main` si estaba en `main`). |
| Subí `.env` por error en un commit local | Faltó `.gitignore` antes del `git add`. | `git rm --cached .env`, agregue `.env*` a `.gitignore` y haga commit. Si ya hizo `push`, **rote todas las contraseñas/llaves de inmediato**. |
| `git add .` subió archivos que no debía | Agregó todo sin mirar `git status`. | Antes de commitear: `git restore --staged <archivo>`. |

---

## 6. Evidencia de sustentación, resumen y reto opcional

Para aprobar la sustentación del equipo, el instructor verificará en GitHub:
1. Reglas de protección activas en `main` (0 commits directos de funcionalidades en `main`).
2. Al menos **1 PR aprobado y fusionado por cada integrante** del equipo en la pestaña **Pull requests → Closed**.
3. Al menos **1 revisión cruzada con comentarios reales** (nadie aprueba sus propios cambios).
4. **Cero archivos `.env` o `node_modules/`** en el repositorio.
5. **Sustentación en caliente:** el instructor pedirá a un integrante elegido al azar crear una rama `fix/...`, editar un archivo, abrir PR y que otro compañero lo revise en vivo.

### Resumen de lo aprendido
- Un **Tech Lead / Maintainer** configura el repositorio, el `.gitignore`, la plantilla de PR y las reglas de protección en `main` y `develop`.
- Todos los integrantes trabajan en ramas aisladas (`feat/*`, `fix/*`) salidas desde `develop` actualizado y hacen commits atómicos.
- Todo cambio entra mediante **Pull Request con Code Review** de otro compañero (regla de los 4 ojos), se fusiona con *Squash and merge* y se borra la rama usada.
- Los conflictos de merge se resuelven integrando ambos cambios válidos y eliminando los marcadores `<<<<<<<`, `=======` y `>>>>>>>`, sin usar `git push --force` en ramas compartidas.

**Reto opcional (equipos rápidos):** agreguen `.github/CODEOWNERS` con los usuarios reales del equipo y configuren un flujo básico de GitHub Actions que ejecute `node --check` en cada PR antes de permitir el merge.
