import { ATTRIBUTES_KEYS, CREATION_KEYS, DICE_POOLS_KEYS, HEALTH_KEYS, KARMA_KEYS, MOVEMENT_KEYS, PROFILE_KEYS } from "./config/AttributeComponentsConfig";
import { CHARACTER_KEYS } from "./config/ActorConfig";
import { METATYPE_KEYS } from "./config/MetaTypeConfig";
import { COMMON_KEYS } from "./config/CommonConfig";

const SYSTEM_NAMESPACE = "sr3e";

function createI18nMapping<T extends readonly string[]>(
  namespace: string,
  keys: T
): Record<T[number], string> {
  return Object.fromEntries(
    keys.map(k => [k, `${namespace}.${k}`])
  ) as Record<T[number], string>;
}

export function createCategory<T extends readonly string[]>(category: string, keys: T) {
  const namespace = `${SYSTEM_NAMESPACE}.${category}`;
  return createI18nMapping(namespace, keys);
}

export const sr3e = {
  ATTRIBUTES: createCategory("attributes", ATTRIBUTES_KEYS),
  CHARACHTER: createCategory("character", CHARACTER_KEYS),
  CREATION: createCategory("creation", CREATION_KEYS),
  COMMON: createCategory("common", COMMON_KEYS),
  DICE_POOLS: createCategory("dicePools", DICE_POOLS_KEYS),
  HEALTH: createCategory("health", HEALTH_KEYS),
  KARMA: createCategory("karma", KARMA_KEYS),
  MOVEMENT: createCategory("movement", MOVEMENT_KEYS),
  PROFILE: createCategory("profile", PROFILE_KEYS),
  METATYPE:createCategory("metatype", METATYPE_KEYS)
} as const;

export type localizations = typeof sr3e;
