-- ==============================================================================
-- SENA - CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (CADPH GARZÓN)
-- PROGRAMA: TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
-- SEMANA 1: NIVELACIÓN INTENSIVA DE FUNDAMENTOS
-- SESIÓN 02: CONSULTAS SQL AVANZADAS, AGREGACIONES Y CRUCE DE TABLAS (JOINS)
-- SCRIPT MAESTRO DE SOLUCIONES Y CASOS DE PRUEBA
-- INSTRUCTOR: Ing. Hector David Toledo Garcia (https://www.hdtoledo.dev/)
-- ==============================================================================

USE sistema_ventas_adso;

-- ==============================================================================
-- DEMOSTRACIÓN CONCEPTUAL EN CLASE (BLOQUE 1: LIVE CODING)
-- ==============================================================================

-- 1. Orden real de ejecución en SQL:
-- FROM -> ON / JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT

-- 2. Diferencia entre COUNT(*) y COUNT(columna)
SELECT 
  COUNT(*) AS total_filas_catalogo,
  COUNT(categoria_id) AS productos_con_categoria,
  COUNT(*) - COUNT(categoria_id) AS productos_sin_categoria_huerfanos
FROM productos;

-- 3. La trampa del NULL: ¿Por qué esto no devuelve nada?
-- SELECT * FROM productos WHERE categoria_id = NULL; -- ❌ INCORRECTO (evalúa a UNKNOWN)
-- Forma correcta:
SELECT codigo, nombre, precio 
FROM productos 
WHERE categoria_id IS NULL; -- ✅ CORRECTO


-- ==============================================================================
-- SOLUCIONARIO OFICIAL DE RETOS (BLOQUE 2: TALLER PRÁCTICO)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- RETO 1: FILTROS AVANZADOS Y PRECEDENCIA LÓGICA
-- Enunciado: Listar clientes activos de 'Garzón' o 'Neiva', con correo institucional '@misena.edu.co'.
-- Demostración de precedencia: Sin paréntesis, AND se evalúa antes que OR.
-- ------------------------------------------------------------------------------
SELECT 
  id,
  nombre,
  email,
  ciudad,
  activo
FROM usuarios
WHERE activo = 1 
  AND (ciudad = 'Garzón' OR ciudad = 'Neiva')
  AND email LIKE '%@misena.edu.co';


-- ------------------------------------------------------------------------------
-- RETO 2: RANGOS, LISTAS Y NULOS
-- Enunciado: Productos entre $400.000 y $2.000.000 o sin categoría asignada.
-- ------------------------------------------------------------------------------
SELECT 
  codigo,
  nombre,
  precio,
  categoria_id
FROM productos
WHERE (precio BETWEEN 400000.00 AND 2000000.00)
   OR categoria_id IS NULL
ORDER BY precio DESC;


-- ------------------------------------------------------------------------------
-- RETO 3: AGREGACIONES Y RESÚMENES (GROUP BY + HAVING)
-- Enunciado: Cantidad de pedidos y suma recaudada por estado (suma > $1.500.000).
-- ------------------------------------------------------------------------------
SELECT 
  estado,
  COUNT(id) AS total_pedidos,
  SUM(total) AS total_recaudado,
  ROUND(AVG(total), 2) AS ticket_promedio
FROM pedidos
GROUP BY estado
HAVING SUM(total) > 1500000.00
ORDER BY total_recaudado DESC;


-- ------------------------------------------------------------------------------
-- RETO 4: CRUCE DE TABLAS CON INTERSECCIÓN (INNER JOIN)
-- Enunciado: Listado detallado de facturación de productos vendidos.
-- Cruce de 4 tablas: pedidos -> usuarios -> detalle_pedidos -> productos
-- ------------------------------------------------------------------------------
SELECT 
  ped.codigo AS codigo_pedido,
  ped.fecha AS fecha_pedido,
  usr.nombre AS cliente,
  usr.ciudad,
  prod.nombre AS producto,
  cat.nombre AS categoria,
  det.cantidad,
  det.precio_unitario,
  det.subtotal
FROM pedidos ped
INNER JOIN usuarios usr 
  ON ped.usuario_id = usr.id
INNER JOIN detalle_pedidos det 
  ON ped.id = det.pedido_id
INNER JOIN productos prod 
  ON det.producto_id = prod.id
LEFT JOIN categorias cat 
  ON prod.categoria_id = cat.id
ORDER BY ped.fecha DESC, det.id ASC;


-- ------------------------------------------------------------------------------
-- RETO 5A: AUDITORÍA DE CLIENTES SIN PEDIDOS (LEFT JOIN & IS NULL)
-- Enunciado: Clientes registrados que NUNCA han realizado un pedido.
-- ------------------------------------------------------------------------------
SELECT 
  usr.id,
  usr.nombre AS cliente_sin_compras,
  usr.email,
  usr.ciudad,
  usr.created_at AS fecha_registro
FROM usuarios usr
LEFT JOIN pedidos ped 
  ON usr.id = ped.usuario_id
WHERE ped.id IS NULL 
  AND usr.rol_id = 3; -- Solo rol Cliente


-- ------------------------------------------------------------------------------
-- RETO 5B: AUDITORÍA DE CATEGORÍAS SIN PRODUCTOS (LEFT JOIN & IS NULL)
-- Enunciado: Categorías creadas en el sistema que no tienen ningún producto asociado.
-- ------------------------------------------------------------------------------
SELECT 
  cat.id,
  cat.nombre AS categoria_vacia,
  cat.descripcion
FROM categorias cat
LEFT JOIN productos prod 
  ON cat.id = prod.categoria_id
WHERE prod.id IS NULL;


-- ==============================================================================
-- CONSULTAS EXTRA DE ALTO VALOR (PREGUNTAS DE SUSTENTACIÓN EN CALIENTE - BLOQUE 3)
-- ==============================================================================

-- Pregunta de Sustentación 1:
-- "¿Cuál es el cliente con mayor volumen histórico de compras pagadas?"
SELECT 
  usr.id,
  usr.nombre,
  usr.email,
  COUNT(ped.id) AS pedidos_completados,
  SUM(ped.total) AS inversion_total
FROM usuarios usr
INNER JOIN pedidos ped ON usr.id = ped.usuario_id
WHERE ped.estado = 'PAGADO'
GROUP BY usr.id, usr.nombre, usr.email
ORDER BY inversion_total DESC
LIMIT 1;

-- Pregunta de Sustentación 2:
-- "Reporte de stock total y valor del inventario por categoría"
SELECT 
  COALESCE(cat.nombre, 'Sin Categoría Asignada') AS categoria,
  COUNT(prod.id) AS total_referencias,
  SUM(prod.stock) AS unidades_en_stock,
  SUM(prod.stock * prod.precio) AS valor_inventario
FROM productos prod
LEFT JOIN categorias cat ON prod.categoria_id = cat.id
GROUP BY cat.id, cat.nombre
ORDER BY valor_inventario DESC;
