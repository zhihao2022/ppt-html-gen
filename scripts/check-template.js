const fs = require("fs");
const path = require("path");
const {
  rootDir,
  readJson,
  writeCheckResult,
  printResult,
  failOnResult
} = require("./lib/check-utils");

const configPath = path.join(rootDir, "configs", "template.config.json");
const requiredSlideTypes = ["cover", "agenda", "section", "content", "ending"];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function hasPlaceholder(html, placeholder) {
  return html.includes(`{{${placeholder}}}`);
}

function collectIssues() {
  const issues = [];
  const config = readJson(configPath);

  if (config.slideSize?.width !== 1920 || config.slideSize?.height !== 1080) {
    issues.push({
      severity: "error",
      kind: "invalid-slide-size-config",
      message: "template.config.json slideSize must be 1920x1080."
    });
  }

  if (!config.sourcePolicy?.sourceDir || !fs.existsSync(path.join(rootDir, config.sourcePolicy.sourceDir))) {
    issues.push({
      severity: "error",
      kind: "missing-source-dir",
      message: "Template source directory is missing."
    });
  }

  for (const metadataFile of [
    config.sourcePolicy?.manifestFile,
    config.templateContract?.mappingFile,
    config.templateContract?.analysisFile
  ]) {
    if (!metadataFile || !fs.existsSync(path.join(rootDir, metadataFile))) {
      issues.push({
        severity: "error",
        kind: "missing-template-metadata",
        file: metadataFile,
        message: `Required template metadata file is missing: ${metadataFile}`
      });
    }
  }

  for (const type of requiredSlideTypes) {
    const slideConfig = config.slideTypes?.[type];
    if (!slideConfig) {
      issues.push({
        severity: "error",
        kind: "missing-slide-type-config",
        slideType: type,
        message: `Missing slide type config for ${type}.`
      });
      continue;
    }

    const templateFile = slideConfig.file ? path.join(rootDir, slideConfig.file) : null;
    if (!templateFile || !fs.existsSync(templateFile)) {
      issues.push({
        severity: "error",
        kind: "missing-template-file",
        slideType: type,
        file: slideConfig.file,
        message: `Missing template file for ${type}.`
      });
      continue;
    }

    const html = readText(templateFile);
    if (!html.includes("class=\"slide ") && !html.includes("class=\"slide\"")) {
      issues.push({
        severity: "error",
        kind: "missing-slide-class",
        slideType: type,
        file: slideConfig.file,
        message: "Template must contain a .slide root element."
      });
    }

    if (!html.includes(`data-slide-type="${type}"`)) {
      issues.push({
        severity: "error",
        kind: "invalid-slide-type-marker",
        slideType: type,
        file: slideConfig.file,
        message: `Template must declare data-slide-type="${type}".`
      });
    }

    for (const placeholder of slideConfig.requiredPlaceholders || []) {
      if (!hasPlaceholder(html, placeholder)) {
        issues.push({
          severity: "error",
          kind: "missing-placeholder",
          slideType: type,
          file: slideConfig.file,
          placeholder,
          message: `Template is missing required placeholder {{${placeholder}}}.`
        });
      }
    }

    if (type === "content") {
      if (!html.includes("data-safe-area")) {
        issues.push({
          severity: "error",
          kind: "missing-safe-area",
          slideType: type,
          file: slideConfig.file,
          message: "Content template must contain [data-safe-area]."
        });
      }

      const safeArea = slideConfig.safeArea;
      if (!safeArea || safeArea.width <= 0 || safeArea.height <= 0) {
        issues.push({
          severity: "error",
          kind: "invalid-safe-area-config",
          slideType: type,
          message: "Content template safeArea config must include positive width and height."
        });
      }
    }
  }

  return {
    templateName: config.templateName,
    version: config.version,
    requiredSlideTypes,
    issues
  };
}

function main() {
  const details = collectIssues();
  const hasErrors = details.issues.some((issue) => issue.severity === "error");
  const result = {
    name: "template",
    status: hasErrors ? "fail" : "pass",
    message: hasErrors
      ? `${details.issues.length} template issue(s) found.`
      : `${details.requiredSlideTypes.length} slide template(s) match the template contract.`,
    details
  };

  const report = writeCheckResult(result);
  printResult(result, report);
  failOnResult(result);
}

try {
  main();
} catch (error) {
  const result = {
    name: "template",
    status: "fail",
    message: error.message,
    details: { issues: [{ severity: "error", message: error.message }] }
  };
  const report = writeCheckResult(result);
  printResult(result, report);
  process.exitCode = 1;
}
