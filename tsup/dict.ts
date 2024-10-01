type KeyValuePair<K extends string, V> = [K, V];

export const dict = <K extends string, V>(arr: KeyValuePair<K, V>[]): Record<K, V> => Object.fromEntries(arr) as Record<K, V>;

