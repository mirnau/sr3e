---
description: Initialize a new project with deep context gathering and PROJECT.md
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---

<objective>
Initialize a new project through comprehensive context gathering.

This is the most leveraged moment in any project. Deep questioning here means better plans, better execution, better outcomes.

Creates `.planning/` with PROJECT.md and config.json.
</objective>

<execution_context>
@./.claude/get-shit-done/references/principles.md
@./.claude/get-shit-done/references/questioning.md
@./.claude/get-shit-done/templates/project.md
@./.claude/get-shit-done/templates/config.json
</execution_context>

<context>
!`[ -d .planning ] && echo "PLANNING_EXISTS" || echo "NO_PLANNING"`
!`[ -d .git ] && echo "GIT_EXISTS" || echo "NO_GIT"`
</context>

<process>

<step name="setup" silent="true">
Silent setup - execute before any user output:

```bash
# Abort if project exists
[ -d .planning ] && echo "Project already initialized. Use /gsd:progress" && exit 1

# Initialize git
[ -d .git ] || git init
```

</step>

<step name="question">
Start: "What do you want to build?"

Let them talk. Then follow the conversation arc from `questioning.md`:
1. **Follow the thread** — dig into what they said, what excites them
2. **Sharpen the core** — essential vs nice-to-have
3. **Find boundaries** — what is it NOT
4. **Ground in reality** — only constraints that actually exist

Be a thinking partner, not an interviewer. Help them discover and articulate their vision.

When you feel you understand it, offer the decision gate:

```
Header: "Ready?"
Options:
  1. "Create PROJECT.md" - Finalize
  2. "Ask more questions" - I'll dig deeper
  3. "Let me add context" - User shares more
```

If "Ask more questions" → check coverage gaps from `questioning.md` → ask naturally → return to gate.
Loop until "Create PROJECT.md" selected.
</step>

<step name="project">
Synthesize all context into `.planning/PROJECT.md` using the template from `templates/project.md`.

Do not compress. Capture everything gathered.
</step>

<step name="mode">
Ask workflow mode preference:

Use AskUserQuestion:

- header: "Mode"
- question: "How do you want to work?"
- options:
  - "Interactive" - Confirm at each step
  - "YOLO" - Auto-approve, just execute

Create `.planning/config.json` with chosen mode using `templates/config.json` structure.
</step>

<step name="commit">
```bash
git add .planning/PROJECT.md .planning/config.json
git commit -m "$(cat <<'EOF'
docs: initialize [project-name]

[One-liner from PROJECT.md]

Creates PROJECT.md with vision and requirements.
EOF
)"

```
</step>

<step name="done">
```

Project initialized:

- Project: .planning/PROJECT.md
- Config: .planning/config.json (mode: [chosen mode])

What's next?

1. Research domain ecosystem (/gsd:research-project) - For niche/complex domains
2. Create roadmap (/gsd:create-roadmap) - Skip research, go straight to planning
3. Done for now

```

If user selects "Research domain ecosystem" → invoke `/gsd:research-project`
If user selects "Create roadmap" → invoke `/gsd:create-roadmap`
</step>

</process>

<output>
- `.planning/PROJECT.md`
- `.planning/config.json`
</output>

<success_criteria>
- [ ] Deep questioning completed (not rushed)
- [ ] PROJECT.md captures full context
- [ ] config.json has workflow mode
- [ ] All committed to git
</success_criteria>
```
