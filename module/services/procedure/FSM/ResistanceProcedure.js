import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";


export  default class ResistanceProcedure extends AbstractProcedure {
    constructor(procedure) {
        DEBUG && !(procedure instanceof AbstractProcedure) && LOG.error("Can only take procedure as arg", [(__FILE__, __LINE__, ResistanceProcedure.name)]);
    }
}
