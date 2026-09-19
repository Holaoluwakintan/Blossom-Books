ALTER TABLE `follows` ADD CONSTRAINT `follows_follower_following_idx` UNIQUE(`followerId`,`followingId`);--> statement-breakpoint
ALTER TABLE `readingProgress` ADD CONSTRAINT `reading_progress_user_story_idx` UNIQUE(`userId`,`storyId`);--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_story_idx` UNIQUE(`userId`,`storyId`);--> statement-breakpoint
ALTER TABLE `savedStories` ADD CONSTRAINT `saved_stories_user_story_idx` UNIQUE(`userId`,`storyId`);--> statement-breakpoint
ALTER TABLE `storyChapters` ADD CONSTRAINT `story_chapters_story_order_idx` UNIQUE(`storyId`,`chapterNumber`);--> statement-breakpoint
CREATE INDEX `comments_story_status_idx` ON `comments` (`storyId`,`status`);--> statement-breakpoint
CREATE INDEX `notifications_recipient_read_idx` ON `notifications` (`recipientId`,`readAt`);