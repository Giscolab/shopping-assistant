use rusqlite::{params, Connection};
use serde::Serialize;
use serde_json::Value;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const INITIAL_MIGRATION: &str = include_str!("../../drizzle/0000_initial.sql");
const ONTOLOGY_MIGRATION: &str = include_str!("../../drizzle/0001_flaky_scrambler.sql");

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DatabaseDiagnostics {
    runtime: &'static str,
    database_path: String,
    schema_version: i64,
    table_counts: BTreeMap<String, i64>,
}

fn db_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let base = dirs::data_local_dir()
        .or_else(|| std::env::current_dir().ok())
        .ok_or_else(|| "Cannot resolve local data directory".to_string())?;
    let dir = base.join("Size Intelligence Studio");
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let _ = app.path().app_data_dir();
    Ok(dir.join("size-intelligence.sqlite"))
}

fn connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let conn = Connection::open(db_path(app)?).map_err(|error| error.to_string())?;
    conn.execute_batch(INITIAL_MIGRATION)
        .map_err(|error| format!("SQLite migration failed: {error}"))?;
    conn.execute_batch(ONTOLOGY_MIGRATION)
        .map_err(|error| format!("SQLite ontology migration failed: {error}"))?;
    Ok(conn)
}

fn json_string(value: &Value) -> String {
    serde_json::to_string(value).unwrap_or_else(|_| "{}".to_string())
}

fn get_string<'a>(value: &'a Value, key: &str) -> &'a str {
    value.get(key).and_then(Value::as_str).unwrap_or("")
}

fn get_bool(value: &Value, key: &str) -> i64 {
    if value.get(key).and_then(Value::as_bool).unwrap_or(false) {
        1
    } else {
        0
    }
}

fn get_f64(value: &Value, key: &str) -> Option<f64> {
    value.get(key).and_then(Value::as_f64)
}

fn wipe_normalized(conn: &Connection) -> Result<(), String> {
    let tables = [
        "body_measurements",
        "body_profile_versions",
        "comfort_preferences",
        "brand_size_guide_measurements",
        "brand_size_guide_rows",
        "brand_size_guides",
        "brands",
        "fabric_profiles",
        "size_labels",
        "size_systems",
        "recommendation_results",
        "recommendation_runs",
        "import_jobs",
        "import_sources",
        "body_profiles",
    ];
    for table in tables {
        conn.execute(&format!("DELETE FROM {table}"), [])
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn persist_state_snapshot(conn: &Connection, state: &Value) -> Result<(), String> {
    conn.execute(
        "INSERT INTO app_settings(key, value_json, updated_at)
         VALUES('app_state_json', ?1, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP",
        params![json_string(state)],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

fn persist_profiles(conn: &Connection, state: &Value) -> Result<(), String> {
    if let Some(profiles) = state.get("bodyProfiles").and_then(Value::as_array) {
        for profile in profiles {
            conn.execute(
                "INSERT INTO body_profiles(id, name, version, profile_mode, height_cm, weight_kg, body_fat_percent, notes, raw_json, created_at, updated_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                params![
                    get_string(profile, "id"),
                    get_string(profile, "name"),
                    profile.get("version").and_then(Value::as_i64).unwrap_or(1),
                    profile.get("profileMode").and_then(Value::as_str),
                    get_f64(profile, "heightCm"),
                    get_f64(profile, "weightKg"),
                    get_f64(profile, "bodyFatPercent"),
                    get_string(profile, "notes"),
                    json_string(profile),
                    get_string(profile, "createdAt"),
                    get_string(profile, "updatedAt")
                ],
            )
            .map_err(|error| error.to_string())?;

            let measurement_keys = [
                ("heightCm", "cm"),
                ("weightKg", "kg"),
                ("bodyFatPercent", "percent"),
                ("chestCm", "cm"),
                ("waistCm", "cm"),
                ("stomachCm", "cm"),
                ("seatHipsCm", "cm"),
                ("leftBicepsCm", "cm"),
                ("rightBicepsCm", "cm"),
                ("leftForearmCm", "cm"),
                ("rightForearmCm", "cm"),
                ("leftThighCm", "cm"),
                ("rightThighCm", "cm"),
                ("leftCalfCm", "cm"),
                ("rightCalfCm", "cm"),
                ("footLengthMm", "mm"),
            ];
            for (key, unit) in measurement_keys {
                if let Some(value) = get_f64(profile, key) {
                    let provenance = profile.get("provenance").and_then(|item| item.get(key));
                    conn.execute(
                        "INSERT INTO body_measurements(id, profile_id, measurement_key, value, unit, source_type, source_name, confidence, created_at, updated_at)
                         VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                        params![
                            format!("{}-{key}", get_string(profile, "id")),
                            get_string(profile, "id"),
                            key,
                            value,
                            unit,
                            provenance.and_then(|item| item.get("sourceType")).and_then(Value::as_str).unwrap_or("manual"),
                            provenance.and_then(|item| item.get("sourceName")).and_then(Value::as_str).unwrap_or("Saisie locale"),
                            provenance.and_then(|item| item.get("confidence")).and_then(Value::as_f64).unwrap_or(1.0),
                            get_string(profile, "createdAt"),
                            get_string(profile, "updatedAt")
                        ],
                    )
                    .map_err(|error| error.to_string())?;
                }
            }
        }
    }

    if let Some(versions) = state.get("bodyProfileVersions").and_then(Value::as_array) {
        for version in versions {
            conn.execute(
                "INSERT INTO body_profile_versions(id, profile_id, version, reason, snapshot_json, created_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    get_string(version, "id"),
                    get_string(version, "profileId"),
                    version.get("version").and_then(Value::as_i64).unwrap_or(1),
                    get_string(version, "reason"),
                    json_string(version.get("snapshot").unwrap_or(&Value::Null)),
                    get_string(version, "createdAt")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

fn persist_guides(conn: &Connection, state: &Value) -> Result<(), String> {
    if let Some(brands) = state.get("brands").and_then(Value::as_array) {
        for brand in brands {
            conn.execute(
                "INSERT INTO brands(id, name, country, website, is_sample, notes, raw_json, created_at, updated_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    get_string(brand, "id"),
                    get_string(brand, "name"),
                    brand.get("country").and_then(Value::as_str),
                    brand.get("website").and_then(Value::as_str),
                    get_bool(brand, "isSample"),
                    get_string(brand, "notes"),
                    json_string(brand),
                    get_string(brand, "createdAt"),
                    get_string(brand, "updatedAt")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }

    if let Some(guides) = state.get("brandSizeGuides").and_then(Value::as_array) {
        for guide in guides {
            conn.execute(
                "INSERT INTO brand_size_guides(id, brand_id, name, garment_category, size_system, fabric_stretch, fit_notes, fabric_notes, source_type, source_name, source_url, is_sample, is_complete, uncertainty, raw_json, created_at, updated_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
                params![
                    get_string(guide, "id"),
                    get_string(guide, "brandId"),
                    get_string(guide, "name"),
                    get_string(guide, "garmentCategory"),
                    get_string(guide, "sizeSystem"),
                    get_string(guide, "fabricStretch"),
                    get_string(guide, "fitNotes"),
                    get_string(guide, "fabricNotes"),
                    get_string(guide, "sourceType"),
                    get_string(guide, "sourceName"),
                    guide.get("sourceUrl").and_then(Value::as_str),
                    get_bool(guide, "isSample"),
                    get_bool(guide, "isComplete"),
                    get_f64(guide, "uncertainty").unwrap_or(0.25),
                    json_string(guide),
                    get_string(guide, "createdAt"),
                    get_string(guide, "updatedAt")
                ],
            )
            .map_err(|error| error.to_string())?;

            if let Some(rows) = guide.get("rows").and_then(Value::as_array) {
                for row in rows {
                    conn.execute(
                        "INSERT INTO brand_size_guide_rows(id, guide_id, label, sort_order, notes, raw_json, created_at, updated_at)
                         VALUES(?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                        params![
                            get_string(row, "id"),
                            get_string(row, "guideId"),
                            get_string(row, "label"),
                            row.get("sortOrder").and_then(Value::as_i64).unwrap_or(0),
                            get_string(row, "notes"),
                            json_string(row)
                        ],
                    )
                    .map_err(|error| error.to_string())?;
                    if let Some(dimensions) = row.get("dimensions").and_then(Value::as_object) {
                        for (dimension, range) in dimensions {
                            conn.execute(
                                "INSERT INTO brand_size_guide_measurements(id, row_id, dimension, min_value, max_value, target_value, unit, source_note, created_at, updated_at)
                                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                                params![
                                    format!("{}-{dimension}", get_string(row, "id")),
                                    get_string(row, "id"),
                                    dimension,
                                    get_f64(range, "min"),
                                    get_f64(range, "max"),
                                    get_f64(range, "target"),
                                    get_string(range, "unit"),
                                    range.get("sourceNote").and_then(Value::as_str)
                                ],
                            )
                            .map_err(|error| error.to_string())?;
                        }
                    }
                }
            }
        }
    }
    Ok(())
}

fn persist_supporting_tables(conn: &Connection, state: &Value) -> Result<(), String> {
    if let Some(preferences) = state.get("comfortPreferences").and_then(Value::as_array) {
        for pref in preferences {
            conn.execute(
                "INSERT INTO comfort_preferences(id, profile_id, garment_category, fit_preference, ease_preference, compression_tolerance, layering_intent, fabric_sensitivity, shrinkage_risk_tolerance, created_at, updated_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                params![
                    get_string(pref, "id"),
                    get_string(pref, "profileId"),
                    get_string(pref, "garmentCategory"),
                    get_string(pref, "fitPreference"),
                    get_string(pref, "easePreference"),
                    get_f64(pref, "compressionTolerance"),
                    get_string(pref, "layeringIntent"),
                    get_f64(pref, "fabricSensitivity"),
                    get_f64(pref, "shrinkageRiskTolerance"),
                    get_string(pref, "createdAt"),
                    get_string(pref, "updatedAt")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }

    if let Some(systems) = state.get("sizeSystems").and_then(Value::as_array) {
        for system in systems {
            conn.execute(
                "INSERT INTO size_systems(id, code, label, description, uncertainty_note, is_approximate, provenance, created_at, updated_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                params![
                    get_string(system, "id"),
                    get_string(system, "code"),
                    get_string(system, "label"),
                    get_string(system, "description"),
                    get_string(system, "uncertaintyNote"),
                    get_bool(system, "isApproximate"),
                    get_string(system, "provenance")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }

    if let Some(fabrics) = state.get("fabricProfiles").and_then(Value::as_array) {
        for fabric in fabrics {
            conn.execute(
                "INSERT INTO fabric_profiles(id, name, stretch, shrinkage_risk, notes, created_at, updated_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                params![
                    get_string(fabric, "id"),
                    get_string(fabric, "name"),
                    get_string(fabric, "stretch"),
                    get_f64(fabric, "shrinkageRisk").unwrap_or(0.0),
                    get_string(fabric, "notes")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

fn persist_runs_and_imports(conn: &Connection, state: &Value) -> Result<(), String> {
    if let Some(runs) = state.get("recommendationRuns").and_then(Value::as_array) {
        for run in runs {
            let input = run.get("input").unwrap_or(&Value::Null);
            let result = run.get("result").unwrap_or(&Value::Null);
            conn.execute(
                "INSERT INTO recommendation_runs(id, profile_id, guide_id, garment_category, input_json, created_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    get_string(run, "id"),
                    get_string(input, "profileId"),
                    get_string(input, "guideId"),
                    get_string(input, "garmentCategory"),
                    json_string(input),
                    get_string(run, "createdAt")
                ],
            )
            .map_err(|error| error.to_string())?;
            conn.execute(
                "INSERT INTO recommendation_results(id, run_id, recommended_size, confidence_score, result_json, created_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    format!("result-{}", get_string(run, "id")),
                    get_string(run, "id"),
                    get_string(result, "recommendedSize"),
                    get_f64(result, "confidenceScore").unwrap_or(0.0),
                    json_string(result),
                    get_string(run, "createdAt")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }

    if let Some(jobs) = state.get("importJobs").and_then(Value::as_array) {
        for job in jobs {
            conn.execute(
                "INSERT INTO import_jobs(id, type, source_name, status, warnings_json, errors_json, created_at)
                 VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    get_string(job, "id"),
                    get_string(job, "type"),
                    get_string(job, "sourceName"),
                    get_string(job, "status"),
                    json_string(job.get("warnings").unwrap_or(&Value::Array(vec![]))),
                    json_string(job.get("errors").unwrap_or(&Value::Array(vec![]))),
                    get_string(job, "createdAt")
                ],
            )
            .map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

fn persist_normalized_state(conn: &Connection, state: &Value) -> Result<(), String> {
    wipe_normalized(conn)?;
    persist_profiles(conn, state)?;
    persist_guides(conn, state)?;
    persist_supporting_tables(conn, state)?;
    persist_runs_and_imports(conn, state)?;
    persist_state_snapshot(conn, state)?;
    Ok(())
}

#[tauri::command]
fn load_app_state(app: tauri::AppHandle) -> Result<Value, String> {
    let conn = connection(&app)?;
    let mut stmt = conn
        .prepare("SELECT value_json FROM app_settings WHERE key = 'app_state_json'")
        .map_err(|error| error.to_string())?;
    let result: Result<String, _> = stmt.query_row([], |row| row.get(0));
    match result {
        Ok(value) => serde_json::from_str(&value).map_err(|error| error.to_string()),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(Value::Object(Default::default())),
        Err(error) => Err(error.to_string()),
    }
}

#[tauri::command]
fn save_app_state(app: tauri::AppHandle, state: Value) -> Result<(), String> {
    let conn = connection(&app)?;
    let tx = conn.unchecked_transaction().map_err(|error| error.to_string())?;
    persist_normalized_state(&tx, &state)?;
    tx.commit().map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_database_diagnostics(app: tauri::AppHandle) -> Result<DatabaseDiagnostics, String> {
    let path = db_path(&app)?;
    let conn = connection(&app)?;
    let tables = [
        "body_profiles",
        "body_measurements",
        "brand_size_guides",
        "brand_size_guide_rows",
        "brand_size_guide_measurements",
        "recommendation_runs",
        "import_jobs",
        "ontology_bundles",
        "ontology_garment_categories",
        "sizing_rule_sets",
        "diagnostic_events",
    ];
    let mut table_counts = BTreeMap::new();
    for table in tables {
        let count: i64 = conn
            .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| row.get(0))
            .map_err(|error| error.to_string())?;
        table_counts.insert(table.to_string(), count);
    }
    Ok(DatabaseDiagnostics {
        runtime: "tauri",
        database_path: path.to_string_lossy().to_string(),
        schema_version: 2,
        table_counts,
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_app_state,
            save_app_state,
            get_database_diagnostics
        ])
        .run(tauri::generate_context!())
        .expect("error while running Size Intelligence Studio");
}
