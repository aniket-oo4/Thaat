/**
 * THAAT — Main JS
 * Cursor, Header, Mobile Nav, Scroll Reveal, Stats, Reviews, Search, Size Guide, Newsletter, Back-to-top
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initHeader();
    initMobileNav();
    initScrollReveal();
    initStatCounters();
    initReviews();
    initSearch();
    initSizeGuide();
    initNewsletter();
    initAnnouncement();
    initBackToTop();
    initCategoryLinks();
    ProductsModule.init();
    CartModule.init();
    OrderModal.init();
});

/* ── Custom Cursor ─────────────────────── */
function initCursor() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor__dot');
    const outline = document.querySelector('.cursor__outline');
    if (!cursor || !dot || !outline) return;

    let mx = 0, my = 0, ox = 0, oy = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });

    (function loop() {
        ox += (mx - ox) * 0.15; oy += (my - oy) * 0.15;
        outline.style.left = ox + 'px'; outline.style.top = oy + 'px';
        requestAnimationFrame(loop);
    })();

    const sel = 'a,button,.product-card,.cat-card,.feature-card,.review-card,.contact__card,.puneri-cta__card';
    document.addEventListener('mouseover', e => { if (e.target.closest(sel)) cursor.classList.add('cursor--hover'); }, { passive: true });
    document.addEventListener('mouseout', e => { if (e.target.closest(sel)) cursor.classList.remove('cursor--hover'); }, { passive: true });
}

/* ── Header ─────────────────────────────── */
function initHeader() {
    const header = document.getElementById('header');
    let last = 0;
    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        header.classList.toggle('header--hidden', y > 120 && y > last);
        header.classList.toggle('header--scrolled', y > 20);
        last = y;
    }, { passive: true });
}

/* ── Mobile Nav ─────────────────────────── */
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('active');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', open);
    });

    menu.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            menu.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

/* ── Scroll Reveal ──────────────────────── */
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-up');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), i * 60);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
}

/* ── Stats Counter ──────────────────────── */
function initStatCounters() {
    const nums = document.querySelectorAll('.hero__stat-num');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { animateNum(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
}

function animateNum(el) {
    const target = parseInt(el.dataset.count);
    const dur = 2000, start = performance.now();
    (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const val = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = val;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    })(start);
}

/* ── Reviews (from localStorage / defaults) ── */
function initReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    let reviews = [];
    try {
        const raw = localStorage.getItem('thaat_reviews');
        if (raw) reviews = JSON.parse(raw).filter(r => r.isActive !== false);
    } catch {}

    if (!reviews.length) {
        reviews = [
            { name: 'Rahul S.', location: 'Mumbai', rating: 5, text: 'Amazing shirt quality! The fabric is premium and the fit is perfect. Definitely ordering more.' },
            { name: 'Amit K.', location: 'Pune', rating: 5, text: 'Best jeans I\'ve bought online. Comfortable, stylish, and great value for money. THAAT चा माल एकदम भारी!' },
            { name: 'Vishal P.', location: 'Nagpur', rating: 5, text: 'Fast delivery and excellent packaging. Shoes were exactly as shown. Very happy customer!' },
            { name: 'Sagar M.', location: 'Delhi', rating: 5, text: 'THAAT has become my go-to brand for men\'s wear. Quality never disappoints!' },
            { name: 'Rohit D.', location: 'Bangalore', rating: 5, text: 'Ordered 3 shirts and all fantastic. Great color options and perfect stitching.' },
            { name: 'Prasad J.', location: 'Kolhapur', rating: 4, text: 'Excellent customer service on WhatsApp. They helped me choose the right size. पुणेकरांचा भरोसा!' }
        ];
    }

    grid.innerHTML = reviews.map(r => `
        <div class="review-card reveal-up">
            <div class="review-card__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <p class="review-card__text">"${escapeHtml(r.text)}"</p>
            <div class="review-card__author">
                <div class="review-card__avatar">${r.name.charAt(0)}</div>
                <div>
                    <div class="review-card__name">${escapeHtml(r.name)}</div>
                    <div class="review-card__loc">${escapeHtml(r.location)}</div>
                </div>
            </div>
        </div>
    `).join('');

    // Re-observe these for reveal
    grid.querySelectorAll('.reveal-up').forEach(el => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1 });
        obs.observe(el);
    });
}

/* ── Search ─────────────────────────────── */
function initSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    const openBtn = document.getElementById('searchToggle');
    const closeBtn = document.getElementById('searchClose');
    if (!overlay || !input) return;

    openBtn?.addEventListener('click', () => { overlay.classList.add('active'); input.focus(); });
    closeBtn?.addEventListener('click', () => { overlay.classList.remove('active'); input.value = ''; results.innerHTML = ''; });
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.classList.remove('active'); } });

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (q.length < 2) { results.innerHTML = '<p style="text-align:center;color:var(--g400);padding:1rem">Type at least 2 characters...</p>'; return; }
            const products = ProductsModule.getProducts('all');
            const matches = products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
            if (!matches.length) {
                results.innerHTML = '<p style="text-align:center;color:var(--g400);padding:2rem">No products found. Try different words!</p>';
                return;
            }
            results.innerHTML = matches.map(p => `
                <div class="search-result" onclick="document.getElementById('searchOverlay').classList.remove('active');document.querySelector('[data-category=${p.category}]')?.click();location.hash='collections';">
                    <div class="search-result__img">${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius)">` : getCatEmoji(p.category)}</div>
                    <div class="search-result__info">
                        <div class="search-result__name">${escapeHtml(p.name)}</div>
                        <div style="font-size:.75rem;color:var(--g400)">${p.category}</div>
                    </div>
                    <div class="search-result__price">₹${p.price}</div>
                </div>
            `).join('');
        }, 250);
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('active'); });
}

function getCatEmoji(cat) {
    return { shirts: '👕', jeans: '👖', footwear: '👞', accessories: '⌚' }[cat] || '🏷️';
}

/* ── Size Guide Tabs ────────────────────── */
function initSizeGuide() {
    document.querySelectorAll('.sg-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sg-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sg-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('guide-' + tab.dataset.guide)?.classList.add('active');
        });
    });
}

/* ── Newsletter ─────────────────────────── */
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const phone = document.getElementById('newsletterPhone');
        const error = document.getElementById('newsletterError');
        const success = document.getElementById('newsletterSuccess');
        error.textContent = ''; success.textContent = '';

        const val = phone.value.trim();
        if (!/^[6-9]\d{9}$/.test(val)) {
            error.textContent = 'Please enter a valid 10-digit Indian mobile number.';
            phone.focus();
            return;
        }

        // Save subscriber locally
        try {
            const subs = JSON.parse(localStorage.getItem('thaat_subscribers') || '[]');
            if (!subs.includes(val)) { subs.push(val); localStorage.setItem('thaat_subscribers', JSON.stringify(subs)); }
        } catch {}

        success.textContent = '✅ Subscribed successfully! We\'ll send updates on WhatsApp.';
        phone.value = '';
        setTimeout(() => success.textContent = '', 5000);
    });
}

/* ── Announcement Bar ───────────────────── */
function initAnnouncement() {
    const bar = document.getElementById('announcement');
    const close = document.getElementById('announcementClose');
    if (!bar || !close) return;

    if (sessionStorage.getItem('thaat_announce_closed')) { bar.classList.add('hidden'); return; }
    close.addEventListener('click', () => { bar.classList.add('hidden'); sessionStorage.setItem('thaat_announce_closed', '1'); });
}

/* ── Back to Top ────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.pageYOffset > 600); }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Category Card Links ────────────────── */
function initCategoryLinks() {
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', e => {
            e.preventDefault();
            const cat = card.dataset.filter;
            const target = document.querySelector(`.products__filter[data-category="${cat}"]`);
            if (target) {
                document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => target.click(), 400);
            }
        });
    });
}

/* ── Smooth Scroll ──────────────────────── */
document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) {
        e.preventDefault();
        const offset = document.getElementById('header')?.offsetHeight || 72;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
    }
});

/* ── Utils ──────────────────────────────── */
function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; setTimeout(() => t.remove(), 300); }, 3000);
}
