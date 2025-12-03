const SYSTEM_NAMESPACE = "sr3e";

// A generic function that generates a mapping object from a list of keys
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