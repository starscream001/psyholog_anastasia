// main.js — бургер, аккордеоны, управление "слайдерами"
document.addEventListener('DOMContentLoaded', () => {
    // ===== Burger / Drawer =====
    const header = document.querySelector('.header');
    const btn = document.querySelector('.menu-btn');
    const menu = document.querySelector('.menu');
    // создаём Drawer из текущего меню
    let drawer = document.querySelector('.menu--drawer');
    if (!drawer) {
        drawer = document.createElement('nav');
        drawer.className = 'menu menu--drawer';
        drawer.setAttribute('aria-label', 'Меню (мобильно)');
        drawer.innerHTML = `<ul class="menu__list">${menu.querySelector('.menu__list').innerHTML}</ul>`;
        header.after(drawer);
    }
    // фон-маска
    let mask = document.querySelector('.drawer-mask');
    if (!mask) {
        mask = document.createElement('div');
        mask.className = 'drawer-mask';
        document.body.append(mask);
    }

    const openDrawer = () => {
        drawer.classList.add('menu--open');
        mask.classList.add('drawer-mask--show');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
        drawer.classList.remove('menu--open');
        mask.classList.remove('drawer-mask--show');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    btn?.addEventListener('click', () => {
        drawer.classList.contains('menu--open') ? closeDrawer() : openDrawer();
    });
    mask.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    // ===== Active link on scroll (простая подсветка) =====
    const links = [...document.querySelectorAll('.menu a[href^="#"]')];
    const ids = links.map(a => a.getAttribute('href')).filter(Boolean);
    const sections = ids.map(id => document.querySelector(id));
    const setActive = () => {
        let i = 0, y = window.scrollY + 120;
        sections.forEach((s, idx) => { if (s && s.offsetTop <= y) i = idx; });
        links.forEach(l => l.classList.remove('menu__list-link--active'));
        const activeHref = sections[i] ? '#' + sections[i].id : null;
        links.filter(l => l.getAttribute('href') === activeHref)
            .forEach(l => l.classList.add('menu__list-link--active'));
    };
    setActive(); window.addEventListener('scroll', setActive);

    // ===== Accordions (FAQ + Политика) =====
    const accordions = document.querySelectorAll('.program-accordion');
    // по умолчанию — свёрнуты
    accordions.forEach(acc => {
        acc.classList.remove('open');
        const info = acc.querySelector('.program-accordion__info');
        const content = acc.querySelector('.program-accordion__content');
        info.setAttribute('role', 'button');
        info.setAttribute('tabindex', '0');
        info.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');

        const toggle = () => {
            const isOpen = acc.classList.toggle('open');
            info.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            // плавный height
            if (isOpen) {
                content.style.display = 'block';
                const h = content.scrollHeight;
                content.style.height = '0px';
                requestAnimationFrame(() => {
                    content.style.height = h + 'px';
                });
                content.addEventListener('transitionend', () => {
                    if (acc.classList.contains('open')) {
                        content.style.height = 'auto';
                    }
                }, { once: true });
            } else {
                const h = content.scrollHeight;
                content.style.height = h + 'px';
                requestAnimationFrame(() => {
                    content.style.height = '0px';
                });
                content.addEventListener('transitionend', () => {
                    if (!acc.classList.contains('open')) {
                        content.style.display = 'none';
                    }
                }, { once: true });
            }
        };

        info.addEventListener('click', toggle);
        info.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
        // стартовое состояние: ПОЛИТИКА свёрнута, FAQ — можно раскрыть первый пункт
        const parentSection = acc.closest('#faq, #policy');
        if (parentSection && parentSection.id === 'faq') {
            // раскрываем только первый в FAQ
            const isFirst = acc === parentSection.querySelector('.program-accordion');
            if (isFirst) {
                acc.classList.add('open');
                info.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
                content.style.display = 'block';
            }
        }
        // policy остаётся закрытой — как просил
    });

    // ===== Sliders: добавим стрелки прокрутки =====
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(sl => {
        // создаём контейнер для стрелок
        const wrap = document.createElement('div');
        wrap.className = 'slider-wrap';
        sl.parentNode.insertBefore(wrap, sl);
        wrap.appendChild(sl);

        const prev = document.createElement('button');
        prev.className = 'slider-nav slider-nav--prev';
        prev.setAttribute('aria-label', 'Назад');
        prev.innerHTML = '‹';

        const next = document.createElement('button');
        next.className = 'slider-nav slider-nav--next';
        next.setAttribute('aria-label', 'Вперёд');
        next.innerHTML = '›';

        wrap.append(prev, next);

        const step = () => Math.max(280, Math.floor(wrap.clientWidth * 0.9));

        prev.addEventListener('click', () => {
            sl.scrollBy({ left: -step(), behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            sl.scrollBy({ left: step(), behavior: 'smooth' });
        });

        // показать/скрыть стрелки если контента меньше ширины
        const check = () => {
            const need = sl.scrollWidth > sl.clientWidth + 8;
            wrap.classList.toggle('slider-wrap--nav', need);
        };
        check();
        window.addEventListener('resize', check);
    });
});
