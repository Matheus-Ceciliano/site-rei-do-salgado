/* ========================================
   O REI DO SALGADO — script.js
   ======================================== */

'use strict';

// ── Helpers ──────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ══════════════════════════════════════════
// 0. HERO CAROUSEL — slide horizontal
// ══════════════════════════════════════════
(function initHeroCarousel() {
  const track    = document.getElementById('carousel-track');
  const slides   = document.querySelectorAll('.carousel-slide');
  const dots     = document.querySelectorAll('.carousel-dot');
  const prevBtn  = document.getElementById('carousel-prev');
  const nextBtn  = document.getElementById('carousel-next');
  const carousel = document.getElementById('hero-carousel');

  if (!track || !slides.length) return;

  const TOTAL      = slides.length;
  const AUTOPLAY_MS = 4000;
  let current      = 0;
  let autoTimer    = null;
  let isAnimating  = false;

  /* Move the track to the given index */
  function slideTo(index, instant) {
    if (isAnimating) return;
    isAnimating = true;

    const next = ((index % TOTAL) + TOTAL) % TOTAL;

    // Disable transition for instant jump (future: infinite loop)
    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.55s cubic-bezier(0.77,0,0.175,1)';
    }

    track.style.transform = `translateX(-${next * 100}%)`;

    // Update active classes
    slides[current].classList.remove('is-active');
    slides[next].classList.add('is-active');

    // Update dots
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');
    dots[next].classList.add('active');
    dots[next].setAttribute('aria-selected', 'true');

    current = next;

    // Release lock after transition
    setTimeout(() => { isAnimating = false; }, instant ? 0 : 580);
  }

  function next() { slideTo(current + 1, false); }
  function prev() { slideTo(current - 1, false); }

  /* Autoplay */
  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() { clearInterval(autoTimer); }

  /* Mark first slide */
  slides[0].classList.add('is-active');

  /* Buttons */
  nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

  /* Dots */
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      slideTo(Number(dot.dataset.index), false);
      startAutoplay();
    });
  });

  /* Pause on hover */
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  /* Touch / swipe */
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
      startAutoplay();
    }
  }, { passive: true });

  /* Keyboard */
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); startAutoplay(); }
  });

  startAutoplay();
})();

// ══════════════════════════════════════════
// 1. NAVBAR: scroll effect (glass on scroll)
// ══════════════════════════════════════════
(function initNavbar() {
  const header = $('header');

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

// ══════════════════════════════════════════
// 2. MOBILE HAMBURGER MENU
// ══════════════════════════════════════════
(function initMobileMenu() {
  const hamburger = $('hamburger');
  const mobileNav = $('mobile-nav');
  const body = document.body;

  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      mobileNav.classList.add('open');
      mobileNav.style.display = 'flex';
      body.style.overflow = 'hidden'; // prevent scroll when menu open
    } else {
      closeMenu();
    }
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    body.style.overflow = '';
    // Wait for fade transition before hiding
    setTimeout(() => {
      if (!mobileNav.classList.contains('open')) {
        mobileNav.style.display = 'none';
      }
    }, 350);
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close when any mobile link is clicked
  $$('.mob-link, #mob-pedir').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });
})();

// ══════════════════════════════════════════
// 3. SMOOTH SCROLL (nav & footer links)
// ══════════════════════════════════════════
(function initSmoothScroll() {
  const HEADER_OFFSET = 80; // fixed header height

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
})();

// ══════════════════════════════════════════
// 4. ACTIVE NAV LINK (highlight on scroll)
// ══════════════════════════════════════════
(function initActiveNav() {
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav-links a:not(.btn)');

  function updateActive() {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').slice(1);
      link.style.color = href === currentId ? 'var(--orange)' : '';
      link.style.fontWeight = href === currentId ? '700' : '';
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

// ══════════════════════════════════════════
// 5. CARRINHO & DRAWER
// ══════════════════════════════════════════
(function initCart() {
  const toast    = $('toast');
  const toastMsg = $('toast-msg');
  const badge    = $('cart-badge');
  const cartDrawer = $('cart-drawer');
  const cartOverlay = $('cart-overlay');
  const cartItemsContainer = $('cart-items-container');
  const cartTotalValue = $('cart-total-value');
  const closeCartBtn = $('close-cart');
  const checkoutBtn = $('checkout-btn');
  const navCartBtns = document.querySelectorAll('.nav-cart');

  const clearCartBtn = $('clear-cart-btn');

  let cart = [];
  let toastTimer = null;

  function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
      // Reset all buttons
      cart.forEach(item => {
        const btn = document.querySelector(`.btn-add[data-item="${item.name}"]`);
        if (btn) {
          btn.textContent = '+';
          btn.style.background = '';
        }
      });
      cart = [];
      updateCartUI();
      saveCart();
    }
  }

  // Load from localStorage
  function loadCart() {
    const saved = localStorage.getItem('rei_do_salgado_cart');
    if (saved) {
      cart = JSON.parse(saved);
      updateCartUI();
      // Restore green buttons
      cart.forEach(item => {
        const btn = document.querySelector(`.btn-add[data-item="${item.name}"]`);
        if (btn) {
          btn.textContent = '✓';
          btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        }
      });
    }
  }

  function saveCart() {
    localStorage.setItem('rei_do_salgado_cart', JSON.stringify(cart));
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateCartUI() {
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.classList.add('has-items');
    } else {
      badge.classList.remove('has-items');
    }

    // Render Items
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty-msg">Seu carrinho está vazio 🥟</div>';
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
          </div>
          <div class="cart-item-controls">
            <button onclick="window.changeQty('${item.name}', -1)">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button onclick="window.changeQty('${item.name}', 1)">+</button>
          </div>
        </div>
      `).join('');
    }

    // Update Total
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalValue.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
    
    saveCart();
  }

  window.changeQty = (name, delta) => {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
        // Reset button if removed from cart
        const btn = document.querySelector(`.btn-add[data-item="${name}"]`);
        if (btn) {
          btn.textContent = '+';
          btn.style.background = '';
        }
      }
      updateCartUI();
    }
  };

  function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ name, price: parseFloat(price), quantity: 1 });
    }
    updateCartUI();
    showToast(name);
  }

  function showToast(itemName) {
    toastMsg.textContent = `"${itemName}" adicionado ao carrinho! 🎉`;
    toast.classList.remove('show');
    clearTimeout(toastTimer);
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
  }

  // Listen for clicks on add buttons
  document.querySelectorAll('.btn-add').forEach((btn) => {
    btn.addEventListener('click', function () {
      const itemName = this.dataset.item || 'Item';
      const itemPrice = this.dataset.price || '0';
      addToCart(itemName, itemPrice);

      // Visual feedback: turns green and stays green
      this.textContent = '✓';
      this.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    });
  });

  // Open/Close interactions
  if (navCartBtns) {
    navCartBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    }));
  }
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }

  // WhatsApp Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5562985653861?text=${encoded}`, '_blank');
  });

  loadCart();

})();

// ══════════════════════════════════════════
// 6. INTERSECTION OBSERVER — Fade In Animation
// ══════════════════════════════════════════
(function initFadeIn() {
  const fadeEls = $$('.fade-in');

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show all
    fadeEls.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach((el) => observer.observe(el));
})();

// ══════════════════════════════════════════
// 7. STAGGERED CARD ANIMATION
// ══════════════════════════════════════════
(function initCardStagger() {
  const cards = $$('.menu-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
})();

// ══════════════════════════════════════════
// 8. HEADER HIDE ON SCROLL DOWN / SHOW ON UP
// ══════════════════════════════════════════
(function initHeaderHide() {
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function update() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      // scrolling down — hide
      header.style.transform = 'translateY(-100%)';
    } else {
      // scrolling up — show
      header.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Add transition to header
  header.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.35s ease, box-shadow 0.35s ease';
})();

// ══════════════════════════════════════════
// 9. COUNTER ANIMATION (hero stats)
// ══════════════════════════════════════════
(function initCounters() {
  const statEls = $$('.stat-number[data-target]');
  if (!statEls.length) return;

  let animated = false;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix  || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 7000; // ms
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const value    = target * eased;

      el.textContent = decimals > 0
        ? value.toFixed(decimals) + suffix
        : Math.round(value) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Pulse effect when counter finishes
        el.style.transform = 'scale(1.2)';
        el.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
        }, 200);
      }
    }

    requestAnimationFrame(tick);
  }

  function runAll() {
    if (animated) return;
    animated = true;
    statEls.forEach((el, i) => {
      // Stagger each counter by 150ms
      setTimeout(() => animateCounter(el), i * 150);
    });
  }

  // Trigger when hero section enters view
  const hero = document.getElementById('home');
  if (!hero) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      runAll();
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  observer.observe(hero);
})();

console.log('%c👑 O Rei do Salgado', 'color:#FF6B00;font-size:20px;font-weight:800;');
console.log('%cFeito com ❤️ e muito salgado!', 'color:#FFB800;font-size:13px;');

// ══════════════════════════════════════════
// 10. CARD CAROUSELS (Cardápio por categoria) — Infinite
// ══════════════════════════════════════════
(function initCardCarousels() {
  const GAP         = 24;  // px — deve bater com o gap do CSS
  const AUTOPLAY_MS = 3500;

  function getVisibleCount() {
    return window.innerWidth <= 768 ? 2 : 4;
  }

  function setupCarousel(wrap) {
    const track = wrap.querySelector('.cards-track');
    const originalCards = Array.from(track.querySelectorAll('.menu-card:not(.clone)'));
    const prevBtn = wrap.querySelector('.cards-prev');
    const nextBtn = wrap.querySelector('.cards-next');
    
    let VISIBLE = getVisibleCount();

    // Clean up existing clones if any
    track.querySelectorAll('.clone').forEach(c => c.remove());

    if (!track || originalCards.length <= VISIBLE) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      track.style.transform = 'translateX(0)';
      return;
    }

    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';

    // Clonagem para loop infinito
    const clonesBefore = originalCards.slice(-VISIBLE).map(c => {
      const clone = c.cloneNode(true);
      clone.classList.add('clone');
      return clone;
    });
    const clonesAfter  = originalCards.slice(0, VISIBLE).map(c => {
      const clone = c.cloneNode(true);
      clone.classList.add('clone');
      return clone;
    });
    
    clonesAfter.forEach(c => track.appendChild(c));
    clonesBefore.reverse().forEach(c => track.insertBefore(c, track.firstChild));

    let current = VISIBLE;
    let isMoving = false;
    let autoTimer = null;

    function getCardWidth() {
      const firstCard = track.querySelector('.menu-card');
      return firstCard.getBoundingClientRect().width + GAP;
    }

    function updatePosition(instant = false) {
      track.style.transition = instant ? 'none' : 'transform 0.5s cubic-bezier(0.77, 0, 0.175, 1)';
      track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    }

    function jumpCheck() {
      if (current >= originalCards.length + VISIBLE) {
        current = VISIBLE;
        updatePosition(true);
      } else if (current < VISIBLE) {
        current = originalCards.length + current;
        updatePosition(true);
      }
    }

    function move(dir) {
      if (isMoving) return;
      isMoving = true;
      current += dir;
      updatePosition();
      setTimeout(() => {
        jumpCheck();
        isMoving = false;
      }, 550);
    }

    function next() { move(1); }
    function prev() { move(-1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, AUTOPLAY_MS);
    }
    function stopAuto() { clearInterval(autoTimer); }

    // Use clone to reset event listeners
    const newNext = nextBtn.cloneNode(true);
    const newPrev = prevBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);

    newNext.addEventListener('click', () => { next(); startAuto(); });
    newPrev.addEventListener('click', () => { prev(); startAuto(); });

    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);

    // Swipe support
    let touchX = 0;
    wrap.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
      const d = e.changedTouches[0].clientX - touchX;
      if (Math.abs(d) > 40) { d < 0 ? next() : prev(); startAuto(); }
    }, { passive: true });

    updatePosition(true);
    startAuto();
  }

  const carousels = document.querySelectorAll('.cards-carousel-wrap');
  carousels.forEach(setupCarousel);

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      carousels.forEach(setupCarousel);
    }, 250);
  });
})();

// ══════════════════════════════════════════
// 11. NEWSLETTER
// ══════════════════════════════════════════
(function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('news-email');
    const email = emailInput.value;
    
    // Simulate API call
    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    
    setTimeout(() => {
      // Show success message using existing toast or alert
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-msg');
      
      if (toast && toastMsg) {
        toastMsg.textContent = `Obrigado! E-mail cadastrado com sucesso. 🎉`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
      } else {
        alert(`Obrigado! O e-mail ${email} foi cadastrado com sucesso. 🎉`);
      }
      
      form.reset();
      btn.disabled = false;
      btn.textContent = originalText;
    }, 1500);
  });
})();
