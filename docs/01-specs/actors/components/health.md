---
title: Health
parent: Components
grand_parent: Actors
toc: true
---

# Health — Spec

The Health component represents condition tracks, overflow, wound penalties, and life/death state in accordance with SR3E rules. Each card defines one rule-driven capability with concrete acceptance criteria.

{% include req-card.md
id="REQ-ACT-C-HEALTH-001"
title="Stun track"
component="Actors > Components > Health"
level="MUST"
description="Show and track Stun damage boxes (SR3 p.125)."
ac="

-  AC-001.1: Health exposes a Stun track of 10 boxes.
-  AC-001.2: Stun can accumulate from 0 (None) to Deadly."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-002"
title="Physical track & Overflow"
component="Actors > Components > Health"
level="MUST"
description="Show and track Physical damage and carry excess into Overflow (SR3 p.125–126)."
ac="

-  AC-002.1: Physical track has 10 boxes from None to Deadly.
-  AC-002.2: Damage beyond Physical spills into Overflow.
-  AC-002.3: Overflow accumulates without upper bound until Body threshold is checked."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-003"
title="Wound penalties"
component="Actors > Components > Health"
level="MUST"
description="Expose wound modifiers based on worst damage stage (SR3 p.113)."
ac="

-  AC-003.1: Penalty is 0/–1/–2/–3 for L/M/S/D respectively.
-  AC-003.2: Penalty is derived from maximum of Stun or Physical stage."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-004"
title="Death threshold"
component="Actors > Components > Health"
level="MUST"
description="Determine when the character is dead (SR3 p.126)."
ac="

-  AC-004.1: Character is dead if Overflow exceeds Body.
-  AC-004.2: Life state flips from alive to not-alive at that point.
-  AC-004.3: Reducing Overflow below Body allows controllers to restore life state."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-005"
title="Miraculous Survival (Hand of God)"
component="Actors > Components > Health"
level="MUST"
description="Support optional Hand of God mechanic (SR3 p.246)."
ac="

-  AC-005.1: Actor may spend Karma to miraculously survive once.
-  AC-005.2: Activating resets Overflow to 0 and restores alive state.
-  AC-005.3: Mechanic can only be used once per character."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-006"
title="Stabilized state"
component="Actors > Components > Health"
level="SHOULD"
description="Prevent further Overflow increase while stabilized (SR3 p.126)."
ac="

-  AC-006.1: Stabilized actors cannot gain additional Overflow.
-  AC-006.2: Stabilized actors are unstabilized on taking new damage.
-  AC-006.3: Stabilization can be toggled manually.
-  AC-006.4: Stabilization is represented on the Karma data model."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-008"
title="State Monitor"
component="Actors > Components > Health"
level="SHOULD"
description="Provide a visual indicator of life state."
ac="

-  AC-008.1: Alive shows ECG animation.
-  AC-008.2: Dead shows flatline.
-  AC-008.3: Indicator updates immediately on state."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-009"
title="Miraculous Survival opt-out (GM system setting)"
component="Actors > Components > Health"
level="SHOULD"
description="Provide a GM-only world setting to disable the Miraculous Survival mechanic."
ac="

-  AC-009.1: A GM-only setting toggles availability of Miraculous Survival."
   %}

{% include req-card.md
id="REQ-ACT-C-HEALTH-010"
title="Revive dead character (GM action)"
component="Actors > Components > Health"
level="SHOULD"
description="Allow the GM to explicitly restore a dead actor to the alive state."
ac="

-  AC-010.1: A GM-only control exists on the actor to Revive.
-  AC-010.2: Revive sets Overflow to 0 and flips life state to alive.
-  AC-010.3: The control is conditionally displayed in the death state."
   %}
