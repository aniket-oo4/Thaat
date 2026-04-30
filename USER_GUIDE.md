# THAAT - User Guide

## For Customers (Storefront)

### Browsing Products

1. Open the website — products load automatically on the homepage
2. Use **category tabs** (All / Shirts / Jeans / Footwear) to filter
3. Each product shows: image, name, price, available sizes, and badge (New/Hot/Sale)

### Adding to Cart

1. Click a **size** on any product card (size becomes highlighted)
2. Click **"Add to Cart"** — item appears in cart sidebar
3. Cart icon in header shows item count
4. Adjust quantity with `+` / `-` buttons or remove items with `×`

### Checkout via WhatsApp

1. Click **"Order via WhatsApp"** button in cart
2. WhatsApp opens with a pre-filled message containing:
   - All items (name, size, quantity, price)
   - Total amount
3. Send the message to complete your order
4. The store owner will respond to confirm delivery details

### Size Guide

- Scroll to the **Size Guide** section on homepage
- Reference measurements for S / M / L / XL / XXL

---

## For Admin (Dashboard)

### Accessing Admin Panel

1. Navigate to `/admin.html` (e.g., `https://yoursite.vercel.app/admin.html`)
2. Login with credentials:
   - **Default**: Username `admin` / Password `thaat@2024`
   - Change password after first login!

### Dashboard Overview

The overview tab shows:
- Total Products count
- Total Orders count
- Total Revenue
- Total Reviews count

### Managing Products

#### Add Product
1. Go to **Products** tab
2. Click **"Add Product"**
3. Fill in: Name, Category, Price, Original Price (for sale badge), Sizes, Badge, Image
4. **Image**: Upload an image (stored as Base64) or paste an image URL
5. Click **Save**

#### Edit Product
1. Click the **edit icon** on any product row
2. Modify fields → Click **Save**

#### Delete Product
1. Click the **delete icon** → Confirm deletion

### Managing Orders

1. Go to **Orders** tab
2. View all orders with: Customer, Items, Total, Status, Date
3. **Update Status**: Click status dropdown → Select new status:
   - `Pending` → `Confirmed` → `Shipped` → `Delivered`
   - Or mark as `Cancelled`

### Managing Reviews

1. Go to **Reviews** tab
2. **Add Review**: Click "Add Review" → Fill name, location, rating (1-5), text
3. **Edit/Delete**: Use action buttons on each row
4. Only **active** reviews appear on the storefront

### Settings

1. Go to **Settings** tab
2. **Store Info**: Update store name, WhatsApp number, delivery charges
3. **Import/Export**: Backup all data as JSON or import from backup

---

## Tips

- **WhatsApp Number**: Set in Settings → used for checkout redirect
- **Delivery Charge**: Set globally in Settings → applied to all orders
- **Product Images**: Keep under 500KB for fast loading (images are Base64 encoded)
- **Offline Mode**: Frontend works with localStorage fallback if API is unreachable
- **Mobile**: Site is fully responsive — test on phone before going live

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Products not loading | Check API URL in frontend config, check backend is running |
| Admin login fails | Verify credentials, check backend logs, try default: admin/thaat@2024 |
| WhatsApp not opening | Ensure WhatsApp number is set in Settings (format: 91XXXXXXXXXX) |
| Images not showing | Re-upload image, ensure file is under 1MB |
| Slow first load | Backend on free tier has cold starts (~30s) — normal behavior |
| Cart not saving | Clear browser localStorage, refresh page |

---

## API Endpoints (for developers)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | Active products (storefront) |
| GET | `/api/products/all` | Admin | All products |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/{id}` | Admin | Update product |
| DELETE | `/api/products/{id}` | Admin | Delete product |
| GET | `/api/orders` | Admin | All orders |
| POST | `/api/orders` | No | Create order (from cart) |
| PUT | `/api/orders/{id}/status` | Admin | Update order status |
| GET | `/api/reviews` | No | Active reviews |
| POST | `/api/reviews` | Admin | Create review |
| PUT | `/api/reviews/{id}` | Admin | Update review |
| DELETE | `/api/reviews/{id}` | Admin | Delete review |
| POST | `/api/auth/login` | No | Admin login |
| GET | `/health` | No | Health check |
| GET | `/swagger` | No | API documentation (dev only) |
