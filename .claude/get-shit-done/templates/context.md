# Phase Context Template

Template for `.planning/phases/XX-name/{phase}-CONTEXT.md` - phase context documentation gathered before planning.

**Purpose:** Capture comprehensive context through adaptive questioning to inform high-quality planning.

---

## File Template

```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** [For planning / Planning complete]

<phase_objectives>
## What This Phase Accomplishes

[Clear, specific description of what this phase delivers]

**Primary goal:**
[Main objective from roadmap - what ships at the end]

**Clarifications:**
[Any clarified details about HOW the primary goal works - not additional features]

**Out of scope:**
[What this phase explicitly does NOT include - prevents scope creep]
</phase_objectives>

<constraints>
## Constraints

**Technical:**
[Library choices, platform requirements, compatibility needs, existing architecture patterns to follow]

**Timeline:**
[Deadlines, urgency, sequencing dependencies]

**Resources:**
[Budget limits, API rate limits, storage constraints, computational limits]

**Dependencies:**
[What must exist before this phase can start, external factors, waiting on other teams/services]

**Other:**
[Any other constraints affecting approach]

[If no constraints: "None - flexible approach"]
</constraints>

<risks>
## Risks and Mitigation

**Risk 1: [Risk description]**
- **Likelihood:** [High / Medium / Low]
- **Impact:** [High / Medium / Low]
- **Mitigation:** [How to prevent or handle this]

**Risk 2: [Risk description]**
- **Likelihood:** [High / Medium / Low]
- **Impact:** [High / Medium / Low]
- **Mitigation:** [How to prevent or handle this]

[Continue for identified risks]

[If no major risks: "No major risks identified - straightforward implementation expected"]
</risks>

<success_indicators>
## Success Indicators

**How we'll know this phase is complete:**

**Functional:**
- [ ] [Specific feature works correctly]
- [ ] [Tests pass for X functionality]
- [ ] [Integration with Y system verified]

**Quality:**
- [ ] [Performance meets X threshold]
- [ ] [No TypeScript errors]
- [ ] [Test coverage >= X%]

**Deployment:**
- [ ] [Changes deployed to staging/production]
- [ ] [Verification in live environment]

**Documentation:**
- [ ] [API documented]
- [ ] [README updated]
- [ ] [Migration guide if needed]

**User-facing:**
- [ ] [Visual verification complete]
- [ ] [User testing passed]
- [ ] [Acceptance criteria met]
</success_indicators>

<codebase_context>
## Codebase State and Patterns

**Current state:**
[Fresh project / Established codebase / Legacy system / Mid-refactor]

**Relevant files/systems:**
- `path/to/relevant.ts` - [What this does and why it matters for this phase]
- `path/to/another.ts` - [What this does and why it matters for this phase]

**Patterns to follow:**
[Existing conventions, architectural patterns, naming conventions, testing patterns]

**External dependencies:**
- [Library/service 1] - [How it's used, version constraints]
- [Library/service 2] - [How it's used, version constraints]

**Known issues to address:**
[From ISSUES.md or prior phases - issues this phase should fix]

**Prior decisions affecting this phase:**
[From STATE.md - decisions from previous phases that constrain approach]
</codebase_context>

<decisions_needed>
## Decisions That Will Affect Implementation

**Decision 1: [What needs deciding]**
- **Context:** [Why this matters]
- **Options:** [Brief list of approaches]
- **When to decide:** [During planning / During task X / Before starting]

**Decision 2: [What needs deciding]**
- **Context:** [Why this matters]
- **Options:** [Brief list of approaches]
- **When to decide:** [During planning / During task X / Before starting]

[If no decisions needed: "No open decisions - approach is clear from roadmap and context"]
</decisions_needed>

<notes>
## Additional Context

[Any other relevant information gathered during context discussion]

[Questions asked during intake:]
- Q: [Question asked]
- A: [Answer received]

[Clarifications:]
- [Important points clarified during discussion]

[References:]
- [Links to relevant docs, prior art, examples]

[If no additional notes: "No additional notes"]
</notes>

---

*Phase: XX-name*
*Context gathered: [date]*
*Ready for planning: [yes/no]*
```

<good_examples>
```markdown
# Phase 3: Authentication - Context

**Gathered:** 2025-01-20
**Status:** For planning

<phase_objectives>
## What This Phase Accomplishes

Implement JWT-based authentication with secure session management.

**Primary goal:**
Users can register, login, logout with JWT tokens stored in httpOnly cookies. Protected routes verify authentication.

**Clarifications:**
- Tokens stored as httpOnly cookies (not localStorage) per security requirements
- "Protected routes" means API routes + page-level middleware redirects
- Password reset included per roadmap scope

**Out of scope:**
- OAuth providers (Google, GitHub) - deferred to Phase 4
- 2FA - deferred to Phase 5
- Role-based access control - deferred to Phase 6
</phase_objectives>

<constraints>
## Constraints

**Technical:**
- Must use jose library (NOT jsonwebtoken - ESM compatibility requirement from Phase 1)
- Must work in Edge runtime (Next.js middleware requirement)
- Passwords must use bcrypt with minimum 10 salt rounds
- Database already has User model from Phase 2 (extend, don't recreate)

**Timeline:**
- Target completion: End of week 3
- Blocking Phase 4 (user profiles) and Phase 5 (product catalog)

**Resources:**
- Email sending limited to 100/day on current SendGrid plan (affects password reset testing)

**Dependencies:**
- Phase 2 complete (database models)
- Phase 1 complete (Next.js setup)
- SendGrid API key obtained (checkpoint for email features)

**Other:**
None
</constraints>

<risks>
## Risks and Mitigation

**Risk 1: JWT token size causing cookie overflow**
- **Likelihood:** Low
- **Impact:** High (authentication breaks)
- **Mitigation:** Keep JWT payload minimal (user ID only), store other data in database session table. Test with realistic tokens early.

**Risk 2: Session timing causing UX issues**
- **Likelihood:** Medium
- **Impact:** Medium (user frustration)
- **Mitigation:** Implement refresh token rotation, clear error messages on expiry, test user flows thoroughly.

**Risk 3: Password reset token security**
- **Likelihood:** Low
- **Impact:** High (account takeover)
- **Mitigation:** Use crypto.randomBytes(32) for tokens, short expiry (1 hour), single-use tokens, rate limiting on reset endpoint.
</risks>

<success_indicators>
## Success Indicators

**How we'll know this phase is complete:**

**Functional:**
- [ ] User can register with email/password
- [ ] User can login and receive JWT cookie
- [ ] Protected routes redirect unauthenticated users
- [ ] User can logout (cookie cleared)
- [ ] Password reset flow works end-to-end

**Quality:**
- [ ] No passwords stored in plaintext
- [ ] JWT tokens validated correctly
- [ ] Tests pass for all auth endpoints
- [ ] No TypeScript errors
- [ ] Test coverage >= 80% for auth code

**Deployment:**
- [ ] Auth endpoints deployed to staging
- [ ] Verified in staging environment
- [ ] Production environment variables configured

**Documentation:**
- [ ] API endpoints documented
- [ ] Authentication flow diagram added to README
- [ ] Environment variables documented

**User-facing:**
- [ ] Login/logout flows tested manually
- [ ] Error messages clear and helpful
- [ ] Password reset tested with real email
</success_indicators>

<codebase_context>
## Codebase State and Patterns

**Current state:**
Established codebase - Phase 2 complete with database models, Phase 1 has Next.js structure.

**Relevant files/systems:**
- `prisma/schema.prisma` - User model exists, need to add Session model
- `src/app/api/*` - API route conventions established in Phase 2
- `src/middleware.ts` - Next.js middleware file (create for protected routes)
- `src/lib/db.ts` - Database connection helper from Phase 2

**Patterns to follow:**
- API routes return JSON with `{ success: boolean, data?: any, error?: string }`
- Use Zod for request validation (established in Phase 2)
- Database queries in try/catch with error logging
- Tests colocated: `route.test.ts` next to `route.ts`

**External dependencies:**
- jose@5.2.0 - JWT library (decision from Phase 1)
- bcrypt@5.1.1 - Password hashing
- @sendgrid/mail - Email sending (need to add)
- zod@3.22.4 - Validation (already installed)

**Known issues to address:**
- ISS-002 from Phase 2: Add rate limiting to API endpoints (include auth endpoints)

**Prior decisions affecting this phase:**
- Phase 1: Use jose for JWT (ESM-native, Edge-compatible)
- Phase 2: API response format established (all endpoints must follow)
- Phase 2: Zod validation pattern established (use for auth requests)
</codebase_context>

<decisions_needed>
## Decisions That Will Affect Implementation

**Decision 1: Token expiry timing**
- **Context:** Balance security (short expiry) vs UX (avoid frequent re-login)
- **Options:** 15min access + 7day refresh / 1hr access + 30day refresh / 4hr access + 90day refresh
- **When to decide:** During planning (affects implementation)

**Decision 2: Remember me implementation**
- **Context:** How to handle "remember me" checkbox on login
- **Options:** Longer refresh token / Separate persistent token / Browser local storage flag
- **When to decide:** During task breakdown (affects token strategy)
</decisions_needed>

<notes>
## Additional Context

[Questions asked during intake:]
- Q: Are there constraints I should know about?
- A: Technical limitations - must use jose library, work in Edge runtime

- Q: What could go wrong in this phase?
- A: Security concerns - authentication vulnerabilities are critical

- Q: Which files or systems should I examine for context?
- A: Check prisma/schema.prisma for User model, src/app/api/* for API patterns

[Clarifications:]
- User stressed security is paramount - better to be overly cautious
- Password reset is "nice to have" but not blocking for Phase 4
- OAuth can wait - just email/password for now

[References:]
- OWASP Auth Cheatsheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- jose docs: https://github.com/panva/jose
</notes>

---

*Phase: 03-authentication*
*Context gathered: 2025-01-20*
*Ready for planning: yes*
```
</good_examples>

<guidelines>
**When to create:**
- Before planning a phase (via /gsd:discuss-phase command)
- When roadmap description is too brief for quality planning
- When phase involves complex decisions or risks

**Structure:**
- Use XML tags for section markers (matches GSD templates)
- Five core sections: objectives, constraints, risks, success_indicators, codebase_context
- Two supporting sections: decisions_needed, notes
- All sections required (use "None" if truly not applicable)

**Content quality:**
- Objectives: Specific and measurable (not "add auth" but "JWT auth with registration, login, logout, password reset")
- Constraints: Technical/timeline/resource specifics (not "be fast" but "must work in Edge runtime")
- Risks: Include likelihood, impact, mitigation (not just "might break")
- Success indicators: Checklist format, specific criteria
- Codebase context: Reference actual files and patterns
- Decisions needed: Note when decision should be made (planning vs execution)

**Out of scope:**
- Document what phase does NOT include (prevents scope creep)
- Reference deferred items from roadmap
- Note what's pushed to future phases

**Integration with planning:**
- CONTEXT.md loaded as @context reference in PLAN.md
- Decisions inform task breakdown
- Risks inform verification criteria
- Success indicators become plan success criteria
- Prior decisions become task action notes

**After creation:**
- File lives in phase directory: `.planning/phases/XX-name/{phase}-CONTEXT.md`
- Referenced during planning workflow
- Can be updated if context changes before planning
</guidelines>
