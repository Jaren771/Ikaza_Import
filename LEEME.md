# ikaZa Import — Guía de Instalación para Primerizos

> Si es tu primera vez instalando este proyecto en tu computadora, sigue estos pasos en orden.  
> **Duración estimada:** 15-20 minutos.

---

## ¿Qué necesito instalar primero?

Antes de empezar, asegúrate de tener estos programas instalados en tu PC:

### 1. Node.js (incluye npm)
- Descárgalo desde: [https://nodejs.org](https://nodejs.org) (versión 20 o superior)
- Para verificar que quedó bien instalado, abre una terminal y escribe:

```bash
node --version
npm --version
```

Deberías ver números como `v20.x.x` y `10.x.x`.

### 2. PostgreSQL
- Descárgalo desde: [https://www.postgresql.org/download](https://www.postgresql.org/download)
- Durante la instalación te pedirá una contraseña para el usuario `postgres`. **Guárdala**, la necesitarás después.
- Para verificar que funciona, abre una terminal y escribe:

```bash
psql --version
```

### 3. Git
- Descárgalo desde: [https://git-scm.com](https://git-scm.com)
- Para verificar:

```bash
git --version
```

### 4. Editor de código (recomendado: VS Code)
- Descárgalo desde: [https://code.visualstudio.com](https://code.visualstudio.com)

---

## Pasos para instalar el proyecto

### Paso 1: Descargar el proyecto

Abre una terminal y escribe:

```bash
git clone https://github.com/Jaren771/Ikaza_Import.git
cd Ikaza_Import
```

Esto creará una carpeta llamada `Ikaza_Import` y entrarás en ella.

### Paso 2: Instalar las dependencias

```bash
npm install
```

Este paso descarga todas las librerías que necesita el proyecto. Puede tardar 1-2 minutos.

### Paso 3: Crear la base de datos

Abre PostgreSQL. Hay dos formas:

**Opción A — Desde terminal:**

```bash
psql -U postgres
```

Te pedirá la contraseña que pusiste al instalar PostgreSQL. Luego escribe:

```sql
CREATE DATABASE "Ikaza-imports";
\q
```

**Opción B — Desde pgAdmin (interfaz gráfica):**
1. Abre pgAdmin
2. Conéctate con tu contraseña
3. Haz clic derecho en "Databases" → "Create" → "Database"
4. Pon como nombre: `Ikaza-imports`
5. Guarda

### Paso 4: Configurar el archivo .env

En la carpeta del proyecto, crea un archivo llamado `.env` (sin nombre, solo la extensión).  
Pega esto adentro:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/Ikaza-imports"
AUTH_SECRET="abc123def456"
NEXTAUTH_SECRET="abc123def456"
```

**Importante:** Reemplaza `TU_CONTRASEÑA` por la contraseña que pusiste al instalar PostgreSQL.

### Paso 5: Sincronizar la base de datos

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Esto crea las tablas y las llena con datos de prueba (productos, usuarios, etc.).

### Paso 6: Iniciar el proyecto

```bash
npm run dev
```

Espera a que aparezca un mensaje como `http://localhost:3000`.

### Paso 7: Abrir en el navegador

Abre tu navegador y ve a: [http://localhost:3000](http://localhost:3000)

¡Ya deberías ver la tienda funcionando!

---

## Usuarios de prueba

Puedes iniciar sesión con cualquiera de estas cuentas:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@ikaza.pe` | `Admin123!` | Super Administrador |
| `admin@ikaza.pe` | `Admin123!` | Administrador |
| `manager@ikaza.pe` | `Admin123!` | Gestor de importaciones |
| `maria@gmail.com` | `Customer123!` | Cliente |
| `carlos@gmail.com` | `Customer123!` | Cliente |

---

## Solución de problemas comunes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `node --version` no funciona | Node.js no está instalado | Vuelve a instalarlo desde nodejs.org |
| `npm install` da errores | Conexión a internet o permisos | Reintenta o ejecuta como administrador |
| `npm run db:push` falla | Contraseña incorrecta en .env | Revisa que `DATABASE_URL` tenga tu contraseña real |
| `npm run dev` no abre | Puerto 3000 ocupado | Cierra otros programas o cambia de puerto |
| Error "relation does not exist" | No se corrió `db:push` | Ejecuta `npm run db:push` nuevamente |
| La página carga sin datos | No se corrió `db:seed` | Ejecuta `npm run db:seed` |

---

## Comandos útiles

```bash
npm run dev            # Iniciar el proyecto en modo desarrollo
npm run build          # Preparar para producción
npm run db:studio      # Ver la base de datos gráficamente
npm run db:reset       # Reiniciar la base de datos desde cero
npm run lint           # Revisar errores de código
```

---

## ¿Necesitas ayuda?

Si algo no funciona, revisa:
1. Que todos los pasos anteriores se hayan completado en orden
2. Que la contraseña en el archivo `.env` sea correcta
3. Que PostgreSQL esté funcionando (búscalo en los servicios de tu sistema)

Si el error persiste, consulta la documentación para desarrolladores en `README.md`.
