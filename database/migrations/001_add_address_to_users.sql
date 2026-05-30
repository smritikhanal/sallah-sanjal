-- Migration: Add address column to users table
-- Date: 2026-04-22

ALTER TABLE `users` ADD COLUMN `address` VARCHAR(255) DEFAULT NULL AFTER `phone`;

-- Add index for address searches (optional but useful)
ALTER TABLE `users` ADD KEY `idx_address` (`address`);
