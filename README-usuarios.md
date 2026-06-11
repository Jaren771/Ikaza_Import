# ikaZa Import — Guía para Usuarios

> **ikaZa Import** es una tienda en línea y sistema de gestión de importaciones.  
> Este documento explica de forma sencilla cómo usar la plataforma.

---

<p align="center">
  <img src="Logo IKAZA.jpg" alt="ikaZa Import" width="100%">
</p>

---

## ¿Qué puedo hacer en ikaZa Import?

| Si eres... | Puedes... |
|------------|-----------|
| **Cliente** | Ver productos, filtrar por categoría o precio, agregar al carrito, comprar, dejar reseñas |
| **Administrador** | Administrar productos, pedidos, clientes, cupones, banners y ver estadísticas |
| **Importador** | Gestionar órdenes de compra a proveedores, tracking de envíos, costos de aduana |

---

## Para Clientes — Cómo Comprar

### 1. Explorar el Catálogo
- Ingresa a la página principal y navega por las categorías
- Usa los filtros del costado para buscar por **categoría**, **precio** o **solo productos en stock**
- Ordena los resultados por precio o popularidad

### 2. Ver un Producto
- Haz clic en cualquier producto para ver sus fotos, descripción y reseñas
- Revisa si tiene descuento (precio tachado)

### 3. Agregar al Carrito
- Selecciona la cantidad y haz clic en **"Agregar al carrito"**
- El ícono del carrito en la parte superior mostrará el total

### 4. Comprar
- Ve al carrito y haz clic en **"Proceder al pago"**
- Ingresa tu dirección de envío
- Elige el método de pago (tarjeta, transferencia, PayPal, etc.)
- ¡Listo! Recibirás la confirmación de tu pedido

### 5. Registrar una Cuenta
- Crea una cuenta con tu correo electrónico o con Google
- Podrás ver tu historial de pedidos y guardar productos en tu lista de deseos

---

## Para Administradores

### Panel de Control
- Al iniciar sesión como administrador, verás un **Dashboard** con:
  - Ventas totales del mes
  - Órdenes pendientes
  - Productos con bajo stock
  - Clientes nuevos

### Gestión de Productos
- **Crear:** Agrega nuevos productos con nombre, precio, fotos, descripción
- **Editar:** Modifica cualquier producto existente
- **Eliminar:** Da de baja productos (se ocultan del catálogo)

### Gestión de Pedidos
- Revisa los pedidos entrantes
- Actualiza el estado (pendiente, enviado, entregado, cancelado)
- Agrega número de seguimiento

### Cupones y Descuentos
- Crea cupones de tipo: **porcentaje**, **monto fijo** o **envío gratis**
- Define fechas de vigencia y límite de usos

---

## Para Importadores

### Órdenes de Importación
- Registra órdenes de compra a proveedores internacionales
- Calcula automáticamente costos de: **flete**, **aduana**, **seguro**
- Da seguimiento al estado del envío: En tránsito → En aduana → Recibido

### Inventario
- Revisa el stock actual de cada producto
- Configura alertas cuando el stock esté bajo

---

## Base de Datos

El proyecto guarda toda su información en una base de datos **PostgreSQL**.  
El archivo `Ikaza-imports.sql` contiene el script para crearla con todas las medidas de seguridad necesarias.

### Seguridad de la información

| Medida | ¿Qué hace? |
|--------|-----------|
| **Contraseñas encriptadas** | Las contraseñas de los usuarios se guardan encriptadas (no en texto plano), usando un método llamado bcrypt. Así, aunque alguien acceda a la base de datos, no puede leer las contraseñas. |
| **Permisos limitados** | La aplicación se conecta con un usuario que solo puede leer y escribir datos, pero no puede borrar tablas ni modificar la estructura de la base de datos. |
| **Aislamiento de datos** | Cada usuario solo puede ver su propia información (sus pedidos, su carrito). La base de datos está configurada para impedir que un usuario vea datos de otros, incluso si la aplicación tuviera un error. |
| **Registro de accesos** | La base de datos anota cada vez que alguien se conecta o desconecta. Esto ayuda a detectar accesos sospechosos. |
| **Tiempo de espera** | Si una conexión está inactiva por más de 30 minutos, se cierra automáticamente para liberar recursos. |

---

## Requisitos Técnicos (para usar la plataforma)

- Un navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet
- Resolución de pantalla recomendada: 1024px o superior

---

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| No cargan las imágenes | Verifica tu conexión a internet |
| No puedo iniciar sesión | Usa la opción "¿Olvidaste tu contraseña?" |
| El carrito está vacío | Asegúrate de haber agregado productos |
| El pago no se procesa | Prueba con otro método de pago |
