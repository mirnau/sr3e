---
title: Oppose Roll Service
parent: Services
grand_parent: Documentation
nav_order: 2
---

# @services/OpposeRollService.js

Coordinator for opposed challenges and damage resistance. Manages contest lifecycle, message stubs across clients, responder routing, and post-roll resolution.

Import: `import OpposeRollService from "@services/OpposeRollService.js"`.

---

## Responsibilities

- Create and track contest records keyed by `contestId`.
- Build and distribute lightweight stubs (ids + exports) to the defender’s client.
- Await defender response (`waitForResponse`) and route it back to the initiator flow.
- Rehydrate initiator procedure from JSON and render combined opposed outcomes.
- Prompt and resolve damage resistance (family-specific via FirearmService/MeleeService).
- Fail loud, fail fast: explicit precondition checks; no hidden fallbacks.

---

## Contest lifecycle

- `getContestById(id) → contest | undefined`
- `waitForResponse(contestId) → Promise<rollData>`: Resolves when defender replies.
- `deliverResponse(contestId, rollData)`: Completes the pending promise for a contest.
- `expireContest(contestId)`: Clears timers, removes record, resolves waiter with `{ __aborted: true }`.
- `abortOpposedRoll(contestId, { reason?, byUserId? }) → true`
  - Expires and updates the originating chat message flags; emits `sr3e:contest-cancelled`.

---

## Starting a contest

- `async startProcedure({ procedure, targetActor, targetToken?, roll }) → string`
  - Preconditions: `procedure`, `procedure.caller`, `targetActor`, and `roll` are required.
  - Creates a `contestId` and a local `contest` record with:
    - `initiatorRoll`: roll snapshot with `options.targetNumber` and UI metadata.
    - `procedure`: `{ class, json, export }` from the initiator procedure.
    - Optional `defenseHint` from `procedure.getDefenseHint()`.
  - Broadcasts a responder prompt (handled elsewhere) that will call back into this service.

- `registerContestStub(stub) → contest`
  - Called on the defender’s client with a light payload (ids only); resolves actor docs locally and stores a contest entry.

---

## Resolving opposed rolls

- `async resolveTargetRoll(contestId, rollData)`
  - Marks contest resolved and stores `targetRoll`.
  - Rehydrates the initiator procedure via `AbstractProcedure.fromJSON(procJSON)`.
  - Calls `initiatorProc.onChallengeResolved` for initiator bookkeeping if present.
  - Computes `netSuccesses` (initiator − target) and asks the initiator procedure to `renderContestOutcome(...)`.
  - Posts a combined chat message honoring current roll mode and scoping to the right users.

Utilities:
- `computeNetSuccesses(initiatorRollData, targetRollData) → number`
- `getSuccessCount(rollData) → number`
- `resolveControllingUser(actor) → User`

---

## Damage resistance flow

- `async promptDamageResistance({ contestId, initiatorId, defenderId, weaponId, prep })`
  - Builds a defender-facing whisper prompt to run a resistance test.
  - Uses `prep.tnBase` and `prep.tnMods` to display a TN breakdown; no hidden defaults.

- `async resolveDamageResistanceFromRoll({ defenderId, weaponId, prep, rollData })`
  - Computes TN = `max(2, tnBase + sum(tnMods))` and counts successes.
  - Delegates outcome math to `FirearmService`/`MeleeService` by `prep.familyKey`.
  - Applies boxes to the correct track (stun/physical) and posts a concise result message.