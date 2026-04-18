CREATE TABLE IF NOT EXISTS `ontology_bundles` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`scope` text NOT NULL,
	`provenance_type` text NOT NULL,
	`truthfulness_note` text NOT NULL,
	`bundle_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ontology_families` (
	`id` text PRIMARY KEY NOT NULL,
	`bundle_id` text NOT NULL,
	`label` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `ontology_bundles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ontology_garment_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`bundle_id` text NOT NULL,
	`canonical_category` text NOT NULL,
	`legacy_category` text,
	`family` text NOT NULL,
	`label` text NOT NULL,
	`ease_profile` text NOT NULL,
	`default_cut` text NOT NULL,
	`default_material_profile` text NOT NULL,
	`category_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `ontology_bundles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `ontology_category_bundle_unique` ON `ontology_garment_categories` (`bundle_id`,`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ontology_measurement_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`bundle_id` text NOT NULL,
	`label_fr` text NOT NULL,
	`body_keys_json` text NOT NULL,
	`guide_aliases_json` text NOT NULL,
	`requires_guide_only` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `ontology_bundles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ontology_priority_dimensions` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`dimension` text NOT NULL,
	`weight` real NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `ontology_garment_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `brand_guide_assumptions` (
	`id` text PRIMARY KEY NOT NULL,
	`guide_id` text NOT NULL,
	`assumption` text NOT NULL,
	`severity` text DEFAULT 'info' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `brand_guide_quality_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`guide_id` text NOT NULL,
	`check_code` text NOT NULL,
	`severity` text NOT NULL,
	`message` text NOT NULL,
	`affected_rows` integer DEFAULT 0 NOT NULL,
	`confidence_penalty` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sizing_rule_dimensions` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_set_id` text NOT NULL,
	`category_id` text NOT NULL,
	`dimension` text NOT NULL,
	`base_ease_cm` real NOT NULL,
	`weight` real NOT NULL,
	`close_fit_delta_cm` real DEFAULT 0 NOT NULL,
	`relaxed_fit_delta_cm` real DEFAULT 0 NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rule_set_id`) REFERENCES `sizing_rule_sets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `ontology_garment_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sizing_rule_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`bundle_id` text NOT NULL,
	`version` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`rule_set_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `ontology_bundles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `diagnostic_events` (
	`id` text PRIMARY KEY NOT NULL,
	`severity` text NOT NULL,
	`code` text NOT NULL,
	`message` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`context_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
