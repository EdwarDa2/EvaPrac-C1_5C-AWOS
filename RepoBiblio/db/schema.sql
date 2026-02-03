CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    member_type TEXT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL
);

CREATE TABLE copies (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    CONSTRAINT fk_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    copy_id INT NOT NULL,
    member_id INT NOT NULL,
    loaned_at TIMESTAMP NOT NULL,
    due_at TIMESTAMP NOT NULL,
    returned_at TIMESTAMP,
    CONSTRAINT fk_copy
        FOREIGN KEY (copy_id)
        REFERENCES copies(id),
    CONSTRAINT fk_member
        FOREIGN KEY (member_id)
        REFERENCES members(id)
);

CREATE TABLE fines (
    id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_at TIMESTAMP,
    CONSTRAINT fk_loan
        FOREIGN KEY (loan_id)
        REFERENCES loans(id)
);
