# Contributing to SR3E

Unofficial Shadowrun 3rd Edition Homebrew system for Foundry VTT v13 (V2).

> **Legal** Contributors must own SR3E. Specs cite page numbers only (e.g., “SR3 p. 115”). No reproduction of rules text or tables.

---

## 1) Philosophy

- Game rules are suggestions, enforcment should be light, where it matters (Karma), or maybe not at all. TTRPGs rely on trust.
- Write code so it works cleanly without fallbacks. Aim for simple, elegant solutions where `??` or other defaults aren’t needed.
- Let the language and Foundry handle errors. Avoid adding extra `throw`; they are for development only, not production.
- Prefer clarity and self‑documentation. Use full words and clear method names instead of comments or abbreviations.
- Treat `sr3e.*` config keys as the baseline reference. Build on them directly so dropdowns and UI stay consistent.
- Use the gated logger: `DEBUG && LOG.*(...)` so log calls are stripped when DEBUG is false.

---

## 2) Tech


- JavaScript (ESNext): [MDN JavaScript](https://developer.mozilla.org/docs/Web/JavaScript) | [ECMAScript Spec](https://tc39.es/ecma262/)
- Svelte 5 (runes): [Svelte Docs](https://svelte.dev/docs/svelte/overview)
- LESS: [lesscss.org](https://lesscss.org/)
- Vite bundler: [Vite Guide](https://vite.dev/guide/)
- Gulp automated build/watch: [Gulp Quick Start](https://gulpjs.com/docs/en/getting-started/quick-start)
- Foundry v13.342 (V2): [Foundry API v13](https://foundryvtt.com/api/) | [Systems Guide](https://foundryvtt.com/article/systems/)
- Node 22.x: [Node.js 22 Docs](https://nodejs.org/docs/latest-v22.x/)

---

## 3) Local dev

**Option A: In-place development (Verified)**

- Run `npm ci`.
- Clone or copy the repo directly into `FoundryVTT/Data/systems/sr3e`.
- For the first build you can run `npm run build`.
- Builds are automated on save (via gulp). `npx gulp` js, LESS and svelte files are automatically handled in most scenarios.

**Option B: Symlink (according to AI)**

- Run `npm ci`.
- Keep the repo in a separate folder.
- Create a symlink from Foundry `Data/systems/sr3e` to your repo:
  - Windows: `mklink /J "%LOCALAPPDATA%/FoundryVTT/Data/systems/sr3e" "C:\path\to\repo"`
  - macOS: `ln -s /path/to/repo ~/Library/Application\ Support/FoundryVTT/Data/systems/sr3e`
  - Linux: `ln -s /path/to/repo ~/.local/share/FoundryVTT/Data/systems/sr3e`
- For the first build you can run `npm run build`.
- Builds are automated on save (via gulp). `npx gulp` js, LESS and svelte files are automatically handled in most scenarios.

---

## 4) Standards

### Code style & structure

- Follow **JavaScript conventions** (lower camelCase for variables/functions, PascalCase for classes). Follow **LESS conventions** (kebab-case filenames, variables/mixins in shared files).
- Keep modules focused (one purpose per file).
- Import via Vite aliases only. Aliases are defined in [`vite.config.js`](vite.config.js).
- Prefer clear, explicit names over comments. Use whole words.
- Use DEBUG‑gated logging. Example:
  ```js
  DEBUG && LOG.info("Mounted FirearmSheet", [__FILE__, __LINE__], { actorId });
  ```

### Foundry V2

- Sheets extend `DocumentSheetV2` / `ApplicationV2`.
- **Data models are registration only**: define schema, defaults, and constraints. Keep behavior in services.
- Avoid prototype patches; add helpers/utilities in modules instead.

### Config

Treat `sr3e.*` as the **baseline reference** used across UI and logic. Use these keys directly; add new options **in config first**, then add matching i18n keys. Changing existing keys without updating all call sites will break dropdowns and labels across sheets.

```js
sr3e.damageType = { l: "sr3e.damageType.l", m: "sr3e.damageType.m", s: "sr3e.damageType.s", d: "sr3e.damageType.d", lStun: "sr3e.damageType.lStun", mStun: "sr3e.damageType.mStun", sStun: "sr3e.damageType.sStun", dStun: "sr3e.damageType.dStun" };

sr3e.weaponMode = { manual: "sr3e.weaponMode.manual", semiauto: "sr3e.weaponMode.semiauto", burst: "sr3e.weaponMode.burst", fullauto: "sr3e.weaponMode.fullauto", blade: "sr3e.weaponMode.blade", explosive: "sr3e.weaponMode.explosive", energy: "sr3e.weaponMode.energy", blunt: "sr3e.weaponMode.blunt" };
```

### Procedures

Procedures govern **who rolls what, when, and how results are posted to chat**. The system has **state‑machine‑like properties** (discrete steps, explicit transitions, a lock policy), but full details live in the developer docs. This page stays high‑level.

**Add a procedure**

- Subclass `AbstractProcedure`.
- Register it in `sr3e.ts`.
- Respect `ProcedureLock`.

See the upcoming **Procedures** chapter in the docs for end‑to‑end flow and examples.

### Gadgets & Effects

**Active Effects**

- Express any **temporary or toggleable** gameplay state as an `ActiveEffect` (buffs, penalties, locks, transient config).
- Keep persistent identity in models; keep variability in effects.
- Expose the **Active Effect Viewer** on relevant Actor/Item sheets and apps so users can inspect, enable, or disable the current stack.

**Gadgets**

- Gadgets are **specialized ActiveEffects** used for add‑ons and attachments (e.g., a weapon modification providing a stateful bonus).
- Canonical flags: `flags.sr3e.gadget.{origin,gadgetType,commodity,isEnabled}`.
- Toggle gadgets on/off to apply or suspend their effect. Gadgets are not items and carry only flags + effect payload.
- Editors: `GadgetEditorSheet`, `WeaponModApp`.

---

## 5) i18n

- Pass all UI strings through `localize(config.sr3e.*)`.
- Define keys in `lang/en.json`.
- Use `ui.notifications.*(localize(key))` for user messages.

---

## 6) Linting & formatting

- ESLint + Svelte plugin.
- Prettier in CI.

---

## 7) Tests

- Optional. Add unit tests **where it helps** (math, pure services, parsers, table lookups).
- For UI/Foundry-bound flows, include a short **manual verification** list in the PR (e.g., create actor → equip weapon → run opposed roll → check Active Effects → chat post).

---

## 8) Git & Pull Requests

**Flow:** Branch → Pull Request → main

A **Pull Request (PR)** is a request to merge your branch into `main`. It’s where code is reviewed and CI runs.

### Option A: GitHub Desktop (GUI)

1. **Open GitHub Desktop** and select the `sr3e` repository (clone it if needed).
2. **Create a branch**: *Branch → New Branch…* → name it like `feature/short-branch-name` → *Create Branch*.
3. **Make changes** in your editor. Return to GitHub Desktop.
4. **Commit with Conventional Commits**:
   - Summary examples:
     - `feat(weapons): add smartlink gadget toggle (SR3 p. 115)`
     - `fix(procedures): prevent double-advance on resolve`
     - `docs(readme): add manifest URL`
   - If breaking: `feat!(procedures): unify attack/defense flow` and add a description in the extended area beginning with `BREAKING CHANGE:`.
   - Click **Commit to feature/…**.
5. **Push**: click **Push origin**.
6. **Open a Pull Request**: click **Create Pull Request** in Desktop. On GitHub, fill in:
   - What changed and why (include **SR3 page references**).
   - **Manual verification steps** you followed (e.g., create actor → equip weapon → run opposed roll → check Active Effects → chat post).
   - Add screenshots/GIFs for UI changes.
7. **Request review** (assign a reviewer). Address comments by committing more changes; push to update the PR. A maintainer merges when approved.

### Option B: Command line (Git)

**1) Create a branch**

```bash
git checkout -b feature/short-branch-name
```

**2) Commit using Conventional Commits**

- `feat(scope): summary` — new functionality (bumps **minor**)
- `fix(scope): summary` — bug fix (bumps **patch**)
- `docs|refactor|perf|test|build|ci|chore(scope): summary`

Examples:

```bash
git add .
git commit -m "feat(weapons): add smartlink gadget toggle (SR3 p. 115)"
# Breaking change:
# git commit -m "feat!(procedures): unify attack/defense flow" -m "BREAKING CHANGE: replaces legacy roll hooks"
```

**3) Push and open a Pull Request**

```bash
git push -u origin feature/short-branch-name
```

Open a Pull Request on GitHub from your branch → `main`. Describe changes, include SR3 citations, and paste manual verification steps.

### Pull Request Checklist

-

## 9) Releases

- Tags: `vX.Y.Z`.
- Changelog maintained.
- Uses **standard-version**: commit types drive CHANGELOG and version bumps.
  - `feat:` → minor, `fix:` → patch, `feat!` or `BREAKING CHANGE:` → major.
- Release flows: `npm run release:alpha|beta|release`.

---

## 10) Migrations (only in beta & release)

- Add version-gated migration if schema changes.
- Keep them idempotent.

---

## 11) Security

- ¯\\\_(ツ)\_/¯

---

## 12) Done

- V2 patterns in use
- Models are state only
- Logging behind DEBUG
- i18n complete
- Critical logic is simple or tested where applicable
- Docs updated

---

## 13) Citations

- Reference page numbers in commits/PRs.
- Do not copy rules text, use page citations instead.
