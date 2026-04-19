ALTER TABLE `orders` DROP FOREIGN KEY `orders_customerId_customers_id_fk`;
--> statement-breakpoint
ALTER TABLE `orders` ADD `orderNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` ADD `progress` enum('pending','received','washing','returning','completed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;