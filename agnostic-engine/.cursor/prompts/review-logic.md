Act as a Senior Principal Engineer and System Architect specializing in Metadata-Driven Systems. I am building AgnosticEngine, a CMS where the UI is a pure function of a JSON schema.

Review the attached code against these 'Zero-Tolerance' Senior constraints:

Logic Leakage: Does this component contain ANY hardcoded strings, business rules, or conditional logic that should be moved to the JSON Metadata or the ActionRegistry?

Prop Resilience: If the metadata prop is missing a key or receives an invalid type, will this component crash the entire app? Is there a Fallback UI or Zod validation?

The 'Agnostic' Test: Can this component be reused in a completely different brand/industry just by changing the JSON, or is it 'poisoned' by domain-specific code?

Tailwind v4 Compliance: Are styles using hardcoded hex codes/values, or the legacy `[var(--xxx)]` arbitrary syntax? All CSS variable references must use the Tailwind v4 shorthand (e.g., `bg-(--color-primary)`, `text-(--color-foreground)`). The `[var(--xxx)]` form is a violation even if the variable name is correct.

Event Handling: Does it use an actionId string to trigger events via a registry, or is it trying to execute local side-effects?

Extraction: Does this code contain any block that belongs in `src/lib/` rather than inline? Apply the test: "if I added a second component of this type right now, would I copy-paste this block?" If yes, it must be extracted. Specifically flag: logic that accesses a shared singleton (ActionRegistry, logger, apiClient) with conditional branching; data transformation or formatting with no JSX; validation or fallback behaviour shared across sibling components. Also check `src/lib/` first — does a utility already exist that this code is duplicating?

Dead Code: Are there any unused exports, unreachable branches, or imported symbols that are never referenced? These must be removed, not left as "might be useful later."

Undocumented Decisions: Does the code contain any of the following WITHOUT a comment explaining why: an intentional rule exception, a deferred extraction, or a non-obvious default/fallback? If yes, add the comment — not to explain what the code does, but to explain why the decision was made.

Cleanliness: Is the Code completely clean, optimized, parted in generic, reusable components/code and following the S.O.L.I.D. principles? Check for unused imports — specifically `import React from 'react'` used only for types (should be `import type { ... } from 'react'`).

Atomic Design Placement: Are new components placed in atomic folders only (`components/atoms/*` or `components/organisms/*`)? Flag any flat `components/*.tsx` file addition as a violation unless it is an explicit provider entry under `components/providers/*`.

Security: Is this code safe or will it let out confidential information?

Output your review in this format:

🛑 Critical Violations: (Architectural deal-breakers)

⚠️ Technical Debt: (Code smells or performance risks)

💡 Senior Refactor: (Show me the 'Agnostic' way to write this)

🧪 Missing Tests: (Specific edge cases I should add to Vitest/Playwright)