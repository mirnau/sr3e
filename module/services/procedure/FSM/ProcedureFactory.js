import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import FirearmProcedure from "@services/procedure/FSM/FirearmProcedure.js";

export function ProcedureFactory(actor, item = null, procedure = null, responsetype = null) {
    if(!(item instanceof Item)) {
        DEBUG && LOG.error("argument is not an instance of Item" [__FILE__, __LINE__]);
        return;
    }
    if(item) {
        if(item.type === "weapon") {
            const mode = item.system.mode
            if (mode === "semiauto" ||
                mode === "manual" ||
                mode === "burst" ||
                mode === "fullauto") {
                return new FirearmProcedure(actor, item);
            }
        } else if(
            mode === "blade" ||
            mode ==="blunt") {
            return new MeleeProcedure(actor, item) 
        } else if(
            mode === "explosive"
        ) {
            return new ExposiveProcedure(actor, item);
        }else {
        DEBUG && LOG.warn("Attack mode not implemented" [__FILE__, __LINE__]);
        }
        
    }

    if (procedure instanceof AbstractProcedure && responsetype === "dodge") {
        return new DodgeProcedure(procedure);
    }

     if (procedure instanceof AbstractProcedure && responsetype === "resist") {
        return new ResistanceProcedure(procedure)
    }
}


export class MeleeProcedure extends AbstractProcedure {}
export class ExposiveProcedure extends AbstractProcedure {}

export class DodgeProcedure extends AbstractProcedure {
    constructor(procedure) {
        DEBUG && !(procedure instanceof AbstractProcedure) && LOG.error("Can only take procedure as arg", [(__FILE__, __LINE__, DodgeProcedure.name)]);
    }
}
export class ResistanceProcedure extends AbstractProcedure {
    constructor(procedure) {
        DEBUG && !(procedure instanceof AbstractProcedure) && LOG.error("Can only take procedure as arg", [(__FILE__, __LINE__, ResistanceProcedure.name)]);
    }
}

// When an item has no target, it regresses to an uncontested roll
// Uncontested advanced rolling using shift
export class UncontestedSkillProcedure extends AbstractProcedure {
}

export class UncontestedAttributeProcedure extends AbstractProcedure {
}
