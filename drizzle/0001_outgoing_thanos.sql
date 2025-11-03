CREATE TABLE `edits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`enableTrim` int NOT NULL DEFAULT 0,
	`trimStart` int,
	`trimEnd` int,
	`enableSubtitles` int NOT NULL DEFAULT 0,
	`enableSilenceRemoval` int NOT NULL DEFAULT 0,
	`silenceThreshold` int DEFAULT -40,
	`enableFilters` int NOT NULL DEFAULT 0,
	`filterType` varchar(50),
	`filterIntensity` int DEFAULT 50,
	`targetFormat` varchar(20) DEFAULT 'mp4',
	`targetResolution` varchar(20) DEFAULT '1080p',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`processedUrl` text,
	`processedFileKey` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `edits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processingJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`editId` int NOT NULL,
	`jobId` varchar(255) NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`progress` int DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processingJobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `processingJobs_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`originalUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`duration` int,
	`fileSize` int,
	`mimeType` varchar(50),
	`status` enum('uploaded','processing','ready','failed') NOT NULL DEFAULT 'uploaded',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `edits` ADD CONSTRAINT `edits_videoId_videos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `videos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `edits` ADD CONSTRAINT `edits_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `processingJobs` ADD CONSTRAINT `processingJobs_editId_edits_id_fk` FOREIGN KEY (`editId`) REFERENCES `edits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;