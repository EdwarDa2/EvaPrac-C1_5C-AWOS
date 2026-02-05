DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_user') THEN
      CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pass';
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE biblioteca TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;

GRANT SELECT ON vw_overdue_loans TO app_user;
GRANT SELECT ON vw_most_borrowed_books TO app_user;
GRANT SELECT ON vw_fines_summary TO app_user;
GRANT SELECT ON vw_member_activity TO app_user;
GRANT SELECT ON vw_inventory_health TO app_user;