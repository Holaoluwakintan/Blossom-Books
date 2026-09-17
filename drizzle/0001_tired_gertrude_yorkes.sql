CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storyId` int NOT NULL,
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`status` enum('visible','hidden','flagged') NOT NULL DEFAULT 'visible',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedStories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedStories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(180) NOT NULL,
	`subtitle` varchar(220),
	`description` text NOT NULL,
	`type` enum('story','article','journal') NOT NULL DEFAULT 'story',
	`category` varchar(120) NOT NULL,
	`coverUrl` text,
	`authorName` varchar(180) NOT NULL,
	`authorBio` text,
	`status` enum('draft','pending','published','rejected') NOT NULL DEFAULT 'draft',
	`rating` varchar(8) DEFAULT '0',
	`reviewCount` int NOT NULL DEFAULT 0,
	`estimatedMinutes` int NOT NULL DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `stories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `storyChapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storyChapters_id` PRIMARY KEY(`id`)
);
