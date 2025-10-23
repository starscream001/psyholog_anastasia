// main.js — меню, слайдер, дипломы (лайтбокс)
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initMobileDrawer();
        initHeroSlider();
        initDiplomaLightbox();
    });

    /* =========================
       1) Mobile Drawer Menu
    ========================= */
    function initMobileDrawer() {
        const header = document.querySelector('.header') || document.querySelector('.site-header');
        const btn = document.querySelector('.menu-btn');
        const menu = document.querySelector('.menu');
        if (!header || !btn || !menu) return;

        let drawer = document.querySelector('.menu--drawer');
        if (!drawer) {
            drawer = document.createElement('nav');
            drawer.className = 'menu menu--drawer';
            drawer.setAttribute('aria-label', 'Меню (мобильно)');
            const src = menu.querySelector('.menu__list') || menu;
            drawer.innerHTML = `<ul class="menu__list">${src.innerHTML}</ul>`;
            header.after(drawer);
        }

        let mask = document.querySelector('.drawer-mask');
        if (!mask) {
            mask = document.createElement('div');
            mask.className = 'drawer-mask';
            document.body.append(mask);
        }

        const open = () => {
            drawer.classList.add('open');
            mask.classList.add('drawer-mask--show');
            document.body.style.overflow = 'hidden';
            btn.setAttribute('aria-expanded', 'true');
        };
        const close = () => {
            drawer.classList.remove('open');
            mask.classList.remove('drawer-mask--show');
            document.body.style.overflow = '';
            btn.setAttribute('aria-expanded', 'false');
        };

        btn.addEventListener('click', () =>
            drawer.classList.contains('open') ? close() : open()
        );
        mask.addEventListener('click', close);
        drawer.addEventListener('click', (e) => {
            if (e.target.closest('a')) close();
        });
        window.addEventListener('resize', () => {
            if (innerWidth > 960) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    /* =========================
       2) Hero Slider (autoplay + swipe)
       Markup: .hero .slider > .slide.current  (img или background)
       Data: data-autoplay="true" data-interval="6000"
    ========================= */
    function initHeroSlider() {
        const root = document.querySelector('.hero .slider');
        if (!root) return;

        const slides = Array.from(root.querySelectorAll('.slide'));
        if (!slides.length) return;

        let i = slides.findIndex((s) => s.classList.contains('current'));
        if (i < 0) {
            i = 0;
            slides[0].classList.add('current');
        }

        // controls
        const ensureBtn = (cls, label, text) => {
            let b = root.querySelector(`.slider-btn.${cls}`);
            if (!b) {
                b = document.createElement('button');
                b.className = `slider-btn ${cls}`;
                b.setAttribute('aria-label', label);
                b.textContent = text;
                root.appendChild(b);
            }
            return b;
        };
        const prevBtn = ensureBtn('prev', 'Предыдущий слайд', '‹');
        const nextBtn = ensureBtn('next', 'Следующий слайд', '›');

        // dots
        let dots = root.querySelector('.slider-dots');
        if (!dots) {
            dots = document.createElement('div');
            dots.className = 'slider-dots';
            root.appendChild(dots);
        }
        function buildDots() {
            dots.innerHTML = '';
            slides.forEach((_, idx) => {
                const d = document.createElement('button');
                d.type = 'button';
                d.addEventListener('click', () => go(idx));
                dots.appendChild(d);
            });
        }
        buildDots();

        const sync = () => {
            slides.forEach((s, idx) => s.classList.toggle('current', idx === i));
            Array.from(dots.children).forEach((d, idx) =>
                d.classList.toggle('active', idx === i)
            );
        };
        const go = (to) => {
            i = (to + slides.length) % slides.length;
            sync();
        };
        const next = () => go(i + 1);
        const prev = () => go(i - 1);

        prevBtn.addEventListener('click', prev);
        nextBtn.addEventListener('click', next);
        sync();

        // autoplay
        const autoplay = root.dataset.autoplay === 'true';
        const interval = +root.dataset.interval || 7000;
        let timer = null;
        const start = () => {
            if (!autoplay) return;
            stop();
            timer = setInterval(next, interval);
        };
        const stop = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        };
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();

        // touch / mouse swipe
        let x0 = 0,
            x = 0,
            dragging = false;

        const onStart = (e) => {
            dragging = true;
            x0 = (e.touches ? e.touches[0].clientX : e.clientX) || 0;
            stop();
        };
        const onMove = (e) => {
            if (!dragging) return;
            x = ((e.touches ? e.touches[0].clientX : e.clientX) || 0) - x0;
        };
        const onEnd = () => {
            if (!dragging) return;
            dragging = false;
            if (Math.abs(x) > 40) (x < 0 ? next() : prev());
            x = 0;
            start();
        };

        root.addEventListener('touchstart', onStart, { passive: true });
        root.addEventListener('touchmove', onMove, { passive: true });
        root.addEventListener('touchend', onEnd);
        root.addEventListener('mousedown', onStart);
        root.addEventListener('mousemove', onMove);
        root.addEventListener('mouseup', onEnd);
        root.addEventListener('mouseleave', () => { dragging = false; x = 0; });
    }

    /* =========================
       3) Diplomas Lightbox
       Markup: .rail > a[href] > img
       Behaviors: next/prev, close on ✕, overlay click, Esc, swipe down
    ========================= */
    function initDiplomaLightbox() {
        const rail = document.querySelector('.rail');
        if (!rail) return;

        const links = Array.from(rail.querySelectorAll('a[href]'));
        if (!links.length) return;

        // reuse if exists
        let lb = document.querySelector('.lightbox');
        if (!lb) {
            lb = document.createElement('div');
            lb.className = 'lightbox';
            lb.innerHTML = `
        <button class="lb-close" aria-label="Закрыть">✕</button>
        <button class="lb-prev" aria-label="Назад">‹</button>
        <figure><img alt=""></figure>
        <button class="lb-next" aria-label="Вперёд">›</button>
      `;
            document.body.appendChild(lb);
        }
        const img = lb.querySelector('img');
        const fig = lb.querySelector('figure');
        const btnClose = lb.querySelector('.lb-close');
        const btnPrev = lb.querySelector('.lb-prev');
        const btnNext = lb.querySelector('.lb-next');

        let k = 0;

        const openLb = (idx) => {
            k = ((idx % links.length) + links.length) % links.length;
            img.src = links[k].href;
            img.alt = links[k].querySelector('img')?.alt || '';
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        };
        const closeLb = () => {
            lb.classList.remove('open');
            document.body.style.overflow = '';
        };
        const next = () => openLb(k + 1);
        const prev = () => openLb(k - 1);

        // buttons
        btnClose.onclick = closeLb;
        btnPrev.onclick = prev;
        btnNext.onclick = next;

        // click overlay or figure (but not image) => close
        lb.addEventListener('click', (e) => {
            if (e.target === lb || e.target === fig) closeLb();
        });

        // Esc / arrows
        document.addEventListener('keydown', (e) => {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') return void closeLb();
            if (e.key === 'ArrowRight') return void next();
            if (e.key === 'ArrowLeft') return void prev();
        });

        // touch: left/right to navigate, swipe down to close
        let sx = 0, sy = 0, dx = 0, dy = 0, drag = false;
        lb.addEventListener('touchstart', (e) => {
            drag = true;
            sx = e.touches[0].clientX;
            sy = e.touches[0].clientY;
        }, { passive: true });
        lb.addEventListener('touchmove', (e) => {
            if (!drag) return;
            dx = e.touches[0].clientX - sx;
            dy = e.touches[0].clientY - sy;
        }, { passive: true });
        lb.addEventListener('touchend', () => {
            if (!drag) return;
            drag = false;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
            } else if (dy > 60) {
                closeLb();
            }
            dx = dy = 0;
        });

        // open
        links.forEach((a, idx) => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                openLb(idx);
            });
        });
    }
})();
