# ikaZa Import

> Plataforma de e-commerce y gestión de importaciones.  
> **Next.js 16 · Prisma 6 · PostgreSQL · Spring Boot 3 · Tailwind CSS v4**

<p align="center">
  <img src="public/logo_ikasa_hd.webp" alt="ikaZa Import Navbar" width="100%">
</p>

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16 (App Router) + React 19 |
| **Backend (API REST)** | Spring Boot 3.4 + Java 21 |
| **Base de Datos** | PostgreSQL + Prisma v6 (frontend) / JPA Hibernate (backend) |
| **Autenticación** | NextAuth.js v5 (frontend) / JWT con Spring Security (backend) |
| **Estilos** | Tailwind CSS v4 + shadcn/ui |
| **Formularios** | React Hook Form + Zod |
| **Estado** | Zustand (local) + TanStack Query v5 (servidor) |
| **Pagos** | MercadoPago · Culqi · Izipay · PayPal |

---

## Estructura del Proyecto

```
Ikaza-imports.sql      # Script SQL con creación de BD, seguridad y documentación
prisma/
  schema.prisma         # Modelos de base de datos (frontend)
  seed.ts              # Seed principal
  seed-reales.json     # Datos de productos reales para seed
src/
  app/                 # App Router (páginas + API routes)
    (auth)/            # Login, registro
    (store)/           # Catálogo, carrito, checkout
    admin/             # Panel administrativo
    importer/          # Gestión de importaciones
    profile/           # Perfil de usuario
    wishlist/          # Lista de deseos
  components/          # UI (shadcn) + componentes de features
  features/            # Lógica por dominio
    auth/              # Login, registro, roles
    orders/            # Carrito, checkout, pedidos
    products/          # Catálogo, filtros, repositorio
  lib/                 # Clientes, utilidades
  repositories/        # Capa de acceso a datos
  services/            # Pagos, integraciones externas
  types/               # Tipos globales de TypeScript
backend/               # API REST en Spring Boot
  src/main/java/       # Controladores, servicios, repositorios, entidades
  src/main/resources/  # Configuración (application.yml)
pom.xml                # Dependencias Maven
```

---

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15+
- npm 10+
- Java 21 (para el backend)
- Maven 3.9+ (para el backend)

---

## Scripts

### Frontend (Next.js)

```bash
npm run dev            # Desarrollo (http://localhost:3000)
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

### Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run    # Iniciar API (http://localhost:8081)
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

Crea la base de datos. Puedes usar el script incluido o hacerlo manualmente:

```sql
CREATE DATABASE "Ikaza-imports";
```

El script completo con seguridad, índices y documentación está en **`Ikaza-imports.sql`** (incluye extensión pgcrypto, roles, RLS y más).

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto. Las variables obligatorias son:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/Ikaza-imports"
AUTH_SECRET="<generar con: openssl rand -base64 32>"
NEXTAUTH_SECRET="<generar con: openssl rand -base64 32>"
```

Opcionales (necesarias para funcionalidades específicas):

```env
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
npm run db:seed        # Inserta datos de prueba (usuarios, categorías, 201 productos, etc.)
```

### 5. Ejecutar frontend

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### 6. (Opcional) Ejecutar backend

```bash
cd backend
mvn spring-boot:run    # http://localhost:8081
```

---

## Usuarios de Prueba (seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@ikaza.pe` | `Admin123!` | SUPER_ADMIN |
| `admin@ikaza.pe` | `Admin123!` | ADMIN |
| `manager@ikaza.pe` | `Admin123!` | MANAGER |
| `maria@gmail.com` | `Customer123!` | CUSTOMER |
| `carlos@gmail.com` | `Customer123!` | CUSTOMER |

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
- Carrito de compras persistente (sesión y usuario autenticado)
- Checkout con múltiples medios de pago
- Panel administrativo con dashboard y métricas
- Gestión de importaciones (aduana, fletes, tracking)
- Cupones de descuento (%, fijo, envío gratis)
- Banners promocionales administrables
- Sistema de reseñas con aprobación
- Auditoría de acciones sensibles
- API REST con autenticación JWT (backend Spring Boot)

---

## Base de Datos — Modelo Lógico

El archivo **`Ikaza-imports.sql`** contiene:

| Sección | Contenido |
|---------|-----------|
| Creación de BD | `CREATE DATABASE` con configuración regional |
| Seguridad | Extensiones pgcrypto, roles, permisos, RLS, auditoría |
| Documentación | CREATE TABLE de referencia con comentarios en lenguaje simple |
| Observaciones | 10 hallazgos sobre el modelo lógico del equipo (redundancias, normalización, tablas faltantes) |

Las tablas se gestionan con **Prisma ORM** (schema en `prisma/schema.prisma`) y se sincronizan con `npm run db:push`.

---

## Notas para Desarrollo

- **Requiere PostgreSQL** — El proyecto ya no usa datos mock. Todos los datos vienen de la base de datos.
- Si la BD no está disponible, las páginas mostrarán error en lugar de datos falsos.
- Para desarrollo local de la BD se recomienda `npm run db:studio` para inspeccionar datos visualmente.
- Las migraciones de Prisma se versionan en `prisma/migrations/`.
- Los datos de seed incluyen **201 productos reales** con imágenes.
- El backend Spring Boot es opcional; el frontend puede funcionar de forma independiente con Prisma.
