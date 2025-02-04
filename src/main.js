/**
 * PORTFOLIO SPLIT PANE RESIZE CONTROLLER
 * Handles horizontal/vertical resizing of dev/design sections based on viewport
 */
class SplitPaneController {
    /**
     * Initialize split pane controller
     * @param {string} containerId - Parent container ID
     * @param {string} dividerId - Divider element ID
     * @param {string} primarySectionId - First section ID (dev)
     * @param {string} secondarySectionId - Second section ID (design)
     */
    constructor(containerId, dividerId, primarySectionId, secondarySectionId) {
      this.container = document.getElementById(containerId);
      this.divider = document.getElementById(dividerId);
      this.primarySection = document.getElementById(primarySectionId);
      this.secondarySection = document.getElementById(secondarySectionId);
      this.isDragging = false;
      this.MIN_SIZE_PERCENTAGE = 20;
      this.MAX_SIZE_PERCENTAGE = 80;
  
      this.initializeEventListeners();
    }
  
    /** Set up event listeners for divider interaction */
    initializeEventListeners() {
      this.divider.addEventListener('mousedown', this.handleDragStart.bind(this));
      document.addEventListener('mousemove', this.handleDragMove.bind(this));
      document.addEventListener('mouseup', this.handleDragEnd.bind(this));
      window.addEventListener('resize', this.handleWindowResize.bind(this));
    }
  
    /** Handle drag start event */
    handleDragStart() {
      this.isDragging = true;
      document.body.style.cursor = this.getCursorStyle();
    }
  
    /** Handle drag movement event */
    handleDragMove(e) {
      if (!this.isDragging) return;
  
      if (this.isDesktopViewport()) {
        this.handleHorizontalResize(e.clientX);
      } else {
        this.handleVerticalResize(e.clientY);
      }
    }
  
    /** Handle drag end event */
    handleDragEnd() {
      this.isDragging = false;
      document.body.style.cursor = 'default';
    }
  
    /** Handle window resize event */
    handleWindowResize() {
      if (this.isDesktopViewport()) {
        this.resetDesktopLayout();
      } else {
        this.resetMobileLayout();
      }
    }
  
    /** Determine if current viewport is desktop size */
    isDesktopViewport() {
      return window.innerWidth >= 1024;
    }
  
    /** Get appropriate cursor style based on viewport */
    getCursorStyle() {
      return this.isDesktopViewport() ? 'col-resize' : 'row-resize';
    }
  
    /** Update section widths for horizontal resize */
    handleHorizontalResize(clientX) {
      const containerWidth = this.container.offsetWidth;
      const percentage = (clientX / containerWidth) * 100;
      const boundedPercentage = this.getBoundedPercentage(percentage);
      
      this.primarySection.style.width = `${boundedPercentage}%`;
      this.secondarySection.style.width = `${100 - boundedPercentage}%`;
    }
  
    /** Update section heights for vertical resize */
    handleVerticalResize(clientY) {
      const containerHeight = this.container.offsetHeight;
      const percentage = (clientY / containerHeight) * 100;
      const boundedPercentage = this.getBoundedPercentage(percentage);
      
      this.primarySection.style.height = `${boundedPercentage}vh`;
      this.secondarySection.style.height = `${100 - boundedPercentage}vh`;
    }
  
    /** Keep percentage within allowed bounds */
    getBoundedPercentage(percentage) {
      return Math.max(this.MIN_SIZE_PERCENTAGE, 
        Math.min(this.MAX_SIZE_PERCENTAGE, percentage));
    }
  
    /** Reset layout for desktop view */
    resetDesktopLayout() {
      this.primarySection.style.height = '100%';
      this.secondarySection.style.height = '100%';
    }
  
    /** Reset layout for mobile view */
    resetMobileLayout() {
      this.primarySection.style.width = '100%';
      this.secondarySection.style.width = '100%';
    }
  }
  
  /**
   * CANVAS ANIMATION CONTROLLER
   * Manages interactive canvas animation with trailing dots and design terms
   */
  class CanvasAnimationController {
    /**
     * Initialize canvas animation
     * @param {string} canvasId - Canvas element ID
     * @param {string} containerId - Parent container ID
     */
    constructor(canvasId, containerId) {
      this.canvas = document.getElementById(canvasId);
      this.container = document.getElementById(containerId);
      this.ctx = this.canvas.getContext('2d');
      this.dots = [];
      this.renderedWords = [];
      this.usedWords = new Set();
      this.lastTextPosition = { x: 0, y: 0 };
      this.mousePosition = { x: 0, y: 0 };
      
      this.designTerms = [
        "UI Designer", "UX Design", "Motion", "Prototype",
        "Wireframe", "User Flow", "Research", "Figma",
        "Design System", "User Testing", "Interaction"
      ];
  
      this.initializeCanvas();
      this.setupEventListeners();
      this.createDots();
      this.startAnimation();
    }
  
    /** Set up initial canvas state */
    initializeCanvas() {
      this.updateCanvasSize();
      window.addEventListener('resize', this.updateCanvasSize.bind(this));
    }
  
    /** Create initial trailing dots */
    createDots() {
      const NUM_DOTS = 5;
      for (let i = 0; i < NUM_DOTS; i++) {
        this.dots.push({
          x: this.mousePosition.x,
          y: this.mousePosition.y,
          scale: 1 - (i * 0.2),
          color: `rgba(${135 - i * 10}, ${206 - i * 5}, ${235 - i * 12}, 0.6)`,
          speed: 0.1 + (i * 0.02)
        });
      }
    }
  
    /** Update canvas dimensions */
    updateCanvasSize() {
      this.canvas.width = this.container.offsetWidth;
      this.canvas.height = window.innerHeight;
    }
  
    /** Set up mouse movement listeners */
    setupEventListeners() {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
      });
    }
  
    /** Main animation loop */
    startAnimation() {
      const animateFrame = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateDots();
        this.drawDots();
        this.handleWordGeneration();
        this.drawWords();
        requestAnimationFrame(animateFrame);
      };
      animateFrame();
    }
  
    /** Update dot positions */
    updateDots() {
      this.dots.forEach(dot => {
        dot.x += (this.mousePosition.x - dot.x) * dot.speed;
        dot.y += (this.mousePosition.y - dot.y) * dot.speed;
      });
    }
  
    /** Draw all dots on canvas */
    drawDots() {
      this.dots.slice().reverse().forEach(dot => {
        this.ctx.beginPath();
        this.ctx.fillStyle = dot.color;
        this.ctx.arc(dot.x, dot.y, 30 * dot.scale, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
  
    /** Handle design term generation */
    handleWordGeneration() {
      if (Math.random() > 0.95 && this.usedWords.size < this.designTerms.length) {
        this.addText(this.mousePosition.x + 30, this.mousePosition.y);
      }
    }
  
    /** Add new design term to canvas */
    addText(x, y) {
      const distance = Math.hypot(x - this.lastTextPosition.x, y - this.lastTextPosition.y);
      if (distance < 150) return;
  
      const availableTerms = this.designTerms.filter(term => !this.usedWords.has(term));
      if (availableTerms.length === 0) {
        this.usedWords.clear();
        return;
      }
  
      const text = availableTerms[Math.floor(Math.random() * availableTerms.length)];
      this.renderedWords.push({
        text,
        x,
        y,
        rotation: Math.random() * 40 - 20,
        alpha: 0
      });
  
      this.usedWords.add(text);
      this.lastTextPosition = { x, y };
    }
  
    /** Draw all design terms on canvas */
    drawWords() {
      this.renderedWords.forEach(word => {
        if (word.alpha < 1) word.alpha += 0.05;
        
        this.ctx.save();
        this.ctx.translate(word.x, word.y);
        this.ctx.rotate(word.rotation * Math.PI / 180);
        this.ctx.font = '28px "Indie Flower", cursive';
        this.ctx.fillStyle = `rgba(100, 149, 237, ${word.alpha})`;
        this.ctx.fillText(word.text, 0, 0);
        this.ctx.restore();
      });
    }
  }
  
  /**
   * SCROLL OBSERVER CONTROLLER
   * Handles scroll-based animations and parallax effects
   */
  class ScrollObserverController {
    constructor() {
      this.observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
      };
  
      this.initializeObservers();
      this.setupParallaxEffect();
    }
  
    /** Initialize Intersection Observers */
    initializeObservers() {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => this.handleSectionIntersection(entry));
      }, this.observerOptions);
  
      document.querySelectorAll('.reveal-section').forEach((section, index) => {
        section.style.transitionDelay = `${index * 200}ms`;
        sectionObserver.observe(section);
      });
    }
  
    /** Handle section intersection events */
    handleSectionIntersection(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    }
  
    /** Set up parallax scroll effect */
    setupParallaxEffect() {
      window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
          document.querySelectorAll('.parallax-layer').forEach(layer => {
            const depth = layer.dataset.depth || 0.1;
            const moveY = window.scrollY * depth;
            layer.style.transform = `translate3d(0, ${moveY}px, 0)`;
          });
        });
      });
    }
  }
  
  /**
   * Initialize application when DOM is ready
   */
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize split pane controller
    new SplitPaneController(
      'portfolio-container',
      'divider',
      'dev-section',
      'design-section'
    );
  
    // Initialize canvas animation
    new CanvasAnimationController(
      'drawingCanvas',
      'design-section'
    );
  
    // Initialize scroll effects
    new ScrollObserverController();
  
    // Set up card animation delays
    document.querySelectorAll('.animate-fade-up').forEach((card, index) => {
      card.style.setProperty('--index', index);
    });
  });
  
  /**
   * PROFILE IMAGE TOGGLE
   * Toggles visibility of profile image container
   */
  function toggleProfileVisibility() {
    const container = document.getElementById('profileContainer');
    container.classList.toggle('hidden');
    container.classList.toggle('flex');
  }





  /** 
   * home scroll */


  document.getElementById('home-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    const devSection = document.getElementById('dev-section');
    const designSection = document.getElementById('design-section');
    
    if (devSection) devSection.scrollTop = 0;
    if (designSection) designSection.scrollTop = 0;
});


/** About sections scroll handler */
document.querySelector('a[href="#about"]').addEventListener('click', function(e) {
  e.preventDefault();
  
  const devAbout = document.getElementById('about');
  const designAbout = document.getElementById('about-me');

  if (devAbout) {
      devAbout.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  if (designAbout) {
      designAbout.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});



/** Projects sections scroll handler */
document.querySelector('a[href="#projects"]').addEventListener('click', function(e) {
  e.preventDefault();
  
  // Target both project sections
  const devProjectsSection = document.querySelector('#dev-section #projects');
  const designProjectsSection = document.querySelector('#design-section #projects');
  
  // Scroll both sections
  if (devProjectsSection) {
      devProjectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  if (designProjectsSection) {
      designProjectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});



/* profile image */



window.toggleProfileImage = function() {
  try {
      const modal = document.getElementById('profile-modal');
      console.log('Toggle called, modal:', modal);

      if (!modal) {
          console.error('Modal element not found');
          return;
      }

      if (modal.classList.contains('hidden')) {
          // Opening
          modal.classList.remove('hidden');
          requestAnimationFrame(() => {
              modal.classList.remove('translate-y-full');
              modal.classList.remove('opacity-0');
          });
      } else {
          // Closing
          modal.classList.add('translate-y-full');
          modal.classList.add('opacity-0');
          setTimeout(() => {
              modal.classList.add('hidden');
          }, 300);
      }
  } catch (error) {
      console.error('Error in toggleProfileImage:', error);
  }
};

// Verify initialization
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('profile-modal');
  console.log('Modal initialized:', modal);
});