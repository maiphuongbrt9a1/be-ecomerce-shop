-- Delete ALL order-related data in PostgreSQL
-- This will completely clear all orders and related records.

BEGIN TRANSACTION;

DELETE FROM "ShipmentItems";

-- 1. Delete all ORDER ITEMS
DELETE FROM "OrderItems";


-- 2. Delete all SHIPMENTS
DELETE FROM "Shipments";

-- 3. Delete all PAYMENTS  
DELETE FROM "Payments";

-- 4. Delete all REQUESTS (return/cancel requests linked to orders)
DELETE FROM "Requests";

-- 5. Delete APPLIED USER VOUCHERS (user vouchers applied to orders)
DELETE FROM "UserVouchers";

-- 6. Delete all ORDERS
DELETE FROM "Orders";

-- 7. Reset auto-increment sequences (optional, for clean IDs starting from 1)
ALTER SEQUENCE "OrderItems_id_seq" RESTART WITH 1;

ALTER SEQUENCE "ShipmentItems_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Shipments_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Payments_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Requests_id_seq" RESTART WITH 1;
ALTER SEQUENCE "UserVouchers_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Orders_id_seq" RESTART WITH 1;

COMMIT;