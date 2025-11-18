ALTER TABLE `userVocabulary` MODIFY COLUMN `nextReviewAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `userVocabulary` ADD `easeFactor` int DEFAULT 2500 NOT NULL;--> statement-breakpoint
ALTER TABLE `userVocabulary` ADD `interval` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userVocabulary` ADD `repetitions` int DEFAULT 0 NOT NULL;