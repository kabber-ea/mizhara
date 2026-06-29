# Mizhara Web (React + Vite + Tailwind)

Customer storefront and admin UI — same design as the Next.js app.

## Structure

```
mizhara-web/src/
├── components/          # Shared: Navbar, Footer, Auth, Cart, etc.
│   └── admin/           # AdminShell, AdminSidebar, pagination, badges
├── pages/
│   ├── home/            # Landing + home/components
│   ├── shop/            # Store catalog + shop/components
│   ├── product-detail/
│   ├── cart/
│   ├── account/
│   ├── reset-password/
│   ├── dashboard/       # Admin dashboard + dashboard/components
│   ├── catalog/         # Admin product CRUD + catalog/components
│   ├── orders/          # Admin orders
│   └── customers/       # Admin customers
├── lib/
├── hooks/
└── types/
```

Admin routes stay at `/admin`, `/admin/catalog`, etc. — only the folder layout changed.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs on http://localhost:5173 and proxies `/api` to the Go backend at `:8080`.

## Backend

Start `mizhara-backend` first (`go run main.go`).
