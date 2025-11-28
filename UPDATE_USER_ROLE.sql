-- SQL script to update user role to ADMIN
-- Run this in your database to set a user as admin

-- Option 1: Update admin@gmail.com to ADMIN role (or create if doesn't exist)
-- First check if admin@gmail.com exists
SELECT id, email, role, full_name 
FROM users 
WHERE email = 'admin@gmail.com';

-- If it doesn't exist, you'll need to create it through registration or manually
-- If it exists, update the role:
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@gmail.com';

-- Option 2: Update niranjachand134@gmail.com to ADMIN role
-- UPDATE users 
-- SET role = 'ADMIN' 
-- WHERE email = 'niranjachand134@gmail.com';

-- Option 3: Update by user ID
-- UPDATE users 
-- SET role = 'ADMIN' 
-- WHERE id = 1;

-- Verify all updates
SELECT id, email, role, full_name 
FROM users 
WHERE email IN ('admin@gmail.com')
ORDER BY email;

