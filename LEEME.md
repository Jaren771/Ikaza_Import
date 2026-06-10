# ikaZa Import

> Plataforma de e-commerce y gestión de importaciones.  
> **Next.js 16 · Prisma 6 · PostgreSQL · Tailwind CSS v4**

<p align="center">
  <img src="public/logo_ikasa_hd.webp" alt="ikaZa Import Navbar" width="100%">
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

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15+ (local o remoto — Neon, Supabase, Railway, etc.)
- npm 10+

---

## Scripts

```bash
npm run dev            # Desarrollo
npm run build          # Producción
npm run start          # Servidor de producción
npm run lint           # ESLint

# Base de datos
npm run db:generate    # Generar Prisma Client
npm run db:push        # Sincronizar esquema a BD
npm run db:migrate     # Crear migración Prisma
npm run db:seed        # Poblar BD con datos de prueba
npm run db:studio      # UI gráfica de la BD (Prisma Studio)
npm run db:reset       # Reset completo + seed
```

---

## Inicio Rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/Jaren771/Ikaza_Import.git
cd Ikaza_Import
npm install
```

### 2. Configurar PostgreSQL

Crea una base de datos PostgreSQL. Puedes usar **local** o servicios cloud como **Neon**, **Supabase** o **Railway**.

```sql
CREATE DATABASE ikaza_db;
```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto. Las variables obligatorias son:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/ikaza_db"
AUTH_SECRET="<generar con: openssl rand -base64 32>"
NEXTAUTH_SECRET="<generar con: openssl rand -base64 32>"
```

Opcionales (necesarias para funcionalidades específicas):

```env
# Datos mock sin BD (útil para frontend sin PostgreSQL)
USE_MOCK_DATA="true"

# Autenticación Google OAuth
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Pasarelas de pago
MERCADOPAGO_ACCESS_TOKEN=""
CULQI_PUBLIC_KEY=""
CULQI_SECRET_KEY=""
IZIPAY_MERCHANT_CODE=""
IZIPAY_API_KEY=""
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
```

### 4. Sincronizar base de datos y sembrar datos

```bash
npm run db:generate
npm run db:push        # Crea las tablas según el schema
npm run db:seed        # Inserta datos de prueba
```

### 5. Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Usuarios de Prueba (seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@ikaza.pe` | `Admin123!` | SUPER_ADMIN |
| `admin@ikaza.pe` | `Admin123!` | ADMIN |
| `maria@gmail.com` | `Admin123!` | CUSTOMER |

*Con `USE_MOCK_DATA="true"` también existe:* `admin@gmail.com` / `admin123`

---

## Estructura del Proyecto

```
prisma/
  schema.prisma         # Modelos de base de datos
  seed.ts              # Seed principal
  seed-reales.json     # Datos de productos reales
src/
  app/                 # App Router (páginas + API routes)
  components/          # UI (shadcn) + componentes
  features/            # Lógica por dominio
    auth/              # Login, registro, roles
    orders/            # Carrito, checkout, pedidos
    products/          # Catálogo, filtros, repositorio
    importer/          # Gestión de importaciones
  lib/                 # Clientes, utilidades, datos mock
  repositories/        # Capa de acceso a datos
  services/            # Pagos, integraciones externas
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

## Notas para Desarrollo

- El proyecto funciona **sin PostgreSQL** si se activa `USE_MOCK_DATA="true"`. Los datos provienen de `src/lib/mock-products.ts`.
- Para desarrollo local de la BD usa `npm run db:studio` para inspeccionar datos visualmente.
- Las migraciones de Prisma se versionan en `prisma/migrations/`.
- El seed incluye 18+ productos con imágenes reales de Unsplash.
