ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(160);--> statement-breakpoint
ALTER TABLE `users` ADD `website` varchar(240);--> statement-breakpoint
ALTER TABLE `users` ADD `profileVisibility` enum('public','private') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `emailNotifications` int DEFAULT 1 NOT NULL;