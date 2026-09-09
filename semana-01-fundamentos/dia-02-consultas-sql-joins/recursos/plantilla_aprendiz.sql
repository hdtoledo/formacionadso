-- ==============================================================================
-- SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (CADPH GARZÓN)
-- PROGRAMA: TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
-- SEMANA 1: NIVELACIÓN INTENSIVA DE FUNDAMENTOS
-- SESIÓN 02: CONSULTAS SQL AVANZADAS, AGREGACIONES Y CRUCE DE TABLAS (JOINS)
-- PLANTILLA DE LABORATORIO PARA EL APRENDIZ
-- INSTRUCTOR: Ing. Hector David Toledo Garcia
-- ==============================================================================

-- INSTRUCCIONES:
-- 1. Ejecuta primero la SECCIÓN 1 (Creación de esquema y datos de prueba).
-- 2. Resuelve los 5 retos progresivos de la SECCIÓN 2 en los bloques [TODO].
-- 3. Verifica cada consulta en MySQL Workbench antes de la sustentación del Bloque 3.

-- ==============================================================================
-- SECCIÓN 1: PREPARACIÓN DE ENTORNO Y DATOS DE PRUEBA (SEEDING)
-- ==============================================================================

DROP DATABASE IF EXISTS sistema_ventas_adso;
CREATE DATABASE sistema_ventas_adso 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_spanish_ci;

USE sistema_ventas_adso;

-- Tabla 1: Roles de usuario
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Tabla 2: Usuarios (Clientes y Empleados)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  ciudad VARCHAR(80) NOT NULL DEFAULT 'Garzón',
  rol_id INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) 
    REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla 3: Categorías de productos
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion TEXT NULL
) ENGINE=InnoDB;

-- Tabla 4: Catálogo de productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  categoria_id INT NULL,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) 
    REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla 5: Encabezado de pedidos
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  usuario_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  estado ENUM('PENDIENTE', 'PAGADO', 'ENVIADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla 6: Detalle de productos por pedido
CREATE TABLE detalle_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) 
    REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) 
    REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Inserción de datos iniciales
INSERT INTO roles (nombre) VALUES 
('Administrador'), ('Vendedor'), ('Cliente');

INSERT INTO usuarios (nombre, email, ciudad, rol_id, activo) VALUES
('Carlos Andrés Perdomo', 'carlos.perdomo@misena.edu.co', 'Garzón', 3, 1),
('María Fernanda Rojas', 'maria.rojas@gmail.com', 'Neiva', 3, 1),
('Juan Diego Cuéllar', 'juan.cuellar@outlook.com', 'Garzón', 3, 1),
('Valentina Losada', 'valentina.losada@misena.edu.co', 'Pitalito', 3, 1),
('Felipe Tovar Silva', 'felipe.tovar@yahoo.com', 'Gigante', 3, 0), -- Cliente inactivo
('Andrea Bermeo', 'andrea.bermeo@sena.edu.co', 'Garzón', 2, 1);    -- Vendedora

INSERT INTO categorias (nombre, descripcion) VALUES
('Laptops & Computadores', 'Equipos portátiles corporativos y de desarrollo'),
('Accesorios & Periféricos', 'Teclados mecánicos, ratones y diademas'),
('Monitores & Pantallas', 'Monitores IPS Full HD y 4K para programación'),
('Servicios & Licencias', 'Software y consultorías de desarrollo'); -- Categoría sin productos para pruebas

INSERT INTO productos (codigo, nombre, precio, stock, categoria_id) VALUES
('LAP-001', 'Portátil Lenovo ThinkPad E14 Gen 4 Core i7', 4200000.00, 12, 1),
('LAP-002', 'Portátil Asus Vivobook Ryzen 7 16GB RAM', 3150000.00, 8, 1),
('PER-001', 'Teclado Mecánico Keychron K2 Wireless RGB', 460000.00, 25, 2),
('PER-002', 'Mouse Ergonómico Logitech MX Master 3S', 480000.00, 15, 2),
('MON-001', 'Monitor Dell 27 Pulgadas IPS 75Hz QHD', 1250000.00, 4, 3),
('MON-002', 'Monitor LG UltraWide 29 Pulgadas IPS', 1100000.00, 0, 3), -- Agotado
('ACC-001', 'Cable Adaptador Tipo C a HDMI 4K', 75000.00, 50, NULL);  -- Sin categoría

INSERT INTO pedidos (codigo, usuario_id, fecha, total, estado) VALUES
('PED-2026-001', 1, '2026-09-01 10:30:00', 4660000.00, 'PAGADO'),
('PED-2026-002', 2, '2026-09-02 14:15:00', 1250000.00, 'PAGADO'),
('PED-2026-003', 1, '2026-09-04 16:45:00', 940000.00,  'PAGADO'),
('PED-2026-004', 3, '2026-09-05 09:10:00', 3150000.00, 'PENDIENTE');
-- Nota pedagógica: El usuario 4 (Valentina Losada) y usuario 5 (Felipe) NO tienen pedidos registrados aún.

INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 4200000.00, 4200000.00), -- Pedido 1: Lenovo ThinkPad
(1, 3, 1, 460000.00, 460000.00),   -- Pedido 1: Teclado Keychron
(2, 5, 1, 1250000.00, 1250000.00), -- Pedido 2: Monitor Dell
(3, 3, 1, 460000.00, 460000.00),   -- Pedido 3: Teclado Keychron
(3, 4, 1, 480000.00, 480000.00),   -- Pedido 3: Mouse Logitech
(4, 2, 1, 3150000.00, 3150000.00); -- Pedido 4: Asus Vivobook


-- ==============================================================================
-- SECCIÓN 2: RETOS DE CONSULTA Y LABORATORIO PRÁCTICO (BLOQUE 2)
-- ==============================================================================

-- RETO 1: FILTROS AVANZADOS Y PRECEDENCIA LÓGICA
-- Enunciado: Listar los aprendices/clientes activos que pertenezcan a las ciudades
-- de 'Garzón' o 'Neiva', cuyo correo sea institucional de '@misena.edu.co'.
-- Pista: Usa paréntesis para aislar el OR de las ciudades y combínalo con AND LIKE.
-- [TODO: Escribe tu consulta aquí]



-- RETO 2: RANGOS, LISTAS Y NULOS
-- Enunciado: Obtener todos los productos cuyo precio esté entre $400.000 y $2.000.000,
-- o aquellos que NO tengan asignada ninguna categoría (categoria_id sea nulo).
-- Mostrar: codigo, nombre, precio y categoria_id ordenados de mayor a menor precio.
-- [TODO: Escribe tu consulta aquí]



-- RETO 3: AGREGACIONES Y RESÚMENES (GROUP BY + HAVING)
-- Enunciado: Generar un reporte gerencial con la cantidad de pedidos y la suma
-- total recaudada por cada estado de pedido ('PAGADO', 'PENDIENTE', etc.).
-- Filtrar únicamente los estados cuya suma total supere $1.500.000.
-- Columnas: estado, total_pedidos, total_recaudado.
-- [TODO: Escribe tu consulta aquí]



-- RETO 4: CRUCE DE TABLAS CON INTERSECCIÓN (INNER JOIN)
-- Enunciado: Generar el listado detallado de facturación de productos vendidos.
-- Debes cruzar: pedidos, usuarios, detalle_pedidos y productos.
-- Mostrar: codigo_pedido, nombre_cliente, nombre_producto, cantidad, precio_unitario, subtotal.
-- Ordenar por fecha de pedido descendente.
-- [TODO: Escribe tu consulta aquí]



-- RETO 5: AUDITORÍA DE RELACIONES HUÉRFANAS (LEFT JOIN & IS NULL)
-- Enunciado 5A: Encontrar los clientes que se registraron pero NUNCA han realizado un pedido.
-- Enunciado 5B: Encontrar las categorías que NO tienen ningún producto registrado.
-- [TODO: Escribe tus dos consultas aquí]

