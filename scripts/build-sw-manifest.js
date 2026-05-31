
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
/**
 * Sinh manifest URL module ES cho Service Worker precache.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsRoot = path.join(root, "client", "src", "js");
const outputPath = path.join(root, "client", "public", "sw-module-manifest.json");

const STATIC_MODULE_URLS = [
  "/src/js/modules/shared/textUtils.js",
  "/src/js/modules/shared/historyUtils.js",
  "/src/js/modules/shared/views/confirmModalView.js",
  "/src/js/entries/admin-students.js",
  "/src/js/entries/admin-theory.js",
  "/src/js/entries/admin-simulation.js",
  "/src/js/entries/admin-lessons.js",
  "/src/js/entries/admin-results.js",
  "/admin-students.html",
  "/admin-theory.html",
  "/admin-simulation.html",
  "/admin-lessons.html",
  "/admin-results.html"
];

/**
 * @param {string} dir
 * @param {string[]} acc
 * @returns {string[]}
 */
function collectJsModules(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsModules(fullPath, acc);
    } else if (entry.name.endsWith(".js")) {
      const publicPath = `/${path.relative(path.join(root, "client"), fullPath).replace(/\\/g, "/")}`;
      acc.push(publicPath);
    }
  }
  return acc;
}

const discovered = collectJsModules(jsRoot);
const modules = [...new Set([...discovered, ...STATIC_MODULE_URLS])].sort();

const manifest = {
  generatedAt: new Date().toISOString(),
  version: 5,
  modules
};

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${modules.length} module URLs to ${outputPath}`);
