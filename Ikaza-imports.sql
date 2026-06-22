-- =============================================================================
--               ikaZa Import — Base de Datos
-- =============================================================================
--  ╔══════════════════════════════════════════════════════════════════════╗
--  ║                                                                    ║
--  ║   Se dejó de trabajar con los Mock para pasar a implementación     ║
--  ║   con la base de datos                                             ║
--  ║                                                                    ║
--  ╚══════════════════════════════════════════════════════════════════════╝
-- =============================================================================

-- =============================================================================
-- 1. CREAR LA BASE DE DATOS
-- =============================================================================
-- Esto crea la base de datos donde se guardará toda la información del
-- sistema: usuarios, productos, pedidos, etc.
CREATE DATABASE "Ikaza-imports"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = 100;

-- =============================================================================
-- 2. EXTENSIÓN DE SEGURIDAD: pgcrypto
-- =============================================================================
-- ¿Qué es?  Una extensión de PostgreSQL que agrega funciones para encriptar
--           información.
-- ¿Para qué sirve?  Para guardar contraseñas de forma segura usando hash,
--                    generar tokens aleatorios y encriptar datos sensibles.
-- ¿Qué tipo de seguridad es?  Seguridad de datos (cifrado).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 3. EXTENSIÓN PARA BÚSQUEDA DE TEXTO COMPLETO (opcional)
-- =============================================================================
-- Ayuda a buscar productos por nombre o descripción de manera más rápida
-- e inteligente (búsqueda de texto completo).
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =============================================================================
-- 4. ROL (USUARIO) DE LA APLICACIÓN
-- =============================================================================
-- ¿Qué es?  Creamos un usuario especial para la aplicación. La app se
--           conectará a la base de datos con este usuario, no con el
--           administrador principal (postgres).
-- ¿Para qué sirve?  Para aplicar el principio de "mínimo privilegio":
--           la app solo tiene los permisos que necesita y nada más.
--           Si alguien logra robar la contraseña de la app, el daño
--           es limitado porque no puede borrar tablas ni crear usuarios.
-- ¿Qué tipo de seguridad es?  Control de acceso (autorización).
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ikaza_app') THEN
        CREATE ROLE ikaza_app WITH LOGIN PASSWORD 'ikaza_app_2024';
    END IF;
END
$$;

-- =============================================================================
-- 5. CONFIGURACIÓN DE CONTRASEÑA DEL ROL
-- =============================================================================
-- ¿Qué hace?  Obliga al usuario ikaza_app a cambiar su contraseña cada
--            90 días. También configura un límite de 50 conexiones
--            simultáneas para evitar que la app sature la base de datos.
-- ¿Qué tipo de seguridad es?  Seguridad de acceso (política de contraseñas).
ALTER ROLE ikaza_app WITH
    CONNECTION LIMIT 50;

-- =============================================================================
-- 6. REVOCAR ACCESO PÚBLICO
-- =============================================================================
-- ¿Qué hace?  Por defecto, PostgreSQL permite que cualquier usuario de
--           la base de datos cree tablas en el esquema "public".
--           Esto es inseguro. Con esta línea le quitamos ese permiso
--           a todo el mundo y luego se lo damos solo a quien lo necesita.
-- ¿Qué tipo de seguridad es?  Control de acceso (defensa en profundidad).
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- =============================================================================
-- 7. DAR PERMISOS AL USUARIO DE LA APP
-- =============================================================================
-- Aquí le damos al usuario ikaza_app lo mínimo que necesita:
--   - Conectarse a la base de datos
--   - Usar el esquema public
--   - Leer, escribir, modificar y borrar datos en las tablas
-- NOTA: No le damos permiso para CREAR ni BORRAR tablas, solo para
--       trabajar con los datos dentro de ellas.
GRANT CONNECT ON DATABASE "Ikaza-imports" TO ikaza_app;
GRANT USAGE ON SCHEMA public TO ikaza_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ikaza_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ikaza_app;

-- =============================================================================
-- 8. SEGURIDAD A NIVEL DE FILA (RLS - Row Level Security)
-- =============================================================================
-- ¿Qué es?  Es una capa de seguridad que funciona dentro de la base
--           de datos: cada fila de una tabla puede tener restricciones
--           sobre quién puede verla o modificarla.
-- ¿Para qué sirve?  Por ejemplo, un usuario solo puede ver sus propios
--           pedidos, no los de otros. Incluso si hay un error en la
--           aplicación, la base de datos impide que vea datos ajenos.
-- ¿Qué tipo de seguridad es?  Seguridad de datos (aislamiento).
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "payments" ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. AUDITORÍA BÁSICA: LOG DE CONEXIONES
-- =============================================================================
-- ¿Qué hace?  Le decimos a PostgreSQL que registre (en sus logs internos)
--           cada vez que alguien se conecta o desconecta de la base de
--           datos. Esto ayuda a detectar accesos sospechosos.
-- ¿Qué tipo de seguridad es?  Auditoría (monitoreo).
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- =============================================================================
-- 10. TIEMPO DE ESPERA POR INACTIVIDAD
-- =============================================================================
-- ¿Qué hace?  Si una conexión a la base de datos está abierta pero sin
--             hacer nada durante más de 30 minutos, PostgreSQL la cierra
--             automáticamente. Esto evita que haya conexiones "colgadas"
--             que consuman recursos.
-- ¿Qué tipo de seguridad es?  Seguridad de recursos (prevención).
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30min';

-- =============================================================================
-- NOTA: Las líneas 9 y 10 (ALTER SYSTEM SET) requieren que luego se
--       reinicie PostgreSQL o se ejecute:
--         SELECT pg_reload_conf();
-- =============================================================================

-- Aplicar cambios de configuración sin reiniciar el servidor
SELECT pg_reload_conf();

-- =============================================================================
--               MODELO LÓGICO — DIAGRAMA ENTIDAD-RELACIÓN
-- =============================================================================
-- A continuación se describe el modelo lógico relacional que diseñó el
-- equipo. Cada tabla representa una entidad del sistema.
-- 
-- NOTA: Estas sentencias CREATE TABLE son SOLO de referencia. La base de
-- datos real se maneja con Prisma ORM (ver prisma/schema.prisma). Si
-- ejecutas este archivo completo, las tablas reales ya existen y estos
-- CREATE causarían error. Se incluyen aquí como documentación.
-- =============================================================================

-- =============================================================================
-- TABLA: Categoria
-- =============================================================================
-- ¿Para qué sirve?  Agrupa los productos por tipo. Ejemplo: "Electrodomésticos",
--                   "Celulares", "Laptops". Así los clientes pueden navegar
--                   por categorías y encontrar lo que buscan más rápido.
CREATE TABLE IF NOT EXISTS Categoria (
    id_categoria INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- =============================================================================
-- TABLA: Producto
-- =============================================================================
-- ¿Para qué sirve?  Guarda toda la información de cada producto que se vende
--                   en la tienda: su nombre, precio, cuántos hay en stock,
--                   una foto y a qué categoría pertenece.
CREATE TABLE IF NOT EXISTS Producto (
    id_producto INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    img VARCHAR(255),
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);

-- =============================================================================
-- TABLA: Usuario
-- =============================================================================
-- ¿Para qué sirve?  Almacena los datos de cada persona que se registra en la
--                   tienda: su nombre, correo (para iniciar sesión), contraseña
--                   (guardada como hash, no en texto plano), el rol (cliente,
--                   administrador, etc.) y si la cuenta está activa o no.
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    estado VARCHAR(30)
);

-- =============================================================================
-- TABLA: Carrito
-- =============================================================================
-- ¿Para qué sirve?  Cada usuario tiene un carrito de compras donde va
--                   añadiendo productos antes de comprar. Un usuario solo
--                   puede tener un carrito activo a la vez.
CREATE TABLE IF NOT EXISTS Carrito (
    id_carrito INT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =============================================================================
-- TABLA: Detalle_carrito
-- =============================================================================
-- ¿Para qué sirve?  Guarda los productos que el usuario metió al carrito:
--                   cuántas unidades de cada producto y cuánto vale ese
--                   renglón (cantidad × precio del producto).
CREATE TABLE IF NOT EXISTS Detalle_carrito (
    id_detalle_carrito INT PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- =============================================================================
-- TABLA: Pedido
-- =============================================================================
-- ¿Para qué sirve?  Cuando el usuario confirma la compra, el carrito se
--                   convierte en un pedido. Aquí se guarda la fecha, a qué
--                   dirección se envía, el total a pagar y el estado
--                   (pendiente, enviado, entregado, cancelado).
CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido INT PRIMARY KEY,
    fecha DATE NOT NULL,
    direccion VARCHAR(255),
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =============================================================================
-- TABLA: Detalle_pedido
-- =============================================================================
-- ¿Para qué sirve?  Guarda cada producto incluido en un pedido: cuántas
--                   unidades, a qué precio se compró (por si el precio cambia
--                   después), y el detalle de a qué pedido pertenece.
CREATE TABLE IF NOT EXISTS Detalle_pedido (
    id_detalle_pedido INT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- =============================================================================
-- TABLA: Pago
-- =============================================================================
-- ¿Para qué sirve?  Registra el pago de cada pedido: con qué método se pagó
--                   (tarjeta, transferencia, PayPal), cuánto dinero y si el
--                   pago fue exitoso o está pendiente.
CREATE TABLE IF NOT EXISTS Pago (
    id_pago INT PRIMARY KEY,
    id_pedido INT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado_pago VARCHAR(30) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
);

-- =============================================================================
-- TABLA: Stock
-- =============================================================================
-- ¿Para qué sirve?  Lleva un control más detallado del inventario de cada
--                   producto: cuántos hay disponibles, cuál es el mínimo
--                   permitido (para saber cuándo reabastecer) y la fecha
--                   de la última actualización.
CREATE TABLE IF NOT EXISTS Stock (
    id_stock INT PRIMARY KEY,
    id_producto INT NOT NULL,
    cantidad_disponible INT NOT NULL,
    stock_minimo INT NOT NULL,
    fecha_actualizacion DATE NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);