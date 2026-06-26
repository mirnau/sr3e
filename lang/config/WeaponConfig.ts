export const WEAPON_KEYS = [
  "weapon", "weaponStats", "damage", "damageType", "mode", "ammunitionClass",
  "range", "recoilCompensation", "reloadMechanism",
  "rangeband", "rangebandshort", "rangebandmedium", "rangebandlong", "rangebandextreme",
] as const;

export const COMMODITY_KEYS = [
  "commodity", "days", "cost", "streetIndex", "isBroken",
  "legalstatus", "legalpermit", "legalenforcementpriority",
] as const;

export const PORTABILITY_KEYS = [
  "portability", "concealability", "weight",
] as const;

export const WEAPON_MODE_KEYS = [
  "manual", "semiauto", "burst", "fullauto", "blade", "explosive", "energy", "blunt",
] as const;

export const RELOAD_MECHANISM_KEYS = ["c", "b", "m", "cy", "belt"] as const;

export const AMMO_CLASS_KEYS = [
  "holdout", "lightPistol", "heavyPistol", "smg", "shotgun", "assaultRifle",
  "sportingRifle", "sniperRifle", "lmg", "mmg", "hmg", "assaultCannon",
  "grenadeLauncher", "missileLauncher", "taser", "bow", "crossbow",
] as const;

export const DAMAGE_TYPE_KEYS = [
  "l", "m", "s", "d", "lStun", "mStun", "sStun", "dStun",
] as const;

export const LEGAL_STATUS_KEYS = ["L", "R", "I"] as const;
export const LEGAL_PERMIT_KEYS = ["1", "2", "3", "4", "N"] as const;
export const LEGAL_PRIORITY_KEYS = ["1", "2", "3", "4", "X"] as const;

export const ITEM_TYPE_KEYS = [
  "metatype", "magic", "weapon", "ammunition", "skill", "transaction",
  "wearable", "techinterface", "spell", "focus", "gadget",
] as const;
