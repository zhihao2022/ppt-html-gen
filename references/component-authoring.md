# Component Authoring Reference

## Existing Components

Prefer these components:

```text
two-column-text
three-cards
comparison-table
pipeline-flow
image-text
```

Each component must have:

```text
components/<name>/component.html
components/<name>/component.css
components/<name>/schema.json
components/<name>/preview.png
```

Register every component in:

```text
configs/component.registry.json
```

## Selection Rules

```text
two-column-text     -> two parallel concepts or problem/solution
three-cards         -> three methods, three challenges, three categories
comparison-table    -> metrics, methods, datasets, pros/cons
pipeline-flow       -> algorithm or workflow steps
image-text          -> local figure plus explanation
```

If no component fits:

1. Explain why existing components are insufficient.
2. Create a new component directory.
3. Add HTML, scoped CSS, schema, registry entry, and preview.
4. Run `npm.cmd run component-previews`.
5. Run `npm.cmd run check`.

## CSS Rules

- Scope CSS under `.component-<name>`.
- Use theme variables.
- Do not write global `h1`, `p`, `.card`, or table rules in component CSS.
- Avoid `filter`, `backdrop-filter`, animation, `iframe`, `canvas`, `video`, and remote assets.
