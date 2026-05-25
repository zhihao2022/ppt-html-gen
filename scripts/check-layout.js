const { chromium } = require("playwright");
const {
  deckHtmlPath,
  deckDataPath,
  readJson,
  fileUrl,
  launchBrowser,
  writeCheckResult,
  printResult,
  failOnResult
} = require("./lib/check-utils");

async function collectLayoutIssues(page, expectedSlides) {
  return page.evaluate((expectedSlidesFromData) => {
    const expectedSize = { width: 1920, height: 1080 };
    const validTypes = new Set(["cover", "agenda", "section", "content", "ending"]);
    const issues = [];
    const slides = Array.from(document.querySelectorAll(".slide"));

    if (slides.length !== expectedSlidesFromData.length) {
      issues.push({
        severity: "error",
        kind: "slide-count-mismatch",
        message: `HTML contains ${slides.length} slide(s), expected ${expectedSlidesFromData.length}.`
      });
    }

    slides.forEach((slide, index) => {
      const slideId = slide.getAttribute("data-slide-id");
      const slideType = slide.getAttribute("data-slide-type");
      const rect = slide.getBoundingClientRect();

      if (!slideId) {
        issues.push({
          severity: "error",
          kind: "missing-slide-id",
          index: index + 1,
          message: "Slide is missing data-slide-id."
        });
      }

      if (!slideType || !validTypes.has(slideType)) {
        issues.push({
          severity: "error",
          kind: "invalid-slide-type",
          slideId: slideId || `(slide ${index + 1})`,
          value: slideType,
          message: "Slide has missing or invalid data-slide-type."
        });
      }

      if (Math.round(rect.width) !== expectedSize.width || Math.round(rect.height) !== expectedSize.height) {
        issues.push({
          severity: "error",
          kind: "invalid-slide-size",
          slideId: slideId || `(slide ${index + 1})`,
          expected: expectedSize,
          actual: {
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          message: "Slide dimensions do not match 1920x1080."
        });
      }

      if (slideType === "content" && !slide.querySelector("[data-safe-area]")) {
        issues.push({
          severity: "error",
          kind: "missing-content-safe-area",
          slideId: slideId || `(slide ${index + 1})`,
          message: "Content slide is missing [data-safe-area]."
        });
      }

      const title = slide.querySelector("h1");
      if (!title || !title.textContent.trim()) {
        issues.push({
          severity: "error",
          kind: "empty-title",
          slideId: slideId || `(slide ${index + 1})`,
          message: "Slide title is missing or empty."
        });
      }

      slide.querySelectorAll("li").forEach((item) => {
        if (!item.textContent.trim()) {
          issues.push({
            severity: "error",
            kind: "empty-list-item",
            slideId: slideId || `(slide ${index + 1})`,
            message: "Slide contains an empty list item."
          });
        }
      });
    });

    return {
      expectedSlideCount: expectedSlidesFromData.length,
      actualSlideCount: slides.length,
      issues
    };
  }, expectedSlides);
}

async function main() {
  const deckData = readJson(deckDataPath);
  const expectedSlides = Array.isArray(deckData.slides) ? deckData.slides : [];

  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(fileUrl(deckHtmlPath));
  const details = await collectLayoutIssues(page, expectedSlides);
  await browser.close();

  const hasErrors = details.issues.some((issue) => issue.severity === "error");
  const result = {
    name: "layout",
    status: hasErrors ? "fail" : "pass",
    message: hasErrors
      ? `${details.issues.length} layout issue(s) found.`
      : `${details.actualSlideCount} slide(s) match the layout contract.`,
    details
  };

  const report = writeCheckResult(result);
  printResult(result, report);
  failOnResult(result);
}

main().catch((error) => {
  const result = {
    name: "layout",
    status: "fail",
    message: error.message,
    details: { issues: [{ severity: "error", message: error.message }] }
  };
  const report = writeCheckResult(result);
  printResult(result, report);
  process.exitCode = 1;
});
