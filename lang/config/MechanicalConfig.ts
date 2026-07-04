export const MECHANICAL_KEYS = [
  "mechanical", "category", "power", "vehicleType", "handling",
  "handlingRoad", "handlingOffRoad", "currentSpeed", "speedRating", "maxSpeed", "speedStall", "accel",
  "body", "armor", "signature", "autonav", "pilot", "sensor",
  "electronicWarfare", "ecm", "eccm", "flux",
  "cargo", "load", "speedTurbo", "accelTurbo", "seating",
  "entryPoints", "setupBreakdownMinutes", "landingTakeoff",
  "riggerAdaptation", "remoteControlInterface", "performance",
  "capacity", "droneOps", "mountsTitle", "firmpoints",
  "hardpoints", "turrets", "externalFixed", "internalFixed",
  "pintles", "miniTurrets",
  "condition", "conditionLight", "conditionModerate", "conditionSerious", "conditionDestroyed",
  "conditionLightRules", "conditionModerateRules", "conditionSeriousRules", "conditionDestroyedRules",
  "hardpoint", "firmpoint", "upgrades", "journal",
] as const;

export const VEHICLE_TYPE_KEYS = [
  "ground", "marine", "aviation",
] as const;

export const MECHANICAL_CATEGORY_KEYS = [
  "car", "truck", "bike", "hovercraft", "boat", "ship",
  "submarine", "fixedWing", "rotor", "vectoredThrust",
  "lta", "security", "military", "tBird", "drone",
] as const;

export const POWER_SOURCE_KEYS = [
  "electric", "petrochem", "methanol", "fusion", "sail", "other",
] as const;

export const LANDING_TAKEOFF_KEYS = [
  "VTOL", "VSTOL", "Runway", "LaunchRecovery",
] as const;
