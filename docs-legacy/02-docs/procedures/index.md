---
title: Procedures
parent: Documentation
nav_order: 2
has_children: true
---

# Procedures

Procedures are the system’s way of formalizing rolls that are more than a single die check.  
They provide a consistent sequence for how complex rolls are set up, executed, and resolved.

The main reasons for using Procedures are:

-  **Opposed rolls**: Procedures enforce that opposed rolls are carried out in a specific, rule-correct order. Attacker and defender contributions are processed in turn, and the final outcome is published in a predictable way.
-  **Advanced rolls**: Anything that passes through the `RollComposer` component—rolls with target numbers, modifiers, dice pool logic, and explosion caps—needs more structure than a single function call. Procedures provide that structure.
-  **Outcome publishing**: By running through a Procedure, results are surfaced consistently to the rest of the system (for example, updating health, initiative, or logging results).

Internally, each Procedure is **state-machine inspired**. They move through well-defined stages—such as setup, roll assembly, resolution, and outcome publishing.

### Design notes: why an abstract base?

We model procedures with an abstract base class (**AbstractProcedure**) and concrete subclasses.

-  **Substitutability (LSP).** Callers keep a reference to AbstractProcedure. Any concrete procedure must be usable in its place without changing caller behavior. Concretely: do not strengthen preconditions, do not weaken postconditions, and preserve base invariants and events.
-  **Extension (OCP).** New procedures are added by subclassing; orchestration code and consumers are not edited to “know” about each new type.
-  **Inversion (DIP).** Factories and controllers depend on AbstractProcedure. Concrete types are resolved at runtime and returned as the abstraction.

Implementation pattern: **Template Method** + **state-machine-inspired flow**. The abstract base defines the sequence (setup → compose roll → apply modifiers → resolve → publish outcome) and exposes overridable hooks for each stage. Concrete procedures override hooks, not the orchestration.
