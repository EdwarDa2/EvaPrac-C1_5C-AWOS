-- ============================================================
-- Grain: Una fila por cada préstamo vencido.
-- Metrics: Días de atraso, Nivel de severidad, Monto estimado de multa.
-- ============================================================
CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH overdue_calc AS (
    SELECT 
        l.id AS loan_id,
        l.member_id,
        l.copy_id,
        l.due_at,
        CURRENT_DATE - l.due_at::date AS days_overdue
    FROM loans l
    WHERE l.returned_at IS NULL 
      AND l.due_at < CURRENT_DATE
)
SELECT 
    oc.loan_id,
    m.name AS member_name,
    b.title AS book_title,
    oc.days_overdue,
    CASE 
        WHEN oc.days_overdue > 30 THEN 'CRITICO'
        WHEN oc.days_overdue > 7 THEN 'ALTO'
        ELSE 'NORMAL'
    END AS severity,
    (oc.days_overdue * 5) AS estimated_fine_amount
FROM overdue_calc oc
JOIN members m ON oc.member_id = m.id
JOIN copies c ON oc.copy_id = c.id
JOIN books b ON c.book_id = b.id;

-- VERIFY: SELECT * FROM vw_overdue_loans WHERE days_overdue > 0;

-- ============================================================
-- Grain: Una fila por libro (Título/Autor).
-- Metrics: Total de préstamos, Ranking (Dense Rank).
-- ============================================================
CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT
    b.id AS book_id,
    b.title,
    b.author, 
    COUNT(l.id) AS total_loans,
    DENSE_RANK() OVER (ORDER BY COUNT(l.id) DESC) AS ranking
FROM books b
JOIN copies c ON b.id = c.book_id
LEFT JOIN loans l ON c.id = l.copy_id
GROUP BY b.id, b.title, b.author;

-- VERIFY: SELECT * FROM vw_most_borrowed_books ORDER BY ranking LIMIT 5;

-- ============================================================
-- Grain: Una fila por Mes/Año (Basado en la fecha del préstamo).
-- Metrics: Total generado, recaudado y deuda pendiente.
-- CORRECCIÓN: Se hace JOIN con loans para obtener la fecha, 
-- ya que 'fines' podría no tener created_at.
-- ============================================================
CREATE OR REPLACE VIEW vw_fines_summary AS
SELECT 
    TO_CHAR(l.loaned_at, 'YYYY-MM') AS month_label,
    COUNT(f.id) AS total_fines,
    SUM(f.amount) AS total_amount_generated,
    SUM(CASE WHEN f.paid_at IS NOT NULL THEN f.amount ELSE 0 END) AS total_collected,
    SUM(CASE WHEN f.paid_at IS NULL THEN f.amount ELSE 0 END) AS pending_debt
FROM fines f
JOIN loans l ON f.loan_id = l.id
GROUP BY TO_CHAR(l.loaned_at, 'YYYY-MM')
HAVING SUM(f.amount) > 0;

-- VERIFY: SELECT * FROM vw_fines_summary ORDER BY month_label DESC;

-- ============================================================
-- Grain: Una fila por socio.
-- Metrics: Préstamos totales, activos y tasa de devolución tardía.
-- ============================================================
CREATE OR REPLACE VIEW vw_member_activity AS
SELECT
    m.id AS member_id,
    m.name,
    m.email,
    COUNT(l.id) AS total_loans,
    COUNT(CASE WHEN l.returned_at IS NULL THEN 1 END) AS active_loans,
    ROUND(
        (SUM(CASE WHEN l.returned_at > l.due_at THEN 1 ELSE 0 END)::numeric 
        / NULLIF(COUNT(l.id), 0)) * 100, 
    2) AS late_return_rate
FROM members m
LEFT JOIN loans l ON m.id = l.member_id
GROUP BY m.id, m.name, m.email
HAVING COUNT(l.id) > 0;

-- VERIFY: SELECT * FROM vw_member_activity ORDER BY total_loans DESC;

-- ============================================================
-- Grain: Una fila por libro (incluye categoría).
-- Metrics: Copias totales, disponibles, prestadas y perdidas.
-- ============================================================
CREATE OR REPLACE VIEW vw_inventory_health AS
SELECT
    b.title,
    b.category,
    COUNT(c.id) AS total_copies,
    SUM(CASE WHEN c.status = 'available' THEN 1 ELSE 0 END) AS available_copies,
    SUM(CASE WHEN c.status = 'loaned' THEN 1 ELSE 0 END) AS loaned_copies,
    SUM(CASE WHEN c.status = 'lost' THEN 1 ELSE 0 END) AS lost_copies,
    CASE
        WHEN SUM(CASE WHEN c.status = 'available' THEN 1 ELSE 0 END) = 0 THEN 'SIN STOCK'
        WHEN SUM(CASE WHEN c.status = 'available' THEN 1 ELSE 0 END) < 2 THEN 'BAJO'
        ELSE 'OK'
    END AS inventory_status
FROM books b
JOIN copies c ON b.id = c.book_id
GROUP BY b.title, b.category;

-- VERIFY: SELECT * FROM vw_inventory_health WHERE inventory_status != 'OK';