const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const templateDir = path.join(rootDir, "templates");
const dataPath = path.join(rootDir, "decks", "generated", "deck.data.json");
const outputPath = path.join(rootDir, "decks", "generated", "deck.html");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
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

function slideId(slide, index) {
  return slide.id || `slide-${String(index + 1).padStart(3, "0")}`;
}

function renderAgendaItems(items = []) {
  return items
    .map((item, index) => {
      const itemNumber = String(index + 1).padStart(2, "0");
      return [
        "<li>",
        `  <span class="agenda-index">${itemNumber}</span>`,
        `  <span class="agenda-text">${escapeHtml(item)}</span>`,
        "</li>"
      ].join("\n");
    })
    .join("\n");
}

function renderReferences(references = []) {
  if (!references.length) {
    return "";
  }

  return references
    .map((reference) => `<div>${escapeHtml(reference)}</div>`)
    .join("\n");
}

function renderContent(slide) {
  const layout = slide.layout || "bullet-list";
  const content = slide.content || {};

  if (layout === "two-column-text") {
    return [
      '<div class="component component-two-column-text">',
      '  <div class="panel">',
      `    <h2>${escapeHtml(content.leftTitle)}</h2>`,
      `    <p>${escapeHtml(content.leftBody)}</p>`,
      "  </div>",
      '  <div class="panel">',
      `    <h2>${escapeHtml(content.rightTitle)}</h2>`,
      `    <p>${escapeHtml(content.rightBody)}</p>`,
      "  </div>",
      "</div>"
    ].join("\n");
  }

  if (layout === "callout") {
    return [
      '<div class="component component-callout">',
      `  <p>${escapeHtml(content.text)}</p>`,
      "</div>"
    ].join("\n");
  }

  const bullets = Array.isArray(content.bullets) ? content.bullets : [];
  return [
    '<div class="component component-bullet-list">',
    "  <ul>",
    ...bullets.map((bullet) => `    <li>${escapeHtml(bullet)}</li>`),
    "  </ul>",
    "</div>"
  ].join("\n");
}

function renderSlide(slide, index, deck) {
  const type = slide.type;
  const templatePath = path.join(templateDir, `${type}.html`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing template for slide type "${type}": ${templatePath}`);
  }

  const commonValues = {
    slideId: escapeHtml(slideId(slide, index)),
    deckTitle: escapeHtml(deck.title),
    pageNumber: String(index + 1).padStart(2, "0"),
    title: escapeHtml(slide.title),
    subtitle: escapeHtml(slide.subtitle),
    kicker: escapeHtml(slide.kicker),
    author: escapeHtml(slide.author || deck.author),
    date: escapeHtml(slide.date || deck.date),
    section: escapeHtml(slide.section),
    sectionNumber: escapeHtml(slide.sectionNumber),
    contact: escapeHtml(slide.contact),
    items: renderAgendaItems(slide.items),
    content: renderContent(slide),
    references: renderReferences(slide.references)
  };

  return renderTemplate(readText(templatePath), commonValues);
}

function renderDeck() {
  const data = readJson(dataPath);
  const deck = data.deck || {};
  const slides = Array.isArray(data.slides) ? data.slides : [];

  if (!slides.length) {
    throw new Error("deck.data.json must include at least one slide.");
  }

  const renderedSlides = slides
    .map((slide, index) => renderSlide(slide, index, deck))
    .join("\n\n");

  const html = renderTemplate(readText(path.join(templateDir, "base.html")), {
    language: escapeHtml(deck.language || "zh-CN"),
    deckTitle: escapeHtml(deck.title || "Untitled Deck"),
    slides: renderedSlides
  });

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, html, "utf8");

  return { outputPath, slideCount: slides.length };
}

try {
  const result = renderDeck();
  console.log(`Rendered ${result.slideCount} slides to ${path.relative(rootDir, result.outputPath)}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
