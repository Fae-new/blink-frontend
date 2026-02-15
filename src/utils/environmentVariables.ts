import type { EnvironmentVariable } from '../types/environment';

// Replace {{variable}} with actual values from environment
export function substituteVariables(
  text: string,
  variables: EnvironmentVariable
): string {
  if (!text || !variables) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return variables[variableName] !== undefined ? variables[variableName] : match;
  });
}

// Find all {{variable}} references in text
export function findVariableReferences(text: string): string[] {
  if (!text) return [];
  
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  return Array.from(matches, m => m[1]);
}

// Find undefined variables in text
export function findUndefinedVariables(
  text: string,
  variables: EnvironmentVariable
): string[] {
  const references = findVariableReferences(text);
  return references.filter(varName => variables[varName] === undefined);
}

// Find all undefined variables in request
export function findAllUndefinedVariables(
  url: string,
  headers: Array<{ key: string; value: string; enabled: boolean }>,
  body: string,
  variables: EnvironmentVariable
): string[] {
  const undefinedVars = new Set<string>();
  
  // Check URL
  findUndefinedVariables(url, variables).forEach(v => undefinedVars.add(v));
  
  // Check headers
  headers.forEach(header => {
    if (header.enabled) {
      findUndefinedVariables(header.key, variables).forEach(v => undefinedVars.add(v));
      findUndefinedVariables(header.value, variables).forEach(v => undefinedVars.add(v));
    }
  });
  
  // Check body
  findUndefinedVariables(body, variables).forEach(v => undefinedVars.add(v));
  
  return Array.from(undefinedVars);
}

// Check if text contains any variable references
export function hasVariableReferences(text: string): boolean {
  return /\{\{(\w+)\}\}/.test(text);
}

// Substitute variables in headers array
export function substituteHeaderVariables(
  headers: Array<{ key: string; value: string; enabled: boolean }>,
  variables: EnvironmentVariable
): Array<{ key: string; value: string; enabled: boolean }> {
  return headers.map(header => ({
    ...header,
    key: substituteVariables(header.key, variables),
    value: substituteVariables(header.value, variables),
  }));
}
