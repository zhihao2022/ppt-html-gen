// ==UserScript==
// @name         PPT HTML Gen Export Helper
// @namespace    ppt-html-gen
// @version      0.1.0
// @description  Export .slide DOM nodes from ppt-html-gen deck.html through a page-provided domToPptx global.
// @match        http://127.0.0.1:4173/*
// @match        http://localhost:4173/*
// @match        file:///*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const exportOptions = {
    fileName: "output.pptx",
    layout: "LAYOUT_16x9",
    svgAsVector: true,
    autoEmbedFonts: true
  };

  function findExporter() {
    const candidates = [
      window.domToPptx && window.domToPptx.exportToPptx,
      window.domToPptx && window.domToPptx.export,
      window.exportToPptx
    ];

    return candidates.find((candidate) => typeof candidate === "function") || null;
  }

  function slideSummary(slides) {
    const issues = [];

    if (!slides.length) {
      issues.push("No .slide elements found.");
    }

    slides.forEach((slide, index) => {
      const id = slide.getAttribute("data-slide-id") || `slide ${index + 1}`;
      const type = slide.getAttribute("data-slide-type");
      const rect = slide.getBoundingClientRect();

      if (!type) {
        issues.push(`${id}: missing data-slide-type.`);
      }

      if (Math.round(rect.width) !== 1920 || Math.round(rect.height) !== 1080) {
        issues.push(`${id}: expected 1920x1080, got ${Math.round(rect.width)}x${Math.round(rect.height)}.`);
      }

      if (type === "content" && !slide.querySelector("[data-safe-area]")) {
        issues.push(`${id}: content slide missing [data-safe-area].`);
      }
    });

    document.querySelectorAll("video, iframe, canvas, foreignObject").forEach((node) => {
      const id = node.closest(".slide")?.getAttribute("data-slide-id") || "unknown slide";
      issues.push(`${id}: contains export-risk element <${node.tagName.toLowerCase()}>.`);
    });

    return issues;
  }

  function setStatus(message, kind) {
    const status = document.querySelector("[data-phtg-export-status]");
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.kind = kind || "info";
  }

  async function exportDeck() {
    const slides = Array.from(document.querySelectorAll(".slide"));
    const issues = slideSummary(slides);

    if (issues.length) {
      setStatus(`Blocked: ${issues[0]}`, "error");
      console.error("[ppt-html-gen] Export blocked", issues);
      return;
    }

    const exporter = findExporter();
    if (!exporter) {
      setStatus("domToPptx exporter not found on this page.", "error");
      console.error("[ppt-html-gen] Expected window.domToPptx.exportToPptx or window.exportToPptx.");
      return;
    }

    setStatus(`Exporting ${slides.length} slides...`, "info");

    try {
      await exporter(slides, exportOptions);
      setStatus(`Exported ${slides.length} slides to ${exportOptions.fileName}.`, "success");
    } catch (error) {
      setStatus(`Export failed: ${error.message}`, "error");
      console.error("[ppt-html-gen] Export failed", error);
    }
  }

  function installPanel() {
    if (document.querySelector("[data-phtg-export-panel]")) {
      return;
    }

    const panel = document.createElement("div");
    panel.dataset.phtgExportPanel = "true";
    panel.innerHTML = `
      <button type="button" data-phtg-export-button>Export PPTX</button>
      <span data-phtg-export-status>Ready</span>
    `;

    Object.assign(panel.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "999999",
      display: "flex",
      gap: "10px",
      alignItems: "center",
      padding: "10px 12px",
      background: "#0F172A",
      color: "#FFFFFF",
      font: "14px Arial, sans-serif",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.28)"
    });

    const button = panel.querySelector("[data-phtg-export-button]");
    Object.assign(button.style, {
      border: "0",
      padding: "8px 12px",
      background: "#00A6A6",
      color: "#FFFFFF",
      cursor: "pointer",
      fontWeight: "700"
    });

    button.addEventListener("click", exportDeck);
    document.body.appendChild(panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installPanel);
  } else {
    installPanel();
  }
})();
