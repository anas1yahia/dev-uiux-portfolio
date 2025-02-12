/**
 * PORTFOLIO SPLIT PANE RESIZE CONTROLLER
 * Handles horizontal/vertical resizing of dev/design sections based on viewport
 */
class SplitPaneController {
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

  initializeEventListeners() {
    // Mouse events
    this.divider.addEventListener('mousedown', this.handleDragStart.bind(this));
    document.addEventListener('mousemove', this.handleDragMove.bind(this));
    document.addEventListener('mouseup', this.handleDragEnd.bind(this));

    // Touch events with conditional preventDefault
    this.divider.addEventListener('touchstart', (e) => {
      console.log('Touchstart event:', e);
      // Always prevent default to capture touchstart
      e.preventDefault();
      this.handleDragStart(e.touches[0]);
    });
    
    document.addEventListener('touchmove', (e) => {
      // Prevent scrolling only if dragging; otherwise allow scroll
      if (this.isDragging) {
        e.preventDefault();
      }
      console.log('Touchmove event:', e);
      this.handleDragMove(e.touches[0]);
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      console.log('Touchend event:', e);
      this.handleDragEnd();
    });

    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  handleDragStart(e) {
    console.log('Drag started at:', e.clientX, e.clientY);
    this.isDragging = true;
    document.body.style.cursor = this.getCursorStyle();
  }

  handleDragMove(e) {
    if (!this.isDragging) return;
    console.log('Drag moving at:', e.clientX, e.clientY);
    if (this.isDesktopViewport()) {
      this.handleHorizontalResize(e.clientX);
    } else {
      this.handleVerticalResize(e.clientY);
    }
  }

  handleDragEnd() {
    console.log('Drag ended');
    this.isDragging = false;
    document.body.style.cursor = 'default';
  }

  handleWindowResize() {
    if (this.isDesktopViewport()) {
      this.resetDesktopLayout();
    } else {
      this.resetMobileLayout();
    }
  }

  isDesktopViewport() {
    return window.innerWidth >= 1024;
  }

  getCursorStyle() {
    return this.isDesktopViewport() ? 'col-resize' : 'row-resize';
  }

  handleHorizontalResize(clientX) {
    const containerWidth = this.container.offsetWidth;
    const percentage = (clientX / containerWidth) * 100;
    const boundedPercentage = Math.max(this.MIN_SIZE_PERCENTAGE, Math.min(this.MAX_SIZE_PERCENTAGE, percentage));
    
    this.primarySection.style.width = `${boundedPercentage}%`;
    this.secondarySection.style.width = `${100 - boundedPercentage}%`;
  }

  handleVerticalResize(clientY) {
    const containerHeight = this.container.offsetHeight;
    const percentage = (clientY / containerHeight) * 100;
    const boundedPercentage = Math.max(this.MIN_SIZE_PERCENTAGE, Math.min(this.MAX_SIZE_PERCENTAGE, percentage));
    
    this.primarySection.style.height = `${boundedPercentage}vh`;
    this.secondarySection.style.height = `${100 - boundedPercentage}vh`;
  }

  resetDesktopLayout() {
    this.primarySection.style.height = '100%';
    this.secondarySection.style.height = '100%';
  }

  
  resetMobileLayout() {
    // Set each section to half the viewport height with smooth scrolling enabled
    this.primarySection.style.width = '100%';
    this.primarySection.style.height = '50vh';
    this.primarySection.style.overflowY = 'auto';
    this.primarySection.style.webkitOverflowScrolling = 'touch';
  
    this.secondarySection.style.width = '100%';
    this.secondarySection.style.height = '50vh';
    this.secondarySection.style.overflowY = 'auto';
    this.secondarySection.style.webkitOverflowScrolling = 'touch';
  }
  
  }


  // Add touch event handlers
document.addEventListener('DOMContentLoaded', () => {
  const divider = document.getElementById('divider');
  const leftPanel = document.querySelector('#dev-section');
  const rightPanel = document.querySelector('#design-section');
  let isDragging = false;
  let startY = 0;
  let startHeight = 0;

  // Touch events for mobile
  divider.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
    startY = e.touches[0].clientY;
    startHeight = leftPanel.offsetHeight;
    
    // Add visual feedback
    divider.classList.add('active');
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaY = e.touches[0].clientY - startY;
    const newHeight = Math.max(100, Math.min(startHeight + deltaY, window.innerHeight - 100));
    
    leftPanel.style.height = `${newHeight}px`;
    rightPanel.style.height = `${window.innerHeight - newHeight}px`;
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
    divider.classList.remove('active');
  });

  // Prevent scrolling when touching the divider
  divider.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
});
  
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



// GitHub API Integration

const GITHUB_USERNAME = 'anas1yahia';
async function fetchGitHubRepos() {
  const projectsGrid = document.getElementById('projects-grid');
  const GITHUB_TOKEN = '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'; // Replace with your GitHub token

  try {
    projectsGrid.innerHTML = `<div class="flex justify-center py-8 col-span-full">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#58a6ff]"></div>
    </div>`;

    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`
    };

    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=5`, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    if (Array.isArray(repos)) {
      projectsGrid.innerHTML = repos.map(repo => `
        <article class="relative overflow-hidden group
                       bg-gradient-to-br from-[#1e3a8a]/30 to-[#1e1e1e]/80
                       backdrop-filter backdrop-blur-lg
                       border border-white/10 rounded-lg p-4
                       shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                       hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.47)]
                       transition-all duration-300">

        <!-- Glass Overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>

          <!-- Content -->
          <div class="relative z-10">
            <!-- Project Header -->
            <div class="flex justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-[#ff5f56] rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-[#ffbd2e] rounded-full animate-pulse delay-100"></div>
                <div class="w-2 h-2 bg-[#27c93f] rounded-full animate-pulse delay-200"></div>
              </div>
              <span class="text-[#7ee787] font-mono text-sm">${repo.private ? 'private' : 'public'}</span>
            </div>

            <!-- Project Info -->
            <div class="mb-4 border-l-2 border-blue-500/20 pl-4">
              <h2 class="text-lg font-bold font-mono flex items-center gap-2">
                <svg class="w-4 h-4 text-[#7ee787]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01">
                  </path>
                </svg>
                ${repo.name}
              </h2>
              <p class="text-[#7d8590] font-mono">${repo.description || 'No description available'}</p>
            </div>

            <!-- Project Stats -->
            <div class="grid grid-cols-2 gap-4 mb-4 font-mono text-xs">
              <div class="flex items-center gap-2 text-[#7d8590]">
                <span class="h-1 w-8 bg-gradient-to-r from-[#238636] to-[#238636]/50 rounded"></span>
                <span>${repo.language || 'N/A'}</span>
              </div>
              <div class="flex items-center gap-2 text-[#7d8590]">
                <span class="h-1 w-8 bg-gradient-to-r from-[#58a6ff] to-[#58a6ff]/50 rounded"></span>
                <span>⭐ ${repo.stargazers_count}</span>
              </div>
            </div>

            <!-- Project Actions -->
            <div class="flex items-center justify-between border-t border-white/5 pt-4">
              <a href="${repo.html_url}" target="_blank"
                 class="flex items-center gap-2 text-[#7d8590] font-mono text-sm hover:text-[#58a6ff] transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                <span>Source</span>
              </a>
              ${repo.homepage ? `
                <a href="${repo.homepage}" target="_blank"
                   class="flex items-center gap-2 text-[#7d8590] font-mono text-sm hover:text-[#58a6ff] transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span>Demo</span>
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Network Activity Lines -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-[#58a6ff] to-transparent
                          transform translate-y-full animate-network-line"></div>
              <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-[#58a6ff] to-transparent
                          transform translate-y-full animate-network-line delay-300"></div>
            </div>
          </div>
        </article>
      `).join('');
    } else {
      projectsGrid.innerHTML = `
        <div class="text-center text-[#ff5f56] font-mono py-8 col-span-full">
          Error: Could not load projects. Invalid data received from GitHub API.
        </div>
      `;
      console.error('GitHub API returned non-array:', repos);
    }
  } catch (error) {
    console.error('GitHub API Error:', error);
    projectsGrid.innerHTML = `
      <div class="text-center text-[#ff5f56] font-mono py-8 col-span-full">
        Error loading projects: ${error.message}
      </div>
    `;
  }
};

// Initialize GitHub projects on page load
document.addEventListener('DOMContentLoaded', fetchGitHubRepos);




// Figma API Integration
const FIGMA_ACCESS_TOKEN = 'figd_n2R8S_Dj58mKLbrUikzXkupolJAfYqE5I0pu5kLk';
const FIGMA_TEAM_ID = '1468794464974120304';

async function getFigmaProjectFiles(projectId) {
  try {
    const response = await fetch(`https://api.figma.com/v1/projects/${projectId}/files`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN
      }
    });
    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error('Files fetch error:', error);
    return [];
  }
}

function renderFigmaProject(file) {
  return `
    <div class="group p-6 rounded-xl relative
                bg-white/80 backdrop-blur-sm
                border border-[#193549]/10
                hover:shadow-lg transition-all duration-300">
      
      ${file.thumbnail_url ? `
        <div class="relative mb-6 overflow-hidden rounded-lg bg-gray-50 aspect-video">
          <img src="${file.thumbnail_url}" 
               alt="${file.name}"
               class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity">
          </div>
        </div>
      ` : ''}

      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 text-xs font-medium
                     bg-[#00bcd4]/5 text-[#00bcd4]/80 rounded-full">
            ${new Date(file.last_modified).toLocaleDateString()}
          </span>
        </div>

        <div>
          <span class="text-xs text-[#00bcd4]/60 font-mono">// figma.file</span>
          <h3 class="text-xl font-bold text-[#193549]">${file.name}</h3>
        </div>

        <div class="flex flex-wrap gap-3 pt-4">
          <a href="https://www.figma.com/file/${file.key}" 
             target="_blank"
             class="inline-flex items-center gap-2 px-4 py-2 
                    bg-[#1E1E1E] text-white rounded-lg
                    hover:bg-[#2d2d2d] transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 38 57" fill="none">
              <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
              <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/>
              <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
              <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
              <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
            </svg>
            Open File
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderFigmaProjects(files) {
  const projectsContainer = document.querySelector('#design-projects');
  if (!projectsContainer) return;
  projectsContainer.innerHTML = files.map(file => renderFigmaProject(file)).join('');
}

async function fetchRecentFigmaFiles() {
  const projectsContainer = document.querySelector('#design-projects');
  if (!projectsContainer) return;

  try {
    projectsContainer.innerHTML = `
      <div class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#00bcd4]"></div>
      </div>
    `;

    const projectsResponse = await fetch(`https://api.figma.com/v1/teams/${FIGMA_TEAM_ID}/projects`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN
      }
    });
    
    const projectsData = await projectsResponse.json();
    
    const allFiles = [];
    for (const project of projectsData.projects) {
      const files = await getFigmaProjectFiles(project.id);
      allFiles.push(...files);
    }

    const recentFiles = allFiles
      .sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified))
      .slice(0, 5);

    renderFigmaProjects(recentFiles);
  } catch (error) {
    console.error('Figma API Error:', error);
    projectsContainer.innerHTML = `
      <div class="text-center text-[#ff5f56] font-mono py-8">
        ${error.message}
      </div>
    `;
  }
}

// Initialize both APIs
document.addEventListener('DOMContentLoaded', () => {
  fetchGitHubRepos();
  fetchRecentFigmaFiles();
});




 /*mobile view switch*/

 document.addEventListener('DOMContentLoaded', () => {
  const devSection = document.getElementById('dev-section');
  const designSection = document.getElementById('design-section');
  const toggleButton = document.querySelector('#toggle-section');

  

  toggleButton.addEventListener('click', () => {
    if (designSection.style.display === 'none') {
      designSection.style.display = 'block';
      devSection.style.display = 'none';
      toggleButton.textContent = 'Switch to Dev Portfolio';
    } else {
      designSection.style.display = 'none';
      devSection.style.display = 'block';
      toggleButton.textContent = 'Switch to UI/UX Portfolio';
      
    }
  });
});







