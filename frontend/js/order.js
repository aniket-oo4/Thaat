/**
 * THAAT — Multi-Step Checkout Modal (order.js)
 * 3-step flow: Cart Review → Delivery Details → Summary + WhatsApp
 */
'use strict';

const OrderModal = (() => {
    const WHATSAPP_NUM = '919876543210'; // Replace with actual WhatsApp number
    let cartItems = [];
    let currentStep = 1;

    /* ══════════════════════════════════════════
       OPEN / CLOSE
    ═════════════════════════════════════════════ */
    function open(items) {
        if (!items || items.length === 0) {
            showToast('Cart is empty! Add some items first. 🛒', 'warn');
            return;
        }
        cartItems = items.slice(); // copy
        currentStep = 1;
        _renderStep1();
        document.getElementById('checkoutModal')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        document.getElementById('checkoutModal')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* ══════════════════════════════════════════
       STEP NAVIGATION
    ═════════════════════════════════════════════ */
    function goToStep(n) {
        if (n === 2 && currentStep === 1) {
            // Nothing to validate in step 1
        }
        if (n === 3 && currentStep === 2) {
            if (!_validateAddress()) return;
        }

        currentStep = n;

        // Update step indicators
        document.querySelectorAll('.co-step').forEach(el => {
            const s = parseInt(el.dataset.step);
            el.classList.toggle('active', s === n);
            el.classList.toggle('done', s < n);
        });

        // Toggle panels
        document.querySelectorAll('.co-panel').forEach(el => {
            el.classList.toggle('active', el.dataset.step === String(n));
        });

        if (n === 3) _buildSummary();

        // Scroll modal to top
        const mb = document.querySelector('.co-modal__body');
        if (mb) mb.scrollTop = 0;
    }

    /* ══════════════════════════════════════════
       STEP 1 — Cart Items + Subtotal
    ═════════════════════════════════════════════ */
    function _renderStep1() {
        const container = document.getElementById('coStep1Items');
        if (!container) return;

        const subtotal = _getSubtotal();
        const delivery = subtotal >= 999 ? 0 : 49;
        const total = subtotal + delivery;

        container.innerHTML = cartItems.map(i => {
            const emoji = _catEmoji(i.category);
            return `
            <div class="co-item">
                <div class="co-item__img">
                    ${i.image
                        ? `<img src="${i.image}" alt="${_esc(i.name)}">`
                        : `<span>${emoji}</span>`}
                </div>
                <div class="co-item__info">
                    <div class="co-item__name">${_esc(i.name)}</div>
                    <div class="co-item__meta">Size: ${i.size} · ₹${i.price.toLocaleString('en-IN')} each</div>
                </div>
                <div class="co-item__right">
                    <div class="co-item__qty">
                        <button type="button" onclick="OrderModal._changeQty('${i.id}','${i.size}',-1)">−</button>
                        <span>${i.qty}</span>
                        <button type="button" onclick="OrderModal._changeQty('${i.id}','${i.size}',1)">+</button>
                    </div>
                    <div class="co-item__total">₹${(i.price * i.qty).toLocaleString('en-IN')}</div>
                </div>
            </div>`;
        }).join('');

        _updatePriceSummary();
    }

    function _changeQty(id, size, delta) {
        const item = cartItems.find(i => i.id === id && i.size === size);
        if (!item) return;
        item.qty = Math.max(1, item.qty + delta);
        // Sync back to CartModule
        CartModule.updateQty(id, size, delta);
        _renderStep1();
    }

    function _updatePriceSummary() {
        const subtotal = _getSubtotal();
        const delivery = subtotal >= 999 ? 0 : 49;
        const total = subtotal + delivery;

        const el = document.getElementById('coPriceSummary');
        if (!el) return;
        el.innerHTML = `
            <div class="co-price-row"><span>Subtotal (${_getCount()} items)</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
            <div class="co-price-row ${subtotal >= 999 ? 'co-price-row--free' : ''}">
                <span>${subtotal >= 999 ? '🎉 Free Delivery!' : 'Delivery'}</span>
                <span>${subtotal >= 999 ? '<s style="opacity:.4">₹49</s> FREE' : '₹49'}</span>
            </div>
            ${subtotal < 999 ? `<div class="co-price-row co-price-row--hint"><span>Add ₹${(999 - subtotal).toLocaleString('en-IN')} more for free delivery</span></div>` : ''}
            <div class="co-price-row co-price-row--total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>`;
    }

    /* ══════════════════════════════════════════
       STEP 2 — Address Validation
    ═════════════════════════════════════════════ */
    function _validateAddress() {
        let valid = true;
        const rules = [
            { id: 'coName',    test: v => v.trim().length >= 2,              msg: 'Please enter your full name' },
            { id: 'coPhone',   test: v => /^[6-9]\d{9}$/.test(v.trim()),    msg: 'Enter a valid 10-digit mobile number' },
            { id: 'coAddress', test: v => v.trim().length >= 5,              msg: 'Enter complete delivery address' },
            { id: 'coCity',    test: v => v.trim().length >= 2,              msg: 'Enter your city/village' },
            { id: 'coPincode', test: v => /^\d{6}$/.test(v.trim()),         msg: 'Enter a valid 6-digit pincode' },
        ];

        rules.forEach(r => {
            const inp = document.getElementById(r.id);
            const err = document.getElementById(r.id + 'Err');
            if (!inp) return;
            const ok = r.test(inp.value);
            inp.classList.toggle('co-input--err', !ok);
            if (err) err.textContent = ok ? '' : r.msg;
            if (!valid) return;
            if (!ok) { valid = false; setTimeout(() => inp.focus(), 50); }
        });

        if (!valid) showToast('कृपया सर्व fields भरा! Fill all required fields.', 'error');
        return valid;
    }

    /* ══════════════════════════════════════════
       STEP 3 — Order Summary
    ═════════════════════════════════════════════ */
    function _buildSummary() {
        const container = document.getElementById('coSummaryBody');
        if (!container) return;

        const name    = document.getElementById('coName')?.value.trim() || '';
        const phone   = document.getElementById('coPhone')?.value.trim() || '';
        const address = document.getElementById('coAddress')?.value.trim() || '';
        const city    = document.getElementById('coCity')?.value.trim() || '';
        const pincode = document.getElementById('coPincode')?.value.trim() || '';
        const payment = document.getElementById('coPayment')?.value || 'COD';

        const subtotal = _getSubtotal();
        const delivery = subtotal >= 999 ? 0 : 49;
        const total = subtotal + delivery;

        const itemsHtml = cartItems.map(i => `
            <div class="co-summary-item">
                <span class="co-summary-item__name">${_esc(i.name)} <em>(${i.size})</em></span>
                <span>× ${i.qty}</span>
                <span>₹${(i.price * i.qty).toLocaleString('en-IN')}</span>
            </div>`).join('');

        container.innerHTML = `
            <div class="co-summary-section">
                <div class="co-summary-section__title">🛍️ Order Items</div>
                ${itemsHtml}
            </div>
            <div class="co-summary-section">
                <div class="co-summary-section__title">📍 Delivery Address</div>
                <div class="co-summary-addr">
                    <strong>${_esc(name)}</strong> · ${_esc(phone)}<br>
                    ${_esc(address)}<br>
                    ${_esc(city)} — ${_esc(pincode)}
                </div>
                <div class="co-summary-payment">
                    💳 Payment: <strong>${payment === 'COD' ? 'Cash on Delivery' : 'Prepaid (UPI/Card)'}</strong>
                </div>
            </div>
            <div class="co-summary-total">
                <div class="co-summary-total__row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
                <div class="co-summary-total__row ${subtotal >= 999 ? 'co-summary-total__row--free' : ''}">
                    <span>Delivery</span>
                    <span>${subtotal >= 999 ? '<span class="badge-free">FREE 🎉</span>' : '₹49'}</span>
                </div>
                <div class="co-summary-total__row co-summary-total__row--grand"><span>Grand Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
            </div>`;
    }

    /* ══════════════════════════════════════════
       PLACE ORDER (WhatsApp)
    ═════════════════════════════════════════════ */
    function placeOrder() {
        const name    = document.getElementById('coName')?.value.trim() || '';
        const phone   = document.getElementById('coPhone')?.value.trim() || '';
        const address = document.getElementById('coAddress')?.value.trim() || '';
        const city    = document.getElementById('coCity')?.value.trim() || '';
        const pincode = document.getElementById('coPincode')?.value.trim() || '';
        const payment = document.getElementById('coPayment')?.value || 'COD';

        const subtotal = _getSubtotal();
        const delivery = subtotal >= 999 ? 0 : 49;
        const total = subtotal + delivery;

        const itemLines = cartItems.map(i =>
            `• ${i.name} (${i.size}) × ${i.qty} = ₹${(i.price * i.qty).toLocaleString('en-IN')}`
        ).join('\n');

        const msg =
            `🛍️ *THAAT — New Order* 🛍️\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `*👤 Customer Details*\n` +
            `Name: ${name}\n` +
            `Phone: ${phone}\n\n` +
            `*📦 Order Items*\n` +
            `${itemLines}\n\n` +
            `*📍 Delivery Address*\n` +
            `${address}\n` +
            `${city} — ${pincode}\n\n` +
            `*💰 Payment*\n` +
            `Method: ${payment === 'COD' ? 'Cash on Delivery' : 'Prepaid (UPI/Card)'}\n` +
            `Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n` +
            `Delivery: ${delivery === 0 ? 'FREE 🎉' : '₹' + delivery}\n` +
            `*Total: ₹${total.toLocaleString('en-IN')}*\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `_Thank you for shopping with THAAT!_ 🙏\n` +
            `_साथ आमची, थाट तुमचा!_ ✨`;

        // Save order to localStorage
        _saveOrder(name, phone, address, city, pincode, payment, total);

        // Open WhatsApp
        window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');

        // Clear cart & close modal
        CartModule.clearCart();
        close();
        showToast('🎉 Order sent! Check your WhatsApp messages.', 'success');
    }

    function _saveOrder(name, phone, address, city, pincode, payment, total) {
        const order = {
            id: 'ORD-' + Date.now().toString(36).toUpperCase(),
            customerName: name,
            phone,
            address: `${address}, ${city} — ${pincode}`,
            payment,
            items: cartItems.map(i => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
            total,
            status: 'Pending',
            date: new Date().toISOString()
        };
        try {
            const orders = JSON.parse(localStorage.getItem('thaat_orders') || '[]');
            orders.unshift(order);
            localStorage.setItem('thaat_orders', JSON.stringify(orders));
        } catch {}
        fetch('https://thaat-api.onrender.com/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        }).catch(() => {});
    }

    /* ══════════════════════════════════════════
       HELPERS
    ═════════════════════════════════════════════ */
    function _getSubtotal() { return cartItems.reduce((s, i) => s + i.price * i.qty, 0); }
    function _getCount()    { return cartItems.reduce((s, i) => s + i.qty, 0); }
    function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function _catEmoji(c) {
        const map = { shirts:'👕', jeans:'👖', footwear:'👟', watches:'⌚', accessories:'🧢', kurta:'🧦' };
        return map[(c||'').toLowerCase()] || '🛍️';
    }

    /* ══════════════════════════════════════════
       INIT
    ═════════════════════════════════════════════ */
    function init() {
        // Overlay click closes
        document.getElementById('checkoutModal')?.addEventListener('click', function(e) {
            if (e.target === this) close();
        });
        // Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') close();
        });
        // Close button
        document.getElementById('coCloseBtn')?.addEventListener('click', close);
        // Step navigation buttons
        document.getElementById('coNext1')?.addEventListener('click', () => goToStep(2));
        document.getElementById('coBack2')?.addEventListener('click', () => goToStep(1));
        document.getElementById('coNext2')?.addEventListener('click', () => goToStep(3));
        document.getElementById('coBack3')?.addEventListener('click', () => goToStep(2));
        document.getElementById('coPlaceOrder')?.addEventListener('click', placeOrder);
    }

    return { init, open, close, goToStep, placeOrder, _changeQty, _renderStep1 };
})();
