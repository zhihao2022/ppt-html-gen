const fs = require("fs");
const path = require("path");
const {
  rootDir,
  writeCheckResult,
  printResult,
  failOnResult
} = require("./lib/check-utils");
const { loadTemplateRegistry, loadAllTemplateConfigs } = require("./lib/template-utils");

const requiredSlideTypes = ["cover", "agenda", "section", "content", "ending"];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function hasPlaceholder(html, placeholder) {
  return html.includes(`{{${placeholder}}}`);
}

function validateTemplate(templateContext) {
  const issues = [];
  const config = templateContext.config;
  const templateName = config.templateName || templateContext.id;

  if (config.slideSize?.width !== 1920 || config.slideSize?.height !== 1080) {
    issues.push({
      severity: "error",
      kind: "invalid-slide-size-config",
      templateName,
      message: `${templateName} slideSize must be 1920x1080.`
    });
  }

  if (!config.sourcePolicy?.sourceDir || !fs.existsSync(path.join(rootDir, config.sourcePolicy.sourceDir))) {
    issues.push({
      severity: "error",
      kind: "missing-source-dir",
      templateName,
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
        templateName,
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
        templateName,
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
        templateName,
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
        templateName,
        slideType: type,
        file: slideConfig.file,
        message: "Template must contain a .slide root element."
      });
    }

    if (!html.includes(`data-slide-type="${type}"`)) {
      issues.push({
        severity: "error",
        kind: "invalid-slide-type-marker",
        templateName,
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
          templateName,
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
          templateName,
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
          templateName,
          slideType: type,
          message: "Content template safeArea config must include positive width and height."
        });
      }
    }
  }

  return issues;
}

function collectIssues() {
  const registry = loadTemplateRegistry();
  const templateContexts = loadAllTemplateConfigs();
  const issues = [];

  for (const templateContext of templateContexts) {
    issues.push(...validateTemplate(templateContext));
  }

  return {
    activeTemplate: registry.activeTemplate,
    templateCount: templateContexts.length,
    templates: templateContexts.map((context) => ({
      id: context.id,
      templateName: context.config.templateName,
      version: context.config.version,
      config: path.relative(rootDir, context.configPath).replace(/\\/g, "/")
    })),
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
      : `${details.templateCount} registered template(s) match the template contract.`,
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
