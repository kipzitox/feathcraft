// feathcraft — Tauri commands for project storage.
//
// Projects are stored as one JSON file per project under the app data dir:
//   {app_data}/projects/{id}.json
// This replaces the expo-file-system / localStorage layer used by the RN app
// and the web desktop shell.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub updated_at: i64,
    #[serde(default)]
    pub data: serde_json::Value,
    #[serde(default)]
    pub favorite: bool,
    #[serde(default)]
    pub trashed: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMeta {
    pub id: String,
    pub name: String,
    pub updated_at: i64,
    pub favorite: bool,
    pub trashed: bool,
    pub size: u64,
}

fn projects_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;
    let dir = base.join("projects");
    fs::create_dir_all(&dir).map_err(|e| format!("create_dir_all: {e}"))?;
    Ok(dir)
}

fn project_path(app: &tauri::AppHandle, id: &str) -> Result<PathBuf, String> {
    // Guard against path traversal
    if id.is_empty() || id.contains('/') || id.contains('\\') || id.contains("..") {
        return Err("invalid project id".into());
    }
    Ok(projects_dir(app)?.join(format!("{id}.json")))
}

#[tauri::command]
pub fn list_projects(app: tauri::AppHandle) -> Result<Vec<ProjectMeta>, String> {
    let dir = projects_dir(&app)?;
    let mut out = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let p: Project = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
        out.push(ProjectMeta {
            id: p.id,
            name: p.name,
            updated_at: p.updated_at,
            favorite: p.favorite,
            trashed: p.trashed,
            size: meta.len(),
        });
    }
    out.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(out)
}

#[tauri::command]
pub fn read_project(app: tauri::AppHandle, id: String) -> Result<Project, String> {
    let path = project_path(&app, &id)?;
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_project(app: tauri::AppHandle, project: Project) -> Result<(), String> {
    let path = project_path(&app, &project.id)?;
    let json = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_project(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = project_path(&app, &id)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn save_export(app: tauri::AppHandle, name: String, b64: String) -> Result<String, String> {
    use base64::Engine;
    // Strip optional data:...;base64, prefix
    let payload = b64.split(',').last().unwrap_or(&b64);
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(payload.trim())
        .map_err(|e| format!("base64 decode: {e}"))?;

    let cache = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let dir = cache.join("exports");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    // Sanitize filename
    let safe = name.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let safe = if safe.is_empty() { "export".to_string() } else { safe };
    let path = dir.join(&safe);
    fs::write(&path, &bytes).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}
