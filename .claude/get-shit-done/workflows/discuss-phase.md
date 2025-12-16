<purpose>
Gather phase context through adaptive questioning before planning, using intake & decision gate pattern to build comprehensive understanding of objectives, constraints, risks, success indicators, and codebase context.
</purpose>

<process>

<step name="validate_phase" priority="first">
Phase number: $ARGUMENTS (required)

Validate phase exists in roadmap:

```bash
if [ -f .planning/ROADMAP.md ]; then
  cat .planning/ROADMAP.md | grep "Phase ${PHASE}:"
else
  cat .planning/ROADMAP.md | grep "Phase ${PHASE}:"
fi
```

**If phase not found:**

```
Error: Phase ${PHASE} not found in roadmap.

Use /gsd:plan-phase to see available phases.
```

Exit workflow.

**If phase found:**
Parse phase details from roadmap:

- Phase number
- Phase name
- Phase description
- Status (should be "Not started" or "In progress")

Continue to check_existing.
</step>

<step name="check_existing">
Check if CONTEXT.md already exists for this phase:

```bash
ls .planning/phases/${PHASE}-*/CONTEXT.md 2>/dev/null
# Also check for ${PHASE}-CONTEXT.md in phase directory
ls .planning/phases/${PHASE}-*/${PHASE}-CONTEXT.md 2>/dev/null
```

**If exists:**

```
Phase ${PHASE} already has context: [path to CONTEXT.md]

What's next?
1. Update context - Review and revise existing context
2. View existing - Show me the current context
3. Skip - Use existing context as-is
```

Wait for user response.

If "Update context": Load existing CONTEXT.md into intake flow (pre-populate known context)
If "View existing": Read and display CONTEXT.md, then offer update/skip
If "Skip": Exit workflow

**If doesn't exist:**
Continue to intake_gate.
</step>

<step name="intake_gate">

<no_context_handler>
Present initial context from roadmap:

```
Phase ${PHASE}: ${PHASE_NAME}

Roadmap description: ${PHASE_DESCRIPTION}

I'll gather additional context through questions to ensure comprehensive planning.
```

Continue to context_analysis.
</no_context_handler>

<context_analysis>
Analyze roadmap phase description and extract what's already provided:

**Objectives (what):** What this phase accomplishes
**Constraints (how):** Technical/timeline limitations mentioned
**Risks (concerns):** Potential issues mentioned
**Success indicators (done when):** Completion criteria mentioned
**Codebase context (dependencies):** Related systems mentioned

Identify gaps where additional clarity would improve planning quality.
</context_analysis>

<initial_questions>
Ask 2-4 questions based on actual gaps. Use AskUserQuestion with structured options.

CRITICAL: Questions must CLARIFY roadmap scope, not EXPAND it.
- ASK: "How should X from the roadmap work?" (clarification)
- ASK: "What constraints affect implementation?" (context)
- ASK: "What existing code patterns should I follow?" (context)
- NEVER ASK: "What else should we add?" (scope creep)
- NEVER ASK: "Should we also include...?" (scope creep)
- NEVER SUGGEST: Additional features beyond roadmap

**If objectives are vague:**
header: "Phase Objectives"
question: "The roadmap says [X]. How should this work specifically?"
options:

- "Minimal implementation" - Core functionality only, simplest approach
- "Standard approach" - Follow common patterns for this type of work
- "Match existing patterns" - Do it the way similar things are done in codebase
- "I'll clarify" - Let me explain what I have in mind

**If constraints are unclear:**
header: "Constraints"
question: "Are there constraints I should know about?"
options:

- "Technical limitations" - Library choices, platform requirements, compatibility
- "Timeline pressure" - Specific deadline or urgency
- "Dependencies" - Waiting on other phases or external factors
- "Performance requirements" - Speed, scale, resource constraints
- "No constraints" - Flexible approach
- "Other" - Something else

**If risks are not mentioned:**
header: "Risks"
question: "What could go wrong in this phase?"
options:

- "Breaking changes" - Could affect existing functionality
- "Integration complexity" - Coordinating multiple systems
- "Unknown unknowns" - New territory, unclear best practices
- "Performance impact" - Could slow things down
- "Security concerns" - Authentication, data protection, vulnerabilities
- "No major risks" - Straightforward implementation
- "Other" - Something else

**If success indicators are unclear:**
header: "Success Indicators"
question: "How will we know this phase is complete?"
options:

- "Feature works" - Functional verification (tests pass, behavior correct)
- "Deployed and live" - Actually running in production
- "User-verified" - Visual/manual confirmation required
- "Metrics hit target" - Performance, coverage, or quality thresholds
- "Documentation complete" - Properly documented for future work
- "Other" - Something else

Skip questions where roadmap already provides clear answers.
</initial_questions>

<gather_codebase_context>
After initial questions, ask about codebase state:

header: "Codebase Context"
question: "What should I know about the current codebase state?"
options:

- "Fresh project" - Just starting, minimal existing code
- "Established patterns" - Follow existing conventions and architecture
- "Needs refactoring" - Current code has issues to address
- "External dependencies" - Relies on specific libraries or services
- "Legacy constraints" - Working with older code or technologies
- "Not sure" - Help me figure this out
- "Other" - Something else

If "Established patterns" or "External dependencies" selected, ask follow-up:
"Which files or systems should I examine for context?"

If "Not sure" selected, offer to scan codebase:
"I can scan the codebase to identify patterns and dependencies. Proceed?"
</gather_codebase_context>

<decision_gate>
**Decision gate (MUST have all 3 options):**

```
Header: "Context Gathering"
Options:
  1. "Create CONTEXT.md" - I have enough context, proceed
  2. "Ask more questions" - I want to clarify how something should work
  3. "Let me add context" - I have information that affects implementation
```

If "Ask more questions" → generate 2-3 CLARIFYING follow-ups (never suggest additions) → return to gate.
If "Let me add context" → receive input → return to gate.
Loop until "Create CONTEXT.md" selected.

SCOPE CREEP PREVENTION:
- Follow-up questions must clarify roadmap items, not expand them
- If user adds scope during "Let me add context", note it for ROADMAP update instead
- CONTEXT.md documents HOW to implement roadmap scope, not WHAT additional things to add
</decision_gate>

</step>

<step name="write_context">
Create CONTEXT.md using accumulated context from intake flow.

Use template from ./.claude/get-shit-done/templates/context.md

**File location:** `.planning/phases/${PHASE}-${SLUG}/${PHASE}-CONTEXT.md`

**If phase directory doesn't exist yet:**
Create it: `.planning/phases/${PHASE}-${SLUG}/`

Use roadmap phase name for slug (lowercase, hyphens).

Populate template sections:

- `<phase_objectives>`: From "what" analysis and questions
- `<constraints>`: From "how" analysis and questions
- `<risks>`: From "concerns" analysis and questions
- `<success_indicators>`: From "done when" analysis and questions
- `<codebase_context>`: From codebase questions and optional scanning
- `<decisions_needed>`: From questions that revealed choices to make
- `<notes>`: Any additional context gathered

Write file.
</step>

<step name="confirm_creation">
Present CONTEXT.md to user:

```
Created: .planning/phases/${PHASE}-${SLUG}/${PHASE}-CONTEXT.md

## Phase Objectives
[summary of objectives]

## Key Constraints
[summary of constraints]

## Risks to Watch
[summary of risks]

## Success Indicators
[summary of success criteria]

What's next?
1. Plan this phase (/gsd:plan-phase ${PHASE}) - CONTEXT.md will be loaded automatically
2. Review/edit CONTEXT.md - Make adjustments before planning
3. Done for now
```

</step>

</process>

<success_criteria>

- Phase number validated against roadmap
- Context gathered through adaptive questioning
- All five core areas addressed: objectives, constraints, risks, success indicators, codebase context
- CONTEXT.md created in phase directory using template
- User knows next steps (typically: plan the phase)
  </success_criteria>
