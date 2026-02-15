import { useState, useMemo } from 'react';
import type { ParamItem } from '../../types/request';
import { MdInfo } from 'react-icons/md';

interface PathParamsEditorProps {
  params: ParamItem[];
  url: string;
  onChange: (params: ParamItem[]) => void;
}

export function PathParamsEditor({ params, url, onChange }: PathParamsEditorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Extract path parameter names from URL (e.g., /users/:id/posts/:postId)
  const pathParamNames = useMemo(() => {
    const matches = url.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
    if (!matches) return [];
    return matches.map(match => match.substring(1)); // Remove the ':' prefix
  }, [url]);

  // Sync params with URL path params
  useMemo(() => {
    const currentKeys = params.map(p => p.key);
    const needsUpdate =
      pathParamNames.length !== params.length ||
      pathParamNames.some(name => !currentKeys.includes(name));

    if (needsUpdate) {
      const newParams: ParamItem[] = pathParamNames.map(name => {
        const existing = params.find(p => p.key === name);
        return existing || { key: name, value: '', enabled: true };
      });
      onChange(newParams);
    }
  }, [pathParamNames]);

  const handleChange = (index: number, field: keyof ParamItem, value: string | boolean) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    onChange(newParams);
  };

  if (pathParamNames.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Path Parameters</h3>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          <MdInfo className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No path parameters in URL</p>
          <p className="text-xs mt-1">Use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">:paramName</code> syntax in the URL</p>
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Example: /users/:id/posts/:postId</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Path Parameters</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {pathParamNames.length} parameter{pathParamNames.length !== 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 px-2">
          <div className="w-6"></div>
          <div>Key</div>
          <div>Value</div>
        </div>
        {params.map((param, index) => (
          <div
            key={index}
            className={`grid grid-cols-[auto_1fr_1fr] gap-2 items-center p-2 rounded transition-colors ${focusedIndex === index
                ? 'bg-blue-50 dark:bg-blue-900/10'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
          >
            <input
              type="checkbox"
              checked={param.enabled}
              onChange={(e) => handleChange(index, 'enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={param.key}
              readOnly
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm cursor-not-allowed"
              title="Path parameter keys are automatically detected from the URL"
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              placeholder={`Value for :${param.key}`}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
