/* feathcraft — Desktop shell (vanilla JS) that drives the engine via the
   Sketchbook Bridge protocol (same as the React Native app).
   Parent window posts {type:'cmd', id, name, payload} to the engine iframe;
   the engine's rn-transport forwards responses/events back to window.parent. */

(function () {
  "use strict";

  var STORE_KEY = "feathcraft_projects";
  var frame = document.getElementById("engineFrame");

  // ---------- i18n (ES/EN) ----------
  var I18N = {
    es: {
      all: "Todos", recent: "Recientes", favorites: "Favoritos", trash: "Papelera",
      empty: "No hay proyectos aquí.", emptyTrash: "La papelera está vacía.",
      newProject: "Nuevo proyecto", import: "Importar", search: "Buscar proyectos…",
      settings: "Ajustes", about: "Acerca de feathcraft", clearAll: "Limpiar todo",
      clearConfirm: "¿Borrar todos los proyectos?", saved: "Guardado",
      theme: "Tema", light: "Claro", dark: "Oscuro",
      language: "Idioma", spanish: "Español", english: "English",
      aboutText: "feathcraft · Editor 3D\nMotor de modelado y bocetado 3D profesional.",
      info: "Información",
    },
    en: {
      all: "All", recent: "Recent", favorites: "Favorites", trash: "Trash",
      empty: "No projects here.", emptyTrash: "Trash is empty.",
      newProject: "New project", import: "Import", search: "Search projects…",
      settings: "Settings", about: "About feathcraft", clearAll: "Clear all",
      clearConfirm: "Delete all projects?", saved: "Saved",
      theme: "Theme", light: "Light", dark: "Dark",
      language: "Language", spanish: "Español", english: "English",
      aboutText: "feathcraft · 3D Editor\nProfessional 3D modeling and sketch engine.",
      info: "Info",
    },
  };
  function currentLang() { return localStorage.getItem("feathcraft_language") || "es"; }
  function t(key) {
    var l = currentLang();
    return (I18N[l] && I18N[l][key]) || (I18N.es && I18N.es[key]) || key;
  }
  function applyLang() {
    // filter tabs
    document.querySelectorAll("#filterTabs .tab").forEach(function (tab) {
      var f = tab.dataset.filter;
      var map = { all: "all", recent: "recent", favorites: "favorites", trash: "trash" };
      if (map[f]) tab.textContent = t(f === "recent" ? "recent" : f);
    });
    // empty state text
    var emptyText = document.getElementById("emptyText");
    if (emptyText) {
      // best-effort: keep current filter's message
    }
    // search placeholder
    var si = document.getElementById("searchInput");
    if (si) si.placeholder = t("search");
    // new project buttons
    var nf = document.getElementById("newFab");
    if (nf) nf.title = t("newProject");
    var en = document.getElementById("emptyNew");
    if (en) en.textContent = t("newProject");
    var ei = document.getElementById("emptyImport");
    if (ei) ei.textContent = t("import");
  }

  // ---------- theme ----------
  function currentTheme() { return localStorage.getItem("feathcraft_theme") || "light"; }
  function applyTheme(mode) {
    try {
      if (mode === "dark") {
        if (frame.contentDocument && frame.contentDocument.documentElement)
          frame.contentDocument.documentElement.setAttribute("data-theme", "dark");
      } else {
        if (frame.contentDocument && frame.contentDocument.documentElement)
          frame.contentDocument.documentElement.removeAttribute("data-theme");
      }
    } catch (e) {}
    localStorage.setItem("feathcraft_theme", mode);
    localStorage.setItem("sk3d_theme", mode);
  }

  // Tauri v2 always injects window.__TAURI_INTERNALS__ (no npm package needed).
  // @tauri-apps/api (window.__TAURI__) is only present if bundled, so prefer
  // the low-level internals and wrap them to the { invoke } shape we use.
  var __TAURI_INTERNALS__ = (typeof window !== "undefined") ? window.__TAURI_INTERNALS__ : null;
  var TAURI = null;
  if (__TAURI_INTERNALS__ && typeof __TAURI_INTERNALS__.invoke === "function") {
    TAURI = { invoke: function (cmd, args) { return __TAURI_INTERNALS__.invoke(cmd, args || {}); } };
  } else if (typeof window !== "undefined" && window.__TAURI__ && window.__TAURI__.core) {
    TAURI = window.__TAURI__.core;
  }
  var knownProjectIds = new Set();

  // ---------- state ----------
  var projects = [];
  loadProjects().then(function (list) { projects = list || []; render(); });
  var filter = "all";
  var query = "";
  var sort = "date"; // or 'name'
  var currentId = null;
  var pendingCmds = {}; // id -> {resolve, reject, timer}
  var cmdSeq = 1;
  var engineReady = false;

  // ---------- storage ----------
  function loadProjects() {
    if (TAURI) {
      return TAURI.invoke("list_projects").then(function (metas) {
        // metas are ProjectMeta (no scene data); fetch full project lazily on open
        var list = (metas || []).map(function (m) {
          return { id: m.id, name: m.name, updatedAt: m.updatedAt, favorite: m.favorite, trashed: m.trashed, data: null };
        });
        knownProjectIds = new Set(list.map(function (p) { return p.id; }));
        return list;
      }).catch(function (e) { console.error("list_projects", e); return []; });
    }
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      knownProjectIds = new Set(list.map(function (p) { return p.id; }));
      return Promise.resolve(list);
    } catch (e) { return Promise.resolve([]); }
  }
  function saveProjects() {
    if (TAURI) {
      var currentIds = new Set(projects.map(function (p) { return p.id; }));
      projects.forEach(function (p) {
        TAURI.invoke("write_project", { project: {
          id: p.id, name: p.name, updatedAt: p.updatedAt,
          data: p.data == null ? {} : p.data,
          favorite: !!p.favorite, trashed: !!p.trashed,
        } }).catch(function (e) { console.error("write_project", e); });
      });
      knownProjectIds.forEach(function (id) {
        if (!currentIds.has(id)) {
          TAURI.invoke("delete_project", { id: id }).catch(function (e) { console.error("delete_project", e); });
        }
      });
      knownProjectIds = currentIds;
      return;
    }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(projects)); } catch (e) {}
  }
  function uid() { return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ---------- toast ----------
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add("hidden"); }, 2200);
  }

  // ---------- library rendering ----------
  var grid = document.getElementById("projectGrid");
  var emptyState = document.getElementById("emptyState");
  var emptyText = document.getElementById("emptyText");

  function visibleProjects() {
    var list = projects.slice();
    if (filter === "favorites") list = list.filter(function (p) { return p.favorite && !p.trashed; });
    else if (filter === "trash") list = list.filter(function (p) { return p.trashed; });
    else list = list.filter(function (p) { return !p.trashed; }); // all/recent/shared
    if (query.trim()) {
      var q = query.toLowerCase();
      list = list.filter(function (p) { return p.name.toLowerCase().indexOf(q) >= 0; });
    }
    list.sort(function (a, b) {
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.updatedAt < b.updatedAt ? 1 : -1;
    });
    return list;
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(); } catch (e) { return ""; }
  }
  function fmtTime(iso) {
    try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; }
  }

  function render() {
    var list = visibleProjects();
    grid.innerHTML = "";
    if (!list.length) {
      grid.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyText.textContent = filter === "trash" ? t("emptyTrash") : t("empty");
      return;
    }
    grid.classList.remove("hidden");
    emptyState.classList.add("hidden");

    list.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        '<div class="card-thumb">' +
          '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-name">' + escapeHtml(p.name) + "</div>" +
          '<div class="card-meta">' + fmtDate(p.updatedAt) + " · " + fmtTime(p.updatedAt) + "</div>" +
        "</div>" +
        (p.favorite ? '<div class="card-fav"><svg viewBox="0 0 24 24" width="14" height="14" fill="#FBBF24" stroke="#FBBF24" stroke-width="2"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-4-6 4 2-7L3 9.5 10 9z"/></svg></div>' : "") +
        '<button class="card-options" title="Opciones">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>' +
        "</button>";

      card.addEventListener("click", function () { openProject(p.id); });
      card.querySelector(".card-options").addEventListener("click", function (e) {
        e.stopPropagation();
        showOptions(p.id);
      });
      grid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- options sheet ----------
  var sheetBackdrop = document.getElementById("sheetBackdrop");
  var sheetTitle = document.getElementById("sheetTitle");
  var sheetBody = document.getElementById("sheetBody");

  function openSheet(title, items) {
    sheetTitle.textContent = title;
    sheetBody.innerHTML = "";
    items.forEach(function (it) {
      var el = document.createElement("div");
      el.className = "sheet-item" + (it.danger ? " danger" : "");
      el.innerHTML = '<span>' + it.label + "</span>";
      el.addEventListener("click", function () {
        closeSheet();
        it.onClick();
      });
      sheetBody.appendChild(el);
    });
    sheetBackdrop.classList.remove("hidden");
  }
  function closeSheet() { sheetBackdrop.classList.add("hidden"); }
  sheetBackdrop.addEventListener("click", function (e) { if (e.target === sheetBackdrop) closeSheet(); });

  function showOptions(id) {
    var p = projects.find(function (x) { return x.id === id; });
    if (!p) return;
    var items = [];
    if (p.trashed) {
      items.push({ label: "Restaurar", onClick: function () { p.trashed = false; saveProjects(); render(); } });
      items.push({ label: "Eliminar permanentemente", danger: true, onClick: function () {
        projects = projects.filter(function (x) { return x.id !== id; }); saveProjects(); render();
      } });
    } else {
      items.push({ label: "Abrir", onClick: function () { openProject(id); } });
      items.push({ label: "Renombrar", onClick: function () { renameProject(id); } });
      items.push({ label: p.favorite ? "Quitar de favoritos" : "Favorito", onClick: function () {
        p.favorite = !p.favorite; saveProjects(); render();
      } });
      items.push({ label: "Mover a papelera", danger: true, onClick: function () {
        p.trashed = true; saveProjects(); render();
      } });
    }
    openSheet(p.name, items);
  }

  function renameProject(id) {
    var p = projects.find(function (x) { return x.id === id; });
    if (!p) return;
    sheetTitle.textContent = "Renombrar";
    sheetBody.innerHTML = "";
    var input = document.createElement("input");
    input.className = "sheet-input";
    input.value = p.name;
    sheetBody.appendChild(input);
    var btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = "Guardar";
    sheetBody.appendChild(btn);
    btn.addEventListener("click", function () {
      p.name = input.value.trim() || "Sin título";
      saveProjects(); render(); closeSheet();
    });
    input.focus();
  }

  // ---------- editor / engine bridge ----------
  function showEditor() {
    document.getElementById("desktop").classList.add("hidden");
    document.getElementById("editor").classList.remove("hidden");
  }
  function showDesktop() {
    document.getElementById("editor").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    frame.src = "about:blank"; // free engine resources
    engineReady = false;
    render();
  }

  function openProject(id, data) {
    var p = projects.find(function (x) { return x.id === id; });
    if (!p) return;
    currentId = id;
    document.getElementById("editorTitle").textContent = p.name;
    showEditor();
    var sceneData = p.data;
    if (TAURI && sceneData == null) {
      TAURI.invoke("read_project", { id: id }).then(function (full) {
        if (full && full.data != null) { p.data = full.data; sceneData = full.data; }
        startEngine(sceneData || {});
      }).catch(function (e) { console.error("read_project", e); startEngine({}); });
    } else {
      startEngine(sceneData || {});
    }
  }

  function newProject() {
    var p = { id: uid(), name: "Sin título", updatedAt: Date.now(), data: {}, favorite: false, trashed: false };
    projects.unshift(p);
    saveProjects();
    currentId = p.id;
    document.getElementById("editorTitle").textContent = p.name;
    showEditor();
    startEngine({});
  }

  function startEngine(sceneData) {
    engineReady = false;
    document.getElementById("engineLoading").classList.remove("hidden");
    frame.src = "/engine/";
    frame.onload = function () {
      injectHide();
      injectReskin();
      applyTheme(currentTheme());
      whenBridgeReady(function () {
        injectHide();
        injectReskin();
        applyTheme(currentTheme());
        setWhiteBg();
        var sdk = frame.contentWindow && frame.contentWindow.SketchbookSDK;
        if (sdk && typeof sdk.loadProject === "function") {
          sdk.loadProject(sceneData || {}).then(function () { hideSpinner(); }).catch(function (err) { console.error("loadProject failed", err); hideSpinner(); });
        } else {
          hideSpinner();
        }
        // safety net: never leave the spinner stuck
        setTimeout(hideSpinner, 5000);
      });
    };
  }

  function hideSpinner() {
    document.getElementById("engineLoading").classList.add("hidden");
  }

  // Poll the engine's Bridge directly from the parent (same-origin iframe).
  function whenBridgeReady(cb) {
    var n = 0;
    var iv = setInterval(function () {
      n++;
      var ok = false;
      try {
        ok = frame.contentWindow && frame.contentWindow.SketchbookSDK &&
             typeof frame.contentWindow.SketchbookSDK.loadProject === "function";
      } catch (e) {}
      if (ok) { clearInterval(iv); cb(); }
      else if (n > 150) { clearInterval(iv); toast("Motor no disponible"); }
    }, 100);
  }

  function injectHide() {
    try {
      var doc = frame.contentDocument;
      if (!doc) return;
      if (!doc.getElementById("tk-web-hide")) {
        var s = doc.createElement("style");
        s.id = "tk-web-hide";
        s.textContent =
          "#topbar,#narrow-bar,#bhide,#sc-hidden-toggle,#sc-hidden-bar,#pb-fab,#sc-fab,#lcl-float-group,#fps-overlay{display:none!important;visibility:hidden!important;}";
        (doc.head || doc.documentElement).appendChild(s);
      }
      // keep re-injecting briefly in case engine rebuilds the bars
      var n = 0;
      var iv = setInterval(function () {
        if (!doc.getElementById("tk-web-hide")) {
          var s2 = doc.createElement("style");
          s2.id = "tk-web-hide";
          s2.textContent = "#topbar,#narrow-bar,#bhide,#sc-hidden-toggle,#sc-hidden-bar,#pb-fab,#sc-fab,#lcl-float-group,#fps-overlay{display:none!important;visibility:hidden!important;}";
          (doc.head || doc.documentElement).appendChild(s2);
        }
        if (++n > 12) clearInterval(iv);
      }, 400);
    } catch (e) { /* cross-origin guard */ }
  }
  function injectReskin() {
    try {
      var doc = frame.contentDocument;
      if (!doc || doc.getElementById("__tk_reskin_loaded")) return;
      var marker = doc.createElement("meta");
      marker.id = "__tk_reskin_loaded";
      (doc.head || doc.documentElement).appendChild(marker);
      var sc = doc.createElement("script");
      sc.src = "/reskin.js";
      (doc.head || doc.documentElement).appendChild(sc);
    } catch (e) { /* cross-origin guard */ }
  }

  function setWhiteBg() {
    try {
      var doc = frame.contentDocument;
      var ci = doc && doc.getElementById("bgpop-custom");
      if (ci) { ci.value = "#ffffff"; ci.dispatchEvent(new Event("input", { bubbles: true })); }
    } catch (e) {}
  }

  // post a command to the engine and return a promise resolved by its response
  function postCommand(name, payload) {
    return new Promise(function (resolve, reject) {
      var id = "c" + (cmdSeq++);
      pendingCmds[id] = { resolve: resolve, reject: reject };
      var timer = setTimeout(function () {
        delete pendingCmds[id];
        reject(new Error("timeout: " + name));
      }, 15000);
      pendingCmds[id].timer = timer;
      try {
        frame.contentWindow.postMessage({ type: "cmd", id: id, name: name, payload: payload || {} }, "*");
      } catch (e) { delete pendingCmds[id]; reject(e); }
    });
  }

  // messages from the engine iframe (rn-transport forwards to window.parent)
  window.addEventListener("message", function (e) {
    if (e.source && e.source !== frame.contentWindow) return;
    var msg = e.data;
    if (typeof msg === "string") { try { msg = JSON.parse(msg); } catch (err) { return; } }
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "ready") { engineReady = true; }
    else if (msg.type === "res" && msg.id && pendingCmds[msg.id]) {
      var p = pendingCmds[msg.id];
      clearTimeout(p.timer);
      delete pendingCmds[msg.id];
      if (msg.ok) p.resolve(msg.result);
      else p.reject(new Error(msg.error || "command failed"));
    } else if (msg.type === "evt" && msg.event === "projectLoaded") {
      document.getElementById("engineLoading").classList.add("hidden");
    } else if (msg.type === "evt" && msg.event === "fileExport") {
      var fd = msg.data || {};
      if (TAURI) {
        TAURI.invoke("save_export", { name: fd.name || "export", b64: fd.b64 }).then(function (path) {
          toast("Guardado: " + (path || ""));
          if (path) { TAURI.invoke("plugin:opener|open", { path: path }).catch(function () {}); }
        }).catch(function (e) { console.error("save_export", e); toast("Error al exportar"); });
      }
    }
  });

  // ---------- toolbar handlers ----------
  function sendKey(key) {
    try {
      var ev = new KeyboardEvent("keydown", { key: key, code: "Key" + key.toUpperCase(), bubbles: true, cancelable: true });
      if (frame.contentWindow) frame.contentWindow.dispatchEvent(ev);
      if (frame.contentDocument) frame.contentDocument.dispatchEvent(ev);
    } catch (e) {}
  }

  document.querySelectorAll(".tool-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tool-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var sdk = frame.contentWindow && frame.contentWindow.SketchbookSDK;
      if (sdk && typeof sdk.setTool === "function") { try { sdk.setTool(btn.dataset.tool); } catch (e) {} }
    });
  });

  document.getElementById("undoBtn").addEventListener("click", function () {
    try {
      if (frame.contentWindow && typeof frame.contentWindow.SketchbookBridge !== "undefined" && typeof frame.contentWindow.SketchbookBridge.undo === "function") {
        frame.contentWindow.SketchbookBridge.undo();
      } else {
        postCommand("undo").catch(function () {});
      }
    } catch (e) { postCommand("undo").catch(function () {}); }
  });
  document.getElementById("redoBtn").addEventListener("click", function () {
    try {
      if (frame.contentWindow && typeof frame.contentWindow.SketchbookBridge !== "undefined" && typeof frame.contentWindow.SketchbookBridge.redo === "function") {
        frame.contentWindow.SketchbookBridge.redo();
      } else {
        postCommand("redo").catch(function () {});
      }
    } catch (e) { postCommand("redo").catch(function () {}); }
  });
  document.getElementById("perspBtn").addEventListener("click", function () {
    try {
      if (frame.contentWindow && typeof frame.contentWindow.togglePersp === "function") {
        frame.contentWindow.togglePersp();
      } else {
        sendKey("v");
      }
    } catch (e) { sendKey("v"); }
  });
  document.getElementById("axisBtn").addEventListener("click", function () {
    try {
      if (frame.contentWindow && typeof frame.contentWindow.toggleAxis === "function") {
        var cur = false;
        try { cur = !!(frame.contentDocument && frame.contentDocument.getElementById("baxis") && frame.contentDocument.getElementById("baxis").classList.contains("on")); } catch (e) {}
        frame.contentWindow.toggleAxis(!cur);
      } else {
        sendKey("a");
      }
    } catch (e) { sendKey("a"); }
  });

  document.getElementById("saveBtn").addEventListener("click", function () { saveCurrent(); });
  document.getElementById("exportPngBtn").addEventListener("click", function () {
    var name = currentName();
    var sdk = frame.contentWindow && frame.contentWindow.SketchbookSDK;
    var bridge = sdk && (typeof sdk.getBridge === "function" ? sdk.getBridge() : null);
    if (bridge && typeof bridge.execute === "function") {
      bridge.execute("export", { format: "png", name: name }).then(function () { toast("Exportando PNG..."); }).catch(function () { toast("Error al exportar"); });
    } else if (sdk && typeof sdk.exportPNG === "function") {
      sdk.exportPNG().then(function () { toast("Exportando PNG..."); }).catch(function () { toast("Error al exportar"); });
    }
  });
  document.getElementById("exportGlbBtn").addEventListener("click", function () {
    var name = currentName();
    var sdk = frame.contentWindow && frame.contentWindow.SketchbookSDK;
    var bridge = sdk && (typeof sdk.getBridge === "function" ? sdk.getBridge() : null);
    if (bridge && typeof bridge.execute === "function") {
      bridge.execute("export", { format: "glb", name: name }).then(function () { toast("Exportando GLB..."); }).catch(function () { toast("Error al exportar"); });
    } else if (sdk && typeof sdk.exportGLB === "function") {
      sdk.exportGLB(name).then(function () { toast("Exportando GLB..."); }).catch(function () { toast("Error al exportar"); });
    }
  });

  function currentName() {
    var p = projects.find(function (x) { return x.id === currentId; });
    return p ? p.name : "feathcraft";
  }

  function saveCurrent() {
    if (!currentId) return;
    var sdk = frame.contentWindow && frame.contentWindow.SketchbookSDK;
    if (sdk && typeof sdk.saveProjectAs === "function") {
      sdk.saveProjectAs(currentName()).then(function (res) {
        var p = projects.find(function (x) { return x.id === currentId; });
        if (p && res && res.data) { p.data = res.data; p.updatedAt = Date.now(); saveProjects(); }
        toast("Guardado");
      }).catch(function () { toast("Error al guardar"); });
    } else {
      toast("Error al guardar");
    }
  }

  document.getElementById("backBtn").addEventListener("click", function () {
    if (currentId) {
      // autosave before leaving
      postCommand("saveProject", { name: currentName() }).then(function (res) {
        var p = projects.find(function (x) { return x.id === currentId; });
        if (p && res && res.data) { p.data = res.data; p.updatedAt = Date.now(); saveProjects(); }
      }).catch(function () {});
    }
    showDesktop();
  });

  // ---------- library events ----------
  document.getElementById("newFab").addEventListener("click", newProject);
  document.getElementById("emptyNew").addEventListener("click", newProject);
  document.getElementById("emptyImport").addEventListener("click", function () { document.getElementById("importInput").click(); });

  document.getElementById("searchInput").addEventListener("input", function (e) { query = e.target.value; render(); });
  document.getElementById("sortBtn").addEventListener("click", function () {
    sort = sort === "date" ? "name" : "date"; render();
  });
  document.querySelectorAll("#filterTabs .tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("#filterTabs .tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      filter = tab.dataset.filter;
      render();
    });
  });

  document.getElementById("importInput").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var p = { id: uid(), name: file.name.replace(/\.(sk3d|json)$/i, ""), updatedAt: Date.now(), data: data, favorite: false, trashed: false };
        projects.unshift(p); saveProjects();
        currentId = p.id;
        document.getElementById("editorTitle").textContent = p.name;
        showEditor(); startEngine(data);
      } catch (err) { toast("Archivo inválido"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  function renderSettings() {
    var body = document.getElementById("sheetBody");
    var title = document.getElementById("sheetTitle");
    if (title) title.textContent = t("settings");
    if (!body) return;
    body.innerHTML = "";
    // Theme
    var thSec = document.createElement("div");
    thSec.className = "sheet-section";
    var thLbl = document.createElement("div");
    thLbl.className = "sheet-section-label";
    thLbl.textContent = t("theme");
    thSec.appendChild(thLbl);
    var thRow = document.createElement("div");
    thRow.className = "sheet-row";
    ["light", "dark"].forEach(function (m) {
      var btn = document.createElement("button");
      btn.className = "sheet-btn" + (currentTheme() === m ? " active" : "");
      btn.textContent = m === "light" ? t("light") : t("dark");
      btn.addEventListener("click", function () {
        applyTheme(m);
        renderSettings();
        toast(t("saved"));
      });
      thRow.appendChild(btn);
    });
    thSec.appendChild(thRow);
    body.appendChild(thSec);
    // Language
    var lgSec = document.createElement("div");
    lgSec.className = "sheet-section";
    var lgLbl = document.createElement("div");
    lgLbl.className = "sheet-section-label";
    lgLbl.textContent = t("language");
    lgSec.appendChild(lgLbl);
    var lgRow = document.createElement("div");
    lgRow.className = "sheet-row";
    ["es", "en"].forEach(function (l) {
      var btn = document.createElement("button");
      btn.className = "sheet-btn" + (currentLang() === l ? " active" : "");
      btn.textContent = l === "es" ? t("spanish") : t("english");
      btn.addEventListener("click", function () {
        localStorage.setItem("feathcraft_language", l);
        applyLang();
        renderSettings();
        toast(t("saved"));
      });
      lgRow.appendChild(btn);
    });
    lgSec.appendChild(lgRow);
    body.appendChild(lgSec);
    // About
    var abSec = document.createElement("div");
    abSec.className = "sheet-section";
    var abLbl = document.createElement("div");
    abLbl.className = "sheet-section-label";
    abLbl.textContent = t("about");
    abSec.appendChild(abLbl);
    var abTxt = document.createElement("div");
    abTxt.className = "sheet-info";
    abTxt.textContent = t("aboutText");
    abSec.appendChild(abTxt);
    body.appendChild(abSec);
    // Clear all
    var clBtn = document.createElement("button");
    clBtn.className = "sheet-btn danger";
    clBtn.textContent = t("clearAll");
    clBtn.addEventListener("click", function () {
      if (confirm(t("clearConfirm"))) { projects = []; saveProjects(); render(); closeSheet(); }
    });
    body.appendChild(clBtn);
  }
  document.getElementById("settingsBtn").addEventListener("click", function () {
    document.getElementById("sheetTitle").textContent = t("settings");
    document.getElementById("sheetBody").innerHTML = "";
    renderSettings();
    document.getElementById("sheetBackdrop").classList.remove("hidden");
  });

  // ---------- init ----------
  applyLang();
  render();
})();
