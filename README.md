# RepoBiblio – Sistema de Reportes de Biblioteca

## Evaluación Práctica – Unidad 1 (AWOS y BDA)

Sistema integral de gestión y visualización de reportes para biblioteca, desarrollado con Next.js (App Router) y PostgreSQL, utilizando Docker Compose para la orquestación del entorno completo.

## 1. Instrucciones de Ejecución

- El proyecto está completamente contenerizado.

- Prerrequisitos

- Docker

- Docker Compose

- Pasos para levantar el proyecto

- Clonar el repositorio o descargar la carpeta.

- Crear el archivo .env en la raíz del proyecto a partir de .env.example.

- Ejecutar el siguiente comando:
```bash
- docker compose up --build
```
El comando levanta:

- Base de datos PostgreSQL

- Aplicación Next.js

- Inicialización automática del esquema, datos y vistas

## 2. Estructura de Base de Datos

El sistema implementa un modelo relacional de biblioteca con las siguientes tablas:

- members: socios de la biblioteca

- books: información bibliográfica

- copies: copias físicas e inventario

- loans: préstamos activos e históricos

- fines: multas generadas por mora

### 2.1 Scripts de Base de Datos

Los siguientes scripts se ejecutan automáticamente al iniciar el contenedor:

- db/schema.sql: definición de tablas y relaciones.

- db/seed.sql: datos de prueba suficientes para todos los reportes, filtros y paginación.

- db/migrate.sql: inicialización del esquema.

- db/reports_vw.sql: definición de vistas SQL de reportes.

- db/indexes.sql: índices de optimización.

- db/roles.sql: configuración de roles y permisos.

## 3. Reportes Implementados (Vistas SQL)

Se implementaron 5 vistas:

- vw_most_borrowed_books

Ranking de libros más prestados

Uso de Window Function (DENSE_RANK)

Permite búsqueda por título/autor y paginación

- vw_overdue_loans

Préstamos vencidos

Uso de CTE (WITH) y lógica de fechas

Cálculo de días de atraso y monto sugerido

- vw_fines_summary

Resumen mensual de multas

Uso de HAVING para filtrar montos relevantes

- vw_member_activity

Actividad de socios

Uso de HAVING + CASE / COALESCE

Cálculo de ratio de devoluciones tardías

- vw_inventory_health

Estado del inventario por categoría

Uso de CASE / COALESCE para clasificación de copias

Todas las vistas incluyen:

Agregaciones (COUNT / SUM)

GROUP BY

Campos calculados

Consultas únicamente de lectura

## 4. Evidencia de Índices (EXPLAIN)

Se crearon índices para optimizar las consultas más frecuentes.

Consulta 1: Búsqueda por título (Reporte de Popularidad)
```sql
EXPLAIN ANALYZE
SELECT * FROM books WHERE title ILIKE 'Harry%';
```
Resultado:
```sql
Index Scan using idx_books_title on books
(cost=0.00..8.27 rows=10 width=255)
Index Cond: ((title)::text ~~* 'Harry%'::text)
```
Se utiliza Index Scan, evitando el escaneo secuencial completo.

Consulta 2: Préstamos activos (Reporte de Morosidad)
```sql
EXPLAIN ANALYZE
SELECT * FROM loans WHERE returned_at IS NULL;
```
Resultado:
```sql
Index Scan using idx_loans_returned_null on loans
(cost=0.12..12.50 rows=5 width=40)
```
Se utiliza un índice parcial, optimizado para préstamos no devueltos.

## 5. Seguridad y Roles

La aplicación NO se conecta como postgres.

- Se creó el rol app_user

- Tiene permisos SELECT únicamente sobre VIEWS

- No posee acceso directo a las tablas base

- Verificación de seguridad

Ingresar a la base de datos:
```sql
docker exec -it biblioteca_db psql -U app_user -d biblioteca_db
Acceso permitido (vista)
SELECT * FROM vw_most_borrowed_books LIMIT 1;
```
Resultado: consulta exitosa.

Acceso denegado (tabla)
```sql
SELECT * FROM members;
```
Resultado:

ERROR: permission denied for table members
## 6. Aplicación Next.js

Ruta /: dashboard principal con accesos a los reportes.

5 pantallas de reportes, una por cada vista SQL.

Cada reporte incluye:

- Título y descripción del insight.

- Tabla de resultados.

- KPI destacado.

Las consultas ejecutadas son SELECT exclusivamente sobre VIEWS.

No se exponen credenciales al cliente.

## 7. Filtros y Paginación

- Reportes con búsqueda por título / autor.

- Filtros por rango de fechas y días de atraso.

- Paginación server-side (limit / offset).

- Validación de parámetros para evitar inyección o errores.

## 8. Docker Compose

El sistema completo se ejecuta mediante:
```bash
docker compose up --build
```
Servicios levantados:

- PostgreSQL

- Next.js App Router

No se requieren pasos manuales adicionales.
