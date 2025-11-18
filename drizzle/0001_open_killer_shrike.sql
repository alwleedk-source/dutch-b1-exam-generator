CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementType` varchar(100) NOT NULL,
	`achievementName` varchar(255) NOT NULL,
	`achievementDescription` text,
	`iconUrl` text,
	`currentProgress` int NOT NULL DEFAULT 0,
	`targetProgress` int NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`textId` int NOT NULL,
	`questions` text NOT NULL,
	`answers` text,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int,
	`scorePercentage` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`timeSpentMinutes` int,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`textId` int NOT NULL,
	`reportedBy` int NOT NULL,
	`reportType` enum('level_issue','content_issue') NOT NULL,
	`levelIssueType` enum('too_easy','too_hard'),
	`contentIssueType` enum('inappropriate','spam','not_dutch','other'),
	`details` text,
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `texts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dutchText` text NOT NULL,
	`title` varchar(255),
	`wordCount` int NOT NULL,
	`estimatedReadingMinutes` int NOT NULL,
	`isValidDutch` boolean NOT NULL DEFAULT true,
	`detectedLevel` enum('A1','A2','B1','B2','C1','C2'),
	`levelConfidence` int,
	`isB1Level` boolean NOT NULL DEFAULT true,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdBy` int NOT NULL,
	`source` enum('paste','upload','scan','admin') NOT NULL DEFAULT 'paste',
	`moderatedBy` int,
	`moderationNote` text,
	`moderatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `texts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`textId` int NOT NULL,
	`arabicTranslation` text,
	`englishTranslation` text,
	`turkishTranslation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userVocabulary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vocabularyId` int NOT NULL,
	`status` enum('new','learning','mastered') NOT NULL DEFAULT 'new',
	`correctCount` int NOT NULL DEFAULT 0,
	`incorrectCount` int NOT NULL DEFAULT 0,
	`lastReviewedAt` timestamp,
	`nextReviewAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userVocabulary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`textId` int NOT NULL,
	`dutchWord` varchar(255) NOT NULL,
	`arabicTranslation` varchar(255),
	`englishTranslation` varchar(255),
	`turkishTranslation` varchar(255),
	`audioUrl` text,
	`audioKey` varchar(255),
	`exampleSentence` text,
	`difficulty` enum('easy','medium','hard'),
	`frequency` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabulary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('nl','ar','en','tr') DEFAULT 'nl' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalExamsCompleted` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalVocabularyLearned` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalTimeSpentMinutes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currentStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `longestStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActivityDate` timestamp;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `achievements` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `exams` (`userId`);--> statement-breakpoint
CREATE INDEX `textId_idx` ON `exams` (`textId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `exams` (`status`);--> statement-breakpoint
CREATE INDEX `textId_idx` ON `reports` (`textId`);--> statement-breakpoint
CREATE INDEX `reportedBy_idx` ON `reports` (`reportedBy`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE INDEX `createdBy_idx` ON `texts` (`createdBy`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `texts` (`status`);--> statement-breakpoint
CREATE INDEX `textId_idx` ON `translations` (`textId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `userVocabulary` (`userId`);--> statement-breakpoint
CREATE INDEX `vocabularyId_idx` ON `userVocabulary` (`vocabularyId`);--> statement-breakpoint
CREATE INDEX `textId_idx` ON `vocabulary` (`textId`);--> statement-breakpoint
CREATE INDEX `dutchWord_idx` ON `vocabulary` (`dutchWord`);