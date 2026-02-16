import React, { createContext, useContext, useState, useCallback } from 'react';
import type { RequestDetails, WorkingRequest, UpdateRequestPayload } from '../types/request';
import type { ExecutionResponse } from '../types/response';
import { apiService } from '../services/api';
import { useToast } from './ToastContext';
import { extractValues } from '../utils/jsonExtractor';
import { useEnvironment } from './EnvironmentContext';

interface RequestContextType {
  selectedItem: RequestDetails | null;
  selectedItemId: number | null;
  selectItem: (id: number) => Promise<void>;
  clearSelection: () => void;
  isExecuting: boolean;
  responseData: ExecutionResponse | null;
  executeRequest: (workingCopy: WorkingRequest) => Promise<void>;
  clearResponse: () => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  handleSave: (updateData: UpdateRequestPayload) => Promise<void>;
  workingCopy: WorkingRequest | null;
  setWorkingCopy: (workingCopy: WorkingRequest | null) => void;
  saveWorkingCopy: () => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<RequestDetails | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseData, setResponseData] = useState<ExecutionResponse | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [workingCopy, setWorkingCopy] = useState<WorkingRequest | null>(null);
  const { showToast } = useToast();
  const { currentEnvironment, updateEnvironmentVariables } = useEnvironment();

  // Select an item and fetch its details
  const selectItem = useCallback(async (id: number) => {
    setSelectedItemId(id);
    try {
      const details = await apiService.getItemDetails(id);
      setSelectedItem(details);
      setIsDirty(false);
      // Clear previous response when selecting new item
      setResponseData(null);
    } catch (error: any) {
      const message = error.userMessage || 'Failed to load item details';
      showToast(message, 'error');
      setSelectedItem(null);
    }
  }, [showToast]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItem(null);
    setSelectedItemId(null);
    setResponseData(null);
    setIsDirty(false);
  }, []);

  // Execute request with working copy
  const executeRequest = useCallback(async (workingCopy: WorkingRequest) => {
    if (!workingCopy.id) {
      showToast('No request selected', 'error');
      return;
    }

    setIsExecuting(true);
    setResponseData(null);

    try {
      // Prepare request payload
      const payload: UpdateRequestPayload = {
        name: workingCopy.name,
        method: workingCopy.method,
        url: workingCopy.url,
        headers: workingCopy.headers,
        body: workingCopy.body,
        query_params: workingCopy.query_params,
        path_params: workingCopy.path_params,
        extraction_rules: workingCopy.extraction_rules,
      };

      let response: ExecutionResponse;

      // Check if URL targets localhost/private IP
      const { agentService } = await import('../services/agentService');

      if (agentService.isLocalUrl(workingCopy.url)) {
        // Check if agent is running
        const isAgentRunning = await agentService.checkHealth();

        if (!isAgentRunning) {
          // We can't prompt the modal directly from here easily without adding more state to context or firing an event.
          // For now, we'll show a toast with a clear action message.
          // Ideally, we could expose a way to open the modal via context, but let's stick to the plan of "Show error/prompt".
          throw new Error('Local Agent is not running. Please download and start the agent to make localhost requests.');
        }

        response = await agentService.executeRequest(payload);
      } else {
        response = await apiService.executeRequest(workingCopy.id, payload);
      }

      setResponseData(response);

      // Auto-token extraction logic (only for successful responses)
      if (workingCopy.extraction_rules && workingCopy.extraction_rules.some(rule => rule.enabled)) {
        if (response.status >= 200 && response.status < 300) {
          try {
            const jsonBody = JSON.parse(response.body);
            const enabledRules = workingCopy.extraction_rules.filter(rule => rule.enabled);
            const extracted = extractValues(jsonBody, enabledRules);
            if (extracted && Object.keys(extracted).length > 0 && currentEnvironment) {
              await updateEnvironmentVariables(currentEnvironment.id, extracted);
              showToast(`Extracted ${Object.keys(extracted).length} variable(s) to environment`, 'success');
            }
          } catch (error) {
            // Gracefully handle parsing or extraction errors without failing the request
          }
        }
      }

      showToast('Request executed successfully', 'success');
    } catch (error: any) {
      const message = error.userMessage || error.message || 'Failed to execute request';
      showToast(message, 'error');

      // If we have error response data, show it
      if (error.response?.data) {
        setResponseData({
          status: error.response.status || 500,
          headers: {},
          body: JSON.stringify(error.response.data, null, 2),
          duration_ms: 0,
        });
      }
    } finally {
      setIsExecuting(false);
    }
  }, [showToast, currentEnvironment, updateEnvironmentVariables]);

  // Clear response
  const clearResponse = useCallback(() => {
    setResponseData(null);
  }, []);

  // Handle save request
  const handleSave = useCallback(async (updateData: UpdateRequestPayload) => {
    if (!selectedItem || selectedItem.item_type !== 'request') {
      showToast('No request selected', 'error');
      return;
    }

    try {
      console.log('PUT request body:', updateData);
      await apiService.updateRequest(selectedItem.id, updateData);
      // Refresh the selected item to get updated data
      const details = await apiService.getItemDetails(selectedItem.id);
      setSelectedItem(details);
      setIsDirty(false);
      showToast('Request saved successfully', 'success');
    } catch (error: any) {
      const message = error.userMessage || 'Failed to save request';
      showToast(message, 'error');
      throw error;
    }
  }, [selectedItem, showToast]);

  // Save the current working copy
  const saveWorkingCopy = useCallback(async () => {
    if (!workingCopy) {
      showToast('No working copy to save', 'error');
      return;
    }

    const payload: UpdateRequestPayload = {
      name: workingCopy.name,
      method: workingCopy.method,
      url: workingCopy.url,
      headers: workingCopy.headers,
      body: workingCopy.body,
      query_params: workingCopy.query_params,
      path_params: workingCopy.path_params,
      extraction_rules: workingCopy.extraction_rules,
    };

    await handleSave(payload);
  }, [workingCopy, handleSave, showToast]);

  return (
    <RequestContext.Provider
      value={{
        selectedItem,
        selectedItemId,
        selectItem,
        clearSelection,
        isExecuting,
        responseData,
        executeRequest,
        clearResponse,
        isDirty,
        setIsDirty,
        handleSave,
        workingCopy,
        setWorkingCopy,
        saveWorkingCopy,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequest() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequest must be used within RequestProvider');
  }
  return context;
}
