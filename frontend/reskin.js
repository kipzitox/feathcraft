(function () {
  var SKIN_CSS = "\r\n/* ── feathcraft Material Design 3 — complete token set for engine UI ──\r\n   Defines every CSS variable the engine's m3.css / base.css expect,\r\n   using our M3 purple brand (#6750A4) as primary. Light & dark modes. */\r\n:root{\r\n  /* Shape tokens (MD3) */\r\n  --shp-xs:4px;\r\n  --shp-sm:8px;\r\n  --shp-md:12px;\r\n  --shp-lg:16px;\r\n  --shp-xl:28px;\r\n  --shp-full:999px;\r\n\r\n  /* Elevation shadows (MD3) */\r\n  --elev-1:0 1px 2px rgba(29,27,32,.14),0 1px 3px 1px rgba(29,27,32,.12);\r\n  --elev-2:0 1px 2px rgba(29,27,32,.12),0 2px 6px 2px rgba(29,27,32,.10);\r\n  --elev-3:0 1px 3px rgba(29,27,32,.15),0 4px 8px 3px rgba(29,27,32,.10);\r\n  --elev-4:0 6px 12px rgba(29,27,32,.14),0 12px 24px rgba(29,27,32,.10);\r\n  --elev-5:0 8px 16px rgba(29,27,32,.16),0 16px 32px rgba(29,27,32,.12);\r\n\r\n  /* Motion */\r\n  --tr:all .15s cubic-bezier(.2,.0,.38,.9);\r\n\r\n  /* MD3 Color tokens — LIGHT (default) */\r\n  --md-primary:#6750A4;\r\n  --md-on-primary:#FFFFFF;\r\n  --md-primary-container:#EADDFF;\r\n  --md-on-primary-container:#21005D;\r\n\r\n  --md-secondary:#625B71;\r\n  --md-on-secondary:#FFFFFF;\r\n  --md-secondary-container:#E8DEF8;\r\n  --md-on-secondary-container:#1D192B;\r\n\r\n  --md-tertiary:#7D5260;\r\n  --md-on-tertiary:#FFFFFF;\r\n  --md-tertiary-container:#FFD8E4;\r\n  --md-on-tertiary-container:#31111D;\r\n\r\n  --md-error:#B3261E;\r\n  --md-on-error:#FFFFFF;\r\n  --md-error-container:#F9DEDC;\r\n  --md-on-error-container:#410E0B;\r\n\r\n  --md-background:#FEF7FF;\r\n  --md-on-background:#1D1B20;\r\n  --md-surface:#FEF7FF;\r\n  --md-on-surface:#1D1B20;\r\n  --md-surface-variant:#E7E0EC;\r\n  --md-on-surface-variant:#49454F;\r\n  --md-outline:#79747E;\r\n  --md-outline-variant:#CAC4D0;\r\n  --md-shadow:#000000;\r\n  --md-scrim:rgba(0,0,0,.4);\r\n  --md-inverse-surface:#322F35;\r\n  --md-inverse-on-surface:#F5EFF7;\r\n  --md-inverse-primary:#D0BCFF;\r\n\r\n  /* Engine legacy aliases (used by base.css, components.css, etc.) */\r\n  --bg:var(--md-background);\r\n  --ink:var(--md-on-background);\r\n  --mut:var(--md-on-surface-variant);\r\n  --pan:rgba(254,247,255,.94);\r\n  --bdr:var(--md-outline-variant);\r\n  --ink-rgb:29,27,32;\r\n  --tr:all .15s ease;\r\n}\r\n\r\n:root[data-theme=\"dark\"]{\r\n  /* MD3 Color tokens — DARK */\r\n  --md-primary:#D0BCFF;\r\n  --md-on-primary:#381E72;\r\n  --md-primary-container:#4F378B;\r\n  --md-on-primary-container:#EADDFF;\r\n\r\n  --md-secondary:#CCC2DC;\r\n  --md-on-secondary:#332D41;\r\n  --md-secondary-container:#4A4458;\r\n  --md-on-secondary-container:#E8DEF8;\r\n\r\n  --md-tertiary:#EFB8C8;\r\n  --md-on-tertiary:#4A2531;\r\n  --md-tertiary-container:#633B48;\r\n  --md-on-tertiary-container:#FFD8E4;\r\n\r\n  --md-error:#F2B8B5;\r\n  --md-on-error:#601410;\r\n  --md-error-container:#8C1D18;\r\n  --md-on-error-container:#F9DEDC;\r\n\r\n  --md-background:#141218;\r\n  --md-on-background:#E6E0E9;\r\n  --md-surface:#141218;\r\n  --md-on-surface:#E6E0E9;\r\n  --md-surface-variant:#49454F;\r\n  --md-on-surface-variant:#CAC4D0;\r\n  --md-outline:#938F99;\r\n  --md-outline-variant:#49454F;\r\n  --md-shadow:#000000;\r\n  --md-scrim:rgba(0,0,0,.5);\r\n  --md-inverse-surface:#E6E0E9;\r\n  --md-inverse-on-surface:#322F35;\r\n  --md-inverse-primary:#6750A4;\r\n\r\n  /* Engine legacy aliases (dark) */\r\n  --bg:var(--md-background);\r\n  --ink:var(--md-on-background);\r\n  --mut:var(--md-on-surface-variant);\r\n  --pan:rgba(20,18,24,.94);\r\n  --bdr:var(--md-outline-variant);\r\n  --ink-rgb:230,224,233;\r\n  --tr:all .15s ease;\r\n}\r\n\r\n/* Global font — DM Mono for authentic technical aesthetic */\r\nbody,button,input,select,textarea,\r\n.btn,.btn-sm,.btn-md,.btn-pill,.btn-sft,.cyc-btn,.cw,\r\n#sbar,.nsm-btn,.emb,#stxt,.card,.sc-group,.panel,.pop,.brush-pop,.tsep,.nsm-lbl,\r\n.nsm-title,.nsm-box,.fc-hdr,.fc-hdr-pill,.pg-thumb,.vw-thumb,\r\n.cyc-pop-item,.sc-title,.nsm-lbl,.bprev-btn{\r\n  font-family:'DM Mono',monospace,-apple-system,sans-serif !important;\r\n}\r\n\r\n/* Canvas background */\r\n#cc{background:var(--bg) !important;}\r\n\r\n/* Cards / sheets — elevation 1 */\r\n.card,.sc-group,.nsm-box,.fc-hdr-pill{\r\n  background:var(--md-surface) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n  border-radius:var(--shp-lg) !important;\r\n  box-shadow:var(--elev-1) !important;\r\n}\r\n\r\n/* Buttons — MD3 filled/tonal/outlined */\r\n.btn,.btn-sm,.btn-md,.btn-pill,.btn-sft{\r\n  border-radius:var(--shp-sm) !important;\r\n  box-shadow:none !important;\r\n  background:var(--md-surface-container-low,var(--md-surface)) !important;\r\n  color:var(--md-on-surface) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n  transition:background .15s,border-color .15s,box-shadow .15s !important;\r\n}\r\n.btn:hover,.btn-sm:hover,.btn-md:hover,.btn-pill:hover,.btn-sft:hover{\r\n  background:var(--md-surface-container,var(--md-surface-variant)) !important;\r\n}\r\n.btn:active,.btn-sm:active,.btn-md:active,.btn-pill:active,.btn-sft:active{\r\n  background:var(--md-surface-container-high,var(--md-surface-variant)) !important;\r\n}\r\n\r\n/* Active/toggle buttons — filled primary */\r\n.btn.on,.btn-sm.on,.btn-md.on,.btn-pill.on,.btn-sft.on,\r\n.cyc-btn.on{\r\n  background:var(--md-primary) !important;\r\n  color:var(--md-on-primary) !important;\r\n  border-color:transparent !important;\r\n}\r\n.btn.on.mode,.btn-sm.on.mode{\r\n  background:var(--md-primary-container) !important;\r\n  color:var(--md-on-primary-container) !important;\r\n  border-color:transparent !important;\r\n}\r\n.btn.on.mode::before{background:var(--md-primary) !important;}\r\n\r\n/* Danger buttons */\r\n.btn.danger,.btn-sm.danger{color:var(--md-error) !important;border-color:var(--md-error) !important;}\r\n.btn.danger:hover{background:var(--md-error-container) !important;}\r\n\r\n/* FABs */\r\n#pb-fab,#sc-fab{\r\n  background:var(--md-primary-container) !important;\r\n  color:var(--md-on-primary-container) !important;\r\n  border:none !important;\r\n  border-radius:var(--shp-lg) !important;\r\n  box-shadow:var(--elev-3) !important;\r\n}\r\n\r\n/* Top bars — hidden (we use RN top bar) */\r\n#topbar,#narrow-bar{display:none !important;}\r\n\r\n/* Status / bottom bars */\r\n#sbar,#stab{\r\n  background:var(--md-surface) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n  border-radius:var(--shp-full) !important;\r\n  box-shadow:var(--elev-2) !important;\r\n}\r\n\r\n/* Color wells */\r\n.cw,#ccpick,.bgpop-swatch,#bgpop-pick{\r\n  border-radius:var(--shp-sm) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n}\r\n\r\n/* Cycle buttons */\r\n.cyc-btn{\r\n  border-radius:var(--shp-sm) !important;\r\n  background:var(--md-surface) !important;\r\n  color:var(--md-on-surface) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n}\r\n.cyc-btn.on{background:var(--md-secondary-container) !important;color:var(--md-on-secondary-container) !important;border-color:transparent !important;}\r\n\r\n/* Popovers / menus — elevation 3 */\r\n#expmenu,#layers-pop,#bgpop,.cyc-pop,.brush-pop,#sgizmo{\r\n  background:var(--md-surface) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n  border-radius:var(--shp-md) !important;\r\n  box-shadow:var(--elev-3) !important;\r\n}\r\n\r\n/* Dialogs */\r\n#new-scene-modal,#save-name-modal,#export-name-modal{background:var(--md-scrim) !important;}\r\n.nsm-box{\r\n  background:var(--md-surface) !important;\r\n  border:none !important;\r\n  border-radius:var(--shp-xl) !important;\r\n  box-shadow:var(--elev-3) !important;\r\n}\r\n\r\n/* Float card & strips */\r\n#pb-float-card,#pages,#views{\r\n  background:var(--md-surface) !important;\r\n  border:1px solid var(--md-outline-variant) !important;\r\n  border-radius:var(--shp-lg) !important;\r\n  box-shadow:var(--elev-2) !important;\r\n}\r\n\r\n/* Snackbar / toast */\r\n#toast{\r\n  background:var(--md-inverse-surface) !important;\r\n  color:var(--md-inverse-on-surface) !important;\r\n  border-radius:var(--shp-full) !important;\r\n  box-shadow:var(--elev-3) !important;\r\n}\r\n\r\n/* Recording stop pill */\r\n#rec-stop-btn{\r\n  background:var(--md-error-container) !important;\r\n  color:var(--md-on-error-container) !important;\r\n  border-color:transparent !important;\r\n}\r\n\r\n/* Sliders — M3 track + primary thumb */\r\n.fps-slider,input[type=range].vr,.brush-slider-row input[type=range],#pb-colors input[type=range]{\r\n  background:var(--md-outline-variant) !important;\r\n}\r\n.fps-slider::-webkit-slider-thumb,input[type=range].vr::-webkit-slider-thumb,.brush-slider-row input[type=range]::-webkit-slider-thumb,#pb-colors input[type=range]::-webkit-slider-thumb{\r\n  background:var(--md-primary) !important;\r\n  border-color:var(--md-on-primary) !important;\r\n}\r\n\r\n/* Separators */\r\n.tsep{background:var(--md-outline-variant) !important;}\r\n\r\n/* Layer rows */\r\n.tb-lrow{background:var(--md-surface) !important;border-radius:var(--shp-sm) !important;}\r\n.tb-lrow.active{background:var(--md-secondary-container) !important;color:var(--md-on-secondary-container) !important;}\r\n\r\n/* Ensure sidecol is always displayed across all screen sizes and aspect ratios, positioned below the RN top bar */\r\n#sidecol{\r\n  display:flex !important;\r\n  top:72px !important;\r\n  bottom:56px !important;\r\n  z-index:200 !important;\r\n}\r\n#sidecol.collapsed{\r\n  opacity:0 !important;\r\n  pointer-events:none !important;\r\n  transform:translateX(-12px) !important;\r\n}\r\nbody.rside #sidecol.collapsed{\r\n  transform:translateX(12px) !important;\r\n}\r\n\r\n/* Hide the engine's original top bars (both regular and narrow) completely.\r\n   Use multiple properties as fallback in case display:none is overridden. */\r\n#topbar,#narrow-bar{\r\n  display:none !important;\r\n  visibility:hidden !important;\r\n  opacity:0 !important;\r\n  height:0 !important;\r\n  width:0 !important;\r\n  overflow:hidden !important;\r\n  pointer-events:none !important;\r\n  position:absolute !important;\r\n  left:-9999px !important;\r\n  top:-9999px !important;\r\n}\r\n\r\n/* Popovers that were anchored to the (now hidden) engine top bar would render\r\n   at the top of the WebView, behind the RN top bar. Pin them just below the\r\n   top bar, right-aligned, so they stay visible and aligned with the controls. */\r\n#expmenu,#layers-pop,#bgpop,#bdepth-op,#rec-stop-btn{\r\n  position:fixed !important;\r\n  top:76px !important;\r\n  right:12px !important;\r\n  left:auto !important;\r\n  z-index:9999 !important;\r\n}\r\n\r\n/* ── Tablet Adaptations (>= 768px) ── */\r\n@media (min-width: 768px) {\r\n  #sidecol {\r\n    width: 216px !important;\r\n    top: 76px !important;\r\n    bottom: 36px !important;\r\n    gap: 8px !important;\r\n  }\r\n  #gc {\r\n    width: 184px !important;\r\n    height: 154px !important;\r\n  }\r\n  .sc-group {\r\n    border-radius: 14px !important;\r\n  }\r\n  .cw, #ccpick {\r\n    width: 32px !important;\r\n    height: 32px !important;\r\n    border-radius: 8px !important;\r\n  }\r\n  .cyc-btn {\r\n    height: 32px !important;\r\n    font-size: 8px !important;\r\n  }\r\n  .btn, .btn-sm, .btn-md {\r\n    font-size: 9px !important;\r\n  }\r\n  #sbar {\r\n    bottom: 14px !important;\r\n    padding: 6px 18px !important;\r\n    font-size: 9.5px !important;\r\n    border-radius: var(--shp-full) !important;\r\n  }\r\n  #stab {\r\n    width: 20px !important;\r\n    height: 40px !important;\r\n    border-radius: 12px !important;\r\n  }\r\n  #stab span {\r\n    width: 4px !important;\r\n    height: 20px !important;\r\n  }\r\n  #expmenu, #layers-pop, #bgpop, #bdepth-op, #rec-stop-btn {\r\n    top: 76px !important;\r\n    right: 16px !important;\r\n    border-radius: 16px !important;\r\n  }\r\n}\r\n";

(function () {
  function injectSkin() {
    try {
      if (!document.getElementById('__tk_skin')) {
        var s = document.createElement('style');
        s.id = '__tk_skin';
        s.textContent = SKIN_CSS;
        document.head.appendChild(s);
      }
      var h = document.getElementById('__tk_hide');
      if (!h) {
        h = document.createElement('style');
        h.id = '__tk_hide';
        h.textContent = '#topbar,#narrow-bar,#bhide,#sc-hidden-toggle,#sc-hidden-bar,#pb-fab,#sc-fab,#lcl-float-group,#fps-overlay,#fps-crosshair,#fps-plane-ctrl{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;width:0!important;overflow:hidden!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;top:-9999px!important;}';
        document.head.appendChild(h);
      } else {
        // Ensure __tk_hide is always the last style in head to override later-loaded CSS
        if (h.parentNode === document.head && h !== document.head.lastElementChild) {
          document.head.appendChild(h);
        }
      }
    } catch (e) {}
  }
  function whiteBg() {
    try {
      var ci = document.getElementById('bgpop-custom');
      if (ci && !ci.__tkInit) {
        ci.__tkInit = true;
        ci.value = '#FEF7FF';
        ci.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e) {}
  }
  function on(sel) {
    try { var e = document.querySelector(sel); return !!(e && e.classList.contains('on')); } catch (e) { return false; }
  }
  function reportState() {
    try {
      var st = {
        grid: on('#bgrid') || on('#pb-grid'),
        axis: on('#baxis') || on('#pb-axis'),
        persp: on('#bpersp') || on('#pb-nav-persp') || on('#nav-persp'),
        surf: on('#bsurf') || on('#pb-surf'),
        depth: on('#bdepth') || on('#pb-depth'),
        surfgrid: on('#bsurfgrid') || on('#pb-surfgrid'),
        pan: on('#bpan'),
        orbit: on('#borbit'),
        stylus: on('#bstylus') || on('#pb-stylus'),
        gestswap: on('#bgestswap') || on('#pb-gestswap'),
        lcl: on('#lcl-float') || on('#glocal') || on('#pb-glocal'),
      };
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'evt', event: 'tkState', data: st }));
      }
    } catch (e) {}
  }
  var HIDE_IDS = ['topbar','narrow-bar','bhide','sc-hidden-toggle','sc-hidden-bar','pb-fab','sc-fab','lcl-float-group','fps-overlay','fps-crosshair','fps-plane-ctrl'];
  function enforceHide() {
    try {
      for (var i = 0; i < HIDE_IDS.length; i++) {
        var e = document.getElementById(HIDE_IDS[i]);
        if (e && e.style.display !== 'none') e.style.setProperty('display', 'none', 'important');
      }
    } catch (e) {}
  }
  function setupWatch() {
    if (window.__tkWatch) return;
    window.__tkWatch = true;
    try {
      for (var i = 0; i < HIDE_IDS.length; i++) {
        (function (id) {
          var e = document.getElementById(id);
          if (e && !e.__tkObs) {
            e.__tkObs = true;
            new MutationObserver(function () {
              var el = document.getElementById(id);
              if (el && el.style.display !== 'none') el.style.setProperty('display', 'none', 'important');
            }).observe(e, { attributes: true, attributeFilter: ['style', 'class'] });
          }
        })(HIDE_IDS[i]);
      }
      setInterval(enforceHide, 1500);
      document.addEventListener('click', function () {
        setTimeout(reportState, 60);
      });
    } catch (e) {}
  }
  function patchDownload() {
    try {
      if (window.__tkDlPatched) return;
      window.__tkDlPatched = true;
      // Keep exported blobs alive so we can read them after the engine calls
      // URL.revokeObjectURL() right after the anchor click.
      window.__tkBlobs = window.__tkBlobs || {};
      var _create = URL.createObjectURL ? URL.createObjectURL.bind(URL) : null;
      var _revoke = URL.revokeObjectURL ? URL.revokeObjectURL.bind(URL) : null;
      if (_create) URL.createObjectURL = function (b) { var u = _create(b); try { window.__tkBlobs[u] = b; } catch (e) {} return u; };
      if (_revoke) URL.revokeObjectURL = function () { /* keep blob so async capture works */ };

      function postExport(name, b64) {
        if (!b64) return;
        try {
          var __exportMsg = JSON.stringify({ type: 'evt', event: 'fileExport', data: { name: name || 'export', b64: b64 } });
        if (window.ReactNativeWebView) { try { window.ReactNativeWebView.postMessage(__exportMsg); } catch (e) {} }
        else if (window.parent && window.parent !== window) { try { window.parent.postMessage(__exportMsg, '*'); } catch (e) {} }
        } catch (e) {}
      }

      var MODEL_RE = /\.(glb|obj|usda|usdz|json|gltf)$/i;
      var orig = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        try {
          var href = this.href || '';
          var dl = (this.download || '').toLowerCase();
          if (href.indexOf('data:image/png') === 0 && /\.png$/i.test(dl)) {
            postExport(dl, href.split(',')[1]);
            return;
          }
          if (MODEL_RE.test(dl)) {
            if (href.indexOf('data:') === 0) {
              postExport(dl, href.split(',')[1]);
              return;
            }
            if (href.indexOf('blob:') === 0) {
              var blob = window.__tkBlobs[href];
              if (blob) {
                var fr = new FileReader();
                fr.onload = function () { postExport(dl, ('' + fr.result).split(',')[1]); };
                fr.readAsDataURL(blob);
                return;
              }
            }
          }
        } catch (e) {}
        return orig.apply(this, arguments);
      };
    } catch (e) {}
  }
  function tick() { injectSkin(); enforceHide(); whiteBg(); reportState(); setupWatch(); patchDownload(); }
  if (document.readyState !== 'loading') tick();
  else document.addEventListener('DOMContentLoaded', tick);
  var n = 0;
  var iv = setInterval(function () { tick(); if (++n > 8) clearInterval(iv); }, 400);
  document.addEventListener('projectLoaded', function () { setTimeout(function () { whiteBg(); reportState(); enforceHide(); }, 300); });
  window.__tkWhiteBg = whiteBg;
  window.__tkReportState = reportState;
})();

})();
