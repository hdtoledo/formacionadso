/**
 * =============================================================================
 * SENA CADPH · ADSO — Motor de lecciones (v2)
 * -----------------------------------------------------------------------------
 * Cada lección solo declara sus metadatos y sus diapositivas:
 *
 *   <body data-lesson="s08" data-week="2" data-session="08"
 *         data-title="Arquitectura en Capas en Express & Conexión Dual">
 *     <main id="lesson-main"> <section class="slide-item" data-title="…" data-block-label="…">…
 *     <script src="../../assets/js/presenter.js"></script>
 *
 * Este archivo construye el shell (cintillo, header, progreso, pie, índice,
 * ayuda y temporizador), la navegación (teclado, botones, gestos táctiles,
 * #slide-N) y las mejoras globales (copiar código, árboles de directorios,
 * tablas con scroll, autoevaluaciones). Es singleton y retrocompatible con las
 * llamadas existentes (goToSlide, toggleDrawer, toggleHelpModal, …).
 * =============================================================================
 */
(() => {
  'use strict';

  if (window.SlidePresenter && window.SlidePresenter.__v2) return;

  // Rutas base calculadas desde la ubicación de este script (…/assets/js/presenter.js)
  const SCRIPT_SRC = document.currentScript ? document.currentScript.src : '';
  const ASSETS_URL = SCRIPT_SRC ? new URL('../', SCRIPT_SRC).href : '../../assets/';
  const PORTAL_URL = SCRIPT_SRC ? new URL('../../index.html', SCRIPT_SRC).href : '../../index.html';

  const PROGRESS_KEY = 'adso:progress:v1';
  const WEEK_NAMES = {
    1: 'Fundamentos Full Stack',
    2: 'Persistencia Políglota',
    3: 'Seguridad & Autenticación',
    4: 'Frontend React',
    5: 'Estado Global & Auth UI',
    6: 'Dashboards por Rol',
    7: 'Blindaje & E2E',
    8: 'Despliegue & Sustentación'
  };
  const BLOCK_NAMES = {
    1: 'Bloque 1 · Teoría & Live Coding',
    2: 'Bloque 2 · Taller Guiado',
    3: 'Bloque 3 · Evidencia & Sustentación'
  };

  // Utilidades ----------------------------------------------------------------
  const storage = {
    read(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento no disponible */ }
    }
  };
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const clean = (text) => String(text || '').replace(/\s+/g, ' ').trim();
  const isTyping = (el) => !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
  const refreshIcons = () => { if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons(); };
  const formatClock = (total) => {
    const s = Math.max(0, Math.floor(total));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  class SlidePresenter {
    constructor() {
      // Singleton: si la página vuelve a llamar "new SlidePresenter()", se devuelve la instancia existente
      if (window.presenter instanceof SlidePresenter) return window.presenter;
      window.presenter = this;

      const data = document.body.dataset;
      this.meta = {
        lesson: data.lesson || location.pathname.split('/').slice(-2, -1)[0] || 'leccion',
        week: data.week || '',
        session: data.session || '',
        title: data.title || clean(document.title.split('|')[0]),
        short: data.short || ''
      };

      this.slides = Array.from(document.querySelectorAll('.slide-content, .slide-item'));
      this.totalSlides = this.slides.length;
      this.currentSlideIndex = 0;
      this.timer = { running: false, mode: 'up', seconds: 0, target: 0, id: null };
      this.progress = storage.read(PROGRESS_KEY, {});
      if (!this.totalSlides) return;

      this.slides.forEach((slide, i) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'diapositiva');
        slide.setAttribute('aria-label', `${i + 1} de ${this.totalSlides}: ${this.slideTitle(i)}`);
      });

      this.buildShell();
      this.enhanceContent();
      this.bindEvents();

      const fromHash = this.indexFromHash();
      this.currentSlideIndex = fromHash ?? 0;
      this.renderSlide({ animate: false });
      refreshIcons();
    }

    // ------------------------------------------------------------------------
    // Metadatos de cada diapositiva
    // ------------------------------------------------------------------------
    slideTitle(i) {
      const slide = this.slides[i];
      if (!slide) return '';
      if (slide.dataset.title) return slide.dataset.title;
      const heading = slide.querySelector('h1, h2');
      return clean(heading ? heading.textContent : `Diapositiva ${i + 1}`).slice(0, 90);
    }

    slideLabel(i) {
      const slide = this.slides[i];
      if (!slide) return '';
      if (slide.dataset.blockLabel) return slide.dataset.blockLabel;
      if (slide.dataset.block && BLOCK_NAMES[slide.dataset.block]) return BLOCK_NAMES[slide.dataset.block];
      return '';
    }

    indexFromHash() {
      const match = location.hash.match(/^#slide-(\d+)$/);
      if (!match) return null;
      const idx = Number(match[1]) - 1;
      return idx >= 0 && idx < this.totalSlides ? idx : null;
    }

    // ------------------------------------------------------------------------
    // Shell: cintillo, header, progreso, pie, índice, ayuda y toast
    // ------------------------------------------------------------------------
    buildShell() {
      const { week, session, title, short } = this.meta;
      const body = document.body;
      body.classList.add('ls-body');

      // Contenedor principal accesible
      let main = document.getElementById('lesson-main') || document.querySelector('main');
      if (main) {
        main.id = main.id || 'lesson-main';
        main.setAttribute('tabindex', '-1');
        if (!main.classList.contains('ls-main')) main.classList.add('ls-main');
      }
      this.main = main;

      const weekChip = week ? `<span class="ls-chip ls-chip--navy">Semana ${escapeHTML(week)}</span>` : '';
      const sessionChip = session ? `<span class="ls-chip">${/^\d+$/.test(session) ? 'Sesión ' + escapeHTML(session) : escapeHTML(session)}</span>` : '';
      const weekName = WEEK_NAMES[week] ? `<span class="ls-only-desktop">${escapeHTML(WEEK_NAMES[week])}</span>` : '';

      const top = document.createElement('div');
      top.className = 'ls-top';
      top.innerHTML = `
        <a class="ls-skip" href="#lesson-main">Saltar al contenido</a>
        <div class="ls-ribbon" role="presentation">
          <div class="ls-ribbon__inner">
            <span class="ls-ribbon__brand"><strong>SENA</strong><span class="ls-ribbon__sep">|</span><span>Regional Huila · CADPH Garzón</span></span>
            <span class="ls-ribbon__date" data-today>Hoy</span>
          </div>
        </div>
        <header class="ls-header">
          <div class="ls-header__inner">
            <a class="ls-brand" href="${PORTAL_URL}" title="Volver al portal de lecciones">
              <img src="${ASSETS_URL}logo_green.png" alt="SENA" width="36" height="36">
              <span class="ls-brand__text">
                <span class="ls-brand__name">FORMACIÓN <b>ADSO</b></span><br>
                <span class="ls-brand__center">Full Stack MERN · CADPH</span>
              </span>
            </a>
            <div class="ls-crumb">
              <div class="ls-crumb__meta">${weekChip}${sessionChip}${weekName}</div>
              <div class="ls-crumb__title" title="${escapeHTML(title)}">${escapeHTML(short && window.innerWidth < 640 ? short : title)}</div>
            </div>
            <div class="ls-actions">
              <div class="ls-timer" role="group" aria-label="Temporizador de clase">
                <span class="ls-timer__display" data-timer-display aria-live="off">00:00</span>
                <button type="button" class="ls-btn ls-btn--ghost" data-action="timer-toggle" title="Iniciar o pausar (T)" aria-label="Iniciar temporizador">${icon('play')}</button>
                <button type="button" class="ls-btn ls-btn--ghost" data-action="timer-reset" title="Reiniciar (R)" aria-label="Reiniciar temporizador">${icon('rotate-ccw')}</button>
              </div>
              <button type="button" class="ls-btn" data-action="index" title="Índice de diapositivas (M)" aria-haspopup="dialog">${icon('list')}<span class="ls-btn__label">Índice</span></button>
              <button type="button" class="ls-btn ls-only-desktop" data-action="fullscreen" title="Pantalla completa (F)" aria-label="Pantalla completa">${icon('maximize')}</button>
              <button type="button" class="ls-btn ls-only-desktop" data-action="help" title="Atajos y ayuda (?)" aria-label="Atajos y ayuda" aria-haspopup="dialog">${icon('keyboard')}</button>
            </div>
          </div>
          <div class="ls-progress" role="progressbar" aria-label="Avance de la lección" aria-valuemin="1" aria-valuemax="${this.totalSlides}">
            <div class="ls-progress__bar" data-progress-bar></div>
          </div>
        </header>`;
      body.prepend(top);

      const footer = document.createElement('nav');
      footer.className = 'ls-footer';
      footer.setAttribute('aria-label', 'Navegación de diapositivas');
      footer.innerHTML = `
        <div class="ls-footer__inner">
          <div class="ls-block"><span class="ls-block__num" data-slide-num>01 / ${String(this.totalSlides).padStart(2, '0')}</span><span class="ls-block__label" data-block-text></span></div>
          <div class="ls-nav">
            <button type="button" class="ls-btn" data-action="prev" title="Anterior (←)" aria-label="Diapositiva anterior">${icon('chevron-left')}<span class="ls-btn__label">Anterior</span></button>
            <button type="button" class="ls-btn ls-counter" data-action="index" data-counter title="Ir a una diapositiva (M)">1 / ${this.totalSlides}</button>
            <button type="button" class="ls-btn ls-btn--primary" data-action="next" title="Siguiente (→)" aria-label="Diapositiva siguiente"><span class="ls-btn__label">Siguiente</span>${icon('chevron-right')}</button>
          </div>
          <div class="ls-hints" aria-hidden="true"><kbd>←</kbd><kbd>→</kbd> navegar · <kbd>M</kbd> índice · <kbd>?</kbd> ayuda</div>
        </div>`;
      body.appendChild(footer);

      // Índice lateral (dialog nativo: foco atrapado, Esc y backdrop gratis)
      const drawer = document.createElement('dialog');
      drawer.className = 'ls-dialog ls-drawer';
      drawer.setAttribute('aria-label', 'Índice de diapositivas');
      drawer.innerHTML = `
        <div class="ls-drawer__panel">
          <div class="ls-drawer__head">
            <div class="ls-drawer__title">
              <div><h2>Índice de la lección</h2><p>${escapeHTML(title)}</p></div>
              <button type="button" class="ls-btn ls-btn--ghost" data-action="close-dialog" aria-label="Cerrar índice">${icon('x')}</button>
            </div>
            <label class="ls-search">${icon('search')}<input type="search" placeholder="Buscar diapositiva…" data-drawer-search aria-label="Buscar diapositiva"></label>
          </div>
          <div class="ls-drawer__list" data-drawer-list></div>
          <div class="ls-drawer__foot">
            <div style="display:flex;justify-content:space-between;gap:.5rem"><span>Avance en esta lección</span><strong data-seen-text>0 / ${this.totalSlides}</strong></div>
            <div class="ls-meter"><span data-seen-meter style="width:0"></span></div>
            <div class="ls-drawer__presets"><span>Temporizador:</span>
              <button type="button" class="ls-btn ls-preset" data-preset="110">Bloque 1 · 110′</button>
              <button type="button" class="ls-btn ls-preset" data-preset="70">Bloque 2 · 70′</button>
              <button type="button" class="ls-btn ls-preset" data-preset="40">Bloque 3 · 40′</button>
            </div>
            <a class="ls-btn" href="${PORTAL_URL}">${icon('home')}<span class="ls-btn__label">Volver al portal</span></a>
          </div>
        </div>`;
      body.appendChild(drawer);

      const help = document.createElement('dialog');
      help.className = 'ls-dialog ls-modal';
      help.setAttribute('aria-label', 'Atajos de teclado');
      help.innerHTML = `
        <div class="ls-modal__panel">
          <div class="ls-modal__head"><h2>Atajos y controles</h2>
            <button type="button" class="ls-btn ls-btn--ghost" data-action="close-dialog" aria-label="Cerrar ayuda">${icon('x')}</button></div>
          <div class="ls-modal__body">
            <dl class="ls-shortcuts">
              <div><dt>Siguiente</dt><dd><kbd>→</kbd><kbd>Espacio</kbd></dd></div>
              <div><dt>Anterior</dt><dd><kbd>←</kbd></dd></div>
              <div><dt>Primera / última</dt><dd><kbd>Inicio</kbd><kbd>Fin</kbd></dd></div>
              <div><dt>Índice</dt><dd><kbd>M</kbd></dd></div>
              <div><dt>Pantalla completa</dt><dd><kbd>F</kbd></dd></div>
              <div><dt>Temporizador</dt><dd><kbd>T</kbd><kbd>R</kbd></dd></div>
              <div><dt>Ayuda</dt><dd><kbd>?</kbd></dd></div>
              <div><dt>Cerrar</dt><dd><kbd>Esc</kbd></dd></div>
            </dl>
            <p style="margin:0">En celular o tableta, desliza horizontalmente sobre la diapositiva para avanzar o retroceder. Cada diapositiva tiene su propio enlace (<code>#slide-N</code>) y el portal recuerda tu avance.</p>
          </div>
        </div>`;
      body.appendChild(help);

      const toast = document.createElement('div');
      toast.className = 'ls-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      body.appendChild(toast);

      this.el = {
        bar: top.querySelector('[data-progress-bar]'),
        progress: top.querySelector('.ls-progress'),
        timer: top.querySelector('.ls-timer'),
        timerDisplay: top.querySelector('[data-timer-display]'),
        timerToggle: top.querySelector('[data-action="timer-toggle"]'),
        slideNum: footer.querySelector('[data-slide-num]'),
        blockText: footer.querySelector('[data-block-text]'),
        counter: footer.querySelector('[data-counter]'),
        prev: footer.querySelector('[data-action="prev"]'),
        next: footer.querySelector('[data-action="next"]'),
        drawer, help, toast,
        list: drawer.querySelector('[data-drawer-list]'),
        search: drawer.querySelector('[data-drawer-search]'),
        seenText: drawer.querySelector('[data-seen-text]'),
        seenMeter: drawer.querySelector('[data-seen-meter]')
      };

      this.renderDrawerList();
      this.fillDates();
    }

    renderDrawerList() {
      let lastLabel = null;
      const html = this.slides.map((_, i) => {
        const label = this.slideLabel(i);
        const group = label && label !== lastLabel ? `<div class="ls-drawer__group">${escapeHTML(label)}</div>` : '';
        lastLabel = label || lastLabel;
        return `${group}<button type="button" class="ls-item" data-goto="${i}" data-search="${escapeHTML((this.slideTitle(i) + ' ' + label).toLowerCase())}">
            <span class="ls-item__num">${String(i + 1).padStart(2, '0')}</span>
            <span class="ls-item__title">${escapeHTML(this.slideTitle(i))}</span>
            <span class="ls-item__seen" aria-hidden="true"></span>
          </button>`;
      }).join('');
      this.el.list.innerHTML = html + '<p class="ls-drawer__empty" data-empty hidden>Ninguna diapositiva coincide con la búsqueda.</p>';
    }

    filterDrawer(query) {
      const q = query.trim().toLowerCase();
      let visible = 0;
      this.el.list.querySelectorAll('.ls-item').forEach((item) => {
        const match = !q || item.dataset.search.includes(q);
        item.hidden = !match;
        if (match) visible++;
      });
      this.el.list.querySelectorAll('.ls-drawer__group').forEach((g) => { g.hidden = !!q; });
      this.el.list.querySelector('[data-empty]').hidden = visible > 0;
    }

    fillDates() {
      const compact = window.matchMedia('(max-width: 639px)').matches;
      const options = compact
        ? { weekday: 'short', day: 'numeric', month: 'short' }
        : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const today = new Date().toLocaleDateString('es-CO', options);
      const pretty = today.charAt(0).toUpperCase() + today.slice(1);
      document.querySelectorAll('[data-today], #slide-cintillo-fecha, #slide-fecha').forEach((el) => { el.textContent = pretty; });
    }

    // ------------------------------------------------------------------------
    // Render de la diapositiva activa
    // ------------------------------------------------------------------------
    renderSlide({ animate = true, direction = 'next' } = {}) {
      const i = this.currentSlideIndex;
      this.slides.forEach((slide, idx) => {
        const active = idx === i;
        slide.classList.toggle('active', active);
        slide.classList.toggle('hidden', !active);
        slide.classList.remove('ls-from-prev', 'ls-no-anim');
        slide.setAttribute('aria-hidden', String(!active));
        if (active) {
          slide.removeAttribute('inert');
          if (!animate || reducedMotion()) slide.classList.add('ls-no-anim');
          else if (direction === 'prev') slide.classList.add('ls-from-prev');
          // Reiniciar la animación de entrada
          slide.style.animation = 'none';
          void slide.offsetWidth;
          slide.style.animation = '';
        } else {
          slide.setAttribute('inert', '');
        }
      });

      const total = this.totalSlides;
      const pct = total > 1 ? (i / (total - 1)) * 100 : 100;
      this.el.bar.style.width = `${pct}%`;
      this.el.progress.setAttribute('aria-valuenow', String(i + 1));
      this.el.slideNum.textContent = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      this.el.blockText.textContent = this.slideLabel(i) || this.slideTitle(i);
      this.el.counter.textContent = `${i + 1} / ${total}`;
      this.el.prev.disabled = i === 0;
      this.el.next.disabled = i === total - 1;

      this.el.list.querySelectorAll('.ls-item').forEach((item) => {
        const current = Number(item.dataset.goto) === i;
        item.classList.toggle('is-current', current);
        if (current) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
      });

      const hash = `#slide-${i + 1}`;
      if (location.hash !== hash) history.replaceState(null, '', hash);

      this.trackProgress(i);
      refreshIcons();
      if (animate) window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }

    trackProgress(i) {
      const key = this.meta.lesson;
      const entry = this.progress[key] || { seen: [], total: this.totalSlides };
      if (!entry.seen.includes(i)) entry.seen.push(i);
      entry.total = this.totalSlides;
      entry.last = i;
      entry.title = this.meta.title;
      entry.updatedAt = new Date().toISOString();
      this.progress[key] = entry;
      storage.write(PROGRESS_KEY, this.progress);

      const seen = new Set(entry.seen);
      this.el.list.querySelectorAll('.ls-item').forEach((item) => item.classList.toggle('is-seen', seen.has(Number(item.dataset.goto))));
      this.el.seenText.textContent = `${seen.size} / ${this.totalSlides}`;
      this.el.seenMeter.style.width = `${Math.round((seen.size / this.totalSlides) * 100)}%`;
    }

    // ------------------------------------------------------------------------
    // Navegación (API pública, retrocompatible)
    // ------------------------------------------------------------------------
    goToSlide(index) {
      const target = Number(index);
      if (!Number.isInteger(target) || target < 0 || target >= this.totalSlides) return;
      const direction = target < this.currentSlideIndex ? 'prev' : 'next';
      const changed = target !== this.currentSlideIndex;
      this.currentSlideIndex = target;
      this.closeDialogs();
      this.renderSlide({ animate: changed, direction });
    }
    nextSlide() { if (this.currentSlideIndex < this.totalSlides - 1) this.goToSlide(this.currentSlideIndex + 1); }
    prevSlide() { if (this.currentSlideIndex > 0) this.goToSlide(this.currentSlideIndex - 1); }

    openDialog(dialog) {
      if (!dialog || dialog.open) return;
      this.closeDialogs();
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      if (dialog === this.el.drawer) {
        this.el.search.value = '';
        this.filterDrawer('');
        const current = this.el.list.querySelector('.is-current');
        if (current) current.scrollIntoView({ block: 'center' });
        (current || this.el.search).focus();
      }
      refreshIcons();
    }
    closeDialogs() {
      [this.el?.drawer, this.el?.help].forEach((d) => { if (d && d.open) d.close(); });
    }
    toggleDrawer() { this.el.drawer.open ? this.closeDialogs() : this.openDialog(this.el.drawer); }
    toggleMenu() { this.toggleDrawer(); }
    toggleDrawerMenu() { this.toggleDrawer(); }
    closeMenu() { this.closeDialogs(); }
    toggleHelpModal() { this.el.help.open ? this.closeDialogs() : this.openDialog(this.el.help); }

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => this.toast('El navegador no permitió la pantalla completa'));
      } else {
        document.exitFullscreen?.();
      }
    }

    toast(message) {
      const el = this.el.toast;
      el.textContent = message;
      el.classList.add('is-visible');
      clearTimeout(this.toastId);
      this.toastId = setTimeout(() => el.classList.remove('is-visible'), 2200);
    }

    // ------------------------------------------------------------------------
    // Temporizador: cronómetro ascendente o cuenta regresiva por bloque
    // ------------------------------------------------------------------------
    toggleTimer() { this.timer.running ? this.pauseTimer() : this.startTimer(); }
    startTimer() {
      if (this.timer.running) return;
      this.timer.running = true;
      this.timer.id = setInterval(() => this.tickTimer(), 1000);
      this.updateTimer();
    }
    pauseTimer() {
      this.timer.running = false;
      clearInterval(this.timer.id);
      this.updateTimer();
    }
    resetTimer() {
      this.pauseTimer();
      this.timer.mode = 'up';
      this.timer.seconds = 0;
      this.timer.target = 0;
      this.updateTimer();
    }
    setTimerPreset(minutes) {
      this.pauseTimer();
      this.timer.mode = 'down';
      this.timer.target = minutes * 60;
      this.timer.seconds = minutes * 60;
      this.startTimer();
      this.toast(`Temporizador: ${minutes} minutos`);
    }
    tickTimer() {
      if (this.timer.mode === 'down') {
        this.timer.seconds -= 1;
        if (this.timer.seconds <= 0) {
          this.timer.seconds = 0;
          this.pauseTimer();
          this.playAlert();
          this.toast('⏰ Tiempo del bloque terminado');
        }
      } else {
        this.timer.seconds += 1;
      }
      this.updateTimer();
    }
    updateTimer() {
      const { running, mode, seconds } = this.timer;
      this.el.timerDisplay.textContent = formatClock(seconds);
      this.el.timer.classList.toggle('is-running', running);
      this.el.timer.classList.toggle('is-warning', mode === 'down' && seconds > 0 && seconds <= 120);
      this.el.timerToggle.innerHTML = icon(running ? 'pause' : 'play');
      this.el.timerToggle.setAttribute('aria-label', running ? 'Pausar temporizador' : 'Iniciar temporizador');
      refreshIcons();
    }
    playAlert() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch { /* sin audio disponible */ }
    }
    // Compatibilidad con llamadas anteriores
    toggleTimerWidget() { this.toggleTimer(); }

    // ------------------------------------------------------------------------
    // Eventos
    // ------------------------------------------------------------------------
    bindEvents() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action], [data-goto], [data-preset]');
        if (!target) return;
        if (target.dataset.goto !== undefined && target.closest('.ls-drawer')) { this.goToSlide(Number(target.dataset.goto)); return; }
        if (target.dataset.preset) { this.setTimerPreset(Number(target.dataset.preset)); this.closeDialogs(); return; }
        switch (target.dataset.action) {
          case 'prev': this.prevSlide(); break;
          case 'next': this.nextSlide(); break;
          case 'index': this.toggleDrawer(); break;
          case 'help': this.toggleHelpModal(); break;
          case 'fullscreen': this.toggleFullscreen(); break;
          case 'timer-toggle': this.toggleTimer(); break;
          case 'timer-reset': this.resetTimer(); break;
          case 'close-dialog': this.closeDialogs(); break;
          default: break;
        }
      });

      // Clic en el fondo de un diálogo lo cierra
      [this.el.drawer, this.el.help].forEach((dialog) => {
        dialog.addEventListener('click', (e) => { if (e.target === dialog) this.closeDialogs(); });
      });

      this.el.search.addEventListener('input', (e) => this.filterDrawer(e.target.value));
      this.el.search.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const first = this.el.list.querySelector('.ls-item:not([hidden])');
          if (first) this.goToSlide(Number(first.dataset.goto));
        }
      });

      window.addEventListener('keydown', (e) => {
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
        if (isTyping(document.activeElement)) return;
        if (this.el.drawer.open || this.el.help.open) return; // Esc lo gestiona el <dialog>
        const onControl = document.activeElement && document.activeElement.closest('button, a, summary');
        switch (e.key) {
          case 'ArrowRight': case 'PageDown': e.preventDefault(); this.nextSlide(); break;
          case ' ': if (onControl) return; e.preventDefault(); this.nextSlide(); break;
          case 'ArrowLeft': case 'PageUp': e.preventDefault(); this.prevSlide(); break;
          case 'Home': e.preventDefault(); this.goToSlide(0); break;
          case 'End': e.preventDefault(); this.goToSlide(this.totalSlides - 1); break;
          case 'm': case 'M': e.preventDefault(); this.toggleDrawer(); break;
          case 'f': case 'F': e.preventDefault(); this.toggleFullscreen(); break;
          case 'h': case 'H': case '?': e.preventDefault(); this.toggleHelpModal(); break;
          case 't': case 'T': e.preventDefault(); this.toggleTimer(); break;
          case 'r': case 'R': e.preventDefault(); this.resetTimer(); break;
          default: break;
        }
      });

      window.addEventListener('hashchange', () => {
        const idx = this.indexFromHash();
        if (idx !== null && idx !== this.currentSlideIndex) this.goToSlide(idx);
      });

      // Enlaces internos "#slide-N" dentro del contenido
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#slide-"]');
        if (!link) return;
        const idx = Number(link.getAttribute('href').replace('#slide-', '')) - 1;
        if (Number.isInteger(idx)) { e.preventDefault(); this.goToSlide(idx); }
      });

      this.bindSwipe();
    }

    // Gesto horizontal en pantallas táctiles (ignora bloques con scroll propio)
    bindSwipe() {
      if (!this.main) return;
      let start = null;
      this.main.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) { start = null; return; }
        const scrollable = e.target.closest('pre, table, .ls-tree, .ls-table-scroll, .overflow-x-auto, input, textarea');
        start = scrollable ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
      }, { passive: true });
      this.main.addEventListener('touchend', (e) => {
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        const fast = Date.now() - start.t < 600;
        start = null;
        if (fast && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
          if (dx < 0) this.nextSlide(); else this.prevSlide();
        }
      }, { passive: true });
    }

    // ------------------------------------------------------------------------
    // Mejoras globales del contenido
    // ------------------------------------------------------------------------
    enhanceContent() {
      this.enhanceCode();
      this.enhanceTrees();
      this.enhanceTables();
      this.enhanceLinksAndMedia();
      this.enhanceQuizzes();
    }

    // Botón "Copiar" en cada bloque <pre>; los visores con botón propio se respetan
    enhanceCode() {
      const copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      this.main?.querySelectorAll('pre').forEach((pre) => {
        if (pre.closest('[data-no-copy]') || pre.querySelector('#active-code-box, [id$="-code-box"]')) return;
        if (pre.parentElement && pre.parentElement.classList.contains('ls-code')) return;
        if ((pre.textContent || '').trim().length < 8) return;
        if (!pre.hasAttribute('tabindex')) pre.setAttribute('tabindex', '0');
        const wrap = document.createElement('div');
        wrap.className = 'ls-code';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ls-copy';
        btn.setAttribute('aria-label', 'Copiar código');
        btn.innerHTML = `${copyIcon}<span>Copiar</span>`;
        btn.addEventListener('click', async () => {
          const text = (pre.querySelector('code') || pre).innerText;
          try {
            await navigator.clipboard.writeText(text);
            btn.classList.add('is-done');
            btn.querySelector('span').textContent = '¡Copiado!';
            setTimeout(() => { btn.classList.remove('is-done'); btn.querySelector('span').textContent = 'Copiar'; }, 1800);
          } catch {
            this.toast('No se pudo copiar: seleccione el texto manualmente');
          }
        });
        wrap.appendChild(btn);
      });
      // Retirar los botones de copia antiguos que cada página insertaba por su cuenta
      this.main?.querySelectorAll('.copy-code-btn').forEach((b) => b.remove());
    }

    // Árboles de directorios: conservan los espacios y cada línea se puede resaltar con un clic
    enhanceTrees() {
      if (!this.main) return;
      const hosts = new Set();
      const walker = document.createTreeWalker(this.main, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (/[├└]──/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
      });
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('pre, code, .ls-tree')) continue;
        const host = node.parentElement.closest('div, p, li, td');
        if (host) hosts.add(host);
      }

      const lineContainers = new Set();
      hosts.forEach((host) => {
        const multiline = /\n\s*\S/.test(host.textContent.trim()) && host.children.length < 60;
        if (multiline && !host.querySelector('div, p')) {
          // Árbol escrito como texto con saltos de línea (ej. Sesión 08)
          this.splitTreeLines(host);
        } else if (host.parentElement) {
          // Árbol con un <div> por línea (ej. Sesión 06)
          lineContainers.add(host.parentElement);
        }
      });
      lineContainers.forEach((container) => {
        container.classList.add('ls-tree');
        Array.from(container.children).forEach((line) => {
          if (/^(DIV|P|LI)$/.test(line.tagName)) line.classList.add('ls-tree__line');
        });
        this.makeTreeInteractive(container);
      });
    }

    splitTreeLines(host) {
      const html = host.innerHTML.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
      const parts = html.split('\n');
      const balanced = parts.every((p) => (p.match(/<span\b/g) || []).length === (p.match(/<\/span>/g) || []).length);
      host.classList.add('ls-tree');
      if (!balanced) { host.classList.add('ls-tree--pre'); return; }
      host.innerHTML = parts.map((p) => `<span class="ls-tree__line">${p || ' '}</span>`).join('');
      this.makeTreeInteractive(host);
    }

    makeTreeInteractive(container) {
      if (container.dataset.treeReady) return;
      container.dataset.treeReady = '1';
      container.setAttribute('title', 'Clic en una línea para resaltarla durante la explicación');
      container.addEventListener('click', (e) => {
        const line = e.target.closest('.ls-tree__line');
        if (!line || !container.contains(line)) return;
        line.classList.toggle('is-focus');
        container.classList.toggle('has-focus', !!container.querySelector('.ls-tree__line.is-focus'));
      });
    }

    // Tablas anchas con scroll propio en pantallas pequeñas
    enhanceTables() {
      this.main?.querySelectorAll('table').forEach((table) => {
        const parent = table.parentElement;
        if (!parent || getComputedStyle(parent).overflowX !== 'visible') return;
        const wrap = document.createElement('div');
        wrap.className = 'ls-table-scroll';
        parent.insertBefore(wrap, table);
        wrap.appendChild(table);
      });
    }

    enhanceLinksAndMedia() {
      document.querySelectorAll('a[target="_blank"]').forEach((a) => {
        const rel = new Set((a.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
        rel.add('noopener'); rel.add('noreferrer');
        a.setAttribute('rel', [...rel].join(' '));
      });
      this.main?.querySelectorAll('img').forEach((img, i) => {
        if (!img.hasAttribute('loading') && i > 0) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      });
    }

    /**
     * Autoevaluación de opción múltiple:
     * <div data-quiz>
     *   <div data-question data-answer="1" data-explain="…">
     *     <p>Pregunta</p> <ul><li>Opción A</li><li>Opción B</li>…</ul>
     *   </div> …
     * </div>
     */
    enhanceQuizzes() {
      document.querySelectorAll('[data-quiz]').forEach((quiz) => {
        const questions = Array.from(quiz.querySelectorAll('[data-question]'));
        if (!questions.length || quiz.dataset.ready) return;
        quiz.dataset.ready = '1';
        let correct = 0;
        let answered = 0;

        const score = document.createElement('div');
        score.className = 'ls-score';
        score.innerHTML = `<div><p>Autoevaluación</p><strong data-score>0 / ${questions.length}</strong></div><p data-score-msg>Responde cada pregunta: la retroalimentación aparece al instante.</p>`;
        quiz.prepend(score);

        questions.forEach((q, qi) => {
          const answer = Number(q.dataset.answer);
          const prompt = q.querySelector('p');
          const options = Array.from(q.querySelectorAll('li')).map((li) => li.innerHTML);
          q.className = 'ls-quiz';
          q.innerHTML = `
            <p class="ls-quiz__q"><span>${String(qi + 1).padStart(2, '0')}</span><span style="color:inherit;font-family:inherit">${prompt ? prompt.innerHTML : ''}</span></p>
            <div class="ls-quiz__options" role="group" aria-label="Opciones de la pregunta ${qi + 1}">
              ${options.map((o, oi) => `<button type="button" class="ls-quiz__opt" data-opt="${oi}"><b>${String.fromCharCode(65 + oi)}</b><span>${o}</span></button>`).join('')}
            </div>
            <p class="ls-quiz__feedback" role="status" aria-live="polite"></p>`;

          const feedback = q.querySelector('.ls-quiz__feedback');
          const explain = q.dataset.explain || '';
          q.querySelectorAll('.ls-quiz__opt').forEach((btn) => {
            btn.addEventListener('click', () => {
              const chosen = Number(btn.dataset.opt);
              const ok = chosen === answer;
              q.querySelectorAll('.ls-quiz__opt').forEach((b) => {
                b.disabled = true;
                if (Number(b.dataset.opt) === answer) b.classList.add('is-correct');
              });
              if (!ok) btn.classList.add('is-wrong');
              feedback.className = `ls-quiz__feedback ${ok ? 'is-ok' : 'is-ko'}`;
              feedback.innerHTML = `${ok ? '✅ ¡Correcto!' : '💡 Aún no.'} ${explain}`;
              answered += 1;
              if (ok) correct += 1;
              score.querySelector('[data-score]').textContent = `${correct} / ${questions.length}`;
              if (answered === questions.length) {
                const pct = correct / questions.length;
                score.querySelector('[data-score-msg]').textContent = pct === 1
                  ? '¡Dominio total! Estás listo para la sustentación.'
                  : pct >= 0.6 ? 'Buen avance: repasa las preguntas marcadas en naranja.' : 'Repasa las diapositivas clave con el instructor antes de sustentar.';
              }
            });
          });
        });

        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'ls-btn ls-quiz__retry';
        retry.textContent = 'Reiniciar autoevaluación';
        retry.addEventListener('click', () => {
          correct = 0; answered = 0;
          score.querySelector('[data-score]').textContent = `0 / ${questions.length}`;
          score.querySelector('[data-score-msg]').textContent = 'Responde cada pregunta: la retroalimentación aparece al instante.';
          quiz.querySelectorAll('.ls-quiz__opt').forEach((b) => { b.disabled = false; b.classList.remove('is-correct', 'is-wrong'); });
          quiz.querySelectorAll('.ls-quiz__feedback').forEach((f) => { f.className = 'ls-quiz__feedback'; f.textContent = ''; });
        });
        quiz.appendChild(retry);
      });
    }
  }

  SlidePresenter.__v2 = true;
  window.SlidePresenter = SlidePresenter;

  const boot = () => { if (!(window.presenter instanceof SlidePresenter)) new SlidePresenter(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
