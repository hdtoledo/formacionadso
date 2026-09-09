/**
 * Presenter Engine para Videobeam SENA ADSO
 * Manejo de diapositivas, atajos de teclado, temporizador y utilidades de clase
 */

class SlidePresenter {
  constructor() {
    this.slides = document.querySelectorAll('.slide-content');
    this.totalSlides = this.slides.length;
    this.currentSlideIndex = 0;
    
    // Elementos UI
    this.progressBar = document.getElementById('presentation-progress');
    this.counterEl = document.getElementById('slide-counter');
    this.prevBtn = document.getElementById('btn-prev-slide');
    this.nextBtn = document.getElementById('btn-next-slide');
    this.fullscreenBtn = document.getElementById('btn-fullscreen');
    this.helpModal = document.getElementById('help-modal');
    this.menuDrawer = document.getElementById('menu-drawer');
    
    // Temporizador
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.timerRunning = false;
    this.timerDisplay = document.getElementById('timer-display');
    this.timerStartBtn = document.getElementById('btn-timer-start');
    this.timerResetBtn = document.getElementById('btn-timer-reset');

    this.init();
  }

  init() {
    if (this.totalSlides === 0) return;

    // Renderizar iconos de Lucide automáticamente
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Recuperar última diapositiva si existe en hash o sessionStorage
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const idx = parseInt(hash.replace('#slide-', ''), 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < this.totalSlides) {
        this.currentSlideIndex = idx;
      }
    }

    this.renderSlide();
    this.bindEvents();
    this.setupCodeCopy();
    this.setupTimer();
  }

  renderSlide() {
    this.slides.forEach((slide, idx) => {
      if (idx === this.currentSlideIndex) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Actualizar Contador
    if (this.counterEl) {
      this.counterEl.textContent = `${this.currentSlideIndex + 1} / ${this.totalSlides}`;
    }

    // Actualizar Barra de Progreso
    if (this.progressBar) {
      const progressPercent = ((this.currentSlideIndex + 1) / this.totalSlides) * 100;
      this.progressBar.style.width = `${progressPercent}%`;
    }

    // Actualizar estado de botones
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentSlideIndex === 0;
      this.prevBtn.style.opacity = this.currentSlideIndex === 0 ? '0.4' : '1';
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentSlideIndex === this.totalSlides - 1;
      this.nextBtn.style.opacity = this.currentSlideIndex === this.totalSlides - 1 ? '0.4' : '1';
    }

    // Hash en la URL para compartir enlace directo a una slide
    window.location.hash = `slide-${this.currentSlideIndex + 1}`;

    // Marcar item en el menú si existe
    document.querySelectorAll('.menu-slide-item').forEach((item, idx) => {
      if (idx === this.currentSlideIndex) {
        item.classList.add('bg-sena-green/20', 'border-sena-green', 'text-emerald-300');
      } else {
        item.classList.remove('bg-sena-green/20', 'border-sena-green', 'text-emerald-300');
      }
    });

    // Scroll hacia el inicio de la slide
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextSlide() {
    if (this.currentSlideIndex < this.totalSlides - 1) {
      this.currentSlideIndex++;
      this.renderSlide();
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderSlide();
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlideIndex = index;
      this.renderSlide();
      this.closeMenu();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen no permitido:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleHelpModal() {
    if (!this.helpModal) return;
    this.helpModal.classList.toggle('hidden');
  }

  toggleMenu() {
    if (!this.menuDrawer) return;
    this.menuDrawer.classList.toggle('hidden');
  }

  closeMenu() {
    if (this.menuDrawer) {
      this.menuDrawer.classList.add('hidden');
    }
  }

  bindEvents() {
    // Teclas de navegación
    window.addEventListener('keydown', (e) => {
      // Ignorar si el usuario está escribiendo en un input o textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Espacio avanza
          e.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case 'h':
        case 'H':
        case '?':
          e.preventDefault();
          this.toggleHelpModal();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.toggleMenu();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          this.toggleTimerWidget();
          break;
        case 'Escape':
          if (this.helpModal && !this.helpModal.classList.contains('hidden')) {
            this.helpModal.classList.add('hidden');
          }
          if (this.menuDrawer && !this.menuDrawer.classList.contains('hidden')) {
            this.menuDrawer.classList.add('hidden');
          }
          break;
      }
    });

    // Botones prev / next
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Cerrar modal de ayuda con botón o backdrop
    const closeHelpBtn = document.getElementById('btn-close-help');
    if (closeHelpBtn) {
      closeHelpBtn.addEventListener('click', () => this.toggleHelpModal());
    }
    if (this.helpModal) {
      this.helpModal.addEventListener('click', (e) => {
        if (e.target === this.helpModal) this.toggleHelpModal();
      });
    }

    // Botón abrir menú
    const openMenuBtn = document.getElementById('btn-open-menu');
    if (openMenuBtn) {
      openMenuBtn.addEventListener('click', () => this.toggleMenu());
    }
    const closeMenuBtn = document.getElementById('btn-close-menu');
    if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', () => this.closeMenu());
    }
  }

  setupCodeCopy() {
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const codeElement = targetId 
          ? document.getElementById(targetId) 
          : button.closest('.code-box')?.querySelector('code');

        if (!codeElement) return;

        const textToCopy = codeElement.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalHTML = button.innerHTML;
          button.innerHTML = `
            <svg class="w-4 h-4 text-emerald-400 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-emerald-400 font-semibold text-xs">¡Copiado!</span>
          `;
          button.classList.add('border-emerald-500', 'bg-emerald-950/40');

          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('border-emerald-500', 'bg-emerald-950/40');
          }, 2000);
        }).catch(err => {
          console.error('Error al copiar al portapapeles:', err);
        });
      });
    });
  }

  setupTimer() {
    if (!this.timerDisplay) return;

    if (this.timerStartBtn) {
      this.timerStartBtn.addEventListener('click', () => {
        if (this.timerRunning) {
          this.pauseTimer();
        } else {
          this.startTimer();
        }
      });
    }

    if (this.timerResetBtn) {
      this.timerResetBtn.addEventListener('click', () => this.resetTimer());
    }

    // Presets de tiempo (ej. 15m, 45m, 70m)
    document.querySelectorAll('[data-timer-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.getAttribute('data-timer-preset'), 10);
        if (!isNaN(minutes)) {
          this.timerSeconds = minutes * 60;
          this.updateTimerDisplay();
        }
      });
    });
  }

  startTimer() {
    this.timerRunning = true;
    if (this.timerStartBtn) {
      this.timerStartBtn.innerHTML = `
        <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <span class="text-xs text-amber-300 font-medium">Pausar</span>
      `;
    }

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        this.updateTimerDisplay();
      } else {
        this.pauseTimer();
        this.playTimerAlert();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
    if (this.timerStartBtn) {
      this.timerStartBtn.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span class="text-xs text-emerald-300 font-medium">Iniciar</span>
      `;
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 0;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    if (!this.timerDisplay) return;
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Cambiar color si faltan menos de 2 minutos
    if (this.timerSeconds > 0 && this.timerSeconds <= 120) {
      this.timerDisplay.classList.add('text-red-400', 'animate-pulse');
      this.timerDisplay.classList.remove('text-slate-100');
    } else {
      this.timerDisplay.classList.remove('text-red-400', 'animate-pulse');
      this.timerDisplay.classList.add('text-slate-100');
    }
  }

  playTimerAlert() {
    // Beep sutil usando AudioContext nativo sin depender de archivos de audio externos
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Alerta de temporizador finalizado');
    }
  }

  toggleTimerWidget() {
    const widget = document.getElementById('timer-floating-widget');
    if (widget) {
      widget.classList.toggle('hidden');
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.presenter = new SlidePresenter();
});
