import { stageForBoxes, type DamageStep } from "./damageMath";

export type VehicleConditionStage = "light" | "moderate" | "serious" | "destroyed";

const STAGE_BY_STEP: Record<DamageStep, VehicleConditionStage> = {
    l: "light",
    m: "moderate",
    s: "serious",
    d: "destroyed",
};

export function vehicleConditionStage(boxesFilled: number): VehicleConditionStage | null {
    const step = stageForBoxes(boxesFilled);
    return step ? STAGE_BY_STEP[step] : null;
}

export function vehicleConditionStageLabelKey(stage: VehicleConditionStage): string {
    return `condition${stage.charAt(0).toUpperCase()}${stage.slice(1)}`;
}

export function vehicleConditionRulesKey(stage: VehicleConditionStage): string {
    return `${vehicleConditionStageLabelKey(stage)}Rules`;
}
