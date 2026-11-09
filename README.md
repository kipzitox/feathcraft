# feathcraft

Aplicacion movil Android de dibujo 3D profesional con interfaz Material Design 3,
construida con **Tauri 2** (backend Rust) y un motor **Three.js** que corre
offline dentro de un WebView (sin servidor, sin internet).

La interfaz nativa expone todas las funciones del editor (dibujar, capas,
deshacer/rehacer, exportar PNG y modelos, cargar/guardar proyectos, Loft,
fusionar capas) sin modificar el motor.

El proyecto se organiza en dos capas principales:

1. **Shell nativo (Tauri 2 + Rust):** pantallas, navegacion, temas, gestos,
   persistencia y exportacion. Es la capa visible y la unica que interactua
   con el usuario.
2. **Motor 3D (Three.js embebido):** Renderizado, geometria, herramientas,
   capas, historial y persistencia. Vive como assets estaticos y se ejecuta
   dentro de un WebView, completamente offline.

El puente entre ambas capas usa eventos y comandos (`postMessage`), de modo
que el motor puede sustituirse sin tocar la UI y viceversa.

## Funcionalidades clave

- Dibujo 3D en tiempo real con Three.js (geometria, camaras, gizmos)
- Sistema de capas para organizar la escena
- Historial de deshacer/rehacer (Undo/Redo)
- Exportacion de capturas PNG y modelos 3D
- Carga y guardado de proyectos locales (app data dir)
- Loft (superficies generadas a partir de perfiles)
- Fusion de capas para optimizar la escena
- Interfaz responsive (telefono y tablet, horizontal y vertical)
- Persistencia offline sin backend
- Modo inmersivo (sin barra de estado ni navegacion del sistema)
- Tema claro/oscuro y idioma ES/EN

## Plataformas

| Plataforma | Estado        | Notas                                      |
|------------|---------------|--------------------------------------------|
| Android    | Funcional     | APK release firmado                         |

## Requisitos

- Rust (con targets `aarch64-linux-android` / `x86_64-linux-android`)
- Node.js + npm
- Android SDK + NDK + JDK 17

## Compilar el APK con Tauri

```bash
npm install                # instala dependencias
npm run build:frontend     # genera dist-tauri (shell + engine)
npm run android:tauri:debug # APK debug (emulador/dispositivo)
npm run android:tauri      # APK release (requiere firma, ver abajo)
```

El APK release se firma con `apksigner` usando un keystore local (alias
`feathcraft`, no incluido en el repositorio).
Guarda una copia de seguridad del keystore y su contraseña.

## Scripts disponibles

| Script                  | Descripcion                                          |
|-------------------------|------------------------------------------------------|
| `npm run tauri`         | CLI de Tauri (passthrough)                           |
| `npm run build:frontend`| Genera dist-tauri (shell + motor + iconos Android)|
| `npm run android:tauri:debug` | Genera APK debug                               |
| `npm run android:tauri` | Genera APK release (sin firmar)                      |

## Estructura

- `frontend/` - shell (HTML/JS) que sirve como frontend de Tauri (biblioteca + editor + reskin MD3)
- `assets/engine/` - fuente del motor 3D (Three.js) que se embebe en Android
- `src-tauri/` - backend Rust (comandos, plugins, proyecto Android generado)
- `scripts/` - utilidades de build (frontend, iconos, parche Android)
- `.github/workflows/` - CI (si aplica)

## Notas

- El motor 3D es un asset externo embebido; no se edita como parte de la app.
- `src-tauri/gen/` y `src-tauri/target/` estan ignorados en Git y se regeneran
  al compilar (`npx tauri android init`).
- `src-tauri/icons/android/` se sincroniza automaticamente en `build:frontend`.

## Donaciones

Si este proyecto te resulta util, puedes apoyar su desarrollo invitandome un cafe:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/kipzitox)

https://ko-fi.com/kipzitox

## Licencia

Este proyecto se distribuye bajo la licencia **feathcraft Proprietary License**.
Ver el archivo [LICENSE](LICENSE) para los terminos completos.

En resumen: **queda prohibida la copia, distribucion, modificacion, venta,
alquiler, sublicencia o uso comercial** de cualquier parte de este proyecto
(codigo, assets, documentacion) sin autorizacion escrita explicita del autor.

---

*Desarrollado con Tauri 2, Rust y Three.js.*
