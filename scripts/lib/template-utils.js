const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const legacyTemplateConfigPath = path.join(rootDir, "configs", "template.config.json");
const templateRegistryPath = path.join(rootDir, "configs", "template.registry.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadTemplateRegistry() {
  if (fs.existsSync(templateRegistryPath)) {
    return readJson(templateRegistryPath);
  }

  const legacyConfig = readJson(legacyTemplateConfigPath);
  return {
    activeTemplate: legacyConfig.templateName,
    templates: [
      {
        id: legacyConfig.templateName,
        displayName: legacyConfig.templateName,
        config: "configs/template.config.json",
        templateDir: "templates"
      }
    ]
  };
}

function findTemplateEntry(registry, templateId) {
  const templates = Array.isArray(registry.templates) ? registry.templates : [];
  return templates.find((entry) => entry.id === templateId);
}

function loadTemplateConfig(templateId) {
  const registry = loadTemplateRegistry();
  const selectedId = templateId || registry.activeTemplate;
  const entry = findTemplateEntry(registry, selectedId);

  if (!entry) {
    throw new Error(`Unknown template "${selectedId}". Add it to configs/template.registry.json.`);
  }

  const configPath = path.join(rootDir, entry.config);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing template config: ${entry.config}`);
  }

  const config = readJson(configPath);
  return {
    id: entry.id,
    entry,
    config,
    configPath,
    templateDir: path.join(rootDir, entry.templateDir || config.templateDir || path.dirname(entry.config))
  };
}

function loadAllTemplateConfigs() {
  const registry = loadTemplateRegistry();
  return (registry.templates || []).map((entry) => loadTemplateConfig(entry.id));
}

module.exports = {
  rootDir,
  templateRegistryPath,
  loadTemplateRegistry,
  loadTemplateConfig,
  loadAllTemplateConfigs
};
