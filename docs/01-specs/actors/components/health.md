---
title: Health
parent: Components
grand_parent: Actors
toc: true
---

# Health - Spec

The Health component owns condition tracks, overflow, life state, and the derived penalty it exposes to Procedures. Cards below define one capability or invariant each with concrete ACs and clear integration boundaries.

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-001"
   title="Model fields (authoritative)"
   component="Actors > Components > Health"
   level="MUST"
   description="Canonical fields exposed by system.health."
   ac="- AC-001.1: system.health has stun, physical, overflow (each with { value:int, mod:int }).
- AC-001.2: system.health has isAlive:boolean (initial true).
- AC-001.3: system.health has penalty:number (derived, read-only; see 004).
- AC-001.4: A RO store exists for penalty; RW stores exist for stun.value, physical.value, overflow.value, isAlive."
   non_goals="Does not define UI layout or labels; Controllers/Procedures own rule application."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-002"
   title="Track & Overflow bounds"
   component="Actors > Components > Health"
   level="MUST"
   description="Stun/Physical tracks are 10 boxes (0-10); Overflow is a non-negative integer."
   ac="- AC-002.1: Setting system.health.stun.value to -1 fails validation.
- AC-002.2: Setting system.health.stun.value or physical.value above 10 fails validation.
- AC-002.3: Non-integer assignment to a track value fails validation.
- AC-002.4: Setting system.health.overflow.value to -1 fails validation.
- AC-002.5: Assigning a non-integer to system.health.overflow.value fails validation.
- AC-002.6: Increasing overflow does not change penalty directly (see 004)."
   non_goals="Box rendering and overflow controls are UI concerns; this card constrains data only."
%}



{% include req-card.md
   id="REQ-ACT-PC-HEALTH-004"
   title="Stage & penalty derivation"
   component="Actors > Components > Health"
   level="MUST"
   description="Derive stage per track and expose penalty as a read-only function of stages."
   ac="- AC-004.1: Value 0 => stage 'None'; 1-2 => 'L'; 3-5 => 'M'; 6-9 => 'S'; 10 => 'D'.
- AC-004.2: getStage('stun') and getStage('physical') return the expected stage string for current values.
- AC-004.3: system.health.penalty is derived as max(stage(stun), stage(physical)) mapped to 0|1|2|3 (D caps at 3).
- AC-004.4: Changing either track updates penalty immediately (no manual refresh).
- AC-004.5: Writing to system.health.penalty is rejected with an explicit error."
   non_goals="Application of penalty to TN/initiative is handled by Procedures; UI display is separate."
%}



{% include req-card.md
   id="REQ-ACT-PC-HEALTH-006"
   title="Deadly semantics"
   component="Actors > Components > Health"
   level="MUST"
   description="Define effects of Deadly by track."
   ac="- AC-006.1: Deadly Stun marks the actor unconscious (exposed as boolean or event for consumers).
- AC-006.2: Deadly Physical confers no penalty beyond stage 'D' (penalty remains 3).
- AC-006.3: Deadly by itself does not flip isAlive (see 007)."
   non_goals="No knockout timers or recovery; those live in Controllers/Procedures."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-007"
   title="Death threshold"
   component="Actors > Components > Health"
   level="MUST"
   description="Overflow beyond Body determines life state."
   ac="- AC-007.1: When system.health.overflow.value > system.attributes.body.value, system.health.isAlive becomes false.
- AC-007.2: Toggling isAlive emits a life-state change event for consumers.
- AC-007.3: Reducing overflow back to <= Body allows isAlive to be set true by controllers (no auto-resurrection)."
   non_goals="How Body changes or revival flows occur is out of scope."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-008"
   title="Stabilized gating"
   component="Actors > Components > Health"
   level="SHOULD"
   description="When stabilized, overflow must not increase via health APIs."
   ac="- AC-008.1: With stabilized=true, attempts to increment overflow are rejected with an explicit error.
- AC-008.2: With stabilized=true, decrements to overflow are allowed.
- AC-008.3: Stabilized state is exposed as a boolean store or read-only flag; consumers can check before updates."
   non_goals="Who sets/clears stabilized and when is decided by Procedures/Controllers."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-009"
   title="Events and stores (integration surface)"
   component="Actors > Components > Health"
   level="MUST"
   description="Define what Health exposes for other layers."
   ac="- AC-009.1: RW stores exist: health.stun.value, health.physical.value, health.overflow.value, health.isAlive.
- AC-009.2: RO store exists: health.penalty (number); writing to it throws.
- AC-009.3: Emitted on any change: 'sr3e.actor.health.changed' with { track, value, stage, penalty }.
- AC-009.4: Emitted when isAlive toggles: 'sr3e.actor.health.lifeStateChanged' with { isAlive }."
   non_goals="Consumers decide how to respond; Health does not dispatch game effects."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-010"
   title="Healing normalization"
   component="Actors > Components > Health"
   level="SHOULD"
   description="Stage-based healing can snap to the low end of the new stage."
   ac="- AC-010.1: Setting a track to stage 'M' normalizes value to 3.
- AC-010.2: 'S' normalizes to 6; 'L' normalizes to 1; 'None' to 0.
- AC-010.3: Normalization is optional helper behavior; controllers may set exact values when required."
   non_goals="Does not prescribe healing rates or test/First Aid procedures."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-012"
   title="Presentation"
   component="Actors > Components > Health"
   level="SHOULD"
   description="ECG reflects life state only; no hidden rule effects."
   ac="- AC-012.1: When isAlive=false, ECG shows a flatline indicator.
- AC-012.2: When isAlive=true, ECG animates; animation rate may vary with stage but has no mechanical impact.
- AC-012.3: Toggling isAlive updates the indicator without page reload."
   non_goals="ECG does not apply or imply penalties; purely representational."
%}

{% include req-card.md
   id="REQ-ACT-PC-HEALTH-013"
   title="Miraculous Survival (house rule)"
   component="Actors > Components > Health"
   level="MAY"
   description="Optional one-time revive control gated by karma flag."
   ac="- AC-013.1: Control is visible only when karma.miraculousSurvival is false.
- AC-013.2: Confirming sets overflow.value=0 and isAlive=true, then flips karma.miraculousSurvival to true.
- AC-013.3: After use, the control hides without requiring a reload."
   non_goals="Rule justification and availability are documented separately as a house rule."
%}
