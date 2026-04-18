ALTER TABLE `orders` ADD `status` enum('pending','completed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `completedAt` timestamp;--> statement-breakpoint
ALTER TABLE `schedules` ADD `deliveryCategory` enum('door_to_door_pickup','door_to_door_return','self_delivery') NOT NULL;--> statement-breakpoint
ALTER TABLE `schedules` ADD `completedAt` timestamp;