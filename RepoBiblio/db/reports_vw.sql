-- Vista que muestra los préstamos vencidos y no devueltos
-- Permite identificar usuarios morosos
CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH overdue AS (
    SELECT
        l.id AS loan_id,
        l.member_id,
        l.copy_id,
        l.due_at,
        NOW()::date - l.due_at::date AS days_overdue
    FROM loans l
    WHERE l.returned_at IS NULL
      AND l.due_at < NOW()
)
SELECT
    o.loan_id,
    m.name AS member_name,
    b.title AS book_title,
    c.barcode,
    o.due_at,
    o.days_overdue,
    CASE
        WHEN o.days_overdue > 30 THEN 'CRÍTICO'
        WHEN o.days_overdue BETWEEN 15 AND 30 THEN 'ALTO'
        ELSE 'MODERADO'
    END AS overdue_level
FROM overdue o
JOIN members m ON o.member_id = m.id
JOIN copies c ON o.copy_id = c.id
JOIN books b ON c.book_id = b.id;


-- Ranking de libros más prestados
-- Se agrupan préstamos por libro, no por copia
CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT
    b.id,
    b.title,
    COUNT(l.id) AS total_loans,
    RANK() OVER (ORDER BY COUNT(l.id) DESC) AS ranking
FROM books b
JOIN copies c ON b.id = c.book_id
JOIN loans l ON c.id = l.copy_id
GROUP BY b.id, b.title;


-- Vista de multas no pagadas
-- Permite identificar adeudos activos
CREATE OR REPLACE VIEW vw_unpaid_fines AS
SELECT
    f.id AS fine_id,
    m.name AS member_name,
    b.title AS book_title,
    COALESCE(f.amount, 0) AS amount,
    l.due_at
FROM fines f
JOIN loans l ON f.loan_id = l.id
JOIN members m ON l.member_id = m.id
JOIN copies c ON l.copy_id = c.id
JOIN books b ON c.book_id = b.id
WHERE f.paid_at IS NULL;


-- Actividad de préstamos por miembro
-- Incluye préstamos activos e históricos
CREATE OR REPLACE VIEW vw_member_activity AS
SELECT
    m.id,
    m.name,
    COUNT(l.id) AS total_loans,
    COUNT(CASE WHEN l.returned_at IS NULL THEN 1 END) AS active_loans
FROM members m
LEFT JOIN loans l ON m.id = l.member_id
GROUP BY m.id, m.name
HAVING COUNT(l.id) > 0;

-- Estado del inventario por libro
-- Permite conocer disponibilidad de copias
CREATE OR REPLACE VIEW vw_inventory_health AS
SELECT
    b.title,
    COUNT(c.id) AS total_copies,
    COUNT(CASE WHEN c.status = 'available' THEN 1 END) AS available_copies,
    COUNT(CASE WHEN c.status = 'loaned' THEN 1 END) AS loaned_copies,
    CASE
        WHEN COUNT(CASE WHEN c.status = 'available' THEN 1 END) = 0 THEN 'SIN STOCK'
        WHEN COUNT(CASE WHEN c.status = 'available' THEN 1 END) < 2 THEN 'STOCK BAJO'
        ELSE 'STOCK OK'
    END AS inventory_status
FROM books b
JOIN copies c ON b.id = c.book_id
GROUP BY b.title;

-- 6. Resumen por categoría
CREATE OR REPLACE VIEW vw_category_summary AS
...
