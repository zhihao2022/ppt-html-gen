const path = require("path");
const { chromium } = require("playwright");
const {
  deckHtmlPath,
  generatedDir,
  ensureDir,
  fileUrl,
  launchBrowser,
  relativePath
} = require("./lib/check-utils");

const screenshotDir = path.join(generatedDir, "screenshots");

async function main() {
  ensureDir(screenshotDir);

  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  await page.goto(fileUrl(deckHtmlPath));
  const slides = await page.locator(".slide").count();

  for (let index = 0; index < slides; index += 1) {
    const slide = page.locator(".slide").nth(index);
    const slideId = await slide.getAttribute("data-slide-id");
    const outputPath = path.join(screenshotDir, `${slideId || `slide-${index + 1}`}.png`);
    await slide.screenshot({ path: outputPath });
    console.log(`Saved ${relativePath(outputPath)}`);
  }

  await browser.close();
  console.log(`Captured ${slides} slide screenshot(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
