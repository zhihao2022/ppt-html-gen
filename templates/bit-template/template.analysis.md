# Template Analysis: bit-template

## Source

This template is adapted from the user's BIT locked SVG template and archived source files:

```text
templates/bit-template/source/AI-template.pptx
templates/bit-template/source/ai_template.pdf
templates/bit-template/source/template_contract.json
templates/bit-template/source/design_spec.md
templates/bit-template/source/title.svg
templates/bit-template/source/toc.svg
templates/bit-template/source/chapter.svg
templates/bit-template/source/content.svg
templates/bit-template/source/ending.svg
```

## Style Lock

The template uses the BIT locked style values extracted from `template_contract.json`:

```text
primary: #005C30
accent: #009944
secondary_accent: #A13F0B
text: #057748
text_secondary: #3F3F3F
border: #A13F0B
font: Times New Roman, Microsoft YaHei, serif
body: 28px
title: 48px
cover_title: 59px
subtitle: 35px
annotation: 16px
```

## Slide Type Mapping

| Slide Type | HTML Template | Source Template |
|---|---|---|
| cover | `templates/bit-template/cover.html` | `title.svg` |
| agenda | `templates/bit-template/agenda.html` | `toc.svg` |
| section | `templates/bit-template/section.html` | `chapter.svg` |
| content | `templates/bit-template/content.html` | `content.svg` |
| ending | `templates/bit-template/ending.html` | `ending.svg` |

## Safe Area

The original locked SVG content workspace is:

```text
viewBox: 0 0 1280 720
main workspace: x=96, y=104, width=1088, height=542
```

The HTML adaptation scales this to a 1920x1080 slide:

```text
x=144, y=156, width=1632, height=730
```

## Locked TOC Rule

The source `toc.svg` has exactly 5 structural section slots. For an outline with exactly 5 sections, the agenda page may use the locked TOC structure.

For 1, 2, 3, 4, or 6+ sections:

```text
Do not fill blank slots.
Do not duplicate sections.
Do not squeeze extra items into the locked TOC.
Use a free structural agenda page in the same BIT style.
```

## Section Number Rule

Section numbers in BIT source templates are plain Arabic digits:

```text
1, 2, 3, 4, 5
```

Do not use leading zeros, Chinese numerals, Roman numerals, prefixes, suffixes, or punctuation for BIT section numbers.
