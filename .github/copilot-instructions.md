# La Gauchada - Project Context for GitHub Copilot

## Project Overview

**Name:** La Gauchada  
**Type:** E-commerce web application for a yerba mate business  
**Language:** Spanish (all UI text)  
**Purpose:** Sell yerba mate products, mate cups, thermoses, bombillas, and accessories

---

## Technology Stack

- **Language:** TypeScript 5.x
- **Framework:** Next.js 15.x (App Router)
- **UI Library:** React 19.x
- **Styling:** Tailwind CSS 4.x
- **Components:** shadcn/ui
- **Package Manager:** npm
- **Data Storage:** Browser localStorage (development mode)

---

## Project Structure

```
app/                      # Next.js App Router pages
  layout.tsx              # Root layout with CartProvider, header, footer
  page.tsx                # Home page
  products/page.tsx       # Product catalog with category filtering
  cart/page.tsx           # Shopping cart
  checkout/page.tsx       # Checkout form with payment methods
  checkout/success/page.tsx # Order confirmation with details
  about/page.tsx          # About us page
  admin/page.tsx          # Admin panel (stock + orders management)
  globals.css             # Tailwind config and CSS variables

components/               # React components
  ui/                     # shadcn/ui base components (Button, Card, Input, etc.)
  site-header.tsx         # Navigation with mobile menu
  site-footer.tsx         # Footer with links
  product-card.tsx        # Product display with add-to-cart
  hero-carousel.tsx       # Home page hero slider
  featured-products.tsx   # Featured products section
  category-grid.tsx       # Category navigation grid
  benefits-section.tsx    # Benefits/features section
  about-intro.tsx         # About section on home page

lib/                      # Core logic and utilities
  types.ts                # TypeScript interfaces (Product, Order, CartItem, etc.)
  products.ts             # Product data array (30+ products)
  cart-context.tsx        # React Context for cart state and localStorage
  order-service.ts        # Order CRUD operations
  email-service.ts        # Email notifications (mock implementation)
  utils.ts                # Utility functions (cn for classNames)

public/images/            # Product and hero images (JPG files)
```

---

## Key Interfaces (lib/types.ts)

```typescript
Product {
  id, name, description, price, image, category, subcategory?, stock, featured?
}

Category = "promos" | "mates" | "materas" | "yerberos" | "termos" | "bombillas" | "otros"

SubcategoryId = "mates-imperiales" | "mates-tradicionales" | "mates-torpedos"

CartItem { product, quantity }

CustomerInfo {
  firstName, lastName, age, gender, dni, phone, email,
  address, city, postalCode, notes?, paymentMethod
}

Order {
  id, items, customer, total, subtotal, shipping, createdAt,
  status, paymentMethod, transferenceStatus?
}
```

---

## State Management

**CartContext (lib/cart-context.tsx):**
- Provides: items, products, cartCount, subtotal
- Actions: addToCart, removeFromCart, updateQuantity, updateStock, completePurchase
- Persistence: localStorage with version control to invalidate stale data
- Keys: "mate-shop-cart", "mate-shop-products", "mate-shop-products-version"

**Order Storage (lib/order-service.ts):**
- Key: "la-gauchada-orders"
- Functions: createOrder, saveOrder, getAllOrders, getOrderById, confirmTransference

---

## Payment Methods

1. **Efectivo** - Cash on delivery
2. **Tarjeta** - Credit/debit card (Mercado Pago integration placeholder)
3. **Transferencia** - Bank transfer with manual verification workflow

Bank transfer orders have a `transferenceStatus` field:
- "pendiente" - Awaiting admin verification
- "confirmado" - Payment confirmed by admin
- "rechazado" - Payment rejected

---

## Admin Panel (/admin)

Two tabs:
1. **Gestion de Stock** - Update product stock quantities
2. **Pedidos** - View all orders, confirm bank transfers

Admin can confirm bank transfers which triggers a customer notification email.

---

## Email Service (lib/email-service.ts)

Currently mock implementation that logs to console. Functions:
- sendAdminOrderNotification(order)
- sendCustomerOrderConfirmation(order)
- sendTransferConfirmationEmail(order)

To configure admin email, change: `const ADMIN_EMAIL = "admin@tuempresa.com"`

For production, replace mock functions with real provider (Resend, SendGrid, Nodemailer).

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check for errors
```

---

## Important Implementation Notes

1. **No authentication** - Intentional design decision for MVP simplicity
2. **localStorage only** - No backend database; data is per-browser
3. **Mock emails** - Console logging only; needs real provider for production
4. **Stock management** - Automatic decrease on purchase; admin can reset
5. **Products version** - Changing CURRENT_PRODUCTS_VERSION in cart-context.tsx forces fresh product data load
6. **Spanish only** - All UI text, product names, descriptions are in Spanish

---

## Production Checklist (Future Implementation)

- [ ] Connect to real database (Supabase, Neon, or similar)
- [ ] Integrate email provider (Resend recommended)
- [ ] Add Mercado Pago integration for card payments
- [ ] Implement actual bank transfer verification
- [ ] Add user authentication if needed
- [ ] Replace placeholder images with real product photos
- [ ] Add order tracking functionality
- [ ] Implement inventory alerts

---

## File Dependencies

```
layout.tsx
  └── CartProvider (cart-context.tsx)
      └── initialProducts (products.ts)
          └── Product type (types.ts)

checkout/page.tsx
  └── useCart hook
  └── createOrder, saveOrder (order-service.ts)
  └── sendAdminOrderNotification, sendCustomerOrderConfirmation (email-service.ts)

admin/page.tsx
  └── useCart hook
  └── getAllOrders, confirmTransference (order-service.ts)
  └── sendTransferConfirmationEmail (email-service.ts)
```

---

## Coding Guidelines

- Use TypeScript for all files
- Follow existing component patterns in the codebase
- Keep all user-facing text in Spanish
- Use shadcn/ui components from components/ui/
- Use Tailwind CSS for styling (no custom CSS unless necessary)
- Maintain localStorage persistence patterns for data
- Use the useCart hook for cart and product operations
