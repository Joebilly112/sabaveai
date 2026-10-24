---
name: Sabave staged delivery
description: The user’s required pause point between sabave.ai build stages.
---

For sabave.ai, complete only the current numbered stage from the supplied build brief. After each stage, summarize what was built and how to try it, then stop until the user says “continue.”

**Why:** the user explicitly requested staged delivery with a pause after each stage.

**How to apply:** treat any follow-up that does not say “continue” as a question or change to the current stage; do not begin the next stage automatically.
