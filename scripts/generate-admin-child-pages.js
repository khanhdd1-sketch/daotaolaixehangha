
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
/**
 * Tách section từ admin.html sang trang con (chạy một lần khi cập nhật markup).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "client", "public", "admin.html");
const publicDir = path.join(root, "client", "public");

const PAGE_CONFIG = [
  { file: "admin-students.html", sectionId: "section-students", title: "Quản lý học viên", entry: "admin-students.js" },
  { file: "admin-theory.html", sectionId: "section-theory", title: "Đề lý thuyết", entry: "admin-theory.js" },
  { file: "admin-simulation.html", sectionId: "section-simulation", title: "Mô phỏng", entry: "admin-simulation.js" },
  { file: "admin-lessons.html", sectionId: "section-lessons", title: "Bài học", entry: "admin-lessons.js" },
  { file: "admin-results.html", sectionId: "section-results", title: "Kết quả thi", entry: "admin-results.js" }
];

const source = fs.readFileSync(sourcePath, "utf8");

function extractSection(html, sectionId) {
  const open = `<div id="${sectionId}"`;
  const start = html.indexOf(open);
  if (start < 0) throw new Error(`Missing ${sectionId}`);
  const closeTag = `</div>`;
  let depth = 0;
  let index = start;
  while (index < html.length) {
    const nextOpen = html.indexOf("<div", index);
    const nextClose = html.indexOf(closeTag, index);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + 4;
      continue;
    }
    depth -= 1;
    index = nextClose + closeTag.length;
    if (depth === 0) {
      let chunk = html.slice(start, index);
      chunk = chunk.replace(`id="${sectionId}" class="d-none"`, `id="${sectionId}"`);
      chunk = chunk.replace(`id="${sectionId}"`, `id="${sectionId}"`);
      return chunk.replace(/\sclass="d-none"/, "");
    }
  }
  throw new Error(`Could not close ${sectionId}`);
}

function extractTailModals(html) {
  const proofModal = html.match(/<!-- ✅ Modal preview ảnh -->[\s\S]*$/);
  return proofModal ? proofModal[0] : "";
}

const tailModals = extractTailModals(source);

for (const page of PAGE_CONFIG) {
  const sectionHtml = extractSection(source, page.sectionId);
  const doc = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="Admin — ${page.title}">
  <title>Trung tâm dạy lái xe | Admin — ${page.title}</title>
  <link href="./assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="./assets/vendor/fontawesome/css/all.min.css" rel="stylesheet">
  <link href="/src/css/main.css" rel="stylesheet">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
  <main class="page-shell">
    <div class="container">
      <div id="adminShellHero"></div>
      <div id="adminShellNav"></div>
      ${sectionHtml}
    </div>
  </main>
  <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
  <script defer src="./assets/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script defer src="/src/js/common.js"></script>
  <script defer src="/src/js/i18n.js"></script>
  <script type="module" src="/src/js/entries/${page.entry}"></script>
  ${tailModals}
</body>
</html>
`;
  fs.writeFileSync(path.join(publicDir, page.file), doc, "utf8");
  console.log("Wrote", page.file);
}

console.log("Done generating admin child pages.");
