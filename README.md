# Relationship System Overhead Sandbox

A browser-based relationship simulation prototype with directional relationships, emotional stable states, structural tags, event-driven updates, memory flags, and social echo propagation.

## Features

- Character creation and batch generation
- Directional axis model: trust, affection, respect, familiarity
- Emotional stable states with drift attractors
- Structural tags with family lock support
- Pattern thresholds and one-shot pattern effects
- Event templates and custom event creation
- Dashboard metrics and benchmark tooling
- Matrix, inspector, stable-state reference, and operation logs
- JSON state export

## Run

Open `index.html` directly in a modern browser, or serve the folder locally:

```powershell
python -m http.server 4173
```

Then navigate to:

`http://127.0.0.1:4173/index.html`

## Project Structure

- `index.html`: app shell markup
- `assets/css/styles.css`: UI styling
- `assets/js/core/state.js`: runtime state and helpers
- `assets/js/core/config.js`: simulation constants and templates
- `assets/js/core/engine.js`: simulation behavior and transitions
- `assets/js/ui/render.js`: rendering layer
- `assets/js/ui/actions.js`: UI actions and event wiring
- `assets/js/main.js`: bootstrap entrypoint

## License

MIT. See `LICENSE`.
