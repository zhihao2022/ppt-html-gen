# Deck Generation Reference

## Plan First

For a real user deck, create `decks/generated/deck.plan.md` before final HTML. Include:

```markdown
| Page | Slide Type | Title | Component | Content Source | Risk |
|---|---|---|---|---|---|
| 1 | cover | ... | none | outline.md | low |
```

Also include:

- task understanding
- estimated page count
- section structure
- likely overloaded pages
- required user confirmations

Do not proceed to final `deck.data.json` until confirmed.

## deck.data.json Shape

Use this top-level structure:

```json
{
  "deck": {
    "title": "",
    "subtitle": "",
    "author": "",
    "date": "",
    "language": "zh-CN"
  },
  "slides": []
}
```

Slide types:

```text
cover
agenda
section
content
ending
```

Content slides must include:

```json
{
  "id": "slide-004",
  "type": "content",
  "section": "",
  "title": "",
  "layout": "two-column-text",
  "content": {},
  "references": []
}
```

## Capacity Rules

- Slide title: max 14 English words or equivalent short Chinese title.
- Body bullets: max 5.
- Bullet length: max 18 English words or one compact Chinese sentence.
- Cards: max 3 or use another component.
- Tables: max 5 rows and 4 columns.
- References: keep short and put details in notes or appendix.

When content exceeds capacity:

```text
1. Remove low-priority detail.
2. Use a better component.
3. Split into multiple pages.
4. Move detail to appendix or notes.
```
