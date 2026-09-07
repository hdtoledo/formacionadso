-- ==============================================================================
-- SENA - CENTRO DE BIOTECNOLOGÍA INDUSTRIAL / FORMACIÓN ADSO
-- PROGRAMA: ANÁLISIS Y DESARROLLO DE SOFTWARE
-- SEMANA 1: NIVELACIÓN INTENSIVA DE FUNDAMENTOS
-- SESIÓN: Lunes 7 Sep | BD: Modelo Relacional y SQL DDL/DML desde Cero
-- SCRIPT: Solución Completa del Sistema de Ventas Básico
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FASE DDL (DATA DEFINITION LANGUAGE)
-- ------------------------------------------------------------------------------

-- Limpiar base de datos previa si existe (permite reejecutar el script desde cero)
DROP DATABASE IF EXISTS sistema_ventas_db;

-- Creación con soporte completo para caracteres en español (tildes, eñes)
CREATE DATABASE IF NOT EXISTS sistema_ventas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos activa
USE sistema_ventas_db;

-- ------------------------------------------------------------------------------
-- TABLA 1: USUARIOS
-- Restricciones aplicadas:
--   - PRIMARY KEY: Identificador unívoco
--   - UNIQUE: Documento y Correo no se pueden repetir
--   - NOT NULL: Obligatoriedad de datos
--   - DEFAULT: Asignación automática de rol 'CLIENTE', estado activo y fecha
-- ------------------------------------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    rol ENUM('ADMIN', 'VENDEDOR', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- TABLA 2: CATEGORIAS (Entidad Padre respecto a Productos)
-- ------------------------------------------------------------------------------
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- TABLA 3: PRODUCTOS (Entidad Hija vinculada con Categorias)
-- Restricciones aplicadas:
--   - FOREIGN KEY: categoria_id apunta a categorias(id)
--   - ON DELETE RESTRICT: Protege contra borrados huérfanos
--   - CHECK: Validación lógica de precios y stock mayores o iguales a cero
-- ------------------------------------------------------------------------------
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barras VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relación y Llave Foránea
    CONSTRAINT fk_productos_categorias
        FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
        
    -- Validación de integridad de negocio
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. FASE DML (DATA MANIPULATION LANGUAGE) - INSERCIÓN DE DATOS
-- ------------------------------------------------------------------------------

-- Inserción de Usuarios iniciales
INSERT INTO usuarios (documento, nombres, email, rol, activo) VALUES
('1001234567', 'Carlos Alberto Ruiz', 'carlos.ruiz@misena.edu.co', 'ADMIN', TRUE),
('1009876543', 'María Fernanda Gómez', 'maria.gomez@empresa.com', 'VENDEDOR', TRUE),
('1014567890', 'Julián Andrés Caicedo', 'julian.caicedo@gmail.com', 'CLIENTE', TRUE),
('1023456789', 'Laura Sofía Méndez', 'laura.mendez@outlook.com', 'CLIENTE', TRUE);

-- Inserción de Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Tecnología', 'Dispositivos electrónicos, periféricos y accesorios de cómputo'),
('Papelería y Oficina', 'Útiles de oficina, cuadernos, bolígrafos y papelería técnica'),
('Audio y Sonido', 'Auriculares, parlantes Bluetooth y micrófonos');

-- Inserción de Productos asociados a categorías existentes (categoria_id válida)
INSERT INTO productos (codigo_barras, nombre, precio, stock, categoria_id) VALUES
('TECH-001', 'Teclado Mecánico RGB Switch Blue', 185000.00, 15, 1),
('TECH-002', 'Mouse Ergonómico Inalámbrico 2.4Ghz', 75000.00, 28, 1),
('PAP-001', 'Resma de Papel Carta 75g (500 Hojas)', 24000.00, 100, 2),
('AUD-001', 'Auriculares Diadema con Cancelación Activa', 230000.00, 12, 3),
('AUD-002', 'Parlante Bluetooth Portátil Resistente al Agua', 110000.00, 20, 3);

-- ------------------------------------------------------------------------------
-- 3. FASE DML - ACTUALIZACIÓN CONTROLADA (SIEMPRE CON WHERE)
-- ------------------------------------------------------------------------------

-- Actualizar precio y stock de un producto específico por su código único
UPDATE productos
SET precio = 195000.00, stock = stock + 10
WHERE codigo_barras = 'TECH-001';

-- Desactivar un usuario (Borrado lógico recomendado en lugar de DELETE físico)
UPDATE usuarios
SET activo = FALSE
WHERE documento = '1023456789';

-- ------------------------------------------------------------------------------
-- 4. FASE DML - ELIMINACIÓN CON WHERE ESTRICTO
-- ------------------------------------------------------------------------------

-- Eliminar un producto específico que no tiene transacciones
DELETE FROM productos
WHERE codigo_barras = 'PAP-001';

-- ==============================================================================
-- 5. CASOS DE EVALUACIÓN Y SUSTENTACIÓN EN VIVO (RÚBRICA DE CLASE)
-- ==============================================================================

-- RETO 1: AGREGAR CAMPO EN VIVO CON RESTRICCIÓN UNIQUE
-- Sintaxis requerida para la pregunta de validación:
ALTER TABLE usuarios
ADD COLUMN telefono VARCHAR(20) NULL UNIQUE AFTER email;

-- Probar la restricción insertando un teléfono
UPDATE usuarios SET telefono = '3115551234' WHERE documento = '1001234567';

-- La siguiente línea FALLARÁ intencionalmente si se repite el teléfono:
-- UPDATE usuarios SET telefono = '3115551234' WHERE documento = '1009876543';
-- ERROR: Duplicate entry '3115551234' for key 'usuarios.telefono'


-- RETO 2: DEMOSTRACIÓN DE INTEGRIDAD REFERENCIAL (FK)
-- ¿Por qué NO se puede eliminar la categoría con id = 1 (Tecnología)?
-- INTENTO DE BORRADO:
-- DELETE FROM categorias WHERE id = 1;
-- 
-- RESULTADO EN WORKBENCH:
-- Error Code: 1451. Cannot delete or update a parent row: a foreign key constraint fails
-- (`sistema_ventas_db`.`productos`, CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`))
--
-- EXPLICACIÓN TÉCNICA PARA EL APRENDIZ:
-- Porque la tabla 'productos' tiene registros hijos que dependen directamente de la categoría 1.
-- Gracias a la regla ON DELETE RESTRICT de la FK, el motor InnoDB previene la existencia de
-- 'productos huérfanos' (productos que apuntarían a una categoría inexistente), salvaguardando
-- la consistencia e integridad de los datos relacionales.

-- ------------------------------------------------------------------------------
-- VERIFICACIÓN FINAL DE DATOS
-- ------------------------------------------------------------------------------
SELECT * FROM usuarios;
SELECT * FROM categorias;
SELECT p.id, p.codigo_barras, p.nombre, p.precio, p.stock, c.nombre AS categoria
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id;
