export type EffectAlgorithmKey =
    | "attributeModPerTwo"
    | "tnPerSuccess"
    | "tnPerSuccessCapped8"
    | "tnPerTwoSuccesses"
    | "barrierStep"
    | "levitateSpeed"
    | "magicFingers"
    | "detectionRange"
    | "permanentTimeDivisor";

export type EffectMagnitudeInput = {
    force: number;
    successes: number;
    magic: number;
    baseTimeTurns?: number;
};

export function attributeModPerTwo({ force, successes }: EffectMagnitudeInput): number {
    return Math.min(force, Math.floor(successes / 2));
}

export function tnPerSuccess({ force, successes }: EffectMagnitudeInput): number {
    return Math.min(force, successes);
}

export function tnPerSuccessCapped8({ force, successes }: EffectMagnitudeInput): number {
    return Math.min(successes, 8, force);
}

export function tnPerTwoSuccesses({ force, successes }: EffectMagnitudeInput): number {
    return Math.min(force, Math.floor(successes / 2));
}

export function barrierStep({ force, successes }: EffectMagnitudeInput): number {
    if (successes < 1) return 0;
    return force + Math.floor((successes - 1) / 2);
}

export function levitateSpeed({ force, successes, magic }: EffectMagnitudeInput): number {
    return magic * Math.min(successes, force);
}

export function magicFingers({ force, successes }: EffectMagnitudeInput): number {
    return Math.min(successes, force);
}

export function detectionRange({ force, magic }: EffectMagnitudeInput): number {
    return force * magic;
}

export function permanentTimeDivisor({ successes, baseTimeTurns }: EffectMagnitudeInput): number {
    return (baseTimeTurns ?? 0) / Math.max(1, successes);
}

const ALGORITHMS: Record<EffectAlgorithmKey, (input: EffectMagnitudeInput) => number> = {
    attributeModPerTwo,
    tnPerSuccess,
    tnPerSuccessCapped8,
    tnPerTwoSuccesses,
    barrierStep,
    levitateSpeed,
    magicFingers,
    detectionRange,
    permanentTimeDivisor,
};

export function computeEffectMagnitude(key: EffectAlgorithmKey, input: EffectMagnitudeInput): number {
    return ALGORITHMS[key](input);
}
