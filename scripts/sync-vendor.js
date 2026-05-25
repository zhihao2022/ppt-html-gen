const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "node_modules", "dom-to-pptx", "dist", "dom-to-pptx.bundle.js");
const vendorDir = path.join(rootDir, "vendor", "dom-to-pptx");
const targetPath = path.join(vendorDir, "dom-to-pptx.bundle.js");

function syncVendorBundle() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing dom-to-pptx browser bundle: ${sourcePath}`);
  }

  fs.mkdirSync(vendorDir, { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);

  const relativeTarget = path.relative(rootDir, targetPath);
  const size = fs.statSync(targetPath).size;
  console.log(`Synced ${relativeTarget} (${size} bytes)`);
}

try {
  syncVendorBundle();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
