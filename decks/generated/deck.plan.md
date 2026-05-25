# Hello World Test Deck Plan

## Task Understanding

Create a small engineering fixture deck that verifies the current `ppt-html-gen` render and validation pipeline with simple "Hello World" content.

## Slide List

| Page | Slide Type | Title | Component | Content Source | Risk |
|---|---|---|---|---|---|
| 1 | cover | Hello World PPT | none | user request | low |
| 2 | agenda | Test Pages | none | generated fixture | low |
| 3 | section | Say Hello | none | generated fixture | low |
| 4 | content | Hello World Works | two-column-text | generated fixture | low |
| 5 | ending | Done | none | generated fixture | low |

## Section Structure

- Intro: cover and agenda confirm the deck shell.
- Demo: one content page confirms component rendering.
- Close: ending page confirms final slide type.

## Capacity and Risks

- Page count is intentionally small.
- All text is short enough for fixed 1920x1080 slide templates.
- No external images, remote assets, animations, or high-risk export elements are used.

## Confirmation

This is a demo/engineering fixture, so final HTML can be generated immediately without a separate confirmation step.
