# Chat / Socket Challenge–Response Flows

## What this is

Started as a routing bug fix and grew into completing the challenge-response pipeline properly. Combat's opposed-roll flow (`contestCoordinator.ts` + `defenderFlow.ts` + `contestedFlow.ts`) already existed but had three cross-client routing bugs (M1–M4, all fixed and manually verified). What's left (M5–M6) is the interactive part the user explicitly wants: the joint contest-outcome message should let *both* sides buy successes / reroll before the flow continues, not just present a fait accompli — this is core to the game's design philosophy of forcing every contested action through discrete, player-agency-driven chat steps (roll → resist → joint result → drain), never silently automating a resolution.

### M1–M4 summary (done)

- **M1/M2** — `sendDefenderPrompt` was self-whispering to the GM instead of resolving the actual controlling player via `resolveControllingUser` (mirroring the already-correct `resistanceFlow.ts` pattern).
- **M3** — the defender's roll response called `deliverResponse` directly (per-client in-memory state) instead of relaying over the socket; added `submitContestResponse` which does both, fixed in `defenseSetups.ts` (×3), `AttributeCard.svelte`, `SkillCard.svelte`.
- **M4** — clicking a responder button threw a Foundry permission error because `ChatMessage` has no configurable per-document `ownership` (confirmed via `foundry-vtt-types`) — only the author or a GM can update a message. Fixed by relaying the "mark consumed" write through the GM's client via a new `consumeMessage` socket payload.

All four confirmed working end-to-end on a live two-client (GM + player) test: attack roll → resist prompt on the player's own client → joint outcome message → Drain prompt.

## MoSCoW

### MUST

**M1 — Fix `sendDefenderPrompt` whisper target**

In `module/services/combat/orchestration/defenderFlow.ts`:
- Replace the self-whisper (`whisper: [game.user.id]`) with `resolveControllingUser(defender)` (imported from `../engine/contestCoordinator`, mirroring `resistanceFlow.ts`'s existing usage) and whisper to that resolved user's id instead.
- `resolveControllingUser` already handles the full precedence chain: assigned character → owning non-GM user → fallback to an active GM. No public-chat branch — always whisper, including the GM-fallback case (GM-vs-GM contests, e.g. NPC vs NPC, stay whispered to the GM rather than posting to public chat).
- Keep the existing `currentUserIsGM()` gate on `sendDefenderPrompt` itself — it exists to ensure exactly one client (the GM's) actually calls `ChatMessage.create`, since `handleContestStub` runs on every client via the socket broadcast. Only the whisper *recipient* was wrong, not the single-sender design.

**M2 — Regression test**

Add a test to `defenderFlow.test.ts` (or a new focused test file) asserting `sendDefenderPrompt` whispers to the id returned by `resolveControllingUser`, not to `game.user.id`, using a mock where the two differ (GM triggering the roll, a distinct player owns the target actor).

**M3 — Fix defender response never reaching the initiator's client**

A second, more severe routing gap found during manual cross-client testing of M1/M2: the defender's roll submission (`commitFn` in `dodge`/`melee-defense`/`spell-resistance` setups, plus the "accept" response path in `AttributeCard.svelte`/`SkillCard.svelte`) called `deliverResponse(contestId, roll)` directly — a synchronous, in-memory, per-client function call. `activeContests`/`pendingResponses` are module-level state scoped to *each individual client*. The initiator's `waitForResponse(contestId)` promise (created in `contestedFlow.ts`, running on the attacker's client) only ever resolves if `deliverResponse` is called *on that same client*. Across two separate browser clients, the defender's roll silently vanished into their own client's empty `pendingResponses` map — no error, no joint outcome message, nothing. `startContest` already had the correct dual pattern (local write + socket emit); the response side never got it.

Fix: added `submitContestResponse(contestId, roll)` to `contestCoordinator.ts`, which calls `deliverResponse` locally (covers same-client/solo-GM testing) *and* emits `{ type: "contestResponse", contestId, roll }` over `game.socket` (covers the real cross-client case — the initiator's client receives it via the existing `registerSocketHandlers` listener, which already correctly called `deliverResponse` on receipt). All five call sites (`defenseSetups.ts` ×3, `AttributeCard.svelte`, `SkillCard.svelte`) now call `submitContestResponse` instead of `deliverResponse` directly.

**M4 — Fix "lacks permission to update ChatMessage" on the defending player's client**

A third bug, found on the same manual retest: clicking a responder button (e.g. "Resist Spell") on the whispered prompt threw `User lacks permission to update ChatMessage`. Cause: `persistConsumedToMessage`/the resistance click handler (`module/foundry/hooks/chatMessageHTML.ts`) call `message.setFlag(...)`, which is a document update. The prompt message's `author` is whoever's client called `ChatMessage.create` — always the GM (`sendDefenderPrompt`/`promptResistance` are both gated to run only on a GM client).

First attempted fix — passing `ownership: { default: 0, [controller.id]: 3 }` on `ChatMessage.create` — **did not work**: `ChatMessage`'s document schema has no `ownership` field at all (confirmed against `foundry-vtt-types`; `BaseChatMessage` overrides `testUserPermission` with hardcoded author-or-GM logic instead). There is no document-data mechanism to grant a third party update rights on someone else's chat message; that override was reverted as dead code.

Actual fix: relay the "mark consumed" write through the GM's client via socket, mirroring the M3 pattern. Added a `consumeMessage` socket payload (`{ type: "consumeMessage", messageId }`) handled in `socketHandlers.ts` — only a GM-client receiver calls `game.messages.get(messageId)?.setFlag(...)`. `chatMessageHTML.ts`'s `requestConsumeMessage` helper checks `game.user.isGM` locally: GM clients write directly (no round-trip needed, matches prior behavior for solo-GM testing), non-GM clients emit the socket message instead of attempting the write themselves.

**M5 — Interactive joint contest message: both sides can buy/reroll (done)**

`renderContestOutcome`/`renderRollSummary` render both the initiator's and target's dice in one shared, public message. Both sides' dice are now clickable, reusing the karma-pool reroll/buy mechanics extracted into a shared `karmaRerollCore.ts` (used by both the original single-roll reroll and the new contest path — DRY, no duplicated karma-spend logic):

- New `ContestOutcomeFlag` (`{ weaponName, exportCtx, initiator: ContestSideData, target: ContestSideData }`) attached to the joint message's flags, one `ContestSideData` per side.
- **Authorization**: `canActOnContestSide` — a die only responds to clicks from that side's own controlling user (`resolveControllingUser`) or a GM. Enforced in `contestRerollHandler.ts`, not just at the UI layer.
- **Free-for-all, no turn order**: either side can buy/reroll any number of times, bounded only by their own Karma Pool balance.
- **Live recompute**: every buy/reroll recomputes `computeNetSuccesses`/`spellDamageStaging` and rewrites the *entire* joint message via the M4-derived generic `messageRelay.ts` (`requestMessageUpdate`/`updateMessageAsGM`), generalized from the one-off `consumeMessage` payload into a reusable `updateChatMessage` socket payload — needed because the joint message is authored by whoever initiated the roll (usually the attacker), so the *defending* side hitting `message.update()` on their own dice hits the exact same author-only permission wall M4 fixed, just from the other side.

Three bugs found and fixed during manual two-client retesting, all confirmed working after:
1. **Stale dice / dead updates** — the message was created with a pre-generated `_id` guessed via `foundry.utils.randomID()` and baked into its own flag data, assuming `ChatMessage.create` would honor an explicit `_id`. It didn't reliably do so; every subsequent update looked up a message ID that didn't match the real document and silently no-op'd. Fixed by removing the guess entirely — flags are set directly in the single `create()` call, and `messageId` is derived from the DOM (`.chat-message[data-message-id]`) at click time instead, matching the existing `persistConsumedToMessage` pattern.
2. **Bought successes showed the raw TN number instead of a coin icon** — `rerenderContestMessage` reconstructed a synthetic `RollSnapshot` from stored `DieEntry[]` (needed for `computeNetSuccesses`) and then rendered through `renderRollSummary` → `extractDieResults`, which only preserves `result`/`exploded`, dropping `bought`. Fixed by adding optional `initiatorResults`/`targetResults: DieEntry[]` to `ContestRenderCtx`, rendering directly from the original entries (with `bought` intact) instead of round-tripping through the lossy synthetic snapshot.
3. **No feedback while a reroll/buy request is in flight** — the round trip has visible latency (GM relay, dice3d animation), and with no pending indicator a player could rack up multiple costly requests before the first one lands. Fixed with `diePendingState.ts`'s `withDiePending`, applied to both the single-roll and contest reroll paths: dice for that roll/side dim and pulse (`sr3e-die-pending`, pointer-events disabled) from click until the request settles.

**M6 — "Done" gates progression to the next step**

Add a Done button per side on the joint message (same authorization rule as M5: only that side's controller or GM can click their own Done). Track `initiatorDone`/`targetDone` on the message's flags.

- While either side is not done: dice remain clickable, Done buttons remain live.
- Once **both** are done: disable all dice and both Done buttons (reuse the existing `consumeCard`/`disableAllButtons` pattern), and unblock whatever step was waiting on contest resolution.
- Today, `executeProcedure` opens the Drain composer immediately after `executeContestedFlow` returns, with no gate. This needs a new async wait — analogous to `waitForResponse` — that `executeContestedFlow` blocks on after posting the outcome message, resolving only when both Done flags are set. Drain's own math is independent of the contest (confirmed: `buildSpellDrainSetup` only reads `spell.force`/`drain` config, never `netSuccesses`), so this is purely a UX pacing gate, not a data dependency — but it's an explicit, deliberate requirement: never let the next dialog appear while the current contest is still being actively negotiated.
- Both-side Done clicks need the same socket relay treatment as M4 (`consumeMessage`) — a non-GM client's Done click still needs its flag write relayed through the GM, and a new "contest fully resolved" signal needs to reach whichever client is waiting inside `executeContestedFlow` (which may be a different client than either participant, e.g. if a third client is GM and both attacker+defender are players — though in the common case the GM *is* one of the two contest participants).

**M7 — Drain outcome message states the exact damage applied (done)**

`postDrainOutcome` said e.g. "Moderate stun" with no box count — unclear whether/how much damage actually landed. Now includes `"${boxes} box(es) of ${track} damage applied."` when `boxes > 0`, threaded through from `applyDrain`.

**M8 — Drain is fully interactive: reroll/buy live-recompute damage, clear success/failure messaging (done)**

Found during the same manual retest: `executeAdvancedFlow` (which Drain uses) called `setup.commitFn` — for Drain, `applyDrain`, which computed damage from the roll's state *at that instant* and immediately applied it to the actor's health track and posted a static outcome message — *before* posting a second, separate self-published roll-summary message that had working reroll/buy dice. Rerolling that second message's dice did nothing: `applyDrain` already ran and never re-fired. A live test rerolled the Drain die four times reaching more successes with zero change to the already-applied damage.

Went with the live-recompute approach (not a Done-gate like M6) since Drain has no downstream step waiting on it and only one actor is involved — no coordination needed, just idempotent recomputation on every change:

- **Baseline capture**: `captureHealthBaseline(actor)` snapshots stun/physical/overflow *before* any drain is applied. Every subsequent recompute (initial roll, every later reroll/buy) calls `applyDamageBoxesFromBaseline(actor, baseline, track, totalBoxes)` — which sets health as if `totalBoxes` were applied fresh on top of the baseline, not incrementally on top of the actor's current value. This makes repeated recomputation idempotent: since successes can only go up as the caster rerolls/buys (reroll only touches failures, buy only adds a success) and damage is non-increasing in successes, a later recompute can *reduce* total boxes — recomputing from a fixed baseline correctly gives health back instead of double-applying or drifting. Extracted alongside the pre-existing overflow-cascade logic (previously private to `resistanceFlow.ts`) into a shared `module/services/combat/damageApplication.ts`; `resistanceFlow.ts` refactored to use it too (`applyDamageBoxes`, unchanged incremental behavior, still used for the one-shot contest resistance case).
- **One unified interactive message** replaces the old pair (static outcome + disconnected reroll summary): `applyDrain` now builds a `DrainOutcomeFlag` (actor, TN, base damage step, track, baseline, roll results, reroll count, frozen magic-loss result) and posts a single message carrying it. Drain's `selfPublish` set to `false` so `executeAdvancedFlow` no longer posts its own redundant summary.
- **Reroll/buy**: `drainRerollHandler.ts` — same shape as `contestRerollHandler.ts` (`canActOnDrain` authorization via `resolveControllingUser`/GM, `karmaRerollCore.ts` reuse, `messageRelay.ts` GM-relay persistence, `withDiePending` click feedback), but single-sided instead of per-side.
- **Clearer message text**: "Your drain roll succeeded — you take no damage!" when fully staged off, otherwise "Your drain roll failed — you take N box(es) of {track} damage." (`renderDrainOutcome.ts`), plus a "Staged to: {level}" line and the frozen magic-loss summary when relevant. Magic loss itself is deliberately *not* recomputed on reroll — it's a one-time 2D6 check against the initial Deadly-physical trigger; re-triggering it on every reroll would be its own can of worms and wasn't asked for.
- Extracted `DAMAGE_STEP_LABELS` (l/m/s/d → Light/Moderate/Serious/Deadly) to `damageMath.ts`, deduplicating a copy that had crept into both `spellCombat.ts` and the old `spellDrain.ts`.

**M9 — Concurrent reroll/buy writes could clobber each other (done, GH #197)**

Found on manual retest: the GM could reroll their own contest side only once, and couldn't buy successes for their own side at all — but could buy for the defender's side, and the defender could reroll their own side repeatedly without issue.

Root cause: `applyAndPersist` (both `contestRerollHandler.ts` and `drainRerollHandler.ts`) computed the *entire* new flag (both contest sides, for contests) from a client-side snapshot captured when the message last rendered, then wrote that whole snapshot. Since the GM's client is the sole relay for every non-GM write (M4 — only the author or a GM can update a `ChatMessage`), a GM action and a relayed defender action landing close together race: whichever `.update()` resolves last silently reverts the other side's just-written progress back to its stale copy of it. Compounding this, `messageRelay.ts`'s `updateMessageAsGM`/`requestMessageUpdate` were fire-and-forget — never awaited the actual document write — which also broke `withDiePending`'s pending-click lock (released on dispatch, not completion) and widened the race window.

Fix, in `messageRelay.ts`:
- `updateMessageAsGM`/`requestMessageUpdate` are now properly async and await the real write.
- New `mergeMessageFlagAsGM<T>(messageId, key, merge)`: reads the message's **current** persisted flag (not a snapshot), applies `merge`, writes — and every write for a given `messageId` is chained through a per-message queue (`serializeWrite`) so two near-simultaneous writes can never interleave; the second always sees the first's fully-applied result.
- `contestRerollHandler.ts`/`drainRerollHandler.ts` no longer ship a full computed flag. They ship a small delta (`{ side, results, rerollCount }` for contests; `{ results, rerollCount }` for Drain) via `applyContestSideDelta`/`applyDrainDelta`, which merge that delta into whatever the message's flag *actually* is at write time.

M9 turned out to be a red herring for the actual bug being retested at the time — see M10.

**M10 — Die clicks silently did nothing for the GM's own side: not a logic bug, a DOM-attachment bug (done)**

M9's fix, verified correct by unit test for the exact reported scenario (GM buying/rerolling on their own side, natural success present), still didn't resolve the live symptom: clicking produced *zero* visible effect for the GM — not even `withDiePending`'s pending-pulse animation, which fires synchronously before any network round trip. That ruled out both the M9 race condition and a stale-build cache (confirmed by a full game restart, not just a client reload). Zero animation on click means the listener isn't firing at all — a DOM-attachment problem, not something a unit test exercising the handler functions directly could ever catch.

Root cause: `.sr3e-die` click handling was wired via **per-element listeners attached inside the `renderChatMessageHTML` hook callback** (`handleChatMessageHTML`). But `renderChatMessageHTML` does not fire for every DOM instance a message appears in — the codebase already had a comment acknowledging this for a different element (`[data-responder]` buttons): *"Foundry's whisper notification popups... don't fire renderChatMessageHTML."* If the GM has roll/chat notification popups enabled (common for GMs watching activity without staring at the log), the dice they click there are a separate DOM copy that never received listeners — while the player, interacting via the main chat log, sees a properly-wired copy of the identical HTML. Confirmed via DOM inspection: the markup itself (`data-side="initiator"`, `.sr3e-die` classes) was completely correct on both sides — this was purely an attachment gap.

Fix: moved all interactive chat-message wiring — die clicks (reroll/buy for single rolls, contests, and Drain) and the resistance-prompt button — onto **document-level click delegation**, the same pattern `[data-responder]` already used. `registerDieClickDelegation()`/`registerResistanceButtonDelegation()` listen on `document` and, at click time, resolve the message via `game.messages.get(messageId)` to read its **current** flags fresh — not a closure captured whenever-if-ever `renderChatMessageHTML` last fired for that particular DOM copy. This fixes the popup case and, as a side effect, is also immune to any residual stale-closure concern. `handleChatMessageHTML` (the render hook callback) now does nothing but the `consumed`-flag auto-disable, which is a pure re-render concern, not an attachment one.

A regression test (`chatMessageHTML.test.ts`) deliberately never invokes the render hook at all — only the delegated click path — reproducing the popup scenario directly and proving the fix doesn't depend on `renderChatMessageHTML` having fired.

**M11 — Karma decline was completely silent (done)**

M10 still didn't resolve the live symptom — turned out there was no bug left to find. The storyteller's character had 0 Karma Pool. `karmaPoolReroll`/`karmaBuySuccess` correctly decline when balance is below cost, and since both reroll and buy share that same gate, both failed identically for that one character while the player's (funded) character worked fine. The actual defect was that the decline was entirely silent — no chat message, no toast, indistinguishable from a broken feature, and the direct cause of the M9/M10 detour (both real fixes, neither the cause of *this* symptom).

Fixed: `karmaPoolReroll`/`karmaBuySuccess` now return a discriminated result (`{ ok: true, results }` or `{ ok: false, reason: "insufficient-karma" | "no-failures" | "no-natural-success" }`) instead of a bare `DieEntry[] | null`. Every caller — single-roll reroll, contest reroll/buy, Drain reroll/buy — shows a `ui.notifications.warn` toast with the specific reason on decline via new `notifyKarmaSpendDeclined`.

**M12 — Drain health not reduced when a reroll stages damage back down (done)**

Reported separately once M5/M11 confirmed the joint contest message fully working: on the Drain message, rerolling to reach 2 successes correctly restaged the message text from Serious to Moderate, but the actor's health boxes stayed at the original (higher) Serious value — confirmed by the user as a genuine data problem, not a UI-refresh gap (reopening the sheet still showed the stale value, and there were no console errors).

A direct integration test of the exact scenario (fresh actor, 6 boxes already applied, reroll improving to 2 successes → should reduce to 3) passed against the existing code — the computation and `.update()` call were provably correct in isolation. First fix attempt: extracted the per-message write queue (previously private to `messageRelay.ts`) into a shared `module/services/writeQueue.ts` (`serializeByKey`) and serialized actor health writes through it too, on the theory that overlapping reroll clicks' independently-timed `SR3ERoll` evaluations could let an older write land after a newer one. **This did not fix the live symptom** — user retested, same result.

Root-caused by adding temporary diagnostic logging directly to the live code path (not just tests) and asking the user to capture actual console output from a live retest. The log proved: `actor.system.health.stun.value` reads back as `3` *immediately* after the health `.update()` call resolves, but a follow-up raw console check (`actor.system.health.stun.value`) after the interaction settled showed `6` — the write lands correctly and is then silently reverted. The actual cause: `handleDrainReroll`/`handleDrainBuy` issued **two separate sequential `actor.update()` calls** on the same document — one for the Karma Pool deduction (inside `karmaPoolReroll`/`karmaBuySuccess`), then a second for the health cascade — and two near-simultaneous writes to the same Foundry document is a genuine lost-update hazard, not a hypothetical one.

Fix: `karmaPoolReroll`/`karmaBuySuccess` no longer call `actor.update()` themselves — they return the computed field-update payload (`karmaUpdate`) as data, and the caller decides how to write it. `damageApplication.ts` gained a pure `computeDamageBoxesFromBaseline` (data in, data out, no write) alongside the existing self-contained `applyDamageBoxesFromBaseline`. `drainRerollHandler.ts`'s new `applyKarmaAndHealthForDelta` merges the karma and health field-updates into a **single atomic `actor.update()` call**, serialized per actor. `rerollHandler.ts` and `contestRerollHandler.ts` (which only ever needed the karma write) now apply `result.karmaUpdate` themselves via the same serialized-write helper — no behavior change for them beyond consistency.

This lesson generalizes: two sequential `actor.update()` calls on the same document, even both correctly awaited in application code, can lose one write to Foundry's own update handling. Any future flow that needs to change more than one field on the same actor in one user action should compute a single merged payload and issue one `.update()` call, not multiple.

Also found and deliberately left alone: `Health.svelte` has an effect that forces both stun and physical to 10 whenever `overflow > 0` — potentially dangerous (would fight any health reduction attempt while bleeding out) but confirmed not the cause here (this actor's overflow was 0), and possibly intentional design (once bleeding out, tracks read as maxed). Not touched without confirming intent.

**Update: the atomic-write fix still did not resolve the live symptom.** User retested after M12 and reported the same result. Rather than continue chasing the exact mechanism live-testing couldn't fully pin down, the user proposed a structurally different fix — see M13.

**M13 — Redesign: apply Drain health once, on explicit Done, not on every recompute (done)**

Strategy change from the user: stop trying to make "apply worst case immediately, reimburse on every reroll/buy" race-proof, and instead never apply health speculatively at all. Add a Done button to the Drain message; health is applied exactly once, when the player (or GM) explicitly commits.

This removes the entire bug class by construction — there is only ever one `actor.update()` for health per Drain roll, so there's nothing to race against or revert. It also matches the project's existing design philosophy already applied to contests: every contested/resisted action proceeds through discrete, player-agency-driven chat steps rather than eager automation (M6, still unimplemented, was already planned to add the same Done-button gating to the joint contest message).

Changes:
- `spellDrain.ts`'s `applyDrain` no longer applies health at roll time — it only captures the baseline and posts the interactive message. (Magic loss checks for Deadly Physical drain still resolve immediately, since that's a separate roll, not staged damage.)
- `drainRerollHandler.ts`: `handleDrainReroll`/`handleDrainBuy` now only spend and apply Karma Pool — health is untouched. New `handleDrainDone(flag)` applies health from baseline using whatever results are currently staged, exactly once.
- `renderDrainOutcome.ts`: added a "Done — Apply Damage" button (`data-drain-done`); result line reworded "will take" instead of "take" to signal the damage is pending until confirmed.
- `chatMessageHTML.ts`: new `registerDrainDoneDelegation`, following the existing consume-card pattern (disable buttons, persist `consumed` flag, invoke handler). Die-click delegation now also bails out once `flags.sr3e.consumed` is set — dice are `<span>`s, not `<button>`s, so the generic button-disable didn't previously stop further reroll/buy clicks after a round closed.
- `chat.scss`: dims and disables pointer events on dice once the message is marked consumed (`[data-sr3e-consumed] .sr3e-die`), since CSS can't rely on the generic disabled-button styling for non-button elements.

**Update: M13 still did not resolve the symptom.** User reported the Done button visibly consumed the card (greyed out, correct animation) but the character sheet's health track never updated.

**M14 — Root cause: `StoreManager` matched Foundry hooks by `.uuid`, which can differ from the document a sheet subscribed with (done)**

This turned out to be a pre-existing bug in `StoreManager.svelte.ts`, completely unrelated to the Drain feature — the Drain investigation just happened to be the first place someone checked the character sheet's live display carefully enough to notice.

Diagnosis, following a strict evidence chain rather than further guessing:
1. Diagnostic logging inside `handleDrainDone` proved the write succeeds — `actor.system.health.stun.value` reads correctly *immediately* after `actor.update()` resolves.
2. A completely independent, fresh `game.actors.get(id).system.health.stun.value` console check (unrelated to any of this session's code) also confirmed the correct value — the data genuinely persists. This ruled out every "the write itself is wrong/reverted" theory from M12.
3. A raw `Hooks.on("updateActor", ...)` registered directly in the console (bypassing all of this codebase) confirmed Foundry's own hook *does* fire, with the correct changed data — for actors whose health actually changed. It also revealed the earlier "still 6" symptom (M12) was caused by the character's stun already sitting at 6 from an untouched-between-tests session — Foundry's `Document.update()` diffs old vs. new and skips firing hooks entirely when nothing actually changes, so repeatedly writing the same value looked like nothing was happening.
4. With health reset to a genuinely different baseline (0), a fresh Drain roll's `updateActor` hook fired correctly (confirmed via a temporary watcher) — but the sheet *still* didn't update. This eliminated the write/data layer entirely; the bug had to be in how the sheet's reactive store consumes the hook.
5. Temporary logging inside `StoreManager.#handleDocumentUpdate` (the internal listener that pushes hook data into Svelte stores) exposed the actual defect: the `docId` captured when a sheet subscribed was `Scene.<sceneId>.Token.<tokenId>.Actor.<actorId>` — a token-scoped UUID, because the sheet had been opened via a token on the canvas — while Foundry's `updateActor`/`actorSystemRecalculated` hooks fire with the canonical actor document, whose `.uuid` is the plain `Actor.<actorId>` form. `#registerHooks`'s guard clause (`if (doc.uuid !== docId) return;`) compared these directly and silently rejected every external update, no matter how many times the underlying document correctly changed.

Fix: match hook events by `.id` instead of `.uuid` (`doc.id !== document.id`). `.id` is the document's own `_id`, stable regardless of whether the actor is accessed via a token or `game.actors.get()`; `.uuid` is not. The `.uuid`-keyed maps used for store lookup/registration are unchanged — this only affects the *hook-matching guard*, which was the actual defect.

This is architecturally significant: it means **any** actor sheet opened via a token — not just Drain, not just health — could have silently stopped receiving live updates from external writes (chat-message interactions, other players' actions, NPC automation) for as long as that sheet stayed open, with no error and no visible symptom other than "the sheet doesn't refresh." Health.svelte's `stun`/`physical`/`overflow`/`penalty` stores, and every other `GetRWStore`/`GetROStore` consumer across every actor sheet, were all exposed to this. It went unnoticed until now because most flows either don't need the *external* update to be visible immediately, or the user hadn't specifically compared "raw persisted value" against "sheet display" before.

Added `module/utilities/StoreManager.test.ts` — this file did not previously exist, meaning this entire bidirectional Foundry↔Svelte sync mechanism had zero test coverage. The regression test was verified to fail against the pre-fix code (`.uuid` matching) and pass against the fix (`.id` matching).

**Update: M14's `.id`-matching fix still did not resolve the symptom** — full Foundry restart, fresh Drain roll, correct computation confirmed via logging (`boxes: 6`), yet the store still updated to `0`.

**M15 — Second root cause in the same mechanism: the sheet's subscribed document reference can be a genuinely separate, stale object instance (done)**

With `.id` matching confirmed working (logged: hook fired, matched, `#handleDocumentUpdate` ran, found the correct store key) but the store still set to `0`, the remaining defect had to be in the *value read itself*. `#handleDocumentUpdate(document, changes)` read values off `document` — the reference captured once at `Subscribe()` time — rather than the fresh document Foundry's hook call actually receives. Live testing showed these can be genuinely different object instances representing the same logical actor: a sheet opened via a token gets one instance, while a backend write through `game.actors.get(id).update()` (confirmed correct via direct console checks) mutates a different one. `.id` matches because both describe the same actor, but the subscribed instance's own `.system` data never updates, so every read through it returns pre-update values indefinitely — explaining a symptom that looked identical to "nothing was written" even though the write demonstrably succeeded and persisted.

Fix: `#handleDocumentUpdate` now takes an explicit `freshDoc` parameter — the document instance the hook call itself provides — and reads all values from that, while still using the originally-subscribed `document`'s `.uuid` for store-key matching (which must stay stable, since that's what `GetRWStore` registered keys against). `Hooks.on(updateEvent, ...)` / `Hooks.on("actorSystemRecalculated", ...)` now pass their own `doc` parameter through as `freshDoc`.

Root-caused via the same evidence-chain discipline as M14: rather than trust that the `.id` fix was sufficient, added logging at each layer (`handleDrainDone`'s own computation, `StoreManager`'s hook match, `#handleDocumentUpdate`'s store-set call) and let a live retest show exactly where the correct computed value (`boxes: 6`) diverged from the store's actual result (`0`) — the divergence was entirely inside `StoreManager`, confirming the Drain code itself was correct all along.

Added a second regression test to `StoreManager.test.ts`, verified to fail when reads are pointed back at the stale `document` reference and pass with `freshDoc`.

### Explicitly out of scope

- No new opposed-test types (Perception vs. Stealth, social tests, etc.) — the existing `contestCoordinator`/`promptResistance` machinery already generalizes to any opposed roll; this item is purely the one routing defect.
- No public/whispered branching — confirmed with the user: always whisper to the resolved controller, never post the defender prompt publicly, even when GM controls both sides of the contest.
- No reroll/buy cap beyond each side's own Karma Pool balance — no artificial round limit.
- No turn order enforcement between the two sides during buying.

---

## Affected files

| File | Change |
|---|---|
| `module/services/combat/orchestration/defenderFlow.ts` | M1 — fix whisper target in `sendDefenderPrompt` |
| `module/services/combat/orchestration/defenderFlow.test.ts` | M2 — regression test |
| `module/services/combat/engine/contestCoordinator.ts` | M3 — new `submitContestResponse` helper |
| `module/services/combat/engine/contestCoordinator.test.ts` | M3 — regression tests |
| `module/services/combat/procedures/defenseSetups.ts` | M3 — dodge/melee-defense/spell-resistance `commitFn`s use `submitContestResponse` |
| `module/ui/actors/actor-components/AttributeCard.svelte` | M3 — "accept" response path uses `submitContestResponse` |
| `module/ui/actors/actor-components/skills/SkillCard.svelte` | M3 — "accept" response path uses `submitContestResponse` |
| `module/services/combat/orchestration/resistanceFlow.test.ts` | M4 — regression test |
| `module/foundry/hooks/chatMessageHTML.ts` | M4 — `requestConsumeMessage` helper; GM writes directly, others relay via socket |
| `module/foundry/hooks/chatMessageHTML.test.ts` | M4 — regression tests |
| `module/services/combat/orchestration/socketHandlers.ts` | M4 — new `consumeMessage` socket payload + handler |
| `module/services/combat/orchestration/socketHandlers.test.ts` | M4 — regression tests |

No new item types, no schema changes. M5 generalized the `consumeMessage` socket payload into `updateChatMessage` (see below) rather than adding a parallel one-off.

**M5/M7 affected files (done):**

| File | Change |
|---|---|
| `module/services/combat/orchestration/messageRelay.ts` | M5 — new, generic `requestMessageUpdate`/`updateMessageAsGM`; supersedes M4's one-off `consumeMessage` |
| `module/services/combat/orchestration/socketHandlers.ts` | M5 — `consumeMessage` payload replaced by generic `updateChatMessage` |
| `module/services/combat/orchestration/karmaRerollCore.ts` | M5 — new, pure karma reroll/buy logic extracted for reuse |
| `module/services/combat/orchestration/rerollHandler.ts` | M5 — refactored to delegate to `karmaRerollCore.ts` |
| `module/services/combat/orchestration/contestRerollHandler.ts` | M5 — new, per-side authorization + reroll/buy + rerender for the joint message |
| `module/ui/combat/chat/renderContestOutcome.ts` | M5 — `data-side` wrappers; optional `initiatorResults`/`targetResults` to preserve `bought` on rerender |
| `module/services/combat/orchestration/contestedFlow.ts` | M5 — attaches `ContestOutcomeFlag` to the joint message's flags |
| `module/foundry/hooks/chatMessageHTML.ts` | M5 — per-side click wiring + authorization; pending-state wrapping |
| `module/foundry/hooks/diePendingState.ts` | M5 — new, `withDiePending` click-feedback helper |
| `styles/chat.scss` | M5 — `.sr3e-die-pending` pulse animation |
| `module/services/spells/spellDrain.ts` | M7 — `postDrainOutcome` states exact box count + track |

**M8 affected files (done):**

| File | Change |
|---|---|
| `module/services/combat/damageApplication.ts` | M8 — new, shared overflow-cascade helpers; `applyDamageBoxesFromBaseline` for idempotent recompute |
| `module/services/combat/damageApplication.test.ts` | M8 — new |
| `module/services/combat/orchestration/resistanceFlow.ts` | M8 — refactored to use the shared module (no behavior change) |
| `module/services/combat/damageMath.ts` | M8 — new `DAMAGE_STEP_LABELS` export, deduplicating two copies |
| `module/services/spells/spellCombat.ts` | M8 — uses `DAMAGE_STEP_LABELS` instead of its own copy |
| `module/services/spells/spellDrain.ts` | M8 — rewritten: baseline capture, single unified interactive message, `selfPublish: false` |
| `module/services/spells/spellDrain.test.ts` | M8 — updated for new health-update shape + message content |
| `module/services/spells/drainRerollHandler.ts` | M8 — new, per-actor authorization + reroll/buy + baseline recompute |
| `module/services/spells/drainRerollHandler.test.ts` | M8 — new |
| `module/ui/combat/chat/renderDrainOutcome.ts` | M8 — new, clear success/damage messaging |
| `module/foundry/hooks/chatMessageHTML.ts` | M8 — drain die click wiring + pending state |

**M9 affected files (done):**

| File | Change |
|---|---|
| `module/services/combat/orchestration/messageRelay.ts` | M9 — `updateMessageAsGM`/`requestMessageUpdate` properly async; new `mergeMessageFlagAsGM` + per-message `serializeWrite` queue; new `readMessageFlag` |
| `module/services/combat/orchestration/messageRelay.test.ts` | M9 — new |
| `module/services/combat/orchestration/contestRerollHandler.ts` | M9 — ships deltas via `applyContestSideDelta`, not full flag snapshots |
| `module/services/combat/orchestration/contestRerollHandler.test.ts` | M9 — race-safety regression tests |
| `module/services/spells/drainRerollHandler.ts` | M9 — ships deltas via `applyDrainDelta` |
| `module/services/spells/drainRerollHandler.test.ts` | M9 — race-safety regression tests |
| `module/services/combat/orchestration/socketHandlers.ts` | M9 — new `contestSideUpdate`/`drainUpdate` socket payloads |
| `module/services/combat/orchestration/socketHandlers.test.ts` | M9 — updated for async write timing |
| `module/foundry/hooks/chatMessageHTML.test.ts` | M9 — updated for async write timing |

**M10 affected files (done):**

| File | Change |
|---|---|
| `module/foundry/hooks/chatMessageHTML.ts` | M10 — rewritten: all interactive wiring (die clicks, resistance button) moved from per-element listeners in the render hook to document-level click delegation reading flags fresh at click time; render hook now only handles the `consumed` auto-disable |
| `module/foundry/hooks/chatMessageHTML.test.ts` | M10 — new tests exercising the delegation path directly, without ever invoking the render hook |

**M11 affected files (done):**

| File | Change |
|---|---|
| `module/services/combat/orchestration/karmaRerollCore.ts` | M11 — `karmaPoolReroll`/`karmaBuySuccess` return a discriminated result; new `notifyKarmaSpendDeclined` |
| `module/services/combat/orchestration/karmaRerollCore.test.ts` | M11 — updated for new return shape + notification tests |
| `module/services/combat/orchestration/rerollHandler.ts` | M11 — shows toast on decline |
| `module/services/combat/orchestration/contestRerollHandler.ts` | M11 — shows toast on decline |
| `module/services/spells/drainRerollHandler.ts` | M11 — shows toast on decline |

**M12 affected files (done):**

| File | Change |
|---|---|
| `module/services/writeQueue.ts` | M12 — new, generic `serializeByKey` extracted from `messageRelay.ts` |
| `module/services/combat/orchestration/messageRelay.ts` | M12 — refactored to use the shared queue |
| `module/services/combat/damageApplication.ts` | M12 — `applyDamageBoxes`/`applyDamageBoxesFromBaseline` take `actorKey`, serialize per-actor writes; new pure `computeDamageBoxesFromBaseline` |
| `module/services/combat/damageApplication.test.ts` | M12 — updated call sites + serialization regression test |
| `module/services/combat/orchestration/resistanceFlow.ts` | M12 — passes `actorKey` |
| `module/services/combat/orchestration/karmaRerollCore.ts` | M12 — `karmaPoolReroll`/`karmaBuySuccess` return `karmaUpdate` data instead of writing it |
| `module/services/combat/orchestration/karmaRerollCore.test.ts` | M12 — updated for new return shape |
| `module/services/combat/orchestration/rerollHandler.ts` | M12 — applies `karmaUpdate` itself via serialized write |
| `module/services/combat/orchestration/contestRerollHandler.ts` | M12 — applies `karmaUpdate` itself via serialized write |
| `module/services/spells/spellDrain.ts` | M12 — passes `actorKey` |
| `module/services/spells/drainRerollHandler.ts` | M12 — new `applyKarmaAndHealthForDelta` merges karma + health into one atomic `actor.update()` call (superseded by M13 — did not fully resolve the live symptom) |
| `module/services/spells/drainRerollHandler.test.ts` | M12 — updated to assert the combined single-call write |

**M13 affected files (done):**

| File | Change |
|---|---|
| `module/services/spells/spellDrain.ts` | M13 — `applyDrain` no longer applies health at roll time |
| `module/services/spells/spellDrain.test.ts` | M13 — updated: no health write at roll time; magic-loss-only assertions |
| `module/services/spells/drainRerollHandler.ts` | M13 — `handleDrainReroll`/`handleDrainBuy` apply Karma only; new `handleDrainDone` applies health exactly once |
| `module/services/spells/drainRerollHandler.test.ts` | M13 — updated for karma-only reroll/buy; new `handleDrainDone` tests |
| `module/ui/combat/chat/renderDrainOutcome.ts` | M13 — new Done button; "will take" wording |
| `module/foundry/hooks/chatMessageHTML.ts` | M13 — new `registerDrainDoneDelegation`; die-click delegation now bails once `consumed` |
| `styles/chat.scss` | M13 — dims/disables dice once message is consumed; Done button styling |

**M14 affected files (done):**

| File | Change |
|---|---|
| `module/utilities/StoreManager.svelte.ts` | M14 — `#registerHooks` matches `updateActor`/`actorSystemRecalculated` events by `.id` instead of `.uuid` |
| `module/utilities/StoreManager.test.ts` | M14 — new; this bidirectional sync mechanism had no prior test coverage |

**M15 affected files (done):**

| File | Change |
|---|---|
| `module/utilities/StoreManager.svelte.ts` | M15 — `#handleDocumentUpdate` reads values from the hook's fresh `doc`, not the stale subscribed `document`; only key-matching still uses the subscribed reference's `.uuid` — the actual fix that resolved the live symptom |
| `module/utilities/StoreManager.test.ts` | M15 — new regression test, verified to fail against stale-reference reads and pass against fresh-doc reads |

**M6 (not yet implemented):**

| File | Change |
|---|---|
| `module/ui/combat/chat/renderContestOutcome.ts` | M6 — Done buttons |
| `module/foundry/hooks/chatMessageHTML.ts` | M6 — Done click handling |
| `module/services/combat/engine/contestCoordinator.ts` | M6 — new "both done" wait/signal primitive |
| `module/services/combat/orchestration/contestedFlow.ts` | M6 — await both-done before returning |
