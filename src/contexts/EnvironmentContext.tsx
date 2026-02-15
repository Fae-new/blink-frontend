import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Environment, CreateEnvironmentPayload, UpdateEnvironmentPayload, EnvironmentVariable } from '../types/environment';
import { apiService } from '../services/api';
import { useToast } from './ToastContext';

interface EnvironmentContextType {
  environments: Environment[];
  currentEnvironment: Environment | null;
  currentEnvironmentId: number | null;
  loading: boolean;
  fetchEnvironments: () => Promise<void>;
  selectEnvironment: (id: number | null) => void;
  createEnvironment: (data: CreateEnvironmentPayload) => Promise<void>;
  updateEnvironment: (id: number, data: UpdateEnvironmentPayload) => Promise<void>;
  deleteEnvironment: (id: number) => Promise<void>;
  updateEnvironmentVariables: (id: number, variables: EnvironmentVariable) => Promise<void>;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [currentEnvironmentId, setCurrentEnvironmentId] = useState<number | null>(null);
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Fetch all environments
  const fetchEnvironments = useCallback(async () => {
    setLoading(true);
    try {
      const envs = await apiService.getEnvironments();
      setEnvironments(envs);
    } catch (error: any) {
      const message = error.userMessage || 'Failed to fetch environments';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Select an environment
  const selectEnvironment = useCallback((id: number | null) => {
    setCurrentEnvironmentId(id);
    if (id) {
      localStorage.setItem('currentEnvironmentId', id.toString());
    } else {
      localStorage.removeItem('currentEnvironmentId');
      setCurrentEnvironment(null);
    }
  }, []);

  // Keep currentEnvironment in sync with environments list and selected ID
  useEffect(() => {
    if (currentEnvironmentId) {
      const env = environments.find(e => e.id === currentEnvironmentId);
      setCurrentEnvironment(env || null);
    } else {
      setCurrentEnvironment(null);
    }
  }, [environments, currentEnvironmentId]);

  // Create environment
  const createEnvironment = useCallback(async (data: CreateEnvironmentPayload) => {
    try {
      const newEnv = await apiService.createEnvironment(data);
      await fetchEnvironments();
      selectEnvironment(newEnv.id);
      showToast('Environment created successfully', 'success');
    } catch (error: any) {
      const message = error.userMessage || 'Failed to create environment';
      showToast(message, 'error');
      throw error;
    }
  }, [fetchEnvironments, selectEnvironment, showToast]);

  // Update environment
  const updateEnvironment = useCallback(async (id: number, data: UpdateEnvironmentPayload) => {
    try {
      await apiService.updateEnvironment(id, data);
      await fetchEnvironments();
      showToast('Environment updated successfully', 'success');
    } catch (error: any) {
      const message = error.userMessage || 'Failed to update environment';
      showToast(message, 'error');
      throw error;
    }
  }, [fetchEnvironments, showToast]);

  // Update environment variables (merges with existing)
  const updateEnvironmentVariables = useCallback(async (id: number, variables: EnvironmentVariable) => {
    try {
      await apiService.updateEnvironmentVariables(id, variables);
      // Merge new variables with existing ones instead of replacing
      setEnvironments(prev => prev.map(env =>
        env.id === id ? { ...env, variables: { ...env.variables, ...variables } } : env
      ));
      if (currentEnvironmentId === id) {
        setCurrentEnvironment(prev => prev ? { ...prev, variables: { ...prev.variables, ...variables } } : null);
      }
      showToast('Environment variables updated successfully', 'success');
    } catch (error: any) {
      const message = error.userMessage || 'Failed to update environment variables';
      showToast(message, 'error');
      throw error;
    }
  }, [currentEnvironmentId, showToast]);

  // Delete environment
  const deleteEnvironment = useCallback(async (id: number) => {
    try {
      await apiService.deleteEnvironment(id);
      if (currentEnvironmentId === id) {
        selectEnvironment(null);
      }
      await fetchEnvironments();
      showToast('Environment deleted successfully', 'success');
    } catch (error: any) {
      const message = error.userMessage || 'Failed to delete environment';
      showToast(message, 'error');
      throw error;
    }
  }, [currentEnvironmentId, fetchEnvironments, selectEnvironment, showToast]);

  // Initialize: fetch environments and restore selection
  useEffect(() => {
    const initializeEnvironments = async () => {
      setLoading(true);
      try {
        const envs = await apiService.getEnvironments();
        setEnvironments(envs);

        // Restore selected environment ID from localStorage
        // The sync effect will handle setting currentEnvironment
        const savedId = localStorage.getItem('currentEnvironmentId');
        if (savedId) {
          const id = parseInt(savedId, 10);
          const env = envs.find(e => e.id === id);
          if (env) {
            // Use setTimeout to ensure the sync effect runs after both states are set
            setTimeout(() => {
              setCurrentEnvironmentId(id);
            }, 0);
          } else {
            // Saved environment no longer exists
            localStorage.removeItem('currentEnvironmentId');
          }
        }
      } catch (error) {
        // Backend might not be running, silently fail
      } finally {
        setLoading(false);
      }
    };

    initializeEnvironments();
  }, []);  // Empty dependency array - only run once on mount

  return (
    <EnvironmentContext.Provider
      value={{
        environments,
        currentEnvironment,
        currentEnvironmentId,
        loading,
        fetchEnvironments,
        selectEnvironment,
        createEnvironment,
        updateEnvironment,
        updateEnvironmentVariables,
        deleteEnvironment,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }
  return context;
}
