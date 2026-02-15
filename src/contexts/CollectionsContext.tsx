import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Collection, CollectionTree } from '../types/collection';
import type { UpdateRequestPayload } from '../types/request';
import { apiService } from '../services/api';
import { useToast } from './ToastContext';

interface CollectionsState {
  collections: Collection[];
  currentCollectionId: number | null;
  currentTree: CollectionTree | null;
  loading: boolean;
  error: string | null;
}

type CollectionsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_CURRENT_COLLECTION'; payload: number | null }
  | { type: 'SET_CURRENT_TREE'; payload: CollectionTree | null };

const initialState: CollectionsState = {
  collections: [],
  currentCollectionId: null,
  currentTree: null,
  loading: false,
  error: null,
};

function collectionsReducer(state: CollectionsState, action: CollectionsAction): CollectionsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload, loading: false };
    case 'SET_CURRENT_COLLECTION':
      return { ...state, currentCollectionId: action.payload };
    case 'SET_CURRENT_TREE':
      return { ...state, currentTree: action.payload, loading: false };
    default:
      return state;
  }
}

interface CollectionsContextType extends CollectionsState {
  fetchCollections: () => Promise<void>;
  uploadCollection: (data: unknown) => Promise<void>;
  selectCollection: (id: number) => Promise<void>;
  updateRequest: (itemId: number, data: UpdateRequestPayload) => Promise<void>;
  refreshTree: () => Promise<void>;
  createItem: (data: {
    name: string;
    item_type: 'folder' | 'request';
    parent_id?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url?: string;
    headers?: Array<{ key: string; value: string; enabled?: boolean }>;
    body?: string;
  }) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(collectionsReducer, initialState);
  const { showToast } = useToast();

  // Fetch all collections
  const fetchCollections = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const collections = await apiService.getCollections();
      dispatch({ type: 'SET_COLLECTIONS', payload: collections });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error: any) {
      const message = error.userMessage || 'Failed to fetch collections';
      dispatch({ type: 'SET_ERROR', payload: message });
      showToast(message, 'error');
    }
  }, [showToast]);

  // Upload new collection
  const uploadCollection = useCallback(async (data: unknown) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apiService.uploadCollection(data);
      showToast(result.message, 'success');
      // Auto-refresh collections list
      await fetchCollections();
      // Auto-select the newly uploaded collection
      if (result.collection_id) {
        await selectCollection(result.collection_id);
      }
    } catch (error: any) {
      const message = error.userMessage || 'Failed to upload collection';
      showToast(message, 'error');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [showToast, fetchCollections]);

  // Select a collection and load its tree
  const selectCollection = useCallback(async (id: number) => {
    dispatch({ type: 'SET_CURRENT_COLLECTION', payload: id });
    localStorage.setItem('lastCollectionId', id.toString());
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const tree = await apiService.getCollectionTree(id);
      dispatch({ type: 'SET_CURRENT_TREE', payload: tree });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error: any) {
      const message = error.userMessage || 'Failed to load collection tree';
      dispatch({ type: 'SET_ERROR', payload: message });
      showToast(message, 'error');
    }
  }, [showToast]);

  // Update a request
  const updateRequest = useCallback(async (itemId: number, data: UpdateRequestPayload) => {
    try {
      await apiService.updateRequest(itemId, data);
      showToast('Request saved successfully', 'success');
      // Refresh the tree to get updated data
      if (state.currentCollectionId) {
        await selectCollection(state.currentCollectionId);
      }
    } catch (error: any) {
      const message = error.userMessage || 'Failed to save request';
      showToast(message, 'error');
      throw error;
    }
  }, [showToast, state.currentCollectionId, selectCollection]);

  // Refresh current tree
  const refreshTree = useCallback(async () => {
    if (state.currentCollectionId) {
      await selectCollection(state.currentCollectionId);
    }
  }, [state.currentCollectionId, selectCollection]);

  // Create new item (folder or request)
  const createItem = useCallback(async (data: {
    name: string;
    item_type: 'folder' | 'request';
    parent_id?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url?: string;
    headers?: Array<{ key: string; value: string; enabled?: boolean }>;
    body?: string;
  }) => {
    if (!state.currentCollectionId) {
      showToast('Please select a collection first', 'error');
      return;
    }

    try {
      await apiService.createItem(state.currentCollectionId, data);
      showToast(`${data.item_type === 'folder' ? 'Folder' : 'Request'} created successfully`, 'success');
      // Refresh the tree to show the new item
      await refreshTree();
    } catch (error: any) {
      const message = error.userMessage || `Failed to create ${data.item_type}`;
      showToast(message, 'error');
      throw error;
    }
  }, [state.currentCollectionId, showToast, refreshTree]);

  // Delete item (folder or request)
  const deleteItem = useCallback(async (itemId: number) => {
    try {
      await apiService.deleteItem(itemId);
      showToast('Item deleted successfully', 'success');
      // Refresh the tree to remove the item
      await refreshTree();
    } catch (error: any) {
      const message = error.userMessage || 'Failed to delete item';
      showToast(message, 'error');
      throw error;
    }
  }, [showToast, refreshTree]);

  // Initialize: fetch collections and auto-select last viewed
  useEffect(() => {
    const initializeCollections = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const collections = await apiService.getCollections();
        dispatch({ type: 'SET_COLLECTIONS', payload: collections });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        // Auto-select last viewed collection
        const lastCollectionId = localStorage.getItem('lastCollectionId');
        if (lastCollectionId) {
          const id = parseInt(lastCollectionId, 10);
          dispatch({ type: 'SET_CURRENT_COLLECTION', payload: id });
          
          try {
            const tree = await apiService.getCollectionTree(id);
            dispatch({ type: 'SET_CURRENT_TREE', payload: tree });
          } catch (error) {
            // Failed to load last collection tree, just continue
          }
        }
      } catch (error) {
        // Backend might not be running, silently fail
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initializeCollections();
  }, []);  // Empty dependency array - only run once on mount

  return (
    <CollectionsContext.Provider
      value={{
        ...state,
        fetchCollections,
        uploadCollection,
        selectCollection,
        updateRequest,
        refreshTree,
        createItem,
        deleteItem,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
}
