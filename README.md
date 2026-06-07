# ikaZa Import

> Plataforma de e-commerce y gestión de importaciones.  
> **Next.js 16 · Prisma 6 · PostgreSQL · Tailwind CSS v4**

---

<p align="center">
  <!-- Reemplaza esta URL con la imagen del navbar -->
  <img src="URL_DE_LA_IMAGEN" alt="ikaZa Import Navbar" width="100%">
</p>

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Base de Datos** | PostgreSQL + Prisma v6 |
| **Estilos** | Tailwind CSS v4 + shadcn/ui |
| **Auth** | NextAuth.js v5 (JWT) |
| **Formularios** | React Hook Form + Zod |
| **Estado** | Zustand (local) + TanStack Query v5 (servidor) |
| **Pagos** | MercadoPago · Culqi · Izipay · PayPal |

---

## Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Producción
npm run lint         # ESLint
npm run db:push      # Sincronizar esquema a BD
npm run db:migrate   # Migración Prisma
npm run db:seed      # Datos de prueba
npm run db:studio    # UI gráfica de la BD
npm run db:reset     # Reset + seed
```

---

## Inicio Rápido

```bash
git clone <repo>
npm install
# Configurar .env (PostgreSQL, NextAuth, pagos...)
npm run db:push
npm run db:seed
npm run dev
```

Usuarios de prueba del seed:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@ikaza.pe` | `Admin123!` | SUPER_ADMIN |
| `admin@ikaza.pe` | `Admin123!` | ADMIN |
| `maria@gmail.com` | `Admin123!` | CUSTOMER |
| `admin@gmail.com` | `admin123` | ADMIN (mock, sin BD) |

---

## Estructura

```
prisma/               # Schema + seed
src/
  app/                # App Router (páginas + API)
  components/         # UI (shadcn) + features
  features/           # Lógica por dominio
    auth/             # Login, registro, roles
    orders/           # Carrito, checkout, pedidos
    products/         # Catálogo, filtros, repositorio
    importer/         # Gestión de importaciones
  lib/                # Clientes, utilidades, mock data
  repositories/       # Capa de acceso a datos
  services/           # Pagos, integraciones externas
```

---

## Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **SUPER_ADMIN** | Todo el sistema |
| **ADMIN** | Panel admin, productos, pedidos |
| **MANAGER** | Importaciones, inventario |
| **CUSTOMER** | Catálogo, carrito, historial |

---

## Features

- Catálogo con filtros (categoría, precio, stock, búsqueda)
- Carrito de compras persistente
- Checkout con múltiples medios de pago
- Panel administrativo con dashboard y métricas
- Gestión de importaciones (aduana, fletes, tracking)
- Cupones de descuento (% , fijo, envío gratis)
- Banners promocionales administrables
- Sistema de reseñas con aprobación
- Auditoría de acciones sensibles
- 18 productos mock para desarrollo sin BD
