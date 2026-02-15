import { useState, useEffect } from 'react';
import { useRequest } from '../../contexts/RequestContext';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import type { WorkingRequest, HeaderItem, ParamItem } from '../../types/request';
import { MethodSelector } from './MethodSelector';
import { URLInput } from './URLInput';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditor } from './BodyEditor';
import { ExtractionEditor } from './ExtractionEditor';
import { QueryParamsEditor } from './QueryParamsEditor';
import { PathParamsEditor } from './PathParamsEditor';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';
import { MdPlayArrow, MdWarning } from 'react-icons/md';
import { isValidUrl } from '../../utils/validators';
import { substituteVariables, substituteHeaderVariables, findAllUndefinedVariables } from '../../utils/environmentVariables';

export function RequestEditor() {
  const { currentEnvironment } = useEnvironment();
  const { selectedItem, isExecuting, executeRequest, selectItem, setIsDirty, handleSave: contextHandleSave, workingCopy, setWorkingCopy } = useRequest();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'query' | 'path' | 'extract'>('body');
  const [isUpdatingFromParams, setIsUpdatingFromParams] = useState(false);

  // Build URL with query params
  const buildUrlWithQueryParams = (baseUrl: string, queryParams: ParamItem[]) => {
    try {
      const [urlWithoutQuery] = baseUrl.split('?');
      const enabledParams = queryParams.filter(p => p.enabled && p.key);

      if (enabledParams.length === 0) {
        return urlWithoutQuery;
      }

      const queryString = enabledParams
        .map(p => {
          const key = encodeURIComponent(p.key);
          const value = p.value ? encodeURIComponent(p.value) : '';
          return value ? `${key}=${value}` : key;
        })
        .join('&');

      return `${urlWithoutQuery}?${queryString}`;
    } catch {
      return baseUrl;
    }
  };

  // Update URL when query params change
  const handleQueryParamsChange = (query_params: ParamItem[]) => {
    if (!workingCopy) return;

    setIsUpdatingFromParams(true);
    const newUrl = buildUrlWithQueryParams(workingCopy.url, query_params);
    setWorkingCopy({ ...workingCopy, query_params, url: newUrl });
    setTimeout(() => setIsUpdatingFromParams(false), 0);
  };

  // Initialize working copy when item is selected
  useEffect(() => {
    if (selectedItem && selectedItem.item_type === 'request') {
      const headers: HeaderItem[] = selectedItem.headers || [];
      setWorkingCopy({
        id: selectedItem.id,
        name: selectedItem.name,
        method: selectedItem.method,
        url: selectedItem.url,
        headers,
        body: selectedItem.body || '',
        query_params: selectedItem.query_params || [],
        path_params: selectedItem.path_params || [],
        extraction_rules: selectedItem.extraction_rules || [],
      });
      setIsDirty(false);
    } else {
      setWorkingCopy(null);
      setIsDirty(false);
    }
  }, [selectedItem, setWorkingCopy, setIsDirty]);

  // Check for changes
  useEffect(() => {
    if (!workingCopy || !selectedItem) {
      setIsDirty(false);
      return;
    }

    const hasChanges =
      workingCopy.name !== selectedItem.name ||
      workingCopy.method !== selectedItem.method ||
      workingCopy.url !== selectedItem.url ||
      workingCopy.body !== (selectedItem.body || '') ||
      JSON.stringify(workingCopy.headers) !== JSON.stringify(selectedItem.headers || []) ||
      JSON.stringify(workingCopy.query_params) !== JSON.stringify(selectedItem.query_params || []) ||
      JSON.stringify(workingCopy.path_params) !== JSON.stringify(selectedItem.path_params || []) ||
      JSON.stringify(workingCopy.extraction_rules) !== JSON.stringify(selectedItem.extraction_rules || []);

    setIsDirty(hasChanges);
  }, [workingCopy, selectedItem]);

  const handleSave = async () => {
    if (!workingCopy) return;

    // Only send serializable fields
    const payload = {
      name: String(workingCopy.name),
      method: workingCopy.method,
      url: String(workingCopy.url),
      headers: Array.isArray(workingCopy.headers) ? workingCopy.headers.map(h => ({
        key: String(h.key),
        value: String(h.value),
        enabled: Boolean(h.enabled),
      })) : [],
      body: String(workingCopy.body),
      query_params: Array.isArray(workingCopy.query_params) ? workingCopy.query_params.map(p => ({
        key: String(p.key),
        value: String(p.value),
        enabled: Boolean(p.enabled),
      })) : [],
      path_params: Array.isArray(workingCopy.path_params) ? workingCopy.path_params.map(p => ({
        key: String(p.key),
        value: String(p.value),
        enabled: Boolean(p.enabled),
      })) : [],
      extraction_rules: Array.isArray(workingCopy.extraction_rules) ? JSON.parse(JSON.stringify(workingCopy.extraction_rules)) : [],
    };

    try {
      await contextHandleSave(payload);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleRun = async () => {
    if (!workingCopy) return;

    // Apply environment variable substitution before executing
    const substitutedRequest: WorkingRequest = {
      id: workingCopy.id,
      name: workingCopy.name,
      method: workingCopy.method,
      url: substituteVariables(workingCopy.url, variables),
      headers: substituteHeaderVariables(workingCopy.headers, variables),
      body: substituteVariables(workingCopy.body, variables),
      query_params: workingCopy.query_params,
      path_params: workingCopy.path_params,
      extraction_rules: workingCopy.extraction_rules,
    };

    await executeRequest(substitutedRequest);
  };

  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">Select a request to start</p>
          <p className="text-sm">Choose a request from the sidebar</p>
        </div>
      </div>
    );
  }

  if (selectedItem.item_type === 'folder') {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">Cannot execute folders</p>
          <p className="text-sm">Please select a request instead</p>
        </div>
      </div>
    );
  }

  if (!workingCopy) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const urlValid = isValidUrl(workingCopy.url);

  // Check for undefined environment variables
  const variables = currentEnvironment?.variables || {};
  const undefinedVars = findAllUndefinedVariables(
    workingCopy.url,
    workingCopy.headers,
    workingCopy.body,
    variables
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Method and URL Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 mb-2">
          <MethodSelector
            value={workingCopy.method}
            onChange={(method) => setWorkingCopy({ ...workingCopy, method })}
          />
          <URLInput
            value={workingCopy.url}
            onChange={(url) => setWorkingCopy({ ...workingCopy, url })}
            isValid={urlValid}
          />
          <Button
            variant="primary"
            onClick={handleRun}
            disabled={isExecuting || !urlValid || undefinedVars.length > 0}
            className="px-3"
            aria-label="Send request"
          >
            {isExecuting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <MdPlayArrow className="w-5 h-5" />
            )}
          </Button>
        </div>
        {undefinedVars.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm">
            <MdWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-amber-700 dark:text-amber-300">
              Undefined variables: <span className="font-mono font-semibold">{undefinedVars.map(v => `{{${v}}}`).join(', ')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('query')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'query'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Query Params {workingCopy.query_params.filter(p => p.enabled && p.key).length > 0 &&
            <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {workingCopy.query_params.filter(p => p.enabled && p.key).length}
            </span>
          }
        </button>
        <button
          onClick={() => setActiveTab('path')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'path'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Path Params {workingCopy.path_params.filter(p => p.enabled && p.key).length > 0 &&
            <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {workingCopy.path_params.filter(p => p.enabled && p.key).length}
            </span>
          }
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'headers'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Headers {workingCopy.headers.filter(h => h.enabled && h.key).length > 0 &&
            <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {workingCopy.headers.filter(h => h.enabled && h.key).length}
            </span>
          }
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'body'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('extract')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'extract'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Extract
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'query' ? (
          <div className="p-3 h-full overflow-auto">
            <QueryParamsEditor
              params={workingCopy.query_params}
              url={workingCopy.url}
              isUpdatingFromParams={isUpdatingFromParams}
              onChange={handleQueryParamsChange}
            />
          </div>
        ) : activeTab === 'path' ? (
          <div className="p-3 h-full overflow-auto">
            <PathParamsEditor
              params={workingCopy.path_params}
              url={workingCopy.url}
              onChange={(path_params) => setWorkingCopy({ ...workingCopy, path_params })}
            />
          </div>
        ) : activeTab === 'headers' ? (
          <div className="p-3 h-full overflow-auto">
            <HeadersEditor
              headers={workingCopy.headers}
              onChange={(headers) => setWorkingCopy({ ...workingCopy, headers })}
            />
          </div>
        ) : activeTab === 'extract' ? (
          <div className="p-3 h-full overflow-auto">
            <ExtractionEditor
              extractionRules={workingCopy.extraction_rules}
              onChange={(extraction_rules) => setWorkingCopy({ ...workingCopy, extraction_rules })}
            />
          </div>
        ) : (
          <div className="p-3 h-full overflow-auto">
            <BodyEditor
              value={workingCopy.body}
              onChange={(body) => setWorkingCopy({ ...workingCopy, body })}
            />
          </div>
        )}
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={async () => {
          await handleSave();
          setShowUnsavedModal(false);
          if (pendingItemId) {
            selectItem(pendingItemId);
            setPendingItemId(null);
          }
        }}
        onDiscard={() => {
          setShowUnsavedModal(false);
          setIsDirty(false);
          if (pendingItemId) {
            selectItem(pendingItemId);
            setPendingItemId(null);
          }
        }}
        onCancel={() => {
          setShowUnsavedModal(false);
          setPendingItemId(null);
        }}
      />
    </div>
  );
}

// Export isDirty state for header component
export function useRequestEditorState() {
  const { selectedItem } = useRequest();
  return {
    requestName: selectedItem?.item_type === 'request' ? selectedItem.name : '',
  };
}
