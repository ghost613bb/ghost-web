CREATE TABLE `thoughts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`body` text NOT NULL,
	`tags` text NOT NULL,
	`visibility` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text,
	`sort_order` integer
);
