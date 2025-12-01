---
title: Log
parent: Services
grand_parent: Documentation
nav_order: 3
---

# @services/Log.js

Styled console logging utility used in development. Exposed globally as `LOG` during system startup and gated by `DEBUG`.

Import (optional): `import Log from "@services/Log.js"`.

---

## Behavior

- No-ops when `DEBUG` is falsy (production builds). In dev, prints styled messages with timestamp and best-effort location inference.
- Accepts a flexible `location` parameter for contextual breadcrumbs:
  - Array-like: `[file, line?, method?]`
  - Object: `{ file, line?, class?, method? }`
  - String: `file`
  - Omitted: attempts to infer from the current stack.

---

## API

- `LOG.error(message, location?, obj?)`
- `LOG.warn(message, location?, obj?)`
- `LOG.info(message, location?, obj?)`
- `LOG.success(message, location?, obj?)`
- `LOG.inspect(message, location?, obj?)`
  - When `obj` is provided, logs as a collapsed group with the object content.

Timers:
- `LOG.time(label)`
- `LOG.timeEnd(label, location?)` → prints elapsed ms for `label`.

Utilities (internal):
- Location inference parses stack frames and extracts filename, method, and line.

---

## Usage

```js
DEBUG && LOG.info("Mounted component", [__FILE__, __LINE__]);
DEBUG && LOG.inspect("State", [__FILE__, __LINE__], state);
```
