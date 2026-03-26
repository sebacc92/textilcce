CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`slug` text NOT NULL,
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`last_login` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);