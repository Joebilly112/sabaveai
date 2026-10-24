---
name: Seed-data packaging
description: Keep JSON seed files available in bundled production server builds.
---
Import static JSON seed data into the server source so the build bundles it; do not locate it relative to `process.cwd()`.

**Why:** the API server runs from the artifact directory in development but from a different working directory in the published runtime, where the relative seed path returned ENOENT.

**How to apply:** when reading packaged seed JSON, verify the built server can start from an unrelated working directory.
