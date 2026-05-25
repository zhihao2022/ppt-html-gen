const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const {
  deckHtmlPath,
  rootDir,
  fileUrl,
  launchBrowser,
  writeCheckResult,
  printResult,
  failOnResult
} = require("./lib/check-utils");

async function collectAssetIssues(page) {
  return page.evaluate(() => {
    const issues = [];
    const riskSelectors = [
      "video",
      "iframe",
      "canvas",
      "foreignObject",
      "[style*='filter']",
      "[style*='backdrop-filter']",
      "[style*='animation']"
    ];

    const images = Array.from(document.images).map((image) => ({
      src: image.getAttribute("src") || "",
      currentSrc: image.currentSrc || "",
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight
    }));

    for (const image of images) {
      if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
        issues.push({
          severity: "error",
          kind: "image-load-failed",
          src: image.src,
          message: "Image failed to load."
        });
      }

      if (/^https?:\/\//i.test(image.src) || /^https?:\/\//i.test(image.currentSrc)) {
        issues.push({
          severity: "warning",
          kind: "remote-image",
          src: image.currentSrc || image.src,
          message: "Remote image may be unstable for PPTX export."
        });
      }
    }

    for (const selector of riskSelectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      for (const node of nodes) {
        issues.push({
          severity: selector.startsWith("[style") ? "warning" : "error",
          kind: "export-risk-element",
          selector,
          slideId: node.closest(".slide")?.getAttribute("data-slide-id") || null,
          message: `${selector} is risky for DOM-to-PPTX export.`
        });
      }
    }

    return {
      imageCount: images.length,
      issues
    };
  });
}

function collectLocalReferenceIssues() {
  const html = fs.readFileSync(deckHtmlPath, "utf8");
  const issues = [];
  const localRefs = Array.from(html.matchAll(/\b(?:src|href)="([^"]+)"/g)).map((match) => match[1]);

  for (const ref of localRefs) {
    if (/^(?:https?:|data:|mailto:|#)/i.test(ref)) {
      continue;
    }

    const normalized = ref.split("#")[0].split("?")[0];
    if (!normalized) {
      continue;
    }

    const resolved = new URL(normalized, fileUrl(deckHtmlPath));
    if (resolved.protocol !== "file:") {
      continue;
    }

    const filePath = path.normalize(decodeURIComponent(resolved.pathname).replace(/^\/([A-Za-z]:\/)/, "$1"));
    const normalizedRoot = path.normalize(rootDir).toLowerCase();
    const normalizedFile = path.normalize(filePath).toLowerCase();

    if (!fs.existsSync(filePath)) {
      issues.push({
        severity: "error",
        kind: "missing-local-reference",
        ref,
        message: `Referenced local asset does not exist: ${ref}`
      });
    } else if (!normalizedFile.startsWith(normalizedRoot)) {
      issues.push({
        severity: "warning",
        kind: "external-local-reference",
        ref,
        message: `Referenced local asset is outside the project root: ${ref}`
      });
    }
  }

  return issues;
}

async function main() {
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(fileUrl(deckHtmlPath), { waitUntil: "networkidle" });
  const details = await collectAssetIssues(page);
  await browser.close();

  details.issues.push(...collectLocalReferenceIssues());

  const hasErrors = details.issues.some((issue) => issue.severity === "error");
  const hasWarnings = details.issues.some((issue) => issue.severity === "warning");
  const result = {
    name: "assets",
    status: hasErrors ? "fail" : hasWarnings ? "warning" : "pass",
    message: hasErrors
      ? `${details.issues.length} asset/export issue(s) found.`
      : hasWarnings
        ? `${details.issues.length} asset/export warning(s) found.`
        : `${details.imageCount} image(s) checked; no asset/export risks found.`,
    details
  };

  const report = writeCheckResult(result);
  printResult(result, report);
  failOnResult(result);
}

main().catch((error) => {
  const result = {
    name: "assets",
    status: "fail",
    message: error.message,
    details: { issues: [{ severity: "error", message: error.message }] }
  };
  const report = writeCheckResult(result);
  printResult(result, report);
  process.exitCode = 1;
});
