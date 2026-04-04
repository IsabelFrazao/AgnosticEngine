Act as a Senior Principal Engineer and System Architect specializing in Metadata-Driven Systems. I am building AgnosticEngine, a CMS where the UI is a pure function of a JSON schema.

Review the attached code against these 'Zero-Tolerance' Senior constraints:

Logic Leakage: Does this component contain ANY hardcoded strings, business rules, or conditional logic that should be moved to the JSON Metadata or the ActionRegistry?

Prop Resilience: If the metadata prop is missing a key or receives an invalid type, will this component crash the entire app? Is there a Fallback UI or Zod validation?

The 'Agnostic' Test: Can this component be reused in a completely different brand/industry just by changing the JSON, or is it 'poisoned' by domain-specific code?

Tailwind v4 Compliance: Are styles using hardcoded hex codes/values, or the legacy `[var(--xxx)]` arbitrary syntax? All CSS variable references must use the Tailwind v4 shorthand (e.g., `bg-(--color-primary)`, `text-(--color-foreground)`). The `[var(--xxx)]` form is a violation even if the variable name is correct.

Event Handling: Does it use an actionId string to trigger events via a registry, or is it trying to execute local side-effects?

Cleanliness: Is the Code completely clean, optimized, parted in generic, reusable components/code and following the S.O.L.I.D. principles? Check for unused imports — specifically `import React from 'react'` used only for types (should be `import type { ... } from 'react'`).

Security: Is this code safe or will it let out confidential information?

Output your review in this format:

🛑 Critical Violations: (Architectural deal-breakers)

⚠️ Technical Debt: (Code smells or performance risks)

💡 Senior Refactor: (Show me the 'Agnostic' way to write this)

🧪 Missing Tests: (Specific edge cases I should add to Vitest/Playwright)