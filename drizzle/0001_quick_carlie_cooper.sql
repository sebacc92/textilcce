CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image_url` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`last_active` integer
);
--> statement-breakpoint
CREATE TABLE `site_content_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`icon` text,
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`hero_title` text DEFAULT 'Telas por Mayor en Once' NOT NULL,
	`hero_subtitle` text,
	`hero_image_url` text,
	`whatsapp_number` text,
	`instagram_url` text,
	`facebook_url` text,
	`tiktok_url` text,
	`address` text,
	`business_hours` text,
	`contact_email` text,
	`about_p1` text,
	`about_p2` text,
	`about_image_url` text,
	`commitment_text` text,
	`stats_years` text,
	`stats_coverage` text,
	`map_embed_url` text,
	`ai_enabled` integer DEFAULT true,
	`ai_tone` text DEFAULT 'Profesional y directo',
	`ai_knowledge` text,
	`ai_call_to_action` text DEFAULT 'Para pasarte la lista actualizada y el stock real de hoy, por favor escribinos a nuestro WhatsApp oficial:',
	`cta_title` text DEFAULT '¿Buscás telas por mayor para tu próxima colección?',
	`cta_subtitle` text DEFAULT 'Nuestro equipo está listo para asesorarte. Escribinos por WhatsApp y recibí atención personalizada al instante.',
	`cta_button_text` text DEFAULT 'Escribinos por WhatsApp',
	`cta_image_url` text,
	`catalog_title` text DEFAULT 'Catálogo de Telas' NOT NULL,
	`catalog_description` text DEFAULT 'En Textil CCE ofrecemos un amplio catálogo de telas por rollo en colores clásicos para producción continua, pensadas para cubrir las necesidades de fábricas de indumentaria, talleres y confeccionistas del rubro textil.

Nuestro objetivo es brindar stock permanente, calidad y disponibilidad para que cada cliente pueda desarrollar su moldería con materiales confiables.',
	`hero_video_url` text DEFAULT 'https://sap3cnfy0vc6nzdk.public.blob.vercel-storage.com/output.mp4',
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `categories` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `is_featured` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `products` ADD `fabricante` text;--> statement-breakpoint
ALTER TABLE `products` ADD `oz` text;--> statement-breakpoint
ALTER TABLE `products` ADD `composicion` text;--> statement-breakpoint
ALTER TABLE `products` ADD `ancho` text;--> statement-breakpoint
ALTER TABLE `products` ADD `colores` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `products` ADD `is_offer` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `products` ADD `season` text;--> statement-breakpoint
ALTER TABLE `products` ADD `rinde` text;--> statement-breakpoint
ALTER TABLE `products` ADD `complemento` text;--> statement-breakpoint
ALTER TABLE `products` ADD `sublimar` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `products` ADD `estampar` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `products` ADD `bordar` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `products` ADD `display_order` integer DEFAULT 0;