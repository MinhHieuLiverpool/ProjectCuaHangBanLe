-- Migration: Remove ip_address and user_agent columns from audit_logs table
-- Date: 2025-10-13

USE store_management;

-- Drop indexes related to ip_address and user_agent (if any)
-- (No indexes on these columns based on previous migration)

-- Drop the columns
ALTER TABLE audit_logs 
DROP COLUMN ip_address,
DROP COLUMN user_agent;

-- Verify the change
DESCRIBE audit_logs;
