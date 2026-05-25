# Template Import Reference

## Source Handling

Archive user template sources under `templates/source/`.

Accepted files:

```text
template.pptx
template.pdf
page-01-cover.png
page-02-agenda.png
page-03-section.png
page-04-content.png
page-05-ending.png
```

Update:

```text
templates/source/template.source.json
templates/template.mapping.json
templates/template.analysis.md
configs/template.config.json
```

## Import Steps

1. Identify representative pages for `cover`, `agenda`, `section`, `content`, and `ending`.
2. Extract background colors, typography, title position, footer, logo/decorative elements, content safe area, and references area.
3. Separate fixed elements from editable fields.
4. Rebuild fixed page frames in `templates/*.html` and `styles/*.css`.
5. Keep generated content in `deck.data.json`, not embedded in template HTML.
6. Run `npm.cmd run check:template`.
7. Run `npm.cmd run check`.

## Locked Template Lessons From BIT Reference

The temporary BIT reference under `tmp/BIT-template` used a locked SVG contract. Carry these rules into HTML template imports:

- Treat the template contract as authoritative.
- Preserve style lock colors and typography unless the user explicitly overrides them.
- Keep fixed template elements stable; generated deck data fills placeholders only.
- Record safe areas as explicit coordinates in `configs/template.config.json` and `templates/template.mapping.json`.
- Do not silently stretch fixed structural slots.

Specific BIT-style constraints to preserve when applicable:

```text
title: title page placeholders only
toc: exactly 5 section slots when using the locked TOC
chapter: plain section digit and title
content: fixed main workspace
ending: presenter/teacher text only
```

If a locked TOC has exactly 5 slots, use it only for 5 sections. For 1, 2, 3, 4, or 6+ sections, create a free structural TOC page in the same style rather than filling blanks, duplicating sections, or squeezing extras.

## Template Contract Checks

`scripts/check-template.js` verifies:

- required slide types exist
- template files exist
- root `.slide` and `data-slide-type` are present
- required placeholders exist
- content template has `[data-safe-area]`
- configured slide size is `1920 × 1080`
- template source metadata files exist

If this fails, fix template/config files before changing deck content.
