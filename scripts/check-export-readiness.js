const { chromium } = require("playwright");
const {
  rootDir,
  deckHtmlPath,
  readJson,
  fileUrl,
  launchBrowser,
  writeCheckResult,
  printResult,
  failOnResult
} = require("./lib/check-utils");
const path = require("path");

const exportConfigPath = path.join(rootDir, "configs", "export.config.json");

async function collectExportIssues(page, exportConfig) {
  return page.evaluate((config) => {
    const issues = [];
    const slideSelector = config.slideSelector || ".slide";
    const slides = Array.from(document.querySelectorAll(slideSelector));
    const expectedSize = config.requiresFixedSlideSize || { width: 1920, height: 1080 };
    const tolerance = 1;

    if (!slides.length) {
      issues.push({
        severity: "error",
        kind: "missing-slides",
        message: `No slides found for selector ${slideSelector}.`
      });
    }

    const exporterAvailable =
      typeof window.domToPptx?.exportToPptx === "function" ||
      typeof window.domToPptx?.export === "function" ||
      typeof window.exportToPptx === "function";

    if (!exporterAvailable) {
      issues.push({
        severity: "error",
        kind: "missing-dom-to-pptx-exporter",
        message: "No DOM-to-PPTX exporter found on window."
      });
    }

    for (const forbidden of config.excludedSelectors || []) {
      if (forbidden === slideSelector) {
        issues.push({
          severity: "error",
          kind: "invalid-export-selector",
          selector: slideSelector,
          message: `Export selector must not target ${forbidden}.`
        });
      }
    }

    slides.forEach((slide, index) => {
      const slideId = slide.getAttribute("data-slide-id") || `slide-${index + 1}`;
      const rect = slide.getBoundingClientRect();

      if (Math.abs(rect.width - expectedSize.width) > tolerance || Math.abs(rect.height - expectedSize.height) > tolerance) {
        issues.push({
          severity: "error",
          kind: "invalid-export-slide-size",
          slideId,
          expected: expectedSize,
          actual: {
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          message: "Slide size is not export-ready."
        });
      }

      if (slide.scrollWidth > slide.clientWidth + tolerance || slide.scrollHeight > slide.clientHeight + tolerance) {
        issues.push({
          severity: "error",
          kind: "slide-scroll-overflow",
          slideId,
          message: "Slide has scroll overflow and may export incorrectly.",
          measurements: {
            clientWidth: slide.clientWidth,
            clientHeight: slide.clientHeight,
            scrollWidth: slide.scrollWidth,
            scrollHeight: slide.scrollHeight
          }
        });
      }
    });

    for (const selector of config.riskSelectors || []) {
      document.querySelectorAll(selector).forEach((node) => {
        issues.push({
          severity: selector.startsWith("[style") ? "warning" : "error",
          kind: "export-risk-selector",
          selector,
          slideId: node.closest(".slide")?.getAttribute("data-slide-id") || null,
          message: `${selector} is risky for DOM-to-PPTX export.`
        });
      });
    }

    if (config.requiresLocalAssets) {
      document.querySelectorAll("img").forEach((image) => {
        const src = image.getAttribute("src") || "";
        if (/^https?:\/\//i.test(src)) {
          issues.push({
            severity: "warning",
            kind: "remote-image",
            src,
            message: "Remote images should be replaced with local assets before export."
          });
        }
      });
    }

    return {
      slideSelector,
      slideCount: slides.length,
      fileName: config.fileName,
      layout: config.layout,
      svgAsVector: config.svgAsVector,
      autoEmbedFonts: config.autoEmbedFonts,
      exporterAvailable,
      issues
    };
  }, exportConfig);
}

async function main() {
  const exportConfig = readJson(exportConfigPath);
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(fileUrl(deckHtmlPath), { waitUntil: "networkidle" });
  const details = await collectExportIssues(page, exportConfig);
  await browser.close();

  const hasErrors = details.issues.some((issue) => issue.severity === "error");
  const hasWarnings = details.issues.some((issue) => issue.severity === "warning");
  const result = {
    name: "export-readiness",
    status: hasErrors ? "fail" : hasWarnings ? "warning" : "pass",
    message: hasErrors
      ? `${details.issues.length} export readiness issue(s) found.`
      : hasWarnings
        ? `${details.issues.length} export readiness warning(s) found.`
        : `${details.slideCount} slide(s) are ready for DOM-to-PPTX export.`,
    details
  };

  const report = writeCheckResult(result);
  printResult(result, report);
  failOnResult(result);
}

main().catch((error) => {
  const result = {
    name: "export-readiness",
    status: "fail",
    message: error.message,
    details: { issues: [{ severity: "error", message: error.message }] }
  };
  const report = writeCheckResult(result);
  printResult(result, report);
  process.exitCode = 1;
});
