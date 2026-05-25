---
name: ppt-html-gen
description: Generate browser-previewable HTML slide decks from outlines, materials, templates, and reusable components, then validate them for editable PPTX export. Use when Codex needs to plan a deck, create or update deck.data.json, render deck.html, import a PPTX/PDF template into HTML/CSS, add reusable slide components, run visual/layout checks, or prepare a DOM-to-PPTX export workflow.
---

# PPT HTML Generator

Use this skill to generate fixed-size HTML slides that can be inspected in a browser and exported to editable PPTX through DOM-to-PPTX.

## Core Contract

- Treat `deck.data.json` as the content contract and HTML/CSS templates as stable visual assets.
- Always generate or update `decks/generated/deck.plan.md` before generating final HTML for a new user deck.
- Do not generate final HTML until the user confirms the plan, unless the user explicitly asks for a demo or engineering fixture.
- Keep every slide as `<section class="slide" data-slide-type="...">` at `1920px × 1080px`.
- Put generated body content only inside `[data-safe-area]` on content slides.
- Prefer existing components under `components/` before creating custom layout HTML.
- Fix overload by splitting pages, changing components, or removing low-priority details. Do not solve overload with tiny fonts, scroll containers, or content outside safe area.
- Preserve template style locks. Do not change global theme colors, typography, or fixed template structure unless the user explicitly asks.

## Inputs

Use these default locations:

```text
decks/input/outline.md
decks/input/materials.md
decks/input/references.md
templates/<template-id>/source/
configs/theme.config.json
configs/theme.registry.json
configs/template.config.json
configs/template.registry.json
configs/component.registry.json
```

If a user provides PPTX/PDF/template screenshots, archive them under `templates/<template-id>/source/` and update that template's `template.config.json`, `theme.config.json`, `source/template.source.json`, `template.mapping.json`, and `template.analysis.md`. Register the template in `configs/template.registry.json`.

## Workflow

1. Read `configs/template.registry.json`, the active template config, `configs/component.registry.json`, and relevant files in `references/`.
2. Read user inputs from `decks/input/` or the paths the user provides.
3. Create `decks/generated/deck.plan.md` with slide list, slide type, component choice, content source, risks, and confirmation questions.
4. Wait for user confirmation for real decks.
5. Generate `decks/generated/deck.data.json`.
6. Run `npm.cmd run render`.
7. Run `npm.cmd run check`.
8. If checks fail, fix `deck.data.json`, component content, or template/component CSS, then rerun checks.
9. Run `npm.cmd run screenshots` when visual inspection matters.
10. Report output paths and remaining manual checks.

## Commands

Use Windows command shims in this repo:

```bash
npm.cmd run check:syntax
npm.cmd run render
npm.cmd run check
npm.cmd run screenshots
npm.cmd run component-previews
npm.cmd run serve
```

`npm.ps1` and `npx.ps1` may be blocked by PowerShell execution policy; use `npm.cmd` and `npx.cmd`.

## References

- For the required deck plan and data schema, read `references/deck-generation.md`.
- For template import, PPTX/PDF handling, and locked-template rules, read `references/template-import.md`.
- For component selection and new component requirements, read `references/component-authoring.md`.
- For validation and export readiness, read `references/validation-and-export.md`.

## Output Report

After generation, summarize:

```text
Generated files:
- decks/generated/deck.plan.md
- decks/generated/deck.data.json
- decks/generated/deck.html
- decks/generated/visual-check-report.json
- decks/generated/screenshots/

Checks:
- template
- overflow
- layout
- assets
- export-readiness

Known issues:
- ...

Manual browser/PPT checks:
- ...
```
