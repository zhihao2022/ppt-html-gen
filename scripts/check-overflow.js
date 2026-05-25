const { chromium } = require("playwright");
const {
  deckHtmlPath,
  fileUrl,
  launchBrowser,
  writeCheckResult,
  printResult,
  failOnResult
} = require("./lib/check-utils");

async function collectOverflowIssues(page) {
  return page.evaluate(() => {
    const tolerance = 1;

    function rectInfo(rect) {
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left)
      };
    }

    function outside(inner, outer) {
      return (
        inner.left < outer.left - tolerance ||
        inner.top < outer.top - tolerance ||
        inner.right > outer.right + tolerance ||
        inner.bottom > outer.bottom + tolerance
      );
    }

    const issues = [];
    const contentSlides = Array.from(document.querySelectorAll('.slide[data-slide-type="content"]'));

    for (const slide of contentSlides) {
      const slideId = slide.getAttribute("data-slide-id") || "(missing id)";
      const safeArea = slide.querySelector("[data-safe-area]");

      if (!safeArea) {
        issues.push({
          severity: "error",
          slideId,
          kind: "missing-safe-area",
          message: "Content slide is missing [data-safe-area]."
        });
        continue;
      }

      if (safeArea.scrollWidth > safeArea.clientWidth + tolerance || safeArea.scrollHeight > safeArea.clientHeight + tolerance) {
        issues.push({
          severity: "error",
          slideId,
          kind: "safe-area-scroll-overflow",
          message: "Safe area content exceeds its client box.",
          measurements: {
            clientWidth: safeArea.clientWidth,
            clientHeight: safeArea.clientHeight,
            scrollWidth: safeArea.scrollWidth,
            scrollHeight: safeArea.scrollHeight
          }
        });
      }

      const safeRect = safeArea.getBoundingClientRect();
      const directChildren = Array.from(safeArea.children);

      for (const child of directChildren) {
        const childRect = child.getBoundingClientRect();
        if (outside(childRect, safeRect)) {
          issues.push({
            severity: "error",
            slideId,
            kind: "child-outside-safe-area",
            selector: child.className ? `.${String(child.className).trim().replace(/\s+/g, ".")}` : child.tagName.toLowerCase(),
            safeArea: rectInfo(safeRect),
            element: rectInfo(childRect),
            message: "A direct child of [data-safe-area] is outside the safe area."
          });
        }
      }
    }

    return {
      contentSlideCount: contentSlides.length,
      issues
    };
  });
}

async function main() {
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(fileUrl(deckHtmlPath));
  const details = await collectOverflowIssues(page);
  await browser.close();

  const hasErrors = details.issues.some((issue) => issue.severity === "error");
  const result = {
    name: "overflow",
    status: hasErrors ? "fail" : "pass",
    message: hasErrors
      ? `${details.issues.length} overflow issue(s) found.`
      : `No overflow found in ${details.contentSlideCount} content slide(s).`,
    details
  };

  const report = writeCheckResult(result);
  printResult(result, report);
  failOnResult(result);
}

main().catch((error) => {
  const result = {
    name: "overflow",
    status: "fail",
    message: error.message,
    details: { issues: [{ severity: "error", message: error.message }] }
  };
  const report = writeCheckResult(result);
  printResult(result, report);
  process.exitCode = 1;
});
