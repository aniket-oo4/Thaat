/**
 * THAAT — Cart Module
 * Cart sidebar, address form with validation, WhatsApp checkout, order saving
 */
'use strict';

const CartModule = (() => {
    const API = 'https://thaat-api.onrender.com/api';
    let items = [];

    function init() {
        loadFromStorage();
        bindUI();
        updateUI();
    }

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem('thaat_cart');
            if (raw) items = JSON.parse(raw);
        } catch { items = []; }
    }

    function save() {
        localStorage.setItem('thaat_cart', JSON.stringify(items));
    }

    function addItem(product) {
        const existing = items.find(i => i.id === product.id && i.size === product.size);
        if (existing) {
            existing.qty++;
        } else {
            items.push({ ...product, qty: 1 });
        }
        save();
        updateUI();
        openSidebar();
    }

    function removeItem(id, size) {
        items = items.filter(i => !(i.id === id && i.size === size));
        save();
        updateUI();
    }

    function updateQty(id, size, delta) {
        const item = items.find(i => i.id === id && i.size === size);
        if (!item) return;
        item.qty = Math.max(1, item.qty + delta);
        save();
        updateUI();
    }

    function getCount() { return items.reduce((s, i) => s + i.qty, 0); }
    function getSubtotal() { return items.reduce((s, i) => s + i.price * i.qty, 0); }

    /* ── UI Binding ─────────────── */
    function bindUI() {
        // Open/close
        document.getElementById('cartToggle')?.addEventListener('click', openSidebar);
        document.getElementById('cartClose')?.addEventListener('click', closeSidebar);
        document.getElementById('cartOverlay')?.addEventListener('click', closeSidebar);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

        // Checkout — opens 3-step modal
        document.getElementById('checkoutWhatsApp')?.addEventListener('click', () => {
            if (!items.length) { showToast('Cart is empty!', 'error'); return; }
            closeSidebar();
            OrderModal.open(items);
        });
    }

    function openSidebar() {
        document.getElementById('cartSidebar')?.classList.add('active');
        document.getElementById('cartOverlay')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        document.getElementById('cartSidebar')?.classList.remove('active');
        document.getElementById('cartOverlay')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* ── Render ─────────────────── */
    function updateUI() {
        const count = getCount();
        const subtotal = getSubtotal();

        // Badge counts
        const cartCount = document.getElementById('cartCount');
        const sidebarCount = document.getElementById('cartSidebarCount');
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.classList.toggle('visible', count > 0);
        }
        if (sidebarCount) sidebarCount.textContent = `(${count})`;

        // Cart items list
        const list = document.getElementById('cartItems');
        if (list) {
            if (!items.length) {
                list.innerHTML = `
                    <div style="text-align:center;padding:3rem 1rem">
                        <div style="font-size:3rem;margin-bottom:1rem">🛒</div>
                        <p style="font-weight:600;margin-bottom:.5rem">Your cart is empty</p>
                        <p style="color:var(--g400);font-size:.85rem">Browse our collection and add items!</p>
                        <p class="marathi" style="margin-top:.75rem;color:var(--gold);font-size:.9rem">शॉपिंग करा, THAAT करा! 🛍️</p>
                    </div>`;
            } else {
                list.innerHTML = items.map(i => {
                    const emoji = getCatEmoji(i.category);
                    return `
                    <div class="cart-item">
                        <div class="cart-item__img">
                            ${i.image ? `<img src="${i.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)">` : `<span style="font-size:1.5rem">${emoji}</span>`}
                        </div>
                        <div class="cart-item__info">
                            <div class="cart-item__name">${escapeHtml(i.name)}</div>
                            <div class="cart-item__meta">Size: ${i.size} · ₹${i.price.toLocaleString('en-IN')}</div>
                            <div class="cart-item__qty">
                                <button class="cart-item__qty-btn" onclick="CartModule.updateQty('${i.id}','${i.size}',-1)" ${i.qty <= 1 ? 'disabled' : ''}>−</button>
                                <span class="cart-item__qty-num">${i.qty}</span>
                                <button class="cart-item__qty-btn" onclick="CartModule.updateQty('${i.id}','${i.size}',1)">+</button>
                            </div>
                        </div>
                        <div class="cart-item__right">
                            <div class="cart-item__total">₹${(i.price * i.qty).toLocaleString('en-IN')}</div>
                            <button class="cart-item__remove" onclick="CartModule.removeItem('${i.id}','${i.size}')" title="Remove">✕</button>
                        </div>
                    </div>`;
                }).join('');
            }
        }

        // Subtotal & summary
        const subtotalEl = document.getElementById('cartSubtotal');
        if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');

        // Free delivery hint
        const freeRow = document.getElementById('freeDeliveryRow');
        if (freeRow) {
            if (!items.length) {
                freeRow.style.display = 'none';
            } else if (subtotal >= 999) {
                freeRow.style.display = '';
                freeRow.textContent = '🚚 Free delivery on this order!';
                freeRow.style.color = 'var(--green, #27ae60)';
            } else {
                freeRow.style.display = '';
                freeRow.textContent = `Add ₹${(999 - subtotal).toLocaleString('en-IN')} more for free delivery`;
                freeRow.style.color = 'var(--g400)';
            }
        }

        // Footer visibility
        const cartFooter = document.getElementById('cartFooter');
        if (cartFooter) cartFooter.style.display = items.length ? '' : 'none';
    }

    function getItems()  { return items.slice(); }
    function clearCart() { items = []; save(); updateUI(); }

    // Public API
    return { init, addItem, removeItem, updateQty, getCount, getItems, clearCart, openSidebar, closeSidebar, close: closeSidebar };
})();
