# Template Source Archive

Put user-provided template sources in this directory before converting them to HTML/CSS.

Accepted inputs:

- `template.pptx`
- `template.pdf`
- `page-01-cover.png`
- `page-02-agenda.png`
- `page-03-section.png`
- `page-04-content.png`
- `page-05-ending.png`

Naming rule for screenshots:

```text
page-XX-{slideType}.png
```

Examples:

```text
page-01-cover.png
page-02-agenda.png
page-03-section.png
page-04-content.png
page-05-ending.png
```

Do not overwrite original source files. If a new user template is imported, create a dated subdirectory and update `template.source.json`.
