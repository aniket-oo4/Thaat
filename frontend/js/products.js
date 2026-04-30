/**
 * THAAT — Products Module
 * Load, filter, sort, render product cards, quick view modal
 */
'use strict';

const ProductsModule = (() => {
    const API = 'https://thaat-api.onrender.com/api';
    let products = [];
    let currentCategory = 'all';
    let currentSort = 'default';

    const defaultProducts = [
        // Shirts
        { id: 's1', name: 'Classic Oxford Shirt', category: 'shirts', price: 1299, originalPrice: 1899, description: 'Premium cotton Oxford shirt with button-down collar. Perfect for formal and casual occasions.', sizes: ['S','M','L','XL','XXL'], badge: 'sale', image: '' },
        { id: 's2', name: 'Slim Fit Linen Shirt', category: 'shirts', price: 1499, originalPrice: null, description: 'Breathable linen shirt with a modern slim fit. Ideal for summer outings.', sizes: ['S','M','L','XL'], badge: 'new', image: '' },
        { id: 's3', name: 'Casual Check Shirt', category: 'shirts', price: 999, originalPrice: 1499, description: 'Comfortable checkered shirt for everyday wear. Soft cotton fabric.', sizes: ['M','L','XL','XXL'], badge: 'sale', image: '' },
        { id: 's4', name: 'Mandarin Collar Shirt', category: 'shirts', price: 1199, originalPrice: null, description: 'Stylish mandarin collar with kurta-style placket. Indo-western look.', sizes: ['S','M','L','XL'], badge: null, image: '' },
        { id: 's5', name: 'Printed Casual Shirt', category: 'shirts', price: 899, originalPrice: 1299, description: 'Trendy printed shirt with abstract patterns. Stand out in style.', sizes: ['S','M','L','XL','XXL'], badge: 'sale', image: '' },

        // Jeans
        { id: 'j1', name: 'Slim Fit Dark Wash', category: 'jeans', price: 1799, originalPrice: 2499, description: 'Premium stretch denim with dark wash. Slim fit with tapered leg.', sizes: ['28','30','32','34','36'], badge: 'sale', image: '' },
        { id: 'j2', name: 'Relaxed Fit Cargo Jeans', category: 'jeans', price: 1999, originalPrice: null, description: 'Comfortable relaxed fit with cargo pockets. Heavy-duty denim.', sizes: ['30','32','34','36'], badge: 'new', image: '' },
        { id: 'j3', name: 'Classic Straight Fit', category: 'jeans', price: 1499, originalPrice: null, description: 'Timeless straight fit blue jeans. Mid-rise comfort.', sizes: ['28','30','32','34','36','38'], badge: null, image: '' },
        { id: 'j4', name: 'Ripped Skinny Jeans', category: 'jeans', price: 1699, originalPrice: 2299, description: 'Trendy ripped skinny jeans with stretch. Modern distressed look.', sizes: ['28','30','32','34'], badge: 'sale', image: '' },

        // Footwear
        { id: 'f1', name: 'Leather Formal Shoes', category: 'footwear', price: 2999, originalPrice: 4499, description: 'Genuine leather formal shoes with cushioned insole. Perfect for office and events.', sizes: ['7','8','9','10','11'], badge: 'sale', image: '' },
        { id: 'f2', name: 'Canvas Sneakers', category: 'footwear', price: 1299, originalPrice: null, description: 'Lightweight canvas sneakers for casual wear. Available in multiple colors.', sizes: ['7','8','9','10'], badge: 'new', image: '' },
        { id: 'f3', name: 'Sports Running Shoes', category: 'footwear', price: 1999, originalPrice: 2999, description: 'High-performance running shoes with EVA sole. Breathable mesh upper.', sizes: ['7','8','9','10','11'], badge: 'sale', image: '' },
        { id: 'f4', name: 'Ethnic Kolhapuri Chappal', category: 'footwear', price: 899, originalPrice: null, description: 'Handcrafted genuine leather Kolhapuri chappal. Traditional Maharashtrian craft.', sizes: ['7','8','9','10','11'], badge: null, image: '' },

        // Accessories
        { id: 'a1', name: 'Leather Belt', category: 'accessories', price: 699, originalPrice: 999, description: 'Premium leather belt with brushed metal buckle. Adjustable fit.', sizes: ['Free'], badge: 'sale', image: '' },
        { id: 'a2', name: 'Analog Wrist Watch', category: 'accessories', price: 2499, originalPrice: null, description: 'Elegant analog watch with leather strap. Water resistant up to 30m.', sizes: ['Free'], badge: 'new', image: '' },
        { id: 'a3', name: 'Aviator Sunglasses', category: 'accessories', price: 799, originalPrice: 1199, description: 'Classic aviator sunglasses with UV400 protection. Lightweight metal frame.', sizes: ['Free'], badge: 'sale', image: '' },
        { id: 'a4', name: 'Cotton Handkerchief Set', category: 'accessories', price: 399, originalPrice: null, description: 'Set of 6 premium cotton handkerchiefs. Elegant embroidered edges.', sizes: ['Free'], badge: null, image: '' }
    ];

    function init() {
        loadProducts();
        initFilters();
        initSort();
    }

    function loadProducts() {
        // Try API first, then localStorage, then defaults
        fetch(API + '/products').then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                if (Array.isArray(data) && data.length) {
                    products = data.map(p => ({
                        id: p.id || p._id,
                        name: p.name,
                        category: (p.category || '').toLowerCase(),
                        price: p.price,
                        originalPrice: p.originalPrice || null,
                        description: p.description || '',
                        sizes: p.sizes || ['M','L','XL'],
                        badge: p.badge || null,
                        image: p.imageUrl || p.image || ''
                    }));
                    localStorage.setItem('thaat_products', JSON.stringify(products));
                } else throw '';
            })
            .catch(() => {
                try {
                    const raw = localStorage.getItem('thaat_products');
                    if (raw) products = JSON.parse(raw);
                } catch {}
                if (!products.length) products = [...defaultProducts];
            })
            .finally(() => render());
    }

    function initFilters() {
        document.querySelectorAll('.products__filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.products__filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                render();
            });
        });
    }

    function initSort() {
        const sort = document.getElementById('productSort');
        if (sort) {
            sort.addEventListener('change', () => {
                currentSort = sort.value;
                render();
            });
        }
    }

    function getFiltered() {
        let list = currentCategory === 'all' ? [...products] : products.filter(p => p.category === currentCategory);

        switch (currentSort) {
            case 'price-low':  list.sort((a, b) => a.price - b.price); break;
            case 'price-high': list.sort((a, b) => b.price - a.price); break;
            case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        return list;
    }

    function render() {
        const grid = document.getElementById('productsGrid');
        const countEl = document.getElementById('productsCount');
        if (!grid) return;

        const list = getFiltered();
        if (countEl) countEl.textContent = list.length + ' products';

        if (!list.length) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--g400)"><p style="font-size:1.2rem">No products found in this category.</p><p style="margin-top:.5rem;font-family:var(--ff-mr)" class="marathi">लवकरच नवीन collection येतंय! 🎉</p></div>';
            return;
        }

        grid.innerHTML = list.map(p => renderCard(p)).join('');
        initRevealForProducts();
    }

    function renderCard(p) {
        const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
        const badgeHtml = p.badge === 'sale' && discount > 0
            ? `<span class="product-card__badge product-card__badge--sale">-${discount}%</span>`
            : p.badge === 'new'
                ? `<span class="product-card__badge product-card__badge--new">NEW</span>`
                : '';

        const emoji = getCatEmoji(p.category);
        const imgContent = p.image
            ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">`
            : `<div>${emoji}</div>`;

        return `
        <div class="product-card reveal-up" data-id="${p.id}">
            <div class="product-card__img">
                ${imgContent}
                ${badgeHtml}
                <button class="product-card__quick-view" onclick="ProductsModule.showQuickView('${p.id}')" aria-label="Quick View">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Quick View
                </button>
            </div>
            <div class="product-card__body">
                <div class="product-card__cat">${p.category}</div>
                <h3 class="product-card__name">${escapeHtml(p.name)}</h3>
                <div class="product-card__price">
                    <span class="product-card__current">₹${p.price.toLocaleString('en-IN')}</span>
                    ${p.originalPrice ? `<span class="product-card__original">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                    ${discount > 0 ? `<span class="product-card__discount">${discount}% off</span>` : ''}
                </div>
                <div class="product-card__sizes">
                    ${p.sizes.map(s => `<button class="product-card__size" data-size="${s}" onclick="this.parentElement.querySelectorAll('.product-card__size').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')">${s}</button>`).join('')}
                </div>
                <button class="product-card__add" onclick="ProductsModule.addToCart('${p.id}', this)">
                    Add to Cart
                </button>
            </div>
        </div>`;
    }

    function addToCart(id, btnEl) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const card = btnEl.closest('.product-card');
        const selectedSize = card?.querySelector('.product-card__size.selected');

        if (!selectedSize) {
            showToast('कृपया साईझ सिलेक्ट करा! (Please select a size)', 'error');
            const sizesRow = card?.querySelector('.product-card__sizes');
            if (sizesRow) {
                sizesRow.style.outline = '2px solid #e74c3c';
                sizesRow.style.borderRadius = '6px';
                setTimeout(() => { sizesRow.style.outline = ''; }, 2000);
            }
            return;
        }

        CartModule.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            size: selectedSize.dataset.size,
            category: product.category,
            image: product.image || ''
        });

        showToast(`${product.name} (${selectedSize.dataset.size}) added to cart! 🛒`);
    }

    function showQuickView(id) {
        const p = products.find(x => x.id === id);
        if (!p) return;
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;

        const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
        const emoji = getCatEmoji(p.category);

        document.getElementById('qvImg').innerHTML = p.image
            ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">`
            : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:5rem;background:var(--g100)">${emoji}</div>`;

        document.getElementById('qvCat').textContent = p.category;
        document.getElementById('qvTitle').textContent = p.name;
        document.getElementById('qvDesc').textContent = p.description;
        document.getElementById('qvPrice').innerHTML =
            `<span class="product-card__current">₹${p.price.toLocaleString('en-IN')}</span>` +
            (p.originalPrice ? `<span class="product-card__original">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : '') +
            (discount > 0 ? `<span class="product-card__discount">${discount}% off</span>` : '');

        document.getElementById('qvSizes').innerHTML = p.sizes.map(s =>
            `<button class="product-card__size" data-size="${s}" onclick="this.parentElement.querySelectorAll('.product-card__size').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')">${s}</button>`
        ).join('');

        document.getElementById('qvAdd').onclick = () => {
            const sel = document.querySelector('#qvSizes .product-card__size.selected');
            if (!sel) { showToast('कृपया साईझ सिलेक्ट करा!', 'error'); return; }
            CartModule.addItem({ id: p.id, name: p.name, price: p.price, size: sel.dataset.size, category: p.category, image: p.image || '' });
            showToast(`${p.name} (${sel.dataset.size}) added! 🛒`);
            closeQuickView();
        };

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeQuickView() {
        const modal = document.getElementById('quickViewModal');
        if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
    }

    // Close quick view on overlay click or close button
    document.addEventListener('click', e => {
        if (e.target.id === 'quickViewModal') closeQuickView();
        if (e.target.id === 'quickViewClose' || e.target.closest('#quickViewClose')) closeQuickView();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuickView(); });

    function initRevealForProducts() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.05 });
        document.querySelectorAll('#productsGrid .reveal-up').forEach(el => obs.observe(el));
    }

    function getProducts(cat = 'all') {
        return cat === 'all' ? [...products] : products.filter(p => p.category === cat);
    }

    return { init, addToCart, showQuickView, closeQuickView, getProducts };
})();
