/**
 * THAAT — Admin Panel JS
 * Authentication, CRUD for products/orders/reviews, settings, data management
 */
'use strict';

const AdminApp = (() => {
    const DEFAULT_PASS = 'thaat@admin';
    let authenticated = false;

    function init() {
        checkAuth();
        initTabs();
        initSidebar();
        initLogin();
        initProducts();
        initOrders();
        initReviews();
        initSettings();
        initDataMgmt();
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    }

    /* ── Auth ──────────────────── */
    function checkAuth() {
        const s = sessionStorage.getItem('thaat_admin_auth');
        if (s === 'true') { authenticated = true; hideLogin(); loadAll(); }
    }

    function initLogin() {
        document.getElementById('loginForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const pw = document.getElementById('loginPassword').value;
            const storedPw = localStorage.getItem('thaat_admin_pass') || DEFAULT_PASS;
            if (pw === storedPw) {
                authenticated = true;
                sessionStorage.setItem('thaat_admin_auth', 'true');
                hideLogin();
                loadAll();
                toast('Welcome to THAAT Admin Panel! 🎉');
            } else {
                document.getElementById('loginError').textContent = 'Incorrect password. Try again.';
            }
        });
    }

    function hideLogin() { document.getElementById('loginModal')?.classList.add('hidden'); }
    function logout() { sessionStorage.removeItem('thaat_admin_auth'); location.reload(); }

    /* ── Tabs ─────────────────── */
    function initTabs() {
        document.querySelectorAll('.sidebar__link[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sidebar__link').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
                document.getElementById('pageTitle').textContent = btn.textContent.trim();
                // Close mobile sidebar
                document.getElementById('sidebar')?.classList.remove('open');
            });
        });
    }

    function initSidebar() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        toggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));
        // Close sidebar when tapping outside on mobile
        document.addEventListener('click', e => {
            if (sidebar?.classList.contains('open') &&
                !sidebar.contains(e.target) && e.target !== toggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    /* ── Load All ─────────────── */
    function loadAll() {
        renderDashboard();
        renderProducts();
        renderOrders();
        renderReviews();
        loadSettings();
    }

    /* ── Dashboard ────────────── */
    function renderDashboard() {
        const products = getLS('thaat_products') || [];
        const orders = getLS('thaat_orders') || [];
        const reviews = getLS('thaat_reviews') || [];
        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

        document.getElementById('statProducts').textContent = products.length;
        document.getElementById('statOrders').textContent = orders.length;
        document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
        document.getElementById('statReviews').textContent = reviews.length;

        // Recent orders
        const body = document.getElementById('recentOrdersBody');
        if (body) {
            const recent = orders.slice(0, 5);
            body.innerHTML = recent.length ? recent.map(o => `
                <tr>
                    <td><strong>${esc(o.id || '')}</strong></td>
                    <td>${esc(o.customerName || 'N/A')}</td>
                    <td>₹${(o.total || 0).toLocaleString('en-IN')}</td>
                    <td><span class="badge badge--${(o.status || 'pending').toLowerCase()}">${o.status || 'Pending'}</span></td>
                    <td>${formatDate(o.date)}</td>
                </tr>
            `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--g400);padding:2rem">No orders yet</td></tr>';
        }
    }

    /* ── Products CRUD ────────── */
    function initProducts() {
        const form = document.getElementById('productForm');
        const formCard = document.getElementById('productFormCard');
        const addBtn = document.getElementById('addProductBtn');
        const cancelBtn = document.getElementById('cancelProductForm');

        addBtn?.addEventListener('click', () => {
            form.reset();
            document.getElementById('productEditId').value = '';
            document.getElementById('productFormTitle').textContent = 'Add Product';
            formCard.style.display = '';
            clearErrors(form);
            resetImageWidget();
        });

        cancelBtn?.addEventListener('click', () => {
            formCard.style.display = 'none';
            form.reset();
            clearErrors(form);
            resetImageWidget();
        });

        initImageWidget();

        form?.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateProduct()) return;

            const products = getLS('thaat_products') || [];
            const editId = document.getElementById('productEditId').value;
            const data = {
                id: editId || 'p' + Date.now().toString(36),
                name: val('prodName'),
                category: val('prodCategory'),
                price: parseInt(val('prodPrice')),
                originalPrice: val('prodOriginalPrice') ? parseInt(val('prodOriginalPrice')) : null,
                description: val('prodDescription'),
                image: val('prodImage'),   // hidden field set by image widget
                sizes: val('prodSizes').split(',').map(s => s.trim()).filter(Boolean),
                badge: val('prodBadge') || null
            };

            if (editId) {
                const idx = products.findIndex(p => p.id === editId);
                if (idx >= 0) products[idx] = data;
            } else {
                products.push(data);
            }

            localStorage.setItem('thaat_products', JSON.stringify(products));
            formCard.style.display = 'none';
            form.reset();
            resetImageWidget();
            renderProducts();
            renderDashboard();
            toast(editId ? 'Product updated!' : 'Product added! 📦');
        });
    }

    /* ── Image Upload Widget ──── */
    function initImageWidget() {
        // Tab switching
        document.querySelectorAll('.img-upload__tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.img-upload__tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.img-upload__panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('imgPanel' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1))?.classList.add('active');
                // Clear the other source when switching
                if (tab.dataset.tab === 'file') document.getElementById('prodImageUrl').value = '';
                else document.getElementById('prodImageFile').value = '';
            });
        });

        // File input → FileReader → base64 preview
        const fileInput = document.getElementById('prodImageFile');
        fileInput?.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { toast('Image must be under 2 MB', 'error'); fileInput.value = ''; return; }
            const reader = new FileReader();
            reader.onload = ev => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        });

        // Drag & drop
        const dropzone = document.getElementById('imgDropzone');
        if (dropzone) {
            dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
            dropzone.addEventListener('drop', e => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (!file || !file.type.startsWith('image/')) { toast('Please drop an image file', 'error'); return; }
                if (file.size > 2 * 1024 * 1024) { toast('Image must be under 2 MB', 'error'); return; }
                const reader = new FileReader();
                reader.onload = ev => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
            });
        }

        // URL input → live preview on blur / Enter
        const urlInput = document.getElementById('prodImageUrl');
        urlInput?.addEventListener('change', () => {
            const u = urlInput.value.trim();
            if (u) setImagePreview(u); else resetImageWidget();
        });

        // Remove button
        document.getElementById('imgRemove')?.addEventListener('click', resetImageWidget);
    }

    function setImagePreview(src) {
        document.getElementById('prodImage').value = src;   // store in hidden field
        const preview = document.getElementById('imgPreview');
        const img = document.getElementById('imgPreviewImg');
        img.src = src;
        preview.style.display = 'flex';
        document.getElementById('imgDropzone').style.display = 'none';
    }

    function resetImageWidget() {
        document.getElementById('prodImage').value = '';
        document.getElementById('prodImageFile').value = '';
        document.getElementById('prodImageUrl').value = '';
        document.getElementById('imgPreview').style.display = 'none';
        document.getElementById('imgDropzone').style.display = '';
        // reset to File tab
        document.querySelectorAll('.img-upload__tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'file'));
        document.querySelectorAll('.img-upload__panel').forEach(p => p.classList.toggle('active', p.id === 'imgPanelFile'));
    }

    function validateProduct() {
        let ok = true;
        const checks = [
            { id: 'prodName', test: v => v.length >= 2, msg: 'Name required (min 2 chars)' },
            { id: 'prodCategory', test: v => !!v, msg: 'Select a category' },
            { id: 'prodPrice', test: v => parseInt(v) > 0, msg: 'Price must be > 0' },
            { id: 'prodSizes', test: v => v.split(',').filter(s => s.trim()).length > 0, msg: 'At least one size required' }
        ];
        checks.forEach(c => {
            const el = document.getElementById(c.id);
            const err = document.getElementById(c.id + 'Error');
            if (!c.test(el?.value?.trim() || '')) {
                ok = false;
                el?.classList.add('field-error');
                if (err) err.textContent = c.msg;
            } else {
                el?.classList.remove('field-error');
                if (err) err.textContent = '';
            }
        });
        return ok;
    }

    function renderProducts() {
        const products = getLS('thaat_products') || [];
        const body = document.getElementById('productsBody');
        if (!body) return;

        body.innerHTML = products.length ? products.map(p => `
            <tr>
                <td><strong>${esc(p.name)}</strong></td>
                <td>${esc(p.category)}</td>
                <td>₹${p.price}${p.originalPrice ? ` <s style="color:var(--g400)">₹${p.originalPrice}</s>` : ''}</td>
                <td>${(p.sizes || []).join(', ')}</td>
                <td>${p.badge ? `<span class="badge badge--${p.badge === 'new' ? 'active' : 'pending'}">${p.badge}</span>` : '—'}</td>
                <td class="actions">
                    <button class="btn btn--sm btn--outline" onclick="AdminApp.editProduct('${p.id}')">Edit</button>
                    <button class="btn btn--sm btn--danger" onclick="AdminApp.deleteProduct('${p.id}')">Delete</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--g400);padding:2rem">No products. Click "Add Product" to start.</td></tr>';
    }

    function editProduct(id) {
        const products = getLS('thaat_products') || [];
        const p = products.find(x => x.id === id);
        if (!p) return;
        document.getElementById('productEditId').value = p.id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodOriginalPrice').value = p.originalPrice || '';
        document.getElementById('prodDescription').value = p.description || '';
        document.getElementById('prodSizes').value = (p.sizes || []).join(', ');
        document.getElementById('prodBadge').value = p.badge || '';
        document.getElementById('productFormTitle').textContent = 'Edit Product';
        document.getElementById('productFormCard').style.display = '';
        clearErrors(document.getElementById('productForm'));
        // Restore image preview
        resetImageWidget();
        if (p.image) setImagePreview(p.image);
    }

    function deleteProduct(id) {
        if (!confirm('Delete this product?')) return;
        let products = getLS('thaat_products') || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('thaat_products', JSON.stringify(products));
        renderProducts();
        renderDashboard();
        toast('Product deleted', 'info');
    }

    /* ── Orders ───────────────── */
    function initOrders() {}

    function renderOrders() {
        const orders = getLS('thaat_orders') || [];
        const body = document.getElementById('ordersBody');
        const countEl = document.getElementById('ordersCount');
        if (countEl) countEl.textContent = orders.length + ' orders';
        if (!body) return;

        body.innerHTML = orders.length ? orders.map((o, i) => `
            <tr>
                <td><strong>${esc(o.id || '')}</strong></td>
                <td>${esc(o.customerName || 'N/A')}</td>
                <td>${esc(o.phone || '')}</td>
                <td>${(o.items || []).map(it => `${esc(it.name)} (${it.size}) ×${it.qty}`).join(', ')}</td>
                <td>₹${(o.total || 0).toLocaleString('en-IN')}</td>
                <td>${esc(o.payment || 'COD')}</td>
                <td>
                    <select class="badge-select" onchange="AdminApp.updateOrderStatus(${i}, this.value)" style="padding:.2rem .4rem;border-radius:6px;border:1px solid var(--g200);font-size:.75rem">
                        ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td>${formatDate(o.date)}</td>
                <td class="actions">
                    <button class="btn btn--sm btn--danger" onclick="AdminApp.deleteOrder(${i})">Delete</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="9" style="text-align:center;color:var(--g400);padding:2rem">No orders yet</td></tr>';
    }

    function updateOrderStatus(idx, status) {
        const orders = getLS('thaat_orders') || [];
        if (orders[idx]) {
            orders[idx].status = status;
            localStorage.setItem('thaat_orders', JSON.stringify(orders));
            renderDashboard();
            toast(`Order status → ${status}`);
        }
    }

    function deleteOrder(idx) {
        if (!confirm('Delete this order?')) return;
        const orders = getLS('thaat_orders') || [];
        orders.splice(idx, 1);
        localStorage.setItem('thaat_orders', JSON.stringify(orders));
        renderOrders();
        renderDashboard();
        toast('Order deleted', 'info');
    }

    /* ── Reviews ──────────────── */
    function initReviews() {
        const form = document.getElementById('reviewForm');
        const formCard = document.getElementById('reviewFormCard');
        const addBtn = document.getElementById('addReviewBtn');
        const cancelBtn = document.getElementById('cancelReviewForm');

        addBtn?.addEventListener('click', () => {
            form.reset();
            document.getElementById('reviewEditIdx').value = '';
            formCard.style.display = '';
            clearErrors(form);
        });

        cancelBtn?.addEventListener('click', () => { formCard.style.display = 'none'; form.reset(); clearErrors(form); });

        form?.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateReview()) return;

            const reviews = getLS('thaat_reviews') || [];
            const editIdx = document.getElementById('reviewEditIdx').value;
            const data = {
                name: val('revName'),
                location: val('revLocation'),
                text: val('revText'),
                rating: parseInt(val('revRating')),
                isActive: true
            };

            if (editIdx !== '') {
                reviews[parseInt(editIdx)] = { ...reviews[parseInt(editIdx)], ...data };
            } else {
                reviews.push(data);
            }

            localStorage.setItem('thaat_reviews', JSON.stringify(reviews));
            formCard.style.display = 'none';
            form.reset();
            renderReviews();
            renderDashboard();
            toast(editIdx !== '' ? 'Review updated!' : 'Review added! ⭐');
        });
    }

    function validateReview() {
        let ok = true;
        const checks = [
            { id: 'revName', test: v => v.length >= 2, msg: 'Name required' },
            { id: 'revLocation', test: v => v.length >= 2, msg: 'Location required' },
            { id: 'revText', test: v => v.length >= 5, msg: 'Review text required (min 5 chars)' },
            { id: 'revRating', test: v => { const n = parseInt(v); return n >= 1 && n <= 5; }, msg: 'Rating must be 1-5' }
        ];
        checks.forEach(c => {
            const el = document.getElementById(c.id);
            const err = document.getElementById(c.id + 'Error');
            if (!c.test(el?.value?.trim() || '')) {
                ok = false; el?.classList.add('field-error');
                if (err) err.textContent = c.msg;
            } else {
                el?.classList.remove('field-error');
                if (err) err.textContent = '';
            }
        });
        return ok;
    }

    function renderReviews() {
        const reviews = getLS('thaat_reviews') || [];
        const body = document.getElementById('reviewsBody');
        if (!body) return;

        body.innerHTML = reviews.length ? reviews.map((r, i) => `
            <tr>
                <td><strong>${esc(r.name)}</strong></td>
                <td>${esc(r.location)}</td>
                <td>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
                <td style="max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.text)}</td>
                <td><span class="badge badge--${r.isActive !== false ? 'active' : 'inactive'}">${r.isActive !== false ? 'Active' : 'Hidden'}</span></td>
                <td class="actions">
                    <button class="btn btn--sm btn--outline" onclick="AdminApp.editReview(${i})">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="AdminApp.toggleReview(${i})">${r.isActive !== false ? 'Hide' : 'Show'}</button>
                    <button class="btn btn--sm btn--danger" onclick="AdminApp.deleteReview(${i})">Del</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--g400);padding:2rem">No reviews. Click "Add Review" to create one.</td></tr>';
    }

    function editReview(idx) {
        const reviews = getLS('thaat_reviews') || [];
        const r = reviews[idx];
        if (!r) return;
        document.getElementById('reviewEditIdx').value = idx;
        document.getElementById('revName').value = r.name;
        document.getElementById('revLocation').value = r.location;
        document.getElementById('revText').value = r.text;
        document.getElementById('revRating').value = r.rating;
        document.getElementById('reviewFormCard').style.display = '';
        clearErrors(document.getElementById('reviewForm'));
    }

    function toggleReview(idx) {
        const reviews = getLS('thaat_reviews') || [];
        if (reviews[idx]) {
            reviews[idx].isActive = reviews[idx].isActive === false ? true : false;
            localStorage.setItem('thaat_reviews', JSON.stringify(reviews));
            renderReviews();
            toast(reviews[idx].isActive ? 'Review shown' : 'Review hidden');
        }
    }

    function deleteReview(idx) {
        if (!confirm('Delete this review?')) return;
        const reviews = getLS('thaat_reviews') || [];
        reviews.splice(idx, 1);
        localStorage.setItem('thaat_reviews', JSON.stringify(reviews));
        renderReviews();
        renderDashboard();
        toast('Review deleted', 'info');
    }

    /* ── Settings ─────────────── */
    function initSettings() {
        document.getElementById('settingsForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const wa = val('setWhatsApp');
            if (wa && !/^\d{10,15}$/.test(wa)) {
                document.getElementById('setWhatsAppError').textContent = 'Enter valid phone (10-15 digits)';
                return;
            }
            document.getElementById('setWhatsAppError').textContent = '';
            const settings = {
                whatsapp: wa,
                apiUrl: val('setApiUrl'),
                storeName: val('setStoreName')
            };
            localStorage.setItem('thaat_settings', JSON.stringify(settings));
            toast('Settings saved! ⚙️');
        });
    }

    function loadSettings() {
        try {
            const s = JSON.parse(localStorage.getItem('thaat_settings') || '{}');
            if (s.whatsapp) document.getElementById('setWhatsApp').value = s.whatsapp;
            if (s.apiUrl) document.getElementById('setApiUrl').value = s.apiUrl;
            if (s.storeName) document.getElementById('setStoreName').value = s.storeName;
        } catch {}
    }

    /* ── Data Management ──────── */
    function initDataMgmt() {
        document.getElementById('exportData')?.addEventListener('click', () => {
            const data = {
                products: getLS('thaat_products') || [],
                orders: getLS('thaat_orders') || [],
                reviews: getLS('thaat_reviews') || [],
                settings: getLS('thaat_settings') || {},
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `thaat_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            toast('Data exported! 📥');
        });

        document.getElementById('importData')?.addEventListener('click', () => {
            document.getElementById('importFile')?.click();
        });

        document.getElementById('importFile')?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.products) localStorage.setItem('thaat_products', JSON.stringify(data.products));
                    if (data.orders) localStorage.setItem('thaat_orders', JSON.stringify(data.orders));
                    if (data.reviews) localStorage.setItem('thaat_reviews', JSON.stringify(data.reviews));
                    if (data.settings) localStorage.setItem('thaat_settings', JSON.stringify(data.settings));
                    loadAll();
                    toast('Data imported successfully! 📤');
                } catch {
                    toast('Invalid JSON file', 'error');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        document.getElementById('clearData')?.addEventListener('click', () => {
            if (!confirm('Are you sure? This will delete ALL data (products, orders, reviews, settings).')) return;
            ['thaat_products', 'thaat_orders', 'thaat_reviews', 'thaat_settings', 'thaat_subscribers'].forEach(k => localStorage.removeItem(k));
            loadAll();
            toast('All data cleared', 'info');
        });
    }

    /* ── Helpers ──────────────── */
    function getLS(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    }
    function val(id) { return (document.getElementById(id)?.value || '').trim(); }
    function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
    function formatDate(d) {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
    }
    function clearErrors(form) {
        if (!form) return;
        form.querySelectorAll('.field-error').forEach(e => { if (e.tagName === 'SPAN') e.textContent = ''; else e.classList.remove('field-error'); });
        form.querySelectorAll('input,select,textarea').forEach(el => el.classList.remove('field-error'));
    }
    function toast(msg, type = 'success') {
        const c = document.getElementById('toastContainer');
        if (!c) return;
        const t = document.createElement('div');
        t.className = `toast toast--${type}`;
        t.textContent = msg;
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    // Public API
    return {
        init, editProduct, deleteProduct,
        editReview, toggleReview, deleteReview,
        updateOrderStatus, deleteOrder
    };
})();

document.addEventListener('DOMContentLoaded', AdminApp.init);
