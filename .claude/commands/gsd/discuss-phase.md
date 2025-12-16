---
description: Gather phase context through adaptive questioning before planning
argument-hint: "[phase]"
---

<objective>
Use adaptive questioning to gather comprehensive phase context before planning.

Purpose: Build deep understanding of objectives, constraints, risks, success indicators, and codebase state through structured intake flow. Creates CONTEXT.md file that informs high-quality planning.
Output: {phase}-CONTEXT.md in phase directory with complete context documentation
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/discuss-phase.md
@./.claude/get-shit-done/templates/context.md
</execution_context>

<context>
Phase number: $ARGUMENTS (required)

**Load project state first:**
@.planning/STATE.md

**Load roadmap:**
@.planning/ROADMAP.md
</context>

<process>
1. Validate phase number argument (error if missing or invalid)
2. Check if phase exists in roadmap
3. Check if CONTEXT.md already exists (offer to update if yes)
4. Follow discuss-phase.md workflow:
   - Present initial context from roadmap
   - Analyze gaps in: objectives, constraints, risks, success indicators, codebase context
   - Ask 2-4 CLARIFYING questions (never suggest additions or expansions)
   - Present decision gate (ready / ask more / let me add context)
   - Create CONTEXT.md using template
5. Offer next steps (typically: plan the phase)

CRITICAL - NO SCOPE CREEP:
- Questions clarify HOW to implement roadmap scope, not WHAT to add
- Never ask "should we also..." or "do you want to add..."
- If user adds scope, suggest updating ROADMAP first instead
</process>

<success_criteria>

- Phase validated against roadmap
- Context gathered through adaptive questioning
- CONTEXT.md created in phase directory
- User knows next steps (plan phase, review context, or done)
  </success_criteria>
