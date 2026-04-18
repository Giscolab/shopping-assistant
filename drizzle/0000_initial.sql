PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS body_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  profile_mode TEXT,
  height_cm REAL,
  weight_kg REAL,
  body_fat_percent REAL,
  notes TEXT NOT NULL DEFAULT '',
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  measurement_key TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES body_profiles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS body_measurements_profile_key_unique
  ON body_measurements(profile_id, measurement_key);

CREATE TABLE IF NOT EXISTS body_profile_versions (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  reason TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES body_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comfort_preferences (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  garment_category TEXT NOT NULL,
  fit_preference TEXT NOT NULL,
  ease_preference TEXT NOT NULL,
  compression_tolerance REAL,
  layering_intent TEXT NOT NULL,
  fabric_sensitivity REAL,
  shrinkage_risk_tolerance REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES body_profiles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS comfort_profile_category_unique
  ON comfort_preferences(profile_id, garment_category);

CREATE TABLE IF NOT EXISTS garment_categories (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  family TEXT NOT NULL,
  definition_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS garment_types (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL,
  label TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES garment_categories(id)
);

CREATE TABLE IF NOT EXISTS size_systems (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  uncertainty_note TEXT NOT NULL DEFAULT '',
  is_approximate INTEGER NOT NULL DEFAULT 1,
  provenance TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS size_labels (
  id TEXT PRIMARY KEY NOT NULL,
  size_system_id TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (size_system_id) REFERENCES size_systems(id)
);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  is_sample INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brand_size_guides (
  id TEXT PRIMARY KEY NOT NULL,
  brand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  garment_category TEXT NOT NULL,
  size_system TEXT NOT NULL,
  fabric_stretch TEXT NOT NULL,
  fit_notes TEXT NOT NULL DEFAULT '',
  fabric_notes TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  is_sample INTEGER NOT NULL DEFAULT 0,
  is_complete INTEGER NOT NULL DEFAULT 0,
  uncertainty REAL NOT NULL DEFAULT 0.25,
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS brand_size_guide_rows (
  id TEXT PRIMARY KEY NOT NULL,
  guide_id TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES brand_size_guides(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS brand_size_guide_measurements (
  id TEXT PRIMARY KEY NOT NULL,
  row_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  min_value REAL,
  max_value REAL,
  target_value REAL,
  unit TEXT NOT NULL,
  source_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (row_id) REFERENCES brand_size_guide_rows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fabric_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  stretch TEXT NOT NULL,
  shrinkage_risk REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fit_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  fit_preference TEXT NOT NULL,
  ease_preference TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_runs (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  guide_id TEXT NOT NULL,
  garment_category TEXT NOT NULL,
  input_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_results (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  recommended_size TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES recommendation_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS import_sources (
  id TEXT PRIMARY KEY NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL,
  warnings_json TEXT NOT NULL,
  errors_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
