// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Highlight active nav link based on scroll position
const sections = document.querySelectorAll('main .section, .hero');
const navItems = document.querySelectorAll('.nav-link');

const setActiveLink = () => {
  let current = sections[0].id;
  const scrollPos = window.scrollY + window.innerHeight * 0.35;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      current = section.id;
    }
  });

  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
  });
};

// Hero parallax — background scrolls slower than the page, fades on exit
const heroContent = document.querySelector('.hero-content');
const heroSwimmer = document.querySelector('.hero-swimmer');
const heroEl = document.querySelector('.hero');

let ticking = false;
const onScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      setActiveLink();

      const heroHeight = heroEl.offsetHeight;
      const y = Math.min(window.scrollY, heroHeight);
      const progress = y / heroHeight;

      if (heroContent) {
        heroContent.style.transform = `translateY(${y * 0.35}px)`;
        heroContent.style.opacity = String(1 - progress * 1.2);
      }
      if (heroSwimmer) {
        heroSwimmer.style.transform = `translateY(${y * 0.15}px)`;
      }

      ticking = false;
    });
    ticking = true;
  }
};

window.addEventListener('scroll', onScroll);
setActiveLink();

// Scroll-reveal animations (fade + scale up as elements enter the viewport)
const revealEls = document.querySelectorAll('.reveal');

revealEls.forEach(el => {
  const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
  const index = siblings.indexOf(el);
  el.style.transitionDelay = `${Math.min(index * 80, 400)}ms`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// Swipeable fin carousel
const finCarousel = document.getElementById('finCarousel');
const finCards = finCarousel ? Array.from(finCarousel.querySelectorAll('.fin-card')) : [];
const finPrev = document.getElementById('finPrev');
const finNext = document.getElementById('finNext');
const dots = document.querySelectorAll('#finDots .dot');
const swipeHint = document.getElementById('swipeHint');

function dismissSwipeHint() {
  if (swipeHint) swipeHint.classList.add('hidden');
}

function cardStep() {
  if (finCards.length < 2) return 0;
  return finCards[1].offsetLeft - finCards[0].offsetLeft;
}

function goToCard(index) {
  if (!finCarousel || !finCards[index]) return;
  const target = finCards[index].offsetLeft - (finCarousel.clientWidth - finCards[index].clientWidth) / 2;
  finCarousel.scrollTo({ left: target, behavior: 'smooth' });
}

if (finPrev && finNext && finCarousel) {
  finPrev.addEventListener('click', () => {
    dismissSwipeHint();
    finCarousel.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  });
  finNext.addEventListener('click', () => {
    dismissSwipeHint();
    finCarousel.scrollBy({ left: cardStep(), behavior: 'smooth' });
  });
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    dismissSwipeHint();
    goToCard(Number(dot.dataset.index));
  });
});

// Sync active dot with whichever card is most centered
let dotSyncTimer = null;
if (finCarousel) {
  finCarousel.addEventListener('scroll', () => {
    clearTimeout(dotSyncTimer);
    dotSyncTimer = setTimeout(() => {
      const center = finCarousel.scrollLeft + finCarousel.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      finCards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === closest));
    }, 80);
  }, { passive: true });
}

// Drag-to-swipe with mouse (touch scrolling works natively)
if (finCarousel) {
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  finCarousel.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return; // native touch scrolling handles this
    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = finCarousel.scrollLeft;
    finCarousel.classList.add('dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    finCarousel.scrollLeft = startScroll - dx;
  });

  window.addEventListener('pointerup', () => {
    if (isDown) dismissSwipeHint();
    isDown = false;
    finCarousel.classList.remove('dragging');
  });

  finCarousel.addEventListener('touchstart', dismissSwipeHint, { passive: true, once: true });

  // Prevent the click on a card from firing right after a drag
  finCarousel.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
}

// Click-to-zoom lightbox with pinch/scroll zoom and drag-to-pan
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightboxStage');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxClose = document.getElementById('lightboxClose');

let scale = 1;
let panX = 0;
let panY = 0;

function applyTransform(withTransition) {
  lightboxContent.classList.toggle('zooming', !withTransition);
  lightboxContent.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function clampPan() {
  const maxPan = Math.max(0, (scale - 1) * 260);
  panX = Math.max(-maxPan, Math.min(maxPan, panX));
  panY = Math.max(-maxPan, Math.min(maxPan, panY));
}

function resetZoom() {
  scale = 1;
  panX = 0;
  panY = 0;
  applyTransform(true);
}

function openLightbox(svgEl) {
  lightboxContent.innerHTML = '';
  lightboxContent.appendChild(svgEl.cloneNode(true));
  resetZoom();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.zoomable').forEach(button => {
  button.addEventListener('click', () => {
    const svg = button.querySelector('svg');
    if (svg) openLightbox(svg);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

// Scroll wheel zoom
lightboxStage.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.15 : 0.15;
  scale = Math.min(4, Math.max(1, scale + delta));
  if (scale === 1) { panX = 0; panY = 0; }
  clampPan();
  applyTransform(true);
}, { passive: false });

// Double-click to toggle zoom
lightboxStage.addEventListener('dblclick', () => {
  if (scale > 1) {
    resetZoom();
  } else {
    scale = 2.2;
    applyTransform(true);
  }
});

// Drag-to-pan (mouse + single-finger touch when zoomed in)
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panOriginX = 0;
let panOriginY = 0;

lightboxStage.addEventListener('pointerdown', (e) => {
  if (scale <= 1) return;
  isPanning = true;
  lightboxStage.classList.add('panning');
  panStartX = e.clientX;
  panStartY = e.clientY;
  panOriginX = panX;
  panOriginY = panY;
});

window.addEventListener('pointermove', (e) => {
  if (!isPanning) return;
  panX = panOriginX + (e.clientX - panStartX);
  panY = panOriginY + (e.clientY - panStartY);
  clampPan();
  applyTransform(false);
});

window.addEventListener('pointerup', () => {
  isPanning = false;
  lightboxStage.classList.remove('panning');
});

// Pinch-to-zoom on touch devices
let pinchStartDist = 0;
let pinchStartScale = 1;
let lastTapTime = 0;

function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

lightboxStage.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    pinchStartDist = touchDistance(e.touches);
    pinchStartScale = scale;
  } else if (e.touches.length === 1) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      // double-tap
      if (scale > 1) {
        resetZoom();
      } else {
        scale = 2.2;
        applyTransform(true);
      }
    }
    lastTapTime = now;
  }
}, { passive: true });

lightboxStage.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist = touchDistance(e.touches);
    const ratio = dist / pinchStartDist;
    scale = Math.min(4, Math.max(1, pinchStartScale * ratio));
    if (scale === 1) { panX = 0; panY = 0; }
    clampPan();
    applyTransform(false);
  }
}, { passive: false });
