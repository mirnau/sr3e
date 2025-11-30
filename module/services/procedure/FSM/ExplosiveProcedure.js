import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import { localize } from "@services/utilities.js";

function RuntimeConfig() {
   return CONFIG?.sr3e || {};
}



export default class ExplosiveProcedure extends AbstractProcedure { }
