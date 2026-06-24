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
- Usa la barra de búsqueda para encontrar productos específicos

### 2. Ver un Producto
- Haz clic en cualquier producto para ver sus fotos, descripción y reseñas
- Revisa si tiene descuento (precio tachado)
- Mira las reseñas de otros clientes antes de decidirte

### 3. Agregar al Carrito
- Selecciona la cantidad y haz clic en **"Agregar al carrito"**
- El ícono del carrito en la parte superior mostrará el total
- Puedes seguir navegando y agregar más productos

### 4. Comprar
- Ve al carrito y haz clic en **"Proceder al pago"**
- Si no has iniciado sesión, puedes hacerlo o crear una cuenta
- Ingresa tu dirección de envío
- Elige el método de pago (tarjeta, transferencia, PayPal, etc.)
- ¡Listo! Recibirás la confirmación de tu pedido

### 5. Registrar una Cuenta
- Crea una cuenta con tu correo electrónico o con Google
- Podrás ver tu historial de pedidos y guardar productos en tu lista de deseos
- Recibe ofertas y promociones exclusivas

---

## Para Clientes — Lista de Deseos

- Desde la página de un producto, haz clic en el ícono de corazón para guardarlo
- Accede a tu lista de deseos desde el menú de usuario
- Los productos guardados muestran el precio actualizado en tiempo real

---

## Para Administradores

### Acceso al Panel
- Inicia sesión con una cuenta con rol de administrador
- Verás un enlace al panel de administración en el menú

### Dashboard
- Al iniciar sesión como administrador, verás un **Dashboard** con:
  - Ventas totales del mes
  - Órdenes pendientes
  - Productos con bajo stock
  - Clientes nuevos

### Gestión de Productos
- **Crear:** Agrega nuevos productos con nombre, precio, fotos, descripción
- **Editar:** Modifica cualquier producto existente
- **Eliminar:** Da de baja productos (se ocultan del catálogo, no se borran)

### Gestión de Pedidos
- Revisa los pedidos entrantes
- Actualiza el estado (pendiente, enviado, entregado, cancelado)
- Agrega número de seguimiento

### Cupones y Descuentos
- Crea cupones de tipo: **porcentaje**, **monto fijo** o **envío gratis**
- Define fechas de vigencia y límite de usos
- Los cupones se aplican en el carrito de compras

### Banners Promocionales
- Agrega banners en la página principal
- Programa fechas de inicio y fin
- Sube imágenes personalizadas

---

## Para Importadores

### Órdenes de Importación
- Registra órdenes de compra a proveedores internacionales
- Calcula automáticamente costos de: **flete**, **aduana**, **seguro**
- Da seguimiento al estado del envío: En tránsito → En aduana → Recibido

### Inventario
- Revisa el stock actual de cada producto
- Configura alertas cuando el stock esté bajo
- Registra movimientos de inventario (entradas, salidas, ajustes)

---

## Seguridad de la Información

| Medida | ¿Qué hace? |
|--------|-----------|
| **Contraseñas encriptadas** | Las contraseñas de los usuarios se guardan encriptadas con bcrypt. Aunque alguien acceda a la base de datos, no puede leerlas. |
| **Permisos limitados** | La aplicación se conecta con un usuario que solo puede leer y escribir datos, no borrar tablas ni modificar la estructura. |
| **Aislamiento de datos** | Cada usuario solo puede ver su propia información (sus pedidos, su carrito). |
| **Registro de accesos** | La base de datos anota cada conexión y desconexión para detectar accesos sospechosos. |
| **Tiempo de espera** | Las conexiones inactivas por más de 30 minutos se cierran automáticamente. |

---

## Requisitos Técnicos (para usar la plataforma)

- Un navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet
- Resolución de pantalla recomendada: 1024px o superior
- JavaScript habilitado en el navegador

---

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| No cargan las imágenes | Verifica tu conexión a internet |
| No puedo iniciar sesión | Usa la opción "¿Olvidaste tu contraseña?" |
| El carrito está vacío | Asegúrate de haber agregado productos desde el catálogo |
| El pago no se procesa | Prueba con otro método de pago o contacta a soporte |
| No encuentro un producto | Usa la barra de búsqueda o los filtros del catálogo |
| El checkbox de términos no funciona | Asegúrate de hacer clic directamente en el cuadro |
