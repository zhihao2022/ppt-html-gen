const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");
const { rootDir, launchBrowser, relativePath } = require("./lib/check-utils");

const componentDir = path.join(rootDir, "components");
const stylePaths = [
  path.join(rootDir, "styles", "theme.css"),
  path.join(rootDir, "styles", "layout.css"),
  path.join(rootDir, "styles", "typography.css"),
  path.join(rootDir, "styles", "components.css"),
  path.join(rootDir, "styles", "export-safe.css")
];

const samples = {
  "two-column-text": {
    leftTitle: "Template",
    leftBody: "Fixed slide assets define the page frame, title hierarchy, footer and safe area.",
    rightTitle: "Component",
    rightBody: "Reusable content assets define stable structures for repeated information patterns."
  },
  "three-cards": {
    cards: [
      { title: "Plan", body: "Confirm slide type, content source and component choice before generating HTML." },
      { title: "Render", body: "Combine structured data with templates and component assets." },
      { title: "Check", body: "Validate overflow, layout, assets and screenshots before export." }
    ]
  },
  "comparison-table": {
    columns: ["Item", "Use", "Risk"],
    rows: [
      ["Template", "Fixed visual frame", "Low"],
      ["Component", "Reusable content layout", "Low"],
      ["Screenshot", "Fallback visual capture", "High"]
    ]
  },
  "pipeline-flow": {
    steps: [
      { title: "Input", description: "Collect outline and materials." },
      { title: "Plan", description: "Choose slide types and components." },
      { title: "Render", description: "Generate fixed-size HTML slides." },
      { title: "Check", description: "Validate before export." }
    ]
  },
  "image-text": {
    image: pathToFileURL(path.join(rootDir, "assets", "images", "render-loop.svg")).href,
    imageAlt: "Render loop diagram",
    imageCaption: "Local figure source for preview generation.",
    imagePosition: "left",
    title: "Image plus text",
    body: "Use this component when a figure needs a concise interpretation next to it.",
    bullets: ["Local assets first.", "Short captions.", "No remote images."]
  }
};

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTemplate(template, values) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function renderCards(cards = []) {
  return cards.map((card, index) => [
    '<article class="card">',
    `  <div class="card-index">${String(index + 1).padStart(2, "0")}</div>`,
    `  <h2>${escapeHtml(card.title)}</h2>`,
    `  <p>${escapeHtml(card.body)}</p>`,
    "</article>"
  ].join("\n")).join("\n");
}

function renderRows(rows = []) {
  return rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("\n");
}

function renderSteps(steps = []) {
  return steps.map((step, index) => [
    '<article class="step">',
    `  <div class="step-index">${String(index + 1).padStart(2, "0")}</div>`,
    `  <h2>${escapeHtml(step.title)}</h2>`,
    `  <p>${escapeHtml(step.description)}</p>`,
    "</article>"
  ].join("\n")).join("\n");
}

function renderBullets(bullets = []) {
  return bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("\n");
}

function valuesFor(name, sample) {
  if (name === "three-cards") {
    return { cards: renderCards(sample.cards) };
  }
  if (name === "comparison-table") {
    return {
      headerCells: sample.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join(""),
      bodyRows: renderRows(sample.rows)
    };
  }
  if (name === "pipeline-flow") {
    return { steps: renderSteps(sample.steps) };
  }
  if (name === "image-text") {
    return {
      image: escapeHtml(sample.image),
      imageAlt: escapeHtml(sample.imageAlt),
      imageCaption: escapeHtml(sample.imageCaption),
      imagePosition: escapeHtml(sample.imagePosition),
      textTitle: escapeHtml(sample.title),
      body: escapeHtml(sample.body),
      bullets: renderBullets(sample.bullets)
    };
  }
  return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, escapeHtml(value)]));
}

function previewHtml(name) {
  const componentPath = path.join(componentDir, name, "component.html");
  const css = [
    ...stylePaths.map((filePath) => readText(filePath).replace(/^@import[^\n]+\n/gm, "")),
    ...Object.keys(samples).map((componentName) => readText(path.join(componentDir, componentName, "component.css")))
  ].join("\n");
  let component = renderTemplate(readText(componentPath), valuesFor(name, samples[name]));

  if (name === "pipeline-flow") {
    component = component.replace(
      'class="component component-pipeline-flow"',
      `class="component component-pipeline-flow" style="--pipeline-count: ${samples[name].steps.length}"`
    );
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>${css}</style>
</head>
<body>
  <section class="slide slide-content" data-slide-type="content" data-slide-id="${name}-preview">
    <header class="slide-header">
      <div class="slide-kicker">Component Preview</div>
      <h1 class="slide-title">${name}</h1>
    </header>
    <main class="slide-body" data-safe-area>
      ${component}
    </main>
  </section>
</body>
</html>`;
}

async function main() {
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  for (const name of Object.keys(samples)) {
    await page.setContent(previewHtml(name), { waitUntil: "networkidle" });
    const outputPath = path.join(componentDir, name, "preview.png");
    await page.locator(".slide").screenshot({ path: outputPath });
    console.log(`Saved ${relativePath(outputPath)}`);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
