# Validation and Export Reference

## Validation Commands

Run:

```bash
npm.cmd run check:syntax
npm.cmd run check
```

`npm.cmd run check` runs:

```text
check:template
render
check:overflow
check:layout
check:assets
check:export
```

Run visual artifacts when needed:

```bash
npm.cmd run screenshots
npm.cmd run component-previews
```

## Report

Read:

```text
decks/generated/visual-check-report.json
```

Required final status:

```text
summary.status = pass
failed = 0
warnings = 0 unless explicitly accepted
```

## Export Readiness

The generated HTML is ready for manual DOM-to-PPTX export when:

- every slide is `.slide`
- every content slide has `[data-safe-area]`
- there is no safe area overflow
- slide size is `1920 × 1080`
- images are loaded and local
- no `iframe`, `canvas`, `video`, `foreignObject`, complex filters, animation, or remote images are required
- `npm.cmd run check:export` passes

The userscript should export only:

```js
Array.from(document.querySelectorAll(".slide"))
```

Recommended DOM-to-PPTX options:

```js
{
  fileName: "output.pptx",
  layout: "LAYOUT_16x9",
  svgAsVector: true,
  autoEmbedFonts: true
}
```
