-- Migration script to add created_at and last_login columns to users table
-- Run this script in your MySQL database

ALTER TABLE users 
ADD COLUMN created_at DATETIME NULL,
ADD COLUMN last_login DATETIME NULL;

-- Update existing users to have a default created_at value (optional)
-- UPDATE users SET created_at = NOW() WHERE created_at IS NULL;

