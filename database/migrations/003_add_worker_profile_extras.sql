-- Sprint 3: Extend worker_profiles with schedule, payment, and verification fields
ALTER TABLE `worker_profiles` ADD COLUMN `qr_code` VARCHAR(255) DEFAULT NULL AFTER `is_verified`;
ALTER TABLE `worker_profiles` ADD COLUMN `schedule_availability` TEXT NULL AFTER `qr_code`;
ALTER TABLE `worker_profiles` ADD COLUMN `schedule_time` TEXT NULL AFTER `schedule_availability`;
ALTER TABLE `worker_profiles` ADD COLUMN `bank_name` VARCHAR(255) NULL AFTER `schedule_time`;
ALTER TABLE `worker_profiles` ADD COLUMN `bank_account_name` VARCHAR(255) NULL AFTER `bank_name`;
ALTER TABLE `worker_profiles` ADD COLUMN `bank_account_number` VARCHAR(255) NULL AFTER `bank_account_name`;
ALTER TABLE `worker_profiles` ADD COLUMN `verification_document` VARCHAR(255) NULL AFTER `bank_account_number`;