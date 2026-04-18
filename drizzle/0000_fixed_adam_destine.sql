CREATE TABLE `app_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `body_measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`measurement_key` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`source_type` text NOT NULL,
	`source_name` text NOT NULL,
	`confidence` real DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `body_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `body_measurements_profile_key_unique` ON `body_measurements` (`profile_id`,`measurement_key`);--> statement-breakpoint
CREATE TABLE `body_profile_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`version` integer NOT NULL,
	`reason` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `body_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `body_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` integer NOT NULL,
	`profile_mode` text,
	`height_cm` real,
	`weight_kg` real,
	`body_fat_percent` real,
	`notes` text DEFAULT '' NOT NULL,
	`raw_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brand_size_guide_measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`row_id` text NOT NULL,
	`dimension` text NOT NULL,
	`min_value` real,
	`max_value` real,
	`target_value` real,
	`unit` text NOT NULL,
	`source_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`row_id`) REFERENCES `brand_size_guide_rows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `brand_size_guide_rows` (
	`id` text PRIMARY KEY NOT NULL,
	`guide_id` text NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`raw_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`guide_id`) REFERENCES `brand_size_guides`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `brand_size_guides` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`garment_category` text NOT NULL,
	`size_system` text NOT NULL,
	`fabric_stretch` text NOT NULL,
	`fit_notes` text DEFAULT '' NOT NULL,
	`fabric_notes` text DEFAULT '' NOT NULL,
	`source_type` text NOT NULL,
	`source_name` text NOT NULL,
	`source_url` text,
	`is_sample` integer DEFAULT false NOT NULL,
	`is_complete` integer DEFAULT false NOT NULL,
	`uncertainty` real DEFAULT 0.25 NOT NULL,
	`raw_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text,
	`website` text,
	`is_sample` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`raw_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comfort_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`garment_category` text NOT NULL,
	`fit_preference` text NOT NULL,
	`ease_preference` text NOT NULL,
	`compression_tolerance` real,
	`layering_intent` text NOT NULL,
	`fabric_sensitivity` real,
	`shrinkage_risk_tolerance` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `body_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comfort_profile_category_unique` ON `comfort_preferences` (`profile_id`,`garment_category`);--> statement-breakpoint
CREATE TABLE `fabric_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`stretch` text NOT NULL,
	`shrinkage_risk` real DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fit_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`fit_preference` text NOT NULL,
	`ease_preference` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `garment_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`family` text NOT NULL,
	`definition_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `garment_types` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`label` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `garment_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`source_name` text NOT NULL,
	`status` text NOT NULL,
	`warnings_json` text NOT NULL,
	`errors_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `import_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`source_name` text NOT NULL,
	`source_type` text NOT NULL,
	`source_url` text,
	`metadata_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recommendation_results` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`recommended_size` text NOT NULL,
	`confidence_score` real NOT NULL,
	`result_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `recommendation_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recommendation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`guide_id` text NOT NULL,
	`garment_category` text NOT NULL,
	`input_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `size_labels` (
	`id` text PRIMARY KEY NOT NULL,
	`size_system_id` text NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`size_system_id`) REFERENCES `size_systems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `size_systems` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`label` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`uncertainty_note` text DEFAULT '' NOT NULL,
	`is_approximate` integer DEFAULT true NOT NULL,
	`provenance` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
