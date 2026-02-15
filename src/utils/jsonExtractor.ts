import type { ExtractionRule, EnvironmentVariable } from '../types/environment';

/**
 * Extracts a value from a JSON object using a dot notation path.
 * @param json - The JSON object to extract from.
 * @param path - The dot notation path (e.g., "data.token").
 * @returns The extracted value or null if the path is invalid.
 */
export function extractFromJson(json: any, path: string): any {
  if (!json || typeof json !== 'object') {
    return null;
  }
  const keys = path.split('.');
  let current = json;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }
  return current;
}

/**
 * Extracts values from JSON using extraction rules.
 * @param json - The JSON object to extract from.
 * @param rules - Array of extraction rules.
 * @returns A record of extracted values.
 */
export function extractValues(json: any, rules: ExtractionRule[]): EnvironmentVariable {
  const extracted: EnvironmentVariable = {};
  
  for (const rule of rules) {
    if (rule.enabled) {
      const value = extractFromJson(json, rule.jsonPath);
      if (value !== null && value !== undefined) {
        extracted[rule.variableName] = String(value);
      }
    }
  }
  
  return extracted;
}
