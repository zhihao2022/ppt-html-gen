const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..", "..");
const generatedDir = path.join(rootDir, "decks", "generated");
const deckHtmlPath = path.join(generatedDir, "deck.html");
const deckDataPath = path.join(generatedDir, "deck.data.json");
const reportPath = path.join(generatedDir, "visual-check-report.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileUrl(filePath) {
  return pathToFileURL(path.resolve(filePath)).href;
}

function relativePath(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function loadReport() {
  if (!fs.existsSync(reportPath)) {
    return {
      generatedAt: null,
      deckHtml: relativePath(deckHtmlPath),
      summary: {
        status: "unknown",
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      checks: []
    };
  }

  return readJson(reportPath);
}

function summarize(report) {
  const checks = Array.isArray(report.checks) ? report.checks : [];
  const passed = checks.filter((check) => check.status === "pass").length;
  const failed = checks.filter((check) => check.status === "fail").length;
  const warnings = checks.filter((check) => check.status === "warning").length;

  report.generatedAt = new Date().toISOString();
  report.summary = {
    status: failed > 0 ? "fail" : warnings > 0 ? "warning" : "pass",
    totalChecks: checks.length,
    passed,
    failed,
    warnings
  };
}

function writeCheckResult(result) {
  ensureDir(path.dirname(reportPath));

  const report = loadReport();
  const nextChecks = (report.checks || []).filter((check) => check.name !== result.name);
  nextChecks.push({
    ...result,
    checkedAt: new Date().toISOString()
  });

  report.deckHtml = relativePath(deckHtmlPath);
  report.checks = nextChecks;
  summarize(report);

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

async function launchBrowser(chromium) {
  const candidates = [
    { channel: process.env.PHTG_BROWSER_CHANNEL || "chrome" },
    { channel: "msedge" },
    {}
  ];

  let lastError;
  for (const options of candidates) {
    try {
      return await chromium.launch({ ...options, headless: true });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function printResult(result, report) {
  const message = `${result.status.toUpperCase()} ${result.name}: ${result.message}`;
  if (result.status === "fail") {
    console.error(message);
  } else {
    console.log(message);
  }
  console.log(`Report: ${relativePath(reportPath)}`);
}

function failOnResult(result) {
  if (result.status === "fail") {
    process.exitCode = 1;
  }
}

module.exports = {
  rootDir,
  generatedDir,
  deckHtmlPath,
  deckDataPath,
  reportPath,
  readJson,
  ensureDir,
  fileUrl,
  relativePath,
  writeCheckResult,
  launchBrowser,
  printResult,
  failOnResult
};
