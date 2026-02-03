
INSERT INTO members (name, email, member_type, joined_at)
VALUES
('Ana López', 'ana@mail.com', 'student', NOW() - INTERVAL '1 year'),
('Juan Pérez', 'juan@mail.com', 'teacher', NOW() - INTERVAL '2 years'),
('María Ruiz', 'maria@mail.com', 'student', NOW() - INTERVAL '6 months'),
('Carlos Gómez', 'carlos@mail.com', 'student', NOW() - INTERVAL '3 months'),
('Laura Torres', 'laura@mail.com', 'teacher', NOW() - INTERVAL '1 month');

INSERT INTO books (title, author, category, isbn)
VALUES
('Harry Potter', 'J.K. Rowling', 'Fantasy', 'ISBN-001'),
('Clean Code', 'Robert C. Martin', 'Programming', 'ISBN-002'),
('The Pragmatic Programmer', 'Andrew Hunt', 'Programming', 'ISBN-003'),
('1984', 'George Orwell', 'Dystopia', 'ISBN-004'),
('El Principito', 'Antoine de Saint-Exupéry', 'Children', 'ISBN-005');

INSERT INTO copies (book_id, barcode, status)
VALUES
(1, 'BC-HP-1', 'loaned'),
(1, 'BC-HP-2', 'available'),
(1, 'BC-HP-3', 'loaned'),

(2, 'BC-CC-1', 'loaned'),
(2, 'BC-CC-2', 'available'),

(3, 'BC-PP-1', 'available'),
(3, 'BC-PP-2', 'loaned'),

(4, 'BC-1984-1', 'loaned'),
(4, 'BC-1984-2', 'available'),

(5, 'BC-EP-1', 'available');

INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at)
VALUES

(1, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days', NULL),

(3, 2, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),

(4, 3, NOW() - INTERVAL '18 days', NOW() - INTERVAL '8 days', NULL),

(7, 4, NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', NULL),

(8, 5, NOW() - INTERVAL '25 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),

(9, 1, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

INSERT INTO fines (loan_id, amount, paid_at)
VALUES

(1, 200.00, NULL),

(3, 120.00, NULL),

(5, 80.00, NOW() - INTERVAL '1 day');
