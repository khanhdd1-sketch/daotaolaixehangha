const fs = require("fs");
const path = require("path");

const adminPath = path.join(__dirname, "..", "client", "public", "admin.html");
let html = fs.readFileSync(adminPath, "utf8");
const marker = '<div id="section-students"';
const start = html.indexOf(marker);
if (start < 0) {
  console.error("section-students not found");
  process.exit(1);
}
const mainClose = html.indexOf("</main>", start);
html = html.slice(0, start) + html.slice(mainClose);
fs.writeFileSync(adminPath, html, "utf8");
console.log("Trimmed admin.html to hub-only");
