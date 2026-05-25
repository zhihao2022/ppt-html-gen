# Template Analysis: minimal-academic-blue

## Source

Current source status: `html-native`.

This template was authored directly in HTML/CSS for the minimal implementation. When importing a user PPTX/PDF template, archive source files under `templates/<template-id>/source/` and update:

- `templates/<template-id>/source/template.source.json`
- `templates/<template-id>/template.mapping.json`
- `templates/<template-id>/template.config.json`
- `configs/template.registry.json`

## Slide Type Mapping

| Slide Type | Template File | Role |
|---|---|---|
| cover | `templates/minimal-academic-blue/cover.html` | Deck title, subtitle, author, date |
| agenda | `templates/minimal-academic-blue/agenda.html` | Chapter or section overview |
| section | `templates/minimal-academic-blue/section.html` | Section divider |
| content | `templates/minimal-academic-blue/content.html` | Component-driven content page |
| ending | `templates/minimal-academic-blue/ending.html` | Closing page |

## Fixed Elements

Fixed visual elements are defined by template HTML and CSS classes. Generated deck data may not modify their structure.

```text
cover: cover-bg, cover-content, cover-meta
agenda: slide-header, agenda-body, slide-footer
section: section-index, section-content, slide-footer
content: slide-header, slide-body, slide-references, slide-footer
ending: ending-content, ending-contact
```

## Dynamic Fields

Dynamic fields are filled from `deck.data.json` by `scripts/render-deck.js`.

```text
cover: kicker, title, subtitle, author, date
agenda: kicker, title, items
section: sectionNumber, kicker, title, subtitle
content: section, title, layout, content, references
ending: kicker, title, subtitle, contact
```

## Safe Area

Only `content` slides accept generated body components. The legal content region is:

```json
{
  "selector": "[data-safe-area]",
  "x": 96,
  "y": 232,
  "width": 1728,
  "height": 704
}
```

Content must not rely on scroll containers or overflow outside this region.

## Import Checklist

When a user template is imported:

```text
[ ] Archive original PPTX/PDF under templates/<template-id>/source/
[ ] Export representative screenshots using page-XX-{slideType}.png
[ ] Identify cover, agenda, section, content, ending pages
[ ] Update template.mapping.json sourceScreenshot fields
[ ] Separate fixed visual elements from editable fields
[ ] Confirm content slide safe area
[ ] Run npm.cmd run check:template
[ ] Run npm.cmd run check
```
