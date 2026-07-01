# Mizhara Backend (Go)

REST API for Mizhara — role-based access from JWT cookie (`mizhara_session`), no `/admin` API prefix.

## Structure

```
mizhara-backend/
├── main.go
├── models/
├── controllers/     # One file per domain (request/response only)
│   ├── auth_controller.go
│   ├── products_controller.go
│   ├── categories_controller.go
│   ├── account_controller.go
│   ├── payment_controller.go
│   ├── orders_controller.go
│   ├── users_controller.go
│   ├── dashboard_controller.go
│   └── upload_controller.go
├── services/        # Business logic & DB queries
├── lib/
├── middleware/
├── routes/
└── scripts/seed/
    ├── cmd/           # go run ./scripts/seed/cmd
    ├── data/          # JSON seed files
    └── img/           # product images ({Product Name}/product1.webp, …)
```

## Authorization

- **Public:** auth login/register, product read, categories list
- **Optional auth:** `GET /api/products` — admin token returns products with `costPrice`; guest/customer get storefront list
- **Customer:** account, payment — role checked in controller from token
- **Admin:** product write, category create, orders, users, dashboard, upload — role checked in controller from token

## API routes (no `/admin` prefix)

| Method | Path | Role |
|--------|------|------|
| POST | `/api/auth/login` | public |
| GET | `/api/products` | optional (admin sees cost) |
| POST | `/api/products` | admin |
| GET | `/api/orders` | admin |
| GET | `/api/users` | admin (customers list) |
| GET | `/api/dashboard` | admin |
| GET | `/api/account/profile` | customer |
| POST | `/api/payment` | customer |

## Setup

```bash
cp .env.example .env
go mod tidy
# Requires MONGODB_URI + Cloudinary keys in .env; uploads scripts/seed/img/{Product Name}/*.webp per product
go run ./scripts/seed/cmd
go run .
```

Seed data lives in `scripts/seed/data/` (`categories.json`, `customers.json`, `products.json`, `offers.json`). Product images live in `scripts/seed/img/{exact product name}/` and are uploaded to Cloudinary during seed.

```bash
# Skip image uploads (local dev without Cloudinary)
go run ./scripts/seed/cmd --skip-images

# Re-upload images for existing DB products only
go run ./scripts/sync-img-to-cloudinary/
```

## Development (auto-reload)

Install [Air](https://github.com/air-verse/air) once:

```bash
go install github.com/air-verse/air@latest
```

Ensure `%USERPROFILE%\go\bin` is on your PATH, then from `mizhara-backend`:

```bash
air
```

Air watches `.go` files and rebuilds/restarts the API on save (like nodemon). Config lives in `.air.toml`.

On Windows, if **Application Control** blocks local `.exe` files, Air is configured to run via `go run .` instead of executing a built binary in the project folder.

If port 3000 is already in use, stop the old process (Ctrl+C in the terminal, or end `go.exe` / `mizhara-api.exe` in Task Manager) before starting Air again.

**Without Air:** `go run .`
