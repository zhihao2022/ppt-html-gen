# HTML-to-PPTX Export Spec

## Goal

Export the generated HTML deck to `.pptx` while keeping as much content editable as possible.

The export target is not `body`, `.deck`, or a screenshot wrapper. The export target is always:

```js
Array.from(document.querySelectorAll(".slide"))
```

## Files

```text
configs/export.config.json
scripts/check-export-readiness.js
userscript/export-html-to-pptx.user.js
decks/exports/
```

## Export Readiness

Run:

```bash
npm.cmd run check
```

This includes:

```bash
npm.cmd run check:export
```

The export readiness check verifies:

- `.slide` elements exist
- slides are `1920 × 1080`
- slide selector does not target `body`, `html`, `.deck`, or `.preview-wrapper`
- no slide scroll overflow
- no high-risk export elements such as `video`, `iframe`, `canvas`, or `foreignObject`
- remote images are flagged

## Userscript

Install:

```text
userscript/export-html-to-pptx.user.js
```

The userscript adds an `Export PPTX` button on:

```text
http://127.0.0.1:4173/
http://localhost:4173/
file:///*
```

It expects the page to provide one of:

```js
window.domToPptx.exportToPptx
window.domToPptx.export
window.exportToPptx
```

Then it calls:

```js
exporter(Array.from(document.querySelectorAll(".slide")), {
  fileName: "output.pptx",
  layout: "LAYOUT_16x9",
  svgAsVector: true,
  autoEmbedFonts: true
});
```

## Manual PowerPoint Check

After export, open the PPTX and check:

- text boxes are editable where expected
- tables remain editable where expected
- SVG assets render acceptably
- page order is correct
- no content is clipped
- fonts and colors remain close to browser preview
