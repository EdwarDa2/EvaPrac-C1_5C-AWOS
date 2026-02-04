CREATE ROLE app_user LOGIN PASSWORD 'app_pass';

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;

GRANT SELECT ON vw_overdue_loans TO app_user;
GRANT SELECT ON vw_most_borrowed_books TO app_user;
GRANT SELECT ON vw_fines_summary TO app_user;
GRANT SELECT ON vw_member_activity TO app_user;
GRANT SELECT ON vw_inventory_health TO app_user;
