const fs = require('fs');
const src = fs.readFileSync('app/editor.tsx','utf8');
function extract(name) {
  const m = src.match(new RegExp('const ' + name + ' = `([\\s\\S]*?)`\\s*;'));
  if (!m) throw new Error('not found: ' + name);
  return m[1];
}
const skinCss = extract('SKIN_CSS');
const hideJs = extract('HIDE_UI_JS');
let adapted = hideJs.replace(/\$\{JSON\.stringify\(SKIN_CSS\)\}/g, 'SKIN_CSS');
adapted = adapted.replace('if (!b64 || !window.ReactNativeWebView) return;', 'if (!b64) return;');
adapted = adapted.replace(
  "window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'evt', event: 'fileExport', data: { name: name || 'export', b64: b64 } }));",
  "var __exportMsg = JSON.stringify({ type: 'evt', event: 'fileExport', data: { name: name || 'export', b64: b64 } });\n        if (window.ReactNativeWebView) { try { window.ReactNativeWebView.postMessage(__exportMsg); } catch (e) {} }\n        else if (window.parent && window.parent !== window) { try { window.parent.postMessage(__exportMsg, '*'); } catch (e) {} }"
);
const out = '(function () {\n  var SKIN_CSS = ' + JSON.stringify(skinCss) + ';\n' + adapted + '\n})();\n';
fs.writeFileSync('web/reskin.js', out, 'utf8');
console.log('written', out.length, 'bytes');
