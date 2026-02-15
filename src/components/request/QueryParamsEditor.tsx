import { useState, useMemo, useEffect } from 'react';
import type { ParamItem } from '../../types/request';
import { MdDelete, MdAdd } from 'react-icons/md';

interface QueryParamsEditorProps {
  params: ParamItem[];
  url: string;
  isUpdatingFromParams: boolean;
  onChange: (params: ParamItem[]) => void;
}

export function QueryParamsEditor({ params, url, isUpdatingFromParams, onChange }: QueryParamsEditorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  // Extract query parameters from URL
  const urlQueryParams = useMemo(() => {
    if (isUpdatingFromParams) return null; // Skip parsing when update came from params
    
    try {
      // Extract query string from URL
      const queryIndex = url.indexOf('?');
      if (queryIndex === -1) return [];
      
      const queryString = url.substring(queryIndex + 1);
      if (!queryString) return [];
      
      const params: ParamItem[] = [];
      const pairs = queryString.split('&');
      
      pairs.forEach(pair => {
        const [key, ...valueParts] = pair.split('=');
        const value = valueParts.join('='); // Handle values with = in them
        if (key) {
          params.push({ 
            key: decodeURIComponent(key), 
            value: value ? decodeURIComponent(value) : '', 
            enabled: true 
          });
        }
      });
      
      return params;
    } catch {
      return [];
    }
  }, [url, isUpdatingFromParams]);

  // Sync URL query params with state
  useEffect(() => {
    if (isUpdatingFromParams || urlQueryParams === null) return; // Skip if update came from params
    
    // Preserve disabled params when syncing from URL
    const disabledParams = params.filter(p => !p.enabled);
    
    // Merge URL params (all enabled) with disabled params
    const urlParamsKeys = new Set(urlQueryParams.map(p => p.key));
    const mergedParams = [
      ...urlQueryParams, // All params from URL (enabled)
      ...disabledParams.filter(p => !urlParamsKeys.has(p.key)) // Keep disabled params not in URL
    ];
    
    // Check if they're different
    const isDifferent = 
      mergedParams.length !== params.length ||
      mergedParams.some(mp => {
        const current = params.find(p => p.key === mp.key);
        return !current || current.value !== mp.value || current.enabled !== mp.enabled;
      });
    
    if (isDifferent) {
      onChange(mergedParams);
    }
  }, [urlQueryParams, isUpdatingFromParams]);
  const handleAdd = () => {
    onChange([...params, { key: '', value: '', enabled: true }]);
  };

  const handleRemove = (index: number) => {
    onChange(params.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ParamItem, value: string | boolean) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    onChange(newParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: 'key' | 'value') => {
    if (e.key === 'Tab' && !e.shiftKey && field === 'value' && index === params.length - 1) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Parameters</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        >
          <MdAdd className="w-4 h-4" />
          Add Parameter
        </button>
      </div>

      {params.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>No query parameters</p>
          <p className="text-xs mt-1">Click "Add Parameter" to add one</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 px-2">
            <div className="w-6"></div>
            <div>Key</div>
            <div>Value</div>
            <div className="w-8"></div>
          </div>
          {params.map((param, index) => (
            <div
              key={index}
              className={`grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center p-2 rounded transition-colors ${
                focusedIndex === index
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
                onChange={(e) => handleChange(index, 'key', e.target.value)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onKeyDown={(e) => handleKeyDown(e, index, 'key')}
                placeholder="Parameter key"
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onKeyDown={(e) => handleKeyDown(e, index, 'value')}
                placeholder="Parameter value"
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRemove(index);
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                aria-label="Remove parameter"
              >
                <MdDelete className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
