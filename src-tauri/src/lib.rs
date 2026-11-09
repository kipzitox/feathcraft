// feathcraft — Tauri v2 entry point (desktop + Android via mobile_entry_point).
//
// Spike: the app shell is the existing Three.js engine (assets/engine),
// loaded offline exactly like the Expo/RN WebView did. No native screens yet.

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_projects,
            commands::read_project,
            commands::write_project,
            commands::delete_project,
            commands::save_export,
        ])
        .run(tauri::generate_context!())
        .expect("error while running feathcraft");
}
