-- Create orderItems table
CREATE TABLE IF NOT EXISTS `orderItems` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `itemNumber` varchar(50) NOT NULL,
  `notes` text,
  `photoUrl` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE
);

-- Create index on orderId for faster queries
CREATE INDEX `orderItems_orderId_idx` ON `orderItems` (`orderId`);
