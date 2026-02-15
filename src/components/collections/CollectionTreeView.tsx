import { MdUpload, MdFolder, MdExpandMore, MdChevronRight, MdAdd } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { useCollections } from '../../contexts/CollectionsContext';
import { TreeItem } from './TreeItem';
import { CreateItemModal } from './CreateItemModal';
import type { Collection, Item } from '../../types/collection';

interface CollectionTreeViewProps {
  searchQuery: string;
}

export function CollectionTreeView({ searchQuery }: CollectionTreeViewProps) {
  const { collections, loading, selectCollection, currentCollectionId, currentTree } = useCollections();
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());
  const [loadedTrees, setLoadedTrees] = useState<Map<number, any>>(new Map());

  // Safety check: ensure collections is an array
  const collectionsList = Array.isArray(collections) ? collections : [];

  // Store the current tree when it loads
  useEffect(() => {
    if (currentCollectionId && currentTree) {
      setLoadedTrees(prev => new Map(prev).set(currentCollectionId, currentTree));
    }
  }, [currentCollectionId, currentTree]);

  // Auto-load all collections when searching
  useEffect(() => {
    if (searchQuery.trim() && collectionsList.length > 0) {
      // Load all collections that aren't already loaded
      collectionsList.forEach(async (collection) => {
        if (!loadedTrees.has(collection.id)) {
          try {
            await selectCollection(collection.id);
          } catch (error) {
            // Error handled by context
          }
        }
      });
    }
  }, [searchQuery, collectionsList, loadedTrees, selectCollection]);

  if (loading && collectionsList.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading collections...
      </div>
    );
  }

  if (collectionsList.length === 0) {
    return (
      <div className="p-4 text-center">
        <MdUpload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">No collections yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Upload a Postman collection to get started
        </p>
      </div>
    );
  }

  const toggleCollection = async (collection: Collection) => {
    const isExpanded = expandedCollections.has(collection.id);

    if (isExpanded) {
      // Collapse
      const newExpanded = new Set(expandedCollections);
      newExpanded.delete(collection.id);
      setExpandedCollections(newExpanded);
    } else {
      // Expand and load tree
      const newExpanded = new Set(expandedCollections);
      newExpanded.add(collection.id);
      setExpandedCollections(newExpanded);

      try {
        await selectCollection(collection.id);
      } catch (error) {
        // Error already handled by context
      }
    }
  };

  return (
    <div className="p-2">
      {collectionsList.map((collection) => {
        // Auto-expand when searching if the collection tree is loaded
        const isLoaded = loadedTrees.has(collection.id);
        const isExpanded = searchQuery.trim() && isLoaded
          ? true
          : expandedCollections.has(collection.id);

        return (
          <div key={collection.id}>
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => toggleCollection(collection)}
                className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
              >
                {isExpanded ? (
                  <MdExpandMore className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <MdChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
                <MdFolder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-900 dark:text-gray-100 truncate">{collection.name}</span>
              </button>
              {isExpanded && (
                <CollectionAddButton collectionName={collection.name} />
              )}
            </div>
            {isExpanded && (
              <CollectionItems collectionId={collection.id} searchQuery={searchQuery} loadedTree={loadedTrees.get(collection.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CollectionAddButton({ collectionName }: { collectionName: string }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowCreateModal(true)}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Add item to collection"
      >
        <MdAdd className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
      <CreateItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        parentName={collectionName}
      />
    </>
  );
}

function CollectionItems({ collectionId, searchQuery, loadedTree }: { collectionId: number; searchQuery: string; loadedTree?: any }) {
  // Use the passed loadedTree if available, otherwise fall back to context
  const { currentTree, currentCollectionId } = useCollections();
  const tree = loadedTree || (currentCollectionId === collectionId ? currentTree : null);

  // Only show items if we have a tree
  if (!tree) {
    return (
      <div className="pl-6 py-1 text-xs text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  const children = Array.isArray(tree.children) ? tree.children : [];

  // Filter items based on search query (name or URL)
  const filterItems = (items: Item[]): Item[] => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      // Check if item name matches
      if (item.name.toLowerCase().includes(query)) {
        return true;
      }

      // Check if item URL matches (for requests)
      if (item.item_type === 'request' && item.url?.toLowerCase().includes(query)) {
        return true;
      }

      // For folders, check if any children match
      if (item.item_type === 'folder' && item.children) {
        const filteredChildren = filterItems(item.children);
        return filteredChildren.length > 0;
      }

      return false;
    }).map(item => {
      // If it's a folder, filter its children recursively
      if (item.item_type === 'folder' && item.children) {
        return {
          ...item,
          children: filterItems(item.children),
        };
      }
      return item;
    });
  };

  const filteredChildren = filterItems(children);

  if (filteredChildren.length === 0) {
    if (searchQuery.trim()) {
      return (
        <div className="pl-6 py-1 text-xs text-gray-500 dark:text-gray-400">
          No items match "{searchQuery}"
        </div>
      );
    }
    return (
      <div className="pl-6 py-1 text-xs text-gray-500 dark:text-gray-400">
        Empty collection
      </div>
    );
  }

  return (
    <div className="pl-4">
      {filteredChildren.map((item) => (
        <TreeItem key={item.id} item={item} level={1} searchQuery={searchQuery} />
      ))}
    </div>
  );
}
