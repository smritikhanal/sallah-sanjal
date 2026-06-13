-- Sallah Sanjal Database Schema
-- Database: sallah_sanjal

CREATE DATABASE IF NOT EXISTS `sallah_sanjal`;
USE `sallah_sanjal`;

-- Users table (stores all users: admin, client, worker)
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `role` ENUM('admin', 'client', 'worker') NOT NULL DEFAULT 'client',
  `is_active` BOOLEAN DEFAULT TRUE,
  `profile_picture` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
);

-- Worker profiles (only workers will have this)
CREATE TABLE `worker_profiles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL UNIQUE,
  `bio` TEXT,
  `location` VARCHAR(255),
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `hourly_rate` DECIMAL(10, 2),
  `is_verified` BOOLEAN DEFAULT FALSE,
  `qr_code` VARCHAR(255),
  `schedule_availability` TEXT,
  `schedule_time` TEXT,
  `bank_name` VARCHAR(255),
  `bank_account_name` VARCHAR(255),
  `bank_account_number` VARCHAR(255),
  `verification_document` VARCHAR(255),
  `verification_date` TIMESTAMP NULL,
  `total_bookings` INT DEFAULT 0,
  `average_rating` DECIMAL(3, 2) DEFAULT 0,
  `experience_years` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_is_verified` (`is_verified`),
  KEY `idx_average_rating` (`average_rating`),
  KEY `idx_location` (`location`)
);

-- Service categories (master list)
CREATE TABLE `service_categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_name` (`name`),
  KEY `idx_is_active` (`is_active`)
);

-- Worker services (many-to-many: workers can offer multiple services)
CREATE TABLE `worker_services` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `worker_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `service_description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `service_categories`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_worker_service` (`worker_id`, `service_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_service_id` (`service_id`)
);

-- Bookings table
CREATE TABLE `bookings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `client_id` INT NOT NULL,
  `worker_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `booking_date` DATETIME NOT NULL,
  `duration_hours` INT DEFAULT 1,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  `estimated_cost` DECIMAL(10, 2),
  `actual_cost` DECIMAL(10, 2),
  `location` VARCHAR(255),
  `notes` TEXT,
  `cancelled_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `service_categories`(`id`) ON DELETE RESTRICT,
  KEY `idx_client_id` (`client_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_status` (`status`),
  KEY `idx_booking_date` (`booking_date`),
  KEY `idx_created_at` (`created_at`)
);

-- Reviews table (only for completed bookings)
CREATE TABLE `reviews` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `booking_id` INT NOT NULL UNIQUE,
  `reviewer_id` INT NOT NULL,
  `worker_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `professionalism` INT CHECK (professionalism >= 1 AND professionalism <= 5),
  `quality_of_work` INT CHECK (quality_of_work >= 1 AND quality_of_work <= 5),
  `communication` INT CHECK (communication >= 1 AND communication <= 5),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`worker_id`) REFERENCES `worker_profiles`(`id`) ON DELETE CASCADE,
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_created_at` (`created_at`)
);

-- Conversations table (chat channels)
CREATE TABLE `conversations` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `client_id` INT NOT NULL,
  `worker_id` INT NOT NULL,
  `booking_id` INT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_message_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`worker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_conversation` (`client_id`, `worker_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_last_message_at` (`last_message_at`)
);

-- Messages table (individual chat messages)
CREATE TABLE `messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
);

-- Payments table (for tracking transactions)
CREATE TABLE `payments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `booking_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` VARCHAR(50),
  `transaction_id` VARCHAR(255) UNIQUE,
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction_id` (`transaction_id`)
);

-- Issues table (for tracking complaints, disputes, and bug reports)
CREATE TABLE `issues` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `issue_type` ENUM('complaint', 'dispute', 'bug-report') DEFAULT 'complaint',
  `description` TEXT NOT NULL,
  `status` ENUM('pending', 'acknowledged', 'resolved') DEFAULT 'pending',
  `resolution` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`issue_type`),
  KEY `idx_created_at` (`created_at`)
);

-- Testimonials table (for user reviews and feedback about the platform)
CREATE TABLE `testimonials` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `is_visible` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_visible` (`is_visible`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`)
);

-- =====================
-- Seed data
-- =====================

-- Insert sample service categories
INSERT INTO `service_categories` (`name`, `description`, `icon`) VALUES
('Plumbing', 'Plumbing services and repairs', 'plumbing.svg'),
('Carpentry', 'Carpentry and woodwork services', 'carpentry.svg'),
('Legal', 'Legal consultation and services', 'legal.svg'),
('Therapy', 'Psychological and therapy services', 'therapy.svg'),
('Electrical', 'Electrical installation and repair', 'electrical.svg'),
('Painting', 'Interior and exterior painting', 'painting.svg'),
('Cleaning', 'House and office cleaning', 'cleaning.svg'),
('Landscaping', 'Garden and landscaping services', 'landscaping.svg'),
('Tutoring', 'Academic tutoring and coaching', 'tutoring.svg'),
('Pet Care', 'Pet grooming and pet sitting', 'pet_care.svg');
