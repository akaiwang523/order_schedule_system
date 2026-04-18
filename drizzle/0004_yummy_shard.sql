ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `customers` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `orders` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `schedules` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `schedules` MODIFY COLUMN `isCompleted` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `schedules` MODIFY COLUMN `isCompleted` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `schedules` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
ALTER TABLE `schedules` DROP COLUMN `deliveryCategory`;--> statement-breakpoint
ALTER TABLE `schedules` DROP COLUMN `completedAt`;