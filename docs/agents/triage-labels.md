# Triage Labels

| Role            | Label string        | Meaning                                      |
|-----------------|---------------------|----------------------------------------------|
| Needs triage    | `needs-triage`      | Maintainer needs to evaluate this issue      |
| Needs info      | `needs-info`        | Waiting on the reporter for more information |
| Ready for agent | `ready-for-agent`   | Fully specified; an AI agent can tackle it   |
| Ready for human | `ready-for-human`   | Needs a human to implement                   |
| Won't fix       | `wontfix`           | Will not be actioned                         |

## Rules for agents

- Apply exactly one triage label per issue at any given time
- Prefer `ready-for-agent` only when the acceptance criteria are fully specified
- Never remove `wontfix` without explicit maintainer instruction
