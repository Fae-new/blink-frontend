import { useState } from 'react';
import { MdKeyboardArrowLeft, MdChevronRight, MdSearch } from 'react-icons/md';
import { useUI } from '../../contexts/UIContext';
import { UploadCollectionButton } from '../collections/UploadCollectionButton';
import { CollectionTreeView } from '../collections/CollectionTreeView';

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUI();
  const [searchQuery, setSearchQuery] = useState('');

  if (isSidebarCollapsed) {
    return (
      <div className="w-12 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          aria-label="Expand sidebar"
        >
          <MdChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Collections</h2>
          <div className="flex items-center gap-2">
            <UploadCollectionButton />
            <button
              onClick={toggleSidebar}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              aria-label="Collapse sidebar"
            >
              <MdKeyboardArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <MdSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <CollectionTreeView searchQuery={searchQuery} />
      </div>
    </div>
  );
}
