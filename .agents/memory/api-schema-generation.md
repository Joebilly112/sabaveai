---
name: API schema generation
description: Avoid duplicate generated exports for inline request bodies.
---
Use named component schemas referenced with `$ref` for new OpenAPI request bodies.

**Why:** this workspace's Orval setup exports both generated Zod schemas and generated types from one index. An inline body produced identically named exports and broke the library typecheck.

**How to apply:** name the input component separately from the operation (for example, `RegenerationInput` rather than an operation-derived body name), then regenerate.
