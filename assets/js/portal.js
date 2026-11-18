/**
 * =============================================================================
 * SENA CADPH · ADSO — Portal de lecciones
 * -----------------------------------------------------------------------------
 * Catálogo único de lecciones: de aquí salen el menú "Proyectar Aula", las
 * acciones del hero, el panel de estado, los recursos, los atajos de teclado y
 * el avance de cada aprendiz (guardado por presenter.js en localStorage).
 * Al publicar una lección nueva solo se agrega una entrada a LESSONS.
 * =============================================================================
 */
(() => {
  'use strict';

  const TOTAL_SESSIONS = 40;
  const PROGRESS_KEY = 'adso:progress:v1';

  const WEEKS = {
    1: 'Fundamentos Full Stack',
    2: 'Persistencia Políglota',
    3: 'Seguridad, JWT & Resend',
    4: 'Frontend React & SPA',
    5: 'Estado Global & Auth UI',
    6: 'Dashboards por Rol',
    7: 'Blindaje & End-to-End',
    8: 'Despliegue & Sustentación'
  };

  const LESSONS = [
    { id: 's01', week: 1, num: '01', title: 'Modelo Relacional & SQL DDL/DML', slides: 15, icon: 'database',
      href: 'semana-01-fundamentos/dia-01-bd-sql-ddl-dml/index.html',
      resource: { label: 'Taller S01', href: 'semana-01-fundamentos/dia-01-bd-sql-ddl-dml/recursos/plantilla_aprendiz.sql', download: true } },
    { id: 's02', week: 1, num: '02', title: 'Consultas SQL & JOINs', slides: 16, icon: 'git-merge',
      href: 'semana-01-fundamentos/dia-02-consultas-sql-joins/index.html',
      resource: { label: 'Taller S02', href: 'semana-01-fundamentos/dia-02-consultas-sql-joins/recursos/plantilla_aprendiz.sql', download: true } },
    { id: 's03', week: 1, num: '03', title: 'JavaScript ES6+ & Asincronía', slides: 16, icon: 'braces',
      href: 'semana-01-fundamentos/dia-03-javascript-es6-asincronia/index.html',
      resource: { label: 'Taller S03', href: 'semana-01-fundamentos/dia-03-javascript-es6-asincronia/recursos/plantilla_aprendiz.js', download: true } },
    { id: 's04', week: 1, num: '04', title: 'HTTP, Express & Bruno', slides: 23, icon: 'server',
      href: 'semana-01-fundamentos/dia-04-http-express-servidor-base/index.html',
      resource: { label: 'Taller S04', href: 'semana-01-fundamentos/dia-04-http-express-servidor-base/recursos/plantilla_servidor.js', download: true } },
    { id: 's05', week: 1, num: '05', title: 'Fetch API & DOM', slides: 26, icon: 'mouse-pointer-click',
      href: 'semana-01-fundamentos/dia-05-consumo-fetch-dom/index.html',
      resource: { label: 'Taller S05', href: 'semana-01-fundamentos/dia-05-consumo-fetch-dom/recursos/index.html' } },
    { id: 'extra', week: 1, num: 'EX', title: 'Tailwind CSS & UI/UX', slides: 33, icon: 'palette', extra: true,
      href: 'semana-01-fundamentos/dia-extra-tailwindcss-ui-ux/index.html',
      resource: { label: 'Taller Extra', href: 'semana-01-fundamentos/dia-extra-tailwindcss-ui-ux/dia-extra-tailwindcss-taller.zip', download: true } },
    { id: 's06', week: 2, num: '06', title: 'PostgreSQL: Identidad & Tokens', slides: 32, icon: 'key-round',
      href: 'semana-02-arquitectura-persistencia/dia-06-postgresql-relacional/index.html',
      resource: { label: 'Guía S06', href: 'semana-02-arquitectura-persistencia/dia-06-postgresql-relacional/recursos/INSTRUCCIONES.md' } },
    { id: 's07', week: 2, num: '07', title: 'MongoDB: Atlas, BSON & Compass', slides: 36, icon: 'leaf',
      href: 'semana-02-arquitectura-persistencia/dia-07-mongodb-nosql/index.html',
      resource: { label: 'Guía S07', href: 'semana-02-arquitectura-persistencia/dia-07-mongodb-nosql/recursos/INSTRUCCIONES.md' } },
    { id: 's08', week: 2, num: '08', title: 'Express: Capas & Conexión Dual', slides: 31, icon: 'layers',
      href: 'semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/index.html',
      resource: { label: 'Guía S08', href: 'semana-02-arquitectura-persistencia/dia-08-backend-express-arquitectura/recursos/INSTRUCCIONES.md' } },
    { id: 's09', week: 2, num: '09', title: 'Repositorio & Cero SQLi', slides: 30, icon: 'shield-check',
      href: 'semana-02-arquitectura-persistencia/dia-09-repositorio-usuarios-sqli/index.html',
      resource: { label: 'Guía S09', href: 'semana-02-arquitectura-persistencia/dia-09-repositorio-usuarios-sqli/recursos/INSTRUCCIONES.md' } },
    { id: 's10', week: 2, num: '10', title: 'Mongoose & CRUD del Catálogo', slides: 22, icon: 'shapes',
      href: 'semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/index.html',
      resource: { label: 'Guía S10', href: 'semana-02-arquitectura-persistencia/dia-10-mongoose-crud-contenidos/recursos/INSTRUCCIONES.md' } }
  ];

  // Utilidades ----------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const icons = () => { if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons(); };
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const readProgress = () => { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; } };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const sessions = LESSONS.filter((l) => !l.extra);
  const currentWeek = Math.max(...LESSONS.map((l) => l.week));
  const latest = sessions[sessions.length - 1];
  const progress = readProgress();

  const lessonProgress = (lesson) => {
    const p = progress[lesson.id];
    if (!p || !Array.isArray(p.seen)) return null;
    const seen = new Set(p.seen).size;
    const total = p.total || lesson.slides;
    return { seen, total, pct: Math.round((seen / total) * 100), last: Number.isInteger(p.last) ? p.last : 0, updatedAt: p.updatedAt || '' };
  };
  const lastVisited = LESSONS
    .map((l) => ({ lesson: l, p: lessonProgress(l) }))
    .filter((x) => x.p && x.p.pct < 100)
    .sort((a, b) => b.p.updatedAt.localeCompare(a.p.updatedAt))[0];

  // 1. Fechas ------------------------------------------------------------------
  function renderDates() {
    const hoy = new Date();
    const corta = cap(hoy.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }));
    const larga = cap(hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    const c = $('#cintillo-fecha'); if (c) c.textContent = `Hoy: ${corta}`;
    const h = $('#hero-fecha-dinamica'); if (h) h.textContent = `Semana ${currentWeek} en curso · ${larga}`;
  }

  // 2. Menú "Proyectar Aula" (accesible: <details>, teclado y táctil) -----------
  function renderLauncher() {
    const host = $('#portal-launcher');
    if (!host) return;
    const items = LESSONS.map((l) => {
      const p = lessonProgress(l);
      return `
        <a href="${esc(l.href)}" class="portal-launcher__item" role="menuitem">
          <span class="portal-launcher__num ${l.extra ? 'is-extra' : ''}">${esc(l.num)}</span>
          <span class="min-w-0 flex-1">
            <span class="block text-xs font-bold text-slate-800 truncate">${esc(l.title)}</span>
            <span class="block text-[10px] text-slate-500">Semana ${l.week} · ${l.slides} diapositivas${p ? ` · visto ${p.pct}%` : ''}</span>
          </span>
          ${p ? `<span class="portal-ring" style="--p:${p.pct}" aria-label="Avance ${p.pct}%"></span>` : ''}
        </a>`;
    }).join('');
    host.innerHTML = `
      <details class="portal-launcher">
        <summary class="px-4 sm:px-5 py-2.5 bg-[#39A900] hover:bg-[#2D8200] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer select-none">
          <i data-lucide="projector" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Proyectar Aula</span>
          <span class="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">${LESSONS.length}</span>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 portal-launcher__chevron"></i>
        </summary>
        <div class="portal-launcher__menu" role="menu" aria-label="Lecciones disponibles">
          <div class="px-3 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Lecciones disponibles</span>
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">${LESSONS.length} listas</span>
          </div>
          <div class="py-1">${items}</div>
          <a href="#descargas" class="portal-launcher__item border-t border-slate-100 mt-1" role="menuitem">
            <span class="portal-launcher__num" style="background:#39A900"><i data-lucide="package" class="w-4 h-4"></i></span>
            <span class="min-w-0 flex-1"><span class="block text-xs font-bold text-slate-800">Código del proyecto por sesión</span><span class="block text-[10px] text-slate-500">Descargas .zip desde la Sesión 06</span></span>
          </a>
          <div class="pt-2 border-t border-slate-100 px-3 pb-1 text-[10px] text-slate-400 font-medium">Atajo: teclas <kbd>1</kbd>–<kbd>9</kbd>, <kbd>0</kbd> y <kbd>-</kbd> abren las lecciones en orden.</div>
        </div>
      </details>`;
    const details = $('details', host);
    document.addEventListener('click', (e) => { if (details.open && !details.contains(e.target)) details.open = false; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && details.open) { details.open = false; $('summary', details).focus(); } });
  }

  // 3. Acciones del hero: continuar donde quedó o iniciar la lección más reciente
  function renderHeroActions() {
    const host = $('#hero-actions');
    if (!host) return;
    const main = lastVisited
      ? { href: `${lastVisited.lesson.href}#slide-${lastVisited.p.last + 1}`, label: `Continuar Sesión ${lastVisited.lesson.num}`, sub: `${lastVisited.lesson.title} · diapositiva ${lastVisited.p.last + 1}`, badge: `${lastVisited.p.pct}%` }
      : { href: latest.href, label: `Iniciar Sesión ${latest.num}`, sub: latest.title, badge: 'Nueva' };
    const previous = sessions.filter((l) => l.id !== (lastVisited ? lastVisited.lesson.id : latest.id)).slice(-2).reverse();
    host.innerHTML = `
      <a href="${esc(main.href)}" class="portal-cta group">
        <i data-lucide="play-circle" class="w-6 h-6 shrink-0 transition-transform group-hover:scale-110 motion-reduce:transform-none"></i>
        <span class="min-w-0 flex-1 text-left">
          <span class="block font-extrabold text-sm sm:text-base">${esc(main.label)}</span>
          <span class="block text-[11px] text-emerald-50/90 font-medium truncate">${esc(main.sub)}</span>
        </span>
        <span class="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shrink-0">${esc(main.badge)}</span>
      </a>
      <div class="grid grid-cols-3 gap-2">
        ${previous.map((l) => `
          <a href="${esc(l.href)}" class="portal-secondary" title="${esc(l.title)}">
            <i data-lucide="${esc(l.icon)}" class="w-4 h-4 text-[#00324D]"></i><span>Sesión ${esc(l.num)}</span>
          </a>`).join('')}
        <a href="#cronograma" class="portal-secondary"><i data-lucide="calendar-range" class="w-4 h-4 text-slate-500"></i><span>Sesiones Full Stack</span></a>
      </div>`;
  }

  // 4. Panel de estado de la formación (calculado, nunca desactualizado) --------
  function renderStatus() {
    const host = $('#hero-status');
    if (!host) return;
    const ready = sessions.length;
    const pct = Math.round((ready / TOTAL_SESSIONS) * 100);
    const weekReady = sessions.filter((l) => l.week === currentWeek).length;
    const started = LESSONS.map(lessonProgress).filter(Boolean);
    const seenSlides = started.reduce((acc, p) => acc + p.seen, 0);
    const totalSlides = LESSONS.reduce((acc, l) => acc + l.slides, 0);
    const myPct = Math.round((seenSlides / totalSlides) * 100);

    const weeks = Object.keys(WEEKS).map(Number).map((w) => {
      const n = sessions.filter((l) => l.week === w).length;
      const state = n >= 5 ? 'is-done' : n > 0 ? 'is-active' : '';
      return `<button type="button" class="portal-week ${state}" onclick="window.irASemana(${w})" title="Semana ${w}: ${esc(WEEKS[w])} · ${n}/5 sesiones">${w}</button>`;
    }).join('');

    const resources = LESSONS.map((l) => `
      <a href="${esc(l.resource.href)}" ${l.resource.download ? 'download' : 'target="_blank" rel="noopener noreferrer"'} class="portal-resource" title="${esc(l.resource.label)} · ${esc(l.title)}">
        <i data-lucide="${l.resource.download ? 'download' : 'file-text'}" class="w-3.5 h-3.5"></i><span>${esc(l.resource.label)}</span>
      </a>`).join('');

    host.innerHTML = `
      <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#39A900]"><i data-lucide="gauge" class="w-4 h-4"></i></div>
          <div>
            <h2 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Estado de la formación</h2>
            <span class="text-[11px] text-slate-500 font-medium">Todas las jornadas · Sede CADPH Garzón</span>
          </div>
        </div>
        <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">${ready}/${TOTAL_SESSIONS} sesiones</span>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs gap-2">
          <span class="font-extrabold text-slate-800">Semana ${currentWeek}: ${esc(WEEKS[currentWeek])}</span>
          <span class="font-mono font-bold text-[#39A900]">${pct}%</span>
        </div>
        <div class="portal-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Sesiones publicadas del plan"><span style="--w:${pct}%"></span></div>
        <p class="text-[11px] text-slate-500">${weekReady}/5 sesiones de la semana actual publicadas, más la Sesión Extra de Tailwind.</p>
        <div class="flex gap-1.5 pt-1" aria-label="Semanas del plan">${weeks}</div>
      </div>

      <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
        <div class="flex items-center justify-between text-xs gap-2">
          <span class="font-extrabold text-slate-800 flex items-center gap-1.5"><i data-lucide="user-round-check" class="w-4 h-4 text-[#00324D]"></i> Mi avance en este equipo</span>
          <span class="font-mono font-bold text-[#00324D]">${myPct}%</span>
        </div>
        <div class="portal-bar portal-bar--navy"><span style="--w:${myPct}%"></span></div>
        <p class="text-[11px] text-slate-500">${started.length ? `${seenSlides} de ${totalSlides} diapositivas vistas en ${started.length} lección(es).` : 'Aún no has abierto ninguna lección en este navegador: tu avance se guardará automáticamente.'}</p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-[11px] font-bold text-slate-500"><span>Recursos de cada sesión</span><span class="text-[10px] font-mono text-[#00324D]">${LESSONS.length} disponibles</span></div>
        <div class="portal-resources">${resources}</div>
      </div>`;
  }

  // 4b. Código del proyecto por sesión (datos: assets/js/downloads-data.js) --------
  function renderDownloads() {
    const host = $('#descargas-lista');
    const packages = Array.isArray(window.ADSO_DOWNLOADS) ? window.ADSO_DOWNLOADS : [];
    if (!host) return;
    if (!packages.length) {
      host.innerHTML = '<li class="text-sm text-slate-500">Aún no hay paquetes de código publicados.</li>';
      return;
    }
    const kb = (bytes) => `${(bytes / 1024).toLocaleString('es-CO', { maximumFractionDigits: 1 })} KB`;
    // Las colecciones Bruno se muestran como una sola línea: "server/bruno/ (13 archivos)"
    const groupFiles = (files) => {
      const groups = new Map();
      files.forEach((f) => {
        const m = f.match(/^(.*\/bruno[^/]*)\//);
        const key = m ? `${m[1]}/` : f;
        groups.set(key, (groups.get(key) || 0) + 1);
      });
      return [...groups].map(([name, n]) => (name.endsWith('/') ? `${name} (${n} archivos)` : name));
    };
    const fileLines = (files, mark, cls, label) => groupFiles(files)
      .map((f) => `<li class="portal-file ${cls}"><span aria-hidden="true">${mark}</span><code>${esc(f)}</code><span class="sr-only">${label}</span></li>`).join('');

    host.innerHTML = packages.map((pkg, i) => {
      const isLast = i === packages.length - 1;
      const p = lessonProgress(LESSONS.find((l) => l.id === pkg.id) || { id: pkg.id, slides: 1 });
      return `
        <li class="portal-step${isLast ? ' is-latest' : ''}">
          <div class="portal-step__marker" aria-hidden="true"><i data-lucide="${esc(pkg.icon)}" class="w-4 h-4"></i></div>
          <article class="portal-step__card">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-[#00324D] text-white font-mono text-[11px] font-bold">Sesión ${esc(pkg.num)}</span>
              <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Semana ${esc(pkg.week)}</span>
              ${isLast ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Última publicada</span>' : ''}
              ${p && p.pct === 100 ? '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">✓ Lección vista</span>' : ''}
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">${esc(pkg.title)}</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${esc(pkg.summary)}</p>
            <div class="flex flex-wrap gap-2 text-[11px] font-bold">
              <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">+${pkg.added.length} archivo${pkg.added.length === 1 ? '' : 's'} nuevo${pkg.added.length === 1 ? '' : 's'}</span>
              ${pkg.changed.length ? `<span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">${pkg.changed.length} modificado${pkg.changed.length === 1 ? '' : 's'}</span>` : ''}
            </div>
            <details class="portal-files">
              <summary>Ver qué archivos incluye</summary>
              <ul>${fileLines(pkg.added, '+', 'is-added', '(nuevo)')}${fileLines(pkg.changed, '~', 'is-changed', '(modificado)')}</ul>
            </details>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a href="${esc(pkg.project.href)}" download class="portal-dl portal-dl--primary">
                <i data-lucide="package" class="w-4 h-4 shrink-0"></i>
                <span class="min-w-0"><span class="block">Proyecto hasta la Sesión ${esc(pkg.num)}</span><span class="block text-[10px] font-semibold opacity-80">${pkg.project.files} archivos · ${kb(pkg.project.bytes)} · .zip</span></span>
              </a>
              <a href="${esc(pkg.session.href)}" download class="portal-dl">
                <i data-lucide="file-archive" class="w-4 h-4 shrink-0 text-[#39A900]"></i>
                <span class="min-w-0"><span class="block">Solo la Sesión ${esc(pkg.num)}</span><span class="block text-[10px] font-semibold text-slate-500">${pkg.session.files} archivos · ${kb(pkg.session.bytes)} · .zip</span></span>
              </a>
            </div>
            <a href="${esc(pkg.lesson)}" class="text-[11px] font-bold text-[#00324D] hover:text-[#39A900] transition-colors inline-flex items-center gap-1 w-fit">
              <i data-lucide="projector" class="w-3.5 h-3.5"></i> Ver la lección de la Sesión ${esc(pkg.num)}
            </a>
          </article>
        </li>`;
    }).join('');
  }

  // 5. Avance en cada tarjeta de sesión del cronograma ---------------------------
  function decorateCards() {
    $$('.sesion-card').forEach((card) => {
      const link = $$('a[href$="index.html"]', card).find((a) => LESSONS.some((l) => l.href === a.getAttribute('href')));
      if (!link) return;
      const lesson = LESSONS.find((l) => l.href === link.getAttribute('href'));
      card.dataset.lesson = lesson.id;
      const p = lessonProgress(lesson);
      if (!p || $('.portal-card-progress', card)) return;
      const box = document.createElement('div');
      box.className = 'portal-card-progress';
      box.innerHTML = `
        <div class="flex items-center justify-between text-[10px] font-bold text-slate-500"><span>Tu avance</span><span class="font-mono text-[#39A900]">${p.seen}/${p.total}</span></div>
        <div class="portal-bar"><span style="--w:${p.pct}%"></span></div>
        ${p.pct < 100 ? `<a href="${esc(lesson.href)}#slide-${p.last + 1}" class="text-[11px] font-bold text-[#00324D] hover:text-[#39A900] transition-colors inline-flex items-center gap-1">Continuar en la diapositiva ${p.last + 1} <i data-lucide="arrow-right" class="w-3 h-3"></i></a>` : '<span class="text-[11px] font-bold text-emerald-700">✓ Lección completada</span>'}`;
      link.parentElement.appendChild(box);
    });
  }

  // 6. Pestañas de semanas (ARIA tabs) -------------------------------------------
  let activeWeek = currentWeek;
  window.cambiarSemana = function (week) {
    activeWeek = Number(week);
    const results = $('#panel-resultados-busqueda');
    if (results) results.classList.add('hidden');
    $$('.semana-panel').forEach((panel) => {
      const show = panel.id === `panel-semana-${activeWeek}`;
      panel.classList.toggle('hidden', !show);
      if (show) panel.classList.add('portal-fade');
    });
    for (let i = 1; i <= 8; i++) {
      const btn = $(`#btn-sem-${i}`);
      if (!btn) continue;
      const on = i === activeWeek;
      btn.className = on
        ? 'px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#39A900] text-white shadow-xs transition-colors'
        : 'px-3 py-1.5 rounded-lg text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(on));
      btn.setAttribute('aria-controls', `panel-semana-${i}`);
      btn.tabIndex = on ? 0 : -1;
    }
    icons();
  };

  window.irASemana = function (week) {
    window.limpiarBusqueda(false);
    window.cambiarSemana(Number(week));
    const el = $(`#panel-semana-${week}`);
    if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  function setupTabsKeyboard() {
    const bar = $('#btn-sem-1')?.parentElement;
    if (!bar) return;
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Semanas del plan');
    bar.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      let next = activeWeek;
      if (e.key === 'ArrowRight') next = activeWeek % 8 + 1;
      if (e.key === 'ArrowLeft') next = (activeWeek + 6) % 8 + 1;
      if (e.key === 'Home') next = 1;
      if (e.key === 'End') next = 8;
      window.cambiarSemana(next);
      $(`#btn-sem-${next}`).focus();
    });
  }

  // 7. Búsqueda instantánea (texto escapado) --------------------------------------
  const catalog = [];
  function indexSessions() {
    $$('.semana-panel').forEach((panel) => {
      const week = panel.id.replace('panel-semana-', '');
      $$('h3, h4', panel).forEach((heading) => {
        const card = heading.closest('.sesion-card, .p-6, .p-7, .p-5, .p-4');
        if (!card || card.dataset.indexed) return;
        card.dataset.indexed = 'true';
        const title = heading.textContent.trim();
        const description = $('p', card) ? $('p', card).textContent.trim() : '';
        const link = $$('a[href$="index.html"]', card).find((a) => !a.getAttribute('href').startsWith('#'));
        const badge = $('span[class*="font-mono"]', card);
        catalog.push({
          week, title, description,
          badge: badge ? badge.textContent.trim() : `Semana ${week}`,
          href: link ? link.getAttribute('href') : null,
          text: `${title} ${description} ${card.textContent} semana ${week}`.toLowerCase()
        });
      });
    });
  }

  const input = () => $('#input-busqueda-sesiones');
  function runSearch() {
    const term = input().value.trim().toLowerCase();
    const clearBtn = $('#btn-limpiar-busqueda');
    if (!term) { window.limpiarBusqueda(); return; }
    clearBtn?.classList.remove('hidden');
    if (term.length < 2) return;
    const matches = catalog.filter((s) => s.text.includes(term));
    $$('.semana-panel').forEach((p) => p.classList.add('hidden'));
    $('#barra-semanas-nav')?.classList.add('hidden');
    const panel = $('#panel-resultados-busqueda');
    panel.classList.remove('hidden');
    $('#conteo-resultados').textContent = `${matches.length} lección(es) encontrada(s) para "${term}"`;
    const list = $('#lista-resultados-busqueda');
    if (!matches.length) {
      list.innerHTML = `<div class="col-span-full py-8 text-center space-y-2">
        <p class="text-sm font-bold text-slate-700">No encontramos lecciones que coincidan con tu búsqueda.</p>
        <p class="text-xs text-slate-500">Prueba con: <code>PostgreSQL</code>, <code>MongoDB</code>, <code>JWT</code>, <code>Tailwind</code>, <code>Bruno</code>.</p></div>`;
      return;
    }
    list.innerHTML = matches.map((m) => `
      <article class="bg-white border border-slate-200 hover:border-[#39A900] rounded-2xl p-5 shadow-2xs space-y-3 transition-colors flex flex-col justify-between portal-fade">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#39A900] font-mono text-[10px] font-extrabold border border-emerald-200">${esc(m.badge)}</span>
            ${m.href ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Disponible</span>' : '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">Planificada</span>'}
          </div>
          <h4 class="text-sm font-extrabold text-slate-900 leading-snug">${esc(m.title)}</h4>
          <p class="text-xs text-slate-600 leading-relaxed">${esc(m.description)}</p>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <button type="button" onclick="window.irASemana('${esc(m.week)}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">Ver en Semana ${esc(m.week)}</button>
          ${m.href ? `<a href="${esc(m.href)}" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#39A900] hover:bg-[#2D8200] text-white text-xs font-bold rounded-lg transition-colors"><i data-lucide="projector" class="w-3.5 h-3.5"></i> Proyectar</a>` : ''}
        </div>
      </article>`).join('');
    icons();
  }

  window.filtrarPorTema = function (tema) {
    $$('.chip-filter').forEach((btn) => {
      const on = btn.getAttribute('data-tema') === tema;
      btn.className = on
        ? 'chip-filter px-3 py-1 rounded-full text-xs font-extrabold bg-[#00324D] text-white shadow-xs transition-colors shrink-0'
        : 'chip-filter px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors shrink-0';
      btn.setAttribute('aria-pressed', String(on));
    });
    if (!tema) { window.limpiarBusqueda(); return; }
    input().value = tema;
    runSearch();
  };

  window.limpiarBusqueda = function (restoreWeek = true) {
    if (input()) input().value = '';
    $('#btn-limpiar-busqueda')?.classList.add('hidden');
    $('#panel-resultados-busqueda')?.classList.add('hidden');
    $('#barra-semanas-nav')?.classList.remove('hidden');
    $$('.chip-filter').forEach((btn) => {
      const on = btn.getAttribute('data-tema') === '';
      btn.className = on
        ? 'chip-filter px-3 py-1 rounded-full text-xs font-extrabold bg-[#00324D] text-white shadow-xs transition-colors shrink-0'
        : 'chip-filter px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors shrink-0';
    });
    if (restoreWeek) window.cambiarSemana(activeWeek);
  };

  // 8. Atajos de teclado (derivados del catálogo) ----------------------------------
  function setupShortcuts() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'];
    window.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) {
        if (e.key === 'Escape') { window.limpiarBusqueda(); active.blur(); }
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k' || e.key === 'K') { e.preventDefault(); input()?.focus(); }
        return;
      }
      if ((e.key === 'd' || e.key === 'D') && e.altKey) { e.preventDefault(); location.href = 'referencia-docente/index.html'; return; }
      if (e.altKey) return;
      if (e.key === '/') { e.preventDefault(); input()?.focus(); return; }
      const idx = keys.indexOf(e.key);
      if (idx >= 0 && LESSONS[idx]) location.href = LESSONS[idx].href;
    });
  }

  // 9. Animaciones de aparición al hacer scroll -----------------------------------
  function setupReveal() {
    if (reducedMotion() || !('IntersectionObserver' in window)) return;
    const targets = $$('main section > div > *, .sesion-card, #metodologia .grid > *, #recursos .grid > *');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) return; // lo visible al cargar no se anima
      el.classList.add('portal-reveal');
      el.style.setProperty('--reveal-delay', `${(i % 3) * 60}ms`);
      io.observe(el);
    });
  }

  // Inicio ---------------------------------------------------------------------
  function init() {
    renderDates();
    renderLauncher();
    renderHeroActions();
    renderStatus();
    renderDownloads();
    indexSessions();
    decorateCards();
    window.cambiarSemana(currentWeek);
    setupTabsKeyboard();
    input()?.addEventListener('input', runSearch);
    setupShortcuts();
    icons();
    setupReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
