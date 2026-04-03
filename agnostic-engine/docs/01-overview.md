# AgnosticEngine — Overview

## What is this?

**AgnosticEngine** is a web application framework where the entire user interface is controlled by a JSON configuration file — not by hardcoded design decisions inside the code.

Think of it this way: instead of a developer writing "put a blue button here that says 'Publish'", they write a small JSON snippet that says "render a button, primary style, labeled 'Publish'". The engine reads that JSON and builds the UI automatically.

This means the same codebase can power a completely different-looking, different-functioning application just by swapping out the JSON. No code changes needed.

---

## Why does it exist?

Traditional web applications have a problem: the UI and the business logic are tangled together. When a product manager wants to rearrange a page, add a button, or change a label, a developer has to touch the code, test it, deploy it. That is slow and expensive.

AgnosticEngine separates the **what to show** (JSON schema) from the **how to show it** (React components). Once the engine is built, non-developers can describe interfaces by writing JSON, and the engine renders them correctly every time.

This pattern is common inside large companies (Netflix, Airbnb, Spotify) for their internal CMS and admin tooling. AgnosticEngine is a clean, educational implementation of that idea.

---

## Who is this for?

| Person | What they do with this |
|--------|----------------------|
| **Developers** | Build new component types (atoms), wire up actions, extend the schema |
| **Content editors** | (Future) Write JSON schemas to compose pages without coding |
| **Designers** | Modify themes via CSS variables without touching component code |
| **Tech leads** | Study the architecture as a reference for metadata-driven UI systems |

---

## What can it do today?

The current version is a **working prototype** that demonstrates the core engine. It renders:

- **Buttons** — three visual styles (primary, secondary, outline), with optional action wiring
- **Tables** — column/row data from metadata
- **Theme Switcher** — lets the user pick from 5 built-in color themes
- **Nested layouts** — any component can contain child components, recursively

The demo page at `http://localhost:3000` shows all of these rendering from a single JSON file (`src/data/mock-schema.json`).

---

## The big idea in one sentence

> The JSON schema is the source of truth. The engine renders it. Components know nothing about the business.

---

## Next steps in this document

- [Getting Started](./02-getting-started.md) — how to run the project locally
- [How It Works](./03-how-it-works.md) — the engine pipeline explained
- [Components](./04-components.md) — every built-in component and its options
- [Adding a Component](./05-adding-a-component.md) — step-by-step guide
- [Theming](./06-theming.md) — color themes and CSS variables
- [Security](./07-security.md) — how the engine stays safe
- [Project Structure](./08-project-structure.md) — every file explained
- [TODOs](./TODOS.md) — honest list of what is missing
