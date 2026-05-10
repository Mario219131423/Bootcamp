
-- TALLER 02 - SQL PRÁCTICO (BASE DE DATOS SAKILA)

-- Asegurar el uso de la base de datos
USE sakila;

-- ------------------------------
-- PARTE 1: SELECT y WHERE
-- ------------------------------

-- 1. Mostrar nombre y apellido de todos los clientes
SELECT first_name, last_name 
FROM customer;

-- 2. Películas con duración mayor a 120 minutos
SELECT title, length 
FROM film 
WHERE length > 120;


-- ------------------------------
-- PARTE 2: ORDER BY
-- ------------------------------

-- 3. Ordenar clientes por apellido de forma ascendente (A-Z)
SELECT * FROM customer 
ORDER BY last_name ASC;

-- 4. Top 5 películas más largas (Uso de LIMIT para eficiencia)
SELECT title, length 
FROM film 
ORDER BY length ASC 
LIMIT 5;


-- ------------------------------
-- PARTE 3: INNER JOIN (Relaciones exactas)
-- ------------------------------

-- 5. Historial de pagos: Cantidad y fecha con identificación del cliente
SELECT c.first_name, c.last_name, p.amount, p.payment_date
FROM customer c
INNER JOIN payment p ON c.customer_id = p.customer_id;

-- 6. Películas alquiladas (JOIN entre Rental - Inventory - Film)
-- Se incluyen las fechas para distinguir cada transacción de renta individual.
SELECT 
    f.title AS 'Título de la Película', 
    r.rental_date AS 'Fecha de Renta'
FROM film f
INNER JOIN inventory i ON f.film_id = i.film_id
INNER JOIN rental r ON i.inventory_id = r.inventory_id
ORDER BY r.rental_date DESC;

-- ------------------------------
-- PARTE 4: LEFT JOIN (Identificación de registros huérfanos o nulos)
-- ------------------------------

-- 7. Clientes que no han registrado ningún pago (Filtro por nulidad)
SELECT c.first_name, c.last_name, p.payment_id
FROM customer c
LEFT JOIN payment p ON c.customer_id = p.customer_id
WHERE p.payment_id IS NULL;

-- 8. Títulos de películas que no tienen actores asignados en la base de datos
SELECT f.title, f.length
FROM film f
LEFT JOIN film_actor fa ON f.film_id = fa.film_id
WHERE fa.actor_id IS NULL;


-- ------------------------------
-- PARTE 5: DML (INSERT, UPDATE, DELETE)
-- ------------------------------

-- 9. Inserción de un nuevo registro de actor para pruebas
INSERT INTO actor (first_name, last_name) 
VALUES ('MARIO', 'PAIBA');

-- 10. Actualización del registro creado (Uso de WHERE para integridad)
UPDATE actor 
SET first_name = 'MARIO ALBERTO' 
WHERE first_name = 'MARIO' AND last_name = 'PAIBA';

-- 11. Eliminación del registro temporal
DELETE FROM actor 
WHERE first_name = 'MARIO ALBERTO' AND last_name = 'PAIBA';


-- ------------------------------
-- PARTE 6: CONSULTAS AVANZADAS (Agregaciones y Métricas)
-- ------------------------------

-- 12. Análisis de ingresos: Top 5 clientes con mayor inversión en rentas
SELECT c.first_name, c.last_name, SUM(p.amount) AS total_pagado
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id
ORDER BY total_pagado DESC
LIMIT 5;

-- 13. Análisis de inventario: Las 5 películas más populares (más alquiladas)
SELECT f.title, COUNT(r.rental_id) AS veces_alquilada
FROM film f
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
GROUP BY f.film_id
ORDER BY veces_alquilada DESC
LIMIT 5;

-- FIN DEL SCRIPT