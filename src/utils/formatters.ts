// Detect content type from headers or body
export function detectContentType(
  headers: Record<string, string> | Array<{ key: string; value: string }>,
  body: string
): 'json' | 'xml' | 'html' | 'text' {
  // Convert array headers to object if needed
  const headerObj: Record<string, string> = Array.isArray(headers)
    ? headers.reduce((acc, h) => ({ ...acc, [h.key.toLowerCase()]: h.value }), {} as Record<string, string>)
    : Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));

  const contentType = headerObj['content-type'] || '';

  if (contentType.includes('application/json')) {
    return 'json';
  }
  if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
    return 'xml';
  }
  if (contentType.includes('text/html')) {
    return 'html';
  }

  // Try to detect from body content
  if (body) {
    const trimmed = body.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(body);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      return trimmed.includes('<!DOCTYPE html') || trimmed.includes('<html') ? 'html' : 'xml';
    }
  }

  return 'text';
}

// Get HTTP status category color
export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
  if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400';
  if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
  if (status >= 500) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

// Get HTTP method color
export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'bg-method-get text-white',
    POST: 'bg-method-post text-white',
    PUT: 'bg-method-put text-white',
    PATCH: 'bg-method-patch text-white',
    DELETE: 'bg-method-delete text-white',
  };
  return colors[method.toUpperCase()] || 'bg-gray-500 text-white';
}

// Format duration
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}
