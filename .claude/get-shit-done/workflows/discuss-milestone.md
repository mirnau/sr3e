<purpose>
Gather milestone context through adaptive questioning before creating a new milestone, using intake & decision gate pattern to build comprehensive understanding of goals, scope, lessons learned, and success criteria.
</purpose>

<process>

<step name="check_state" priority="first">
Load project state:

```bash
cat .planning/STATE.md
cat .planning/ROADMAP.md
```

**If no active milestone (expected state after completing previous):**
Continue to milestone_context.

**If active milestone exists:**

```
Current milestone in progress: v[X.Y] [Name]
Phases [N]-[M], [P]% complete

Did you want to:
1. Complete current milestone first (/gsd:complete-milestone)
2. Add phases to current milestone (/gsd:add-phase)
3. Continue anyway - discuss next milestone scope

```

Wait for user response. If "Continue anyway", proceed to milestone_context.
</step>

<step name="milestone_context">
Present context from previous milestone:

```
Last completed: v[X.Y] [Name] (shipped [DATE])
Key accomplishments:
- [From MILESTONES.md or STATE.md]

Total phases delivered: [N]
Next phase number: [N+1]
```

Continue to intake_gate.
</step>

<step name="intake_gate">
The primary question is: **What do you want to build/add/fix?**

Everything else (scope, priority, constraints) is secondary and derived from features.

Check for inputs:
- Deferred issues from STATE.md (potential features)
- Known gaps or pain points from usage
- User's ideas for what's next

Start: "What do you want to add, improve, or fix in this milestone?"

Then use AskUserQuestion to explore features. After each response, dig deeper with follow-up questions about specifics.

**Feature exploration questions (use as needed):**

If they named specific features:
- header: "Feature Details"
- question: "Tell me more about [feature] - what should it do?"
- options: [Contextual options based on feature type + "Let me describe it"]

If they described a general direction:
- header: "Breaking It Down"
- question: "That could involve [A], [B], [C] - which matter most?"
- options: [Specific sub-features + "All of them" + "Something else"]

If they're not sure:
- header: "Starting Points"
- question: "What's been frustrating or missing?"
- options: [Deferred issues from STATE.md + pain point categories + "Let me think about it"]

After gathering features, synthesize:

```
Based on what you described:

**Features:**
- [Feature 1]: [brief description]
- [Feature 2]: [brief description]
- [Feature 3]: [brief description]

**Estimated scope:** [N] phases
**Theme suggestion:** v[X.Y] [Name]
```

**Decision gate (MUST have all 3 options):**

```
Header: "Ready?"
Options:
  1. "Create milestone" - Proceed to /gsd:new-milestone
  2. "Ask more questions" - Explore features or constraints further
  3. "Let me add context" - I have more to share
```

If "Ask more questions" → generate 2-3 contextual follow-ups → return to gate.
If "Let me add context" → receive input, update synthesis → return to gate.
Loop until "Create milestone" selected.
</step>

<step name="handoff">
Present summary and hand off to create-milestone:

```
Milestone scope defined:

**Features:**
- [Feature 1]: [description]
- [Feature 2]: [description]
- [Feature 3]: [description]

**Suggested milestone:** v[X.Y] [Theme Name]
**Estimated phases:** [N]

Ready to create the milestone structure.
```

**Invoke:** SlashCommand("/gsd:new-milestone")

Pass context forward by summarizing:
- Features to build (the substance)
- Suggested milestone name
- How features map to phases
</step>

</process>

<success_criteria>

- Project state loaded (STATE.md, ROADMAP.md)
- Previous milestone context presented
- **Features identified** - What to build/add/fix (the substance)
- Features explored with clarifying questions
- Scope synthesized from features (not asked abstractly)
- Context handed off to /gsd:new-milestone with feature list
</success_criteria>
