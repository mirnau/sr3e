import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";

// When an item has no target, it regresses to an uncontested roll
// Uncontested advanced rolling using shift

export default class UncontestedSkillProcedure extends AbstractProcedure {}
