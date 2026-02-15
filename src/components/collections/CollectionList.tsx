import { useCollections } from '../../contexts/CollectionsContext';

export function CollectionList() {
  const { collections, currentCollectionId, selectCollection, loading } = useCollections();

  // Safety check: ensure collections is an array
  const collectionsList = Array.isArray(collections) ? collections : [];

  if (loading && collectionsList.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">Loading collections...</div>
    );
  }

  if (collectionsList.length === 0) {
    return null; // Empty state will be shown in tree view
  }

  return (
    <select
      value={currentCollectionId || ''}
      onChange={(e) => {
        const id = parseInt(e.target.value, 10);
        if (!isNaN(id)) {
          selectCollection(id);
        }
      }}
      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">Select a collection</option>
      {collectionsList.map((collection) => (
        <option key={collection.id} value={collection.id}>
          {collection.name}
        </option>
      ))}
    </select>
  );
}
