// =============================================================================
// Laboratorios interactivos — Sesión Extra: Git & GitHub en Equipos Reales
// 1. Selector de equipo (2, 3 o 4 personas): roles, ramas y revisión cruzada
// 2. Simulador paso a paso (8 fases): Repo → Ramas → PR → Review → Merge → Sync
// 3. Simulador de resolución de conflictos en server/src/app.js
// =============================================================================
(() => {
  'use strict';

  const refreshIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // ---------------------------------------------------------------------------
  // LAB 1: Selector de tamaño de equipo (2, 3 o 4 personas)
  // ---------------------------------------------------------------------------
  const TEAMS = {
    2: {
      summary: 'En parejas, la regla de los 4 ojos es simple: A revisa a B y B revisa a A. Ninguno aprueba su propio código.',
      cadence: 'Ideal para micro-sprints: 1 PR por funcionalidad pequeña (máx. 200 líneas).',
      members: [
        { name: 'Integrante A', role: 'Tech Lead / Maintainer', badge: 'bg-[#00324D] text-white', branch: 'feat/auth-jwt', reviews: 'PRs de Integrante B', owns: 'Crea el repo, protege main/develop, revisa PRs y lidera el merge de cierre.' },
        { name: 'Integrante B', role: 'Full Stack Developer', badge: 'bg-[#2D8200] text-white', branch: 'feat/catalogo-crud', reviews: 'PRs de Integrante A', owns: 'Desarrolla módulos en ramas feat/*, revisa los PRs del Tech Lead y valida con Bruno.' }
      ]
    },
    3: {
      summary: 'En equipos de 3 personas se forma un anillo de revisión: nadie se queda bloqueado esperando a una sola persona.',
      cadence: 'El Tech Lead protege main/develop, pero los 3 revisan código: así todos conocen el proyecto completo.',
      members: [
        { name: 'Integrante A', role: 'Tech Lead / Arquitectura', badge: 'bg-[#00324D] text-white', branch: 'feat/auth-seguridad', reviews: 'PRs de Integrante C', owns: 'Configura repo, protección de ramas, plantilla PR, despliegue y release develop → main.' },
        { name: 'Integrante B', role: 'Backend Developer', badge: 'bg-blue-700 text-white', branch: 'feat/api-pedidos', reviews: 'PRs de Integrante A', owns: 'Endpoints Express, validaciones, repositorios SQL/Mongo y pruebas Bruno.' },
        { name: 'Integrante C', role: 'Frontend Developer', badge: 'bg-[#2D8200] text-white', branch: 'feat/ui-landing', reviews: 'PRs de Integrante B', owns: 'Vistas React/Tailwind, consumo de API y capturas de evidencia en cada PR.' }
      ]
    },
    4: {
      summary: 'En equipos de 4 personas conviene separar responsabilidades por módulo para minimizar conflictos en los mismos archivos.',
      cadence: 'Usen CODEOWNERS para asignar revisores automáticos y sincronicen develop al inicio de cada jornada.',
      members: [
        { name: 'Integrante A', role: 'Tech Lead / Integración', badge: 'bg-[#00324D] text-white', branch: 'feat/config-seguridad', reviews: 'PRs de B y D', owns: 'Repo, Branch Protection, CODEOWNERS, releases a main y desbloqueo de conflictos.' },
        { name: 'Integrante B', role: 'Backend Developer', badge: 'bg-blue-700 text-white', branch: 'feat/api-usuarios', reviews: 'PRs de Integrante A', owns: 'Controladores, rutas, middlewares y manejo estándar de errores.' },
        { name: 'Integrante C', role: 'Frontend Developer', badge: 'bg-[#2D8200] text-white', branch: 'feat/ui-dashboard', reviews: 'PRs de Integrante B', owns: 'Componentes UI, formularios, responsive móvil y consumo Fetch/API.' },
        { name: 'Integrante D', role: 'Datos & QA (Bruno/SQL)', badge: 'bg-amber-700 text-white', branch: 'feat/db-seeds-bruno', reviews: 'PRs de Integrante C', owns: 'Migraciones SQL, índices Mongo, semillas y colecciones Bruno de regresión.' }
      ]
    }
  };

  function renderTeam(size) {
    const data = TEAMS[size];
    const grid = document.getElementById('git-team-grid');
    const note = document.getElementById('git-team-summary');
    if (!data || !grid || !note) return;

    [2, 3, 4].forEach((n) => {
      const btn = document.getElementById('btn-team-' + n);
      if (!btn) return;
      const active = n === size;
      btn.setAttribute('aria-pressed', String(active));
      btn.className = active
        ? 'px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl text-xs font-extrabold bg-[#00324D] text-white shadow-xs transition-colors cursor-pointer'
        : 'px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer';
    });

    note.textContent = `${data.summary} ${data.cadence}`;
    grid.className = size === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
      : size === 3
        ? 'grid grid-cols-1 md:grid-cols-3 gap-3'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3';

    grid.innerHTML = '';
    data.members.forEach((m) => {
      const card = document.createElement('article');
      card.className = 'p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-2xs min-w-0';
      card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-extrabold text-slate-900">${m.name}</h3>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${m.badge}">${m.role}</span>
        </div>
        <p class="text-slate-600 leading-snug">${m.owns}</p>
        <div class="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
          <div class="flex flex-wrap items-center justify-between gap-1"><span class="text-slate-600">Rama ejemplo:</span><code class="font-mono font-bold text-[#00324D] break-all">${m.branch}</code></div>
          <div class="flex flex-wrap items-center justify-between gap-1"><span class="text-slate-600">Revisa:</span><span class="font-bold text-emerald-800">${m.reviews}</span></div>
        </div>`;
      grid.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------------
  // LAB 2: Simulador del ciclo completo de una funcionalidad (8 fases)
  // ---------------------------------------------------------------------------
  const FLOW_STEPS = [
    {
      num: 1, short: 'Repo base', actor: 'Tech Lead', actorCls: 'bg-[#00324D] text-white',
      title: 'Fase 1 · Subir base, crear develop y proteger ramas',
      why: 'El Tech Lead sube .gitignore, la plantilla de PR y README base a main, publica develop y activa Branch Protection en ambas ramas.',
      cmd: 'git clone https://github.com/equipo-04/adso-app.git\ncd adso-app\ngit add .gitignore .github/pull_request_template.md README.md\ngit commit -m "chore(repo): agregar gitignore y plantilla pr"\ngit push origin main\ngit switch -c develop ; git push -u origin develop',
      output: 'Branch "develop" set up to track "origin/develop".\nGitHub: Protección activa en main y develop (1 aprobación obligatoria).',
      pr: { state: 'Sin PR abierto', cls: 'bg-slate-200 text-slate-800', detail: 'Repositorio listo con main y develop protegidas.' },
      graph: { feat: 0, branchCreated: false, merged: false, prOpen: false, approved: false, deleted: false }
    },
    {
      num: 2, short: 'Colaboradores', actor: 'Tech Lead + Equipo', actorCls: 'bg-[#00324D] text-white',
      title: 'Fase 2 · Invitar colaboradores y clonar en local',
      why: 'En Settings → Collaborators se agregan los 2–4 integrantes. Cada uno acepta la invitación y clona el repo en su equipo.',
      cmd: '# En GitHub: Settings → Collaborators → Add people\ngit clone https://github.com/equipo-04/adso-app.git\ncd adso-app\ngit branch -a',
      output: '* main\n  remotes/origin/develop\n  remotes/origin/main',
      pr: { state: 'Equipo conectado', cls: 'bg-blue-100 text-blue-900', detail: 'Todos tienen acceso de escritura a ramas feat/* (nunca directo a main).' },
      graph: { feat: 0, branchCreated: false, merged: false, prOpen: false, approved: false, deleted: false }
    },
    {
      num: 3, short: 'Crear rama', actor: 'Developer (Laura)', actorCls: 'bg-[#2D8200] text-white',
      title: 'Fase 3 · Sincronizar develop y crear rama de trabajo',
      why: 'Antes de tocar un solo archivo, el developer actualiza develop y crea su rama aislada feat/auth-login (aún sin commits propios).',
      cmd: 'git switch develop\ngit pull origin develop\ngit switch -c feat/auth-login',
      output: "Switched to a new branch 'feat/auth-login'",
      pr: { state: 'Rama lista en local', cls: 'bg-emerald-100 text-emerald-900', detail: 'Rama feat/auth-login aislada desde develop; main y develop siguen intactas.' },
      graph: { feat: 0, branchCreated: true, merged: false, prOpen: false, approved: false, deleted: false }
    },
    {
      num: 4, short: 'Commit', actor: 'Developer (Laura)', actorCls: 'bg-[#2D8200] text-white',
      title: 'Fase 4 · Hacer commit atómico y verificado',
      why: 'Se revisa git status para no colar .env ni archivos temporales, y se guarda el trabajo con Conventional Commits.',
      cmd: 'git status\ngit add src/routes/authRoutes.js src/controllers/authController.js\ngit commit -m "feat(auth): endpoint de login con validacion"',
      output: '[feat/auth-login 7a3f1c2] feat(auth): endpoint de login con validacion\n 2 files changed, 68 insertions(+)',
      pr: { state: 'Commit local listo', cls: 'bg-emerald-100 text-emerald-900', detail: 'Commit c1 limpio en feat/auth-login listo para publicar en GitHub.' },
      graph: { feat: 1, branchCreated: true, merged: false, prOpen: false, approved: false, deleted: false }
    },
    {
      num: 5, short: 'Push rama', actor: 'Developer (Laura)', actorCls: 'bg-[#2D8200] text-white',
      title: 'Fase 5 · Subir la rama propia a GitHub',
      why: 'git push -u publica únicamente la rama feat/auth-login. Si alguien intentara git push origin main, GitHub lo rechazaría.',
      cmd: 'git push -u origin feat/auth-login',
      output: 'To https://github.com/equipo-04/adso-app.git\n * [new branch] feat/auth-login -> feat/auth-login',
      pr: { state: 'Lista para PR', cls: 'bg-amber-100 text-amber-900', detail: 'GitHub detectó la rama y muestra el botón "Compare & pull request".' },
      graph: { feat: 1, branchCreated: true, merged: false, prOpen: false, approved: false, deleted: false }
    },
    {
      num: 6, short: 'Abrir PR', actor: 'Developer (Laura)', actorCls: 'bg-amber-700 text-white',
      title: 'Fase 6 · Abrir Pull Request hacia develop (no a main)',
      why: 'Se elige base: develop ← compare: feat/auth-login, se llena la plantilla con evidencia y se asigna un compañero en Reviewers.',
      cmd: '# En GitHub → Pull requests → New pull request\n# Base: develop  ←  Compare: feat/auth-login\n# Reviewer asignado: @carlos-dev',
      output: 'PR #12 abierto: "feat(auth): endpoint de login con validacion"\nEstado: Merge blocked (se requiere 1 aprobación).',
      pr: { state: 'PR #12 · Esperando revisión', cls: 'bg-amber-100 text-amber-900', detail: 'base: develop ← feat/auth-login · Botón Merge bloqueado hasta aprobación.' },
      graph: { feat: 1, branchCreated: true, merged: false, prOpen: true, approved: false, deleted: false }
    },
    {
      num: 7, short: 'Code Review', actor: 'Revisor (Carlos)', actorCls: 'bg-blue-700 text-white',
      title: 'Fase 7 · Revisar el código (Code Review) y aprobar',
      why: 'Otro integrante revisa Files changed: pide validar un campo, Laura sube el commit c2 en la misma rama y Carlos aprueba.',
      cmd: '# Revisor en GitHub → Files changed → Review changes\n# 1) Comentario: "Validar email antes de consultar la BD"\n# 2) Laura sube c2 + git push → Carlos marca: Approve',
      output: 'PR #12 aprobado por @carlos-dev · Checks passed\nBotón "Squash and merge" habilitado en verde.',
      pr: { state: 'PR #12 · Aprobado', cls: 'bg-emerald-100 text-emerald-900', detail: '1 aprobación recibida · Sin conflictos · Listo para Squash and merge.' },
      graph: { feat: 2, branchCreated: true, merged: false, prOpen: true, approved: true, deleted: false }
    },
    {
      num: 8, short: 'Merge & Sync', actor: 'Tech Lead + Equipo', actorCls: 'bg-[#00324D] text-white',
      title: 'Fase 8 · Squash & Merge, borrar rama y sincronizar',
      why: 'El PR se fusiona en develop en 1 commit limpio, se borra la rama feat/auth-login y todo el equipo actualiza su develop local.',
      cmd: '# En GitHub: Squash and merge → Delete branch\ngit switch develop\ngit pull origin develop\ngit branch -d feat/auth-login',
      output: 'Updating a1b2c3d..f9e8d7c (Fast-forward)\nDeleted branch feat/auth-login (was 9c4e2b1).',
      pr: { state: 'PR #12 · Merged', cls: 'bg-purple-100 text-purple-900', detail: 'Integrado en develop · Rama borrada · Equipo sincronizado.' },
      graph: { feat: 2, branchCreated: true, merged: true, prOpen: false, approved: true, deleted: true }
    }
  ];

  let activeStep = 0;

  function buildFlowSvg(g) {
    const featOpacity = g.deleted ? '0.45' : '1';
    const featNodes = [];
    for (let i = 0; i < g.feat; i++) {
      const cx = 210 + i * 85;
      featNodes.push(`<circle cx="${cx}" cy="118" r="9" fill="#2D8200" stroke="#ffffff" stroke-width="2.5" opacity="${featOpacity}"/>`);
      featNodes.push(`<text x="${cx}" y="142" text-anchor="middle" font-size="10.5" font-weight="700" font-family="JetBrains Mono, monospace" fill="#166534">c${i + 1}</text>`);
    }
    const lastFeatX = g.feat > 0 ? 210 + (g.feat - 1) * 85 : 195;
    const featPath = g.branchCreated
      ? `<path d="M 135 74 C 165 74, 165 118, 195 118 L ${lastFeatX} 118" fill="none" stroke="#2D8200" stroke-width="3" stroke-dasharray="${g.deleted || g.feat === 0 ? '5 4' : 'none'}" opacity="${featOpacity}"/>`
      : '';
    const mergePath = g.merged
      ? `<path d="M ${lastFeatX} 118 C ${lastFeatX + 40} 118, ${lastFeatX + 40} 74, 415 74" fill="none" stroke="#6b21a8" stroke-width="3"/>`
      : '';
    const devEndX = g.merged ? 415 : 135;
    const prBadge = g.prOpen
      ? `<rect x="315" y="54" width="145" height="24" rx="12" fill="${g.approved ? '#dcfce7' : '#fef3c7'}" stroke="${g.approved ? '#166534' : '#92400e'}" stroke-width="1.5"/>
         <text x="387" y="70" text-anchor="middle" font-size="10.5" font-weight="700" font-family="Plus Jakarta Sans, sans-serif" fill="${g.approved ? '#166534' : '#92400e'}">${g.approved ? 'PR #12 Aprobado' : 'PR #12 en revisión'}</text>`
      : '';

    return `<svg viewBox="0 0 520 160" class="w-full min-w-[460px] sm:min-w-0 h-auto" aria-hidden="true">
      <line x1="85" y1="30" x2="495" y2="30" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 4"/>
      <line x1="85" y1="74" x2="495" y2="74" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 4"/>
      <rect x="8" y="19" width="68" height="22" rx="6" fill="#00324D"/>
      <text x="42" y="34" text-anchor="middle" font-size="10.5" font-weight="700" font-family="JetBrains Mono, monospace" fill="#ffffff">main</text>
      <rect x="8" y="63" width="68" height="22" rx="6" fill="#1d4ed8"/>
      <text x="42" y="78" text-anchor="middle" font-size="10.5" font-weight="700" font-family="JetBrains Mono, monospace" fill="#ffffff">develop</text>
      <rect x="8" y="107" width="68" height="22" rx="6" fill="${g.branchCreated ? '#2D8200' : '#475569'}" opacity="${featOpacity}"/>
      <text x="42" y="122" text-anchor="middle" font-size="10" font-weight="700" font-family="JetBrains Mono, monospace" fill="#ffffff">feat/*</text>

      <path d="M 100 30 C 118 30, 118 74, 135 74 L ${devEndX} 74" fill="none" stroke="#1d4ed8" stroke-width="3"/>
      ${featPath}
      ${mergePath}

      <circle cx="100" cy="30" r="9" fill="#00324D" stroke="#ffffff" stroke-width="2.5"/>
      <text x="108" y="14" text-anchor="middle" font-size="10" font-weight="700" font-family="JetBrains Mono, monospace" fill="#00324D">v1.0 (protegida)</text>
      <circle cx="135" cy="74" r="9" fill="#1d4ed8" stroke="#ffffff" stroke-width="2.5"/>
      <text x="135" y="97" text-anchor="middle" font-size="10" font-weight="700" font-family="JetBrains Mono, monospace" fill="#1e40af">base</text>
      ${featNodes.join('')}
      ${g.merged ? '<circle cx="415" cy="74" r="10" fill="#6b21a8" stroke="#ffffff" stroke-width="2.5"/><text x="415" y="55" text-anchor="middle" font-size="10.5" font-weight="700" font-family="JetBrains Mono, monospace" fill="#6b21a8">Squash #12</text>' : ''}
      ${prBadge}
    </svg>`;
  }

  function buildFlowButtons() {
    const bar = document.getElementById('git-flow-steps');
    if (!bar || bar.childElementCount > 0) return;
    FLOW_STEPS.forEach((step, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'git-flow-step-' + i;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = `${step.num}. ${step.short}`;
      btn.addEventListener('click', () => renderFlowStep(i));
      bar.appendChild(btn);
    });
  }

  function renderFlowStep(idx) {
    activeStep = Math.max(0, Math.min(FLOW_STEPS.length - 1, idx));
    const s = FLOW_STEPS[activeStep];
    const title = document.getElementById('git-flow-title');
    const actor = document.getElementById('git-flow-actor');
    const why = document.getElementById('git-flow-why');
    const cmd = document.getElementById('git-flow-cmd');
    const out = document.getElementById('git-flow-out');
    const prBadge = document.getElementById('git-flow-pr-badge');
    const prDetail = document.getElementById('git-flow-pr-detail');
    const graphHost = document.getElementById('git-flow-graph');
    const prevBtn = document.getElementById('git-flow-prev');
    const nextBtn = document.getElementById('git-flow-next');
    if (!title) return;

    // Actualizar botones existentes sin destruirlos (preserva foco de teclado)
    FLOW_STEPS.forEach((_, i) => {
      const btn = document.getElementById('git-flow-step-' + i);
      if (!btn) return;
      const done = i < activeStep;
      btn.setAttribute('aria-pressed', String(i === activeStep));
      btn.className = i === activeStep
        ? 'px-2.5 py-2 min-h-[44px] sm:min-h-[34px] rounded-lg text-[11px] font-extrabold bg-[#2D8200] text-white shadow-xs transition-colors cursor-pointer shrink-0'
        : done
          ? 'px-2.5 py-2 min-h-[44px] sm:min-h-[34px] rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0'
          : 'px-2.5 py-2 min-h-[44px] sm:min-h-[34px] rounded-lg text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shrink-0';
    });

    title.textContent = s.title;
    actor.textContent = s.actor;
    actor.className = `px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${s.actorCls}`;
    why.textContent = s.why;
    cmd.textContent = s.cmd;
    out.textContent = s.output;
    prBadge.textContent = s.pr.state;
    prBadge.className = `px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${s.pr.cls}`;
    prDetail.textContent = s.pr.detail;
    graphHost.innerHTML = buildFlowSvg(s.graph);

    if (prevBtn) prevBtn.disabled = activeStep === 0;
    if (nextBtn) {
      nextBtn.textContent = activeStep === FLOW_STEPS.length - 1 ? 'Reiniciar laboratorio' : 'Siguiente fase →';
    }
  }

  // ---------------------------------------------------------------------------
  // LAB 3: Simulador de resolución de conflicto en server/src/app.js
  // ---------------------------------------------------------------------------
  const CONFLICT_OPTIONS = {
    ours: {
      ok: false,
      icon: 'x-circle',
      iconCls: 'text-rose-700',
      preCls: 'text-rose-200',
      badge: 'Peligro: perdiste el trabajo de tu compañero',
      cls: 'bg-rose-50 border-rose-300 text-rose-950',
      result: "app.use('/api/auth', authRoutes);",
      explain: 'Elegir "Accept Current Change" borró app.use("/api/content", contentRoutes) que tu compañero ya había integrado en develop. La Landing Page dejaría de funcionar en producción.'
    },
    theirs: {
      ok: false,
      icon: 'alert-triangle',
      iconCls: 'text-amber-700',
      preCls: 'text-amber-200',
      badge: 'Error: borraste tu propia funcionalidad',
      cls: 'bg-amber-50 border-amber-300 text-amber-950',
      result: "app.use('/api/content', contentRoutes);",
      explain: 'Elegir "Accept Incoming Change" eliminó tu propia ruta /api/auth. Tu PR pasaría sin conflictos, pero tu login nunca quedaría registrado en Express.'
    },
    both: {
      ok: true,
      icon: 'check-circle-2',
      iconCls: 'text-emerald-700',
      preCls: 'text-emerald-200',
      badge: 'Resolución profesional: ambas rutas conviven limpias',
      cls: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      result: "app.use('/api/auth', authRoutes);\napp.use('/api/content', contentRoutes);",
      explain: 'Eliminaste los marcadores <<<<<<<, ======= y >>>>>>>, conservaste ambas rutas sin duplicar líneas y ahora ejecutas en PowerShell: git add server/src/app.js ; git commit -m "chore(merge): resolver conflicto en app.js" ; git push.'
    }
  };

  function resolveConflict(choice) {
    const opt = CONFLICT_OPTIONS[choice];
    const box = document.getElementById('git-conflict-feedback');
    const code = document.getElementById('git-conflict-result');
    const title = document.getElementById('git-conflict-badge');
    const text = document.getElementById('git-conflict-explain');
    if (!opt || !box || !code || !title || !text) return;

    ['ours', 'theirs', 'both'].forEach((k) => {
      const b = document.getElementById('btn-conflict-' + k);
      if (!b) return;
      b.setAttribute('aria-pressed', String(k === choice));
      b.className = k === choice
        ? 'px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl text-xs font-extrabold bg-[#00324D] text-white shadow-xs transition-colors cursor-pointer'
        : 'px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer';
    });

    box.className = `p-3.5 rounded-xl border-2 space-y-2 text-xs transition-colors ${opt.cls}`;
    title.innerHTML = `<span class="inline-flex items-center gap-1.5"><i data-lucide="${opt.icon}" class="w-4 h-4 shrink-0 ${opt.iconCls}" aria-hidden="true"></i><span>${opt.badge}</span></span>`;
    if (code.parentElement) {
      code.parentElement.className = `bg-slate-900 ${opt.preCls} p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto`;
    }
    code.textContent = opt.result;
    text.textContent = opt.explain;
    refreshIcons();
  }

  function initGitLabs() {
    [2, 3, 4].forEach((n) => {
      const btn = document.getElementById('btn-team-' + n);
      if (btn) btn.addEventListener('click', () => renderTeam(n));
    });
    renderTeam(3);

    buildFlowButtons();
    const prevBtn = document.getElementById('git-flow-prev');
    const nextBtn = document.getElementById('git-flow-next');
    if (prevBtn) prevBtn.addEventListener('click', () => renderFlowStep(activeStep - 1));
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        renderFlowStep(activeStep === FLOW_STEPS.length - 1 ? 0 : activeStep + 1);
      });
    }
    renderFlowStep(0);

    ['ours', 'theirs', 'both'].forEach((k) => {
      const btn = document.getElementById('btn-conflict-' + k);
      if (btn) btn.addEventListener('click', () => resolveConflict(k));
    });

    refreshIcons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGitLabs, { once: true });
  else initGitLabs();
})();
