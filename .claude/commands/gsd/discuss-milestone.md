---
description: Gather context for next milestone through adaptive questioning
---

<objective>
Use adaptive questioning to gather comprehensive milestone context before creating a new milestone.

Purpose: After completing a milestone, discuss the scope and focus of the next milestone before diving into phase creation. Builds understanding of goals, constraints, priorities, and lessons learned.
Output: Context gathered, then routes to /gsd:new-milestone
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/discuss-milestone.md
</execution_context>

<context>
**Load project state first:**
@.planning/STATE.md

**Load roadmap:**
@.planning/ROADMAP.md

**Load milestones (if exists):**
@.planning/MILESTONES.md
</context>

<process>
1. Verify previous milestone complete (or acknowledge active milestone)
2. Present context from previous milestone (accomplishments, phase count)
3. Follow discuss-milestone.md workflow:
   - Ask about milestone theme/focus
   - Ask about scope (estimated phases)
   - Ask about constraints and priorities
   - Ask about lessons from previous milestone
   - Present decision gate (ready / ask more / let me add context)
4. Hand off to /gsd:new-milestone with gathered context
</process>

<success_criteria>

- Project state loaded and presented
- Previous milestone context summarized
- Milestone scope gathered through adaptive questioning
- Context handed off to /gsd:new-milestone
  </success_criteria>
