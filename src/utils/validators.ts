// URL validation
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }
  
  // Allow URLs with environment variables (e.g., {{baseurl}}/path)
  // Replace variables with placeholder for validation
  const urlWithoutVars = url.replace(/\{\{[^}]+\}\}/g, 'http://placeholder');
  
  try {
    new URL(urlWithoutVars);
    return true;
  } catch {
    // If it starts with {{ variable, it might be valid after substitution
    if (url.trim().startsWith('{{')) {
      return true;
    }
    return false;
  }
}

// JSON validation
export function isValidJson(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim() === '') {
    return { valid: true }; // Empty is valid
  }
  
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    return { valid: false, error: errorMessage };
  }
}

// Format JSON with indentation
export function formatJson(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

// Header validation
export function isValidHeader(key: string, value: string): boolean {
  // Warn if empty key with non-empty value
  if (!key.trim() && value.trim()) {
    return false;
  }
  return true;
}

// Check for duplicate header keys
export function hasDuplicateHeaders(headers: Array<{ key: string; value: string }>): string[] {
  const keys = headers
    .filter(h => h.key.trim())
    .map(h => h.key.toLowerCase());
  
  const duplicates: string[] = [];
  const seen = new Set<string>();
  
  for (const key of keys) {
    if (seen.has(key) && !duplicates.includes(key)) {
      duplicates.push(key);
    }
    seen.add(key);
  }
  
  return duplicates;
}
