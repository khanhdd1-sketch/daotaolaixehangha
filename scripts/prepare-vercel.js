const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const clientPublicDir = path.join(rootDir, "client", "public");
const clientSrcDir = path.join(rootDir, "client", "src");
const targetSrcDir = path.join(publicDir, "src");

function removeDir(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyDir(sourceDir, targetDir) {
  ensureDir(targetDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
      continue;
    }

    ensureDir(path.dirname(targetPath));
    fs.copyFileSync(sourcePath, targetPath);
  }
}

removeDir(publicDir);
ensureDir(publicDir);
copyDir(clientPublicDir, publicDir);
copyDir(clientSrcDir, targetSrcDir);

console.log("Prepared Vercel public assets.");
