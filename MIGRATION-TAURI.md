# Plan de migración: Expo / React Native → Tauri 2

> **Actualización (Fase 2+):** la versión web (server.ts, web/, docs/, export web)
> se ha **eliminado por completo**. El shell web (`frontend/`) es ahora únicamente
> la fuente del frontend de Tauri. Expo/RN (`app/`, `android/`, `eas.json`) se
> mantiene en paralelo hasta la Fase 4.

> **Decisión:** Tauri 2 gana de forma permanente como shell nativo. El motor
> Three.js (`assets/engine`) se conserva tal cual, cargado offline. La
> migración se hace por fases; cada fase entrega un APK funcional.
>
> Rama de trabajo: `spike/tauri-v2` (spike cerrado ✅). La migración real se
> hará en ramas `migration/phase-N` que desembocan en `main`.

---

## 1. Visión y decisión

| Aspecto | Hoy (Expo/RN) | Objetivo (Tauri 2) |
|---|---|---|
| Shell nativo | Expo SDK 52 + RN 0.76 | Tauri 2 (Rust core + WebView del sistema) |
| 3D | Three.js en WebView (`react-native-webview`) | Three.js en WebView (Tauri webview) — sin cambios |
| UI | RN + Material Design 3 (32 archivos, ~6.700 líneas) | Web (HTML/CSS/JS) — reusar el shell web ya existente |
| Storage nativo | expo-file-system | Rust (`tauri-plugin-fs` o comandos propios) |
| Diálogos / share | expo-document-picker / expo-sharing | `tauri-plugin-dialog` / `tauri-plugin-shell` |
| Build APK | EAS Build (nube) | `tauri android build` (local o CI) |
| Web deploy | server.ts (Node) | se mantiene (PWA opcional) |

**Por qué Tauri y no un rewrite completo:** la parte valiosa y compleja del
proyecto es el motor 3D (~8.700 líneas). Portarlo a Rust/wgpu sería meses de
trabajo sin beneficio. Tauri conserva el motor 100% y solo reemplaza el shell.

**Activo clave:** el repo ya tiene un shell web funcional en `web/desktop.html`
+ `web/desktop.js` (~670 líneas) que implementa biblioteca, bridge de comandos,
exportación y storage en localStorage. Es la base del frontend Tauri.

---

## 2. Estado actual (inventario)

- `app/` — shell RN: 32 archivos TS/TSX, ~6.700 líneas (splash, library,
  editor, settings, about, providers, stores, theme, ui, services, i18n).
- `assets/engine/` — motor Three.js: 32 archivos JS, ~8.700 líneas + CSS + HTML.
- `web/` — shell web standalone (desktop.html/js/css) + `docs/` (GitHub Pages).
- `android/` — proyecto nativo commiteado con el engine embebido.
- `src-tauri/` (spike) — esqueleto Tauri 2, compilable, APK verificado.

---

## 3. Arquitectura objetivo

```
┌──────────────────────────────────────────────────┐
│  Tauri 2 webview (frontendDist)                  │
│  ┌────────────────┐    ┌─────────────────────┐  │
│  │ web shell      │    │ engine (iframe)     │  │
│  │ (library,      │───▶│ /engine/index.html │  │
│  │  editor chrome)│    │ Three.js 3D        │  │
│  └────────────────┘    └─────────────────────┘  │
└────────────────┬─────────────────────────────────┘
                 │ invoke() / events
┌────────────────┴─────────────────────────────────┐
│  Rust core (src-tauri)                           │
│  - project storage (FS en app data dir)          │
│  - import/export, share, dialogs                 │
│  - settings (lang, theme)                        │
│  - (futuro) updater, deep links                  │
└──────────────────────────────────────────────────┘
```

- El motor se sirve desde el mismo origen (`http://tauri.localhost/engine/`),
  por lo que el bridge `postMessage` (mismo origen) funciona sin cambios.
- Los comandos del engine (`loadProject`, `saveProject`, `export`, `undo`, …)
  siguen igual; el shell solo cambia de RN a web.
- El reskin MD3 que hacía el RN (`INJECTED_JAVASCRIPT` en `app/editor.tsx`)
  **no se porta**: se usa la UI propia del engine (más simple y consistente
  con el build web/PWA). Si se quiere el look MD3, se hace con CSS sobre el
  engine (ya existe en el build web).

---

## 4. Fases

> **Fase 4 completada:** Expo/RN retirado por completo (`app/`, `android/`, `eas.json`,
> `app.json`, `plugins/`, scripts Expo, dependencias Expo). Unico build: Tauri 2.
> CI: `.github/workflows/build-tauri.yml` (build debug APK). Release firmado:
> v1.0.2 en GitHub Releases. Historial aplastado a un solo commit.

### Fase 0 — Spike Tauri + engine ✅ (hecha)
APK compila, instala y el engine corre en el WebView de Tauri.
Rama: `spike/tauri-v2`.

### Fase 1 — Shell web como frontend + bridge básico (1–2 semanas)
**Objetivo:** la biblioteca (listar/crear/abrir/eliminar proyectos) funciona
en Tauri con el engine abriéndose al abrir un proyecto.
- `frontendDist` → build del shell web (index.html + engine/).
- Rust: comandos `list_projects`, `read_project`, `write_project`,
  `delete_project`, `import_project`.
- El shell web deja de usar `localStorage` para proyectos y llama a Tauri
  vía `invoke()` (fallback a localStorage en web/PWA).
- Arreglar insets de status bar / navigation bar (CSS safe-area).
- **Entregable:** APK que abre la biblioteca, crea/abre un proyecto y pinta
  el engine. Exportación PNG/GLB sigue funcionando (comando `export` del engine).

### Fase 2 — Editor completo y exportación (2–3 semanas)
- Portar las acciones del editor del shell web: undo/redo, tool switching,
  save/autosave, export PNG/GLB/OBJ/USD, share nativo (diálogo del SO).
- Exportación a archivo real con `tauri-plugin-dialog` + `tauri-plugin-fs`
  (hoy el engine exporta por blob + share sheet de RN).
- Persistencia de la escena en app data dir (Rust), no localStorage.
- **Entregable:** flujo completo crear → dibujar → guardar → exportar → compartir.

### Fase 3 — Settings, About, tema, i18n (1 semana)
- Portar la pantalla Settings (idioma, tema oscuro/claro, opciones del editor)
  a web; persistir con Rust o localStorage.
- Portar i18n (ES/EN) del RN a un JSON consumido por el shell web.
- Info "Acerca de" + licencia.
- **Entregable:** app sin pantallas RN pendientes.

### Fase 4 — Limpieza y release (1–2 semanas)
- Retirar Expo/RN: borrar `app/`, dependencias Expo, `android/` prebuild,
  `eas.json`, workflows de EAS.
- CI: workflow de GitHub Actions con `tauri android build` (release) + firma.
- Generar keystore de release, configurar signing en gradle de Tauri.
- Medir APK/AAB release (objetivo: muy por debajo de los 249 MB debug).
- Verificar la build web/PWA (server.ts o PWA con el service worker del engine).

### Fase 5 — Opcionales (después)
- Updater (Tauri updater plugin, si soporta mobile en la versión usada).
- Deep links / scheme `fheatcraft`.
- Migración de datos de usuarios RN → Tauri (no aplica: app nunca publicada).

---

## 5. Fase 1 en detalle (biblioteca + bridge primero)

**Tareas concretas:**

1. `tauri.conf.json`: cambiar `frontendDist` de `../assets/engine` a un directorio
   de build del shell web (`../dist-tauri` o `../web`).
2. Estructura de `dist-tauri/`:
   ```
   dist-tauri/
     index.html          (web/desktop.html renombrado)
     desktop.css         (web/desktop.css)
     desktop.js          (web/desktop.js)
     engine/             (copia de assets/engine)
   ```
   Añadir script `build:tauri-frontend` que copie `web/*` + `assets/engine` → `dist-tauri/`.
3. Rust: crear `src-tauri/src/commands.rs` con:
   - `list_projects() -> Vec<ProjectMeta>`
   - `read_project(id) -> Project`
   - `write_project(id, data)`
   - `delete_project(id)`
   - `import_project(path)` (usando `tauri-plugin-dialog` para el picker)
4. Registrar los comandos en `lib.rs` con `.invoke_handler(tauri::generate_handler![...])`.
5. En `web/desktop.js`, detectar Tauri (`window.__TAURI__`) y usar `invoke()`
   en lugar de `localStorage` para proyectos; mantener localStorage como fallback
   para el build web/PWA.
6. CSS: añadir padding por `env(safe-area-inset-*)` y ocultar la barra de
   estado si se va edge-to-edge.
7. Verificar que el engine (iframe `engine/`) carga desde el mismo origen y que
   `postMessage` bridge funciona (ya validado en el spike).

**Criterio de salida de Fase 1:**
- APK release-debug que abre la biblioteca, crea/abre un proyecto y pinta el
  engine con el bridge funcional (undo/redo/tool).
- Sin Expo/RN en el path de build de Tauri (EAS sigue existiendo en paralelo).

---

## 6. Decisiones tomadas (2026-11-08)

1. **UI del engine:** portar el reskin MD3 inyectado (`app/editor.tsx`),
   pero en **Fase 2** (editor completo), no en Fase 1. Fase 1 usa la UI propia
   del engine para validar el bridge antes.
2. **Storage de proyectos:** Rust FS en app data dir (es un APK nativo). localStorage
   solo como fallback para el build web/PWA.
3. **Build web:** mantener `server.ts` (Node) en paralelo.
4. **Firma release:** Fase 4.

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Ecosistema de plugins mobile más joven que RN | Validar `tauri-plugin-dialog/fs/shell` en Fase 1 antes de comprometerse |
| Curva de Rust para el equipo | Backend mínimo: comandos CRUD + storage; lógica compleja sigue en JS |
| Tamaño del APK release | Medir en Fase 4; si es alto, split-per-abi y tree-shaking de deps |
| Pérdida de OTA updates (expo-updates) | Hoy está deshabilitado; evaluar Tauri updater en Fase 5 |
| Bridge `postMessage` cross-origin | Mismo origen en Tauri (verificado en spike) |
| Iconos JPEG disfrazados de PNG | Reconvertir en rama aparte antes de release |

---

## 8. Criterio de salida global

La migración se considera completa cuando:
- `main` se construye solo con Tauri (sin Expo/RN ni EAS).
- Todas las pantallas (biblioteca, editor, settings, about) funcionan en APK.
- Exportación PNG/GLB/OBJ/USD + share nativo funcionan.
- CI genera APK release firmado en GitHub Actions.
- El build web/PWA sigue funcionando.

---

## 9. Estado final (2026-11-09)

- Migracion completa a Tauri 2 (sin Expo/RN, sin artefactos web).
- Release publica: v1.0.3 (APK firmado, 43 MB, universal arm64+x86_64).
- Fix v1.0.3: botones del topbar del editor (undo/redo/persp/axis/save/export) usan
  SketchbookSDK directamente; postCommand('undo'/'redo') no funcionaba porque esos
  comandos no estan registrados en el Bridge del motor, y whenBridgeReady verificaba
  SketchbookBridge (no expuesto en el build classic).
- Historia aplastada a un unico commit (5176d81) antes de publicar el repo (publico).
- Releases activas: v1.0.2 y v1.0.3 (Latest). README con seccion de donaciones (Ko-fi).
