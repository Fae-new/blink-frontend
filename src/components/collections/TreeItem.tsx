import { useState } from 'react';
import { MdFolder, MdChevronRight, MdKeyboardArrowDown, MdDescription, MdAdd, MdDelete } from 'react-icons/md';
import type { Item } from '../../types/collection';
import { useRequest } from '../../contexts/RequestContext';
import { useCollections } from '../../contexts/CollectionsContext';
import { MethodBadge } from '../common/MethodBadge';
import { CreateItemModal } from './CreateItemModal';

interface TreeItemProps {
  item: Item;
  level: number;
  searchQuery?: string;
}

export function TreeItem({ item, level, searchQuery = '' }: TreeItemProps) {
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { selectedItemId, selectItem } = useRequest();
  const { deleteItem } = useCollections();
  const isSelected = selectedItemId === item.id;

  // Auto-expand folders when searching
  const isExpanded = searchQuery.trim() && item.item_type === 'folder'
    ? true
    : isManuallyExpanded;

  const handleClick = () => {
    if (item.item_type === 'folder') {
      setIsManuallyExpanded(!isManuallyExpanded);
    } else {
      selectItem(item.id);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateModal(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMessage = item.item_type === 'folder'
      ? `Are you sure you want to delete the folder "${item.name}" and all its contents?`
      : `Are you sure you want to delete the request "${item.name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteItem(item.id);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const paddingLeft = `${level * 16 + 8}px`;

  return (
    <>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer group
          hover:bg-gray-100 dark:hover:bg-gray-700
          ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
        `}
        style={{ paddingLeft }}
      >
        {item.item_type === 'folder' ? (
          <>
            {isExpanded ? (
              <MdKeyboardArrowDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            ) : (
              <MdChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            )}
            <MdFolder className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
              {item.name}
            </span>
            {isHovered && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleAddClick}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Add item"
                >
                  <MdAdd className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Delete folder"
                >
                  <MdDelete className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <MdDescription className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-4" />
            {item.method && <MethodBadge method={item.method} size="sm" />}
            <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
              {item.name}
            </span>
            {isHovered && (
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete request"
              >
                <MdDelete className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </>
        )}
      </div>

      {item.item_type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItem key={child.id} item={child} level={level + 1} searchQuery={searchQuery} />
          ))}
        </div>
      )}

      <CreateItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        parentId={item.id}
        parentName={item.name}
      />
    </>
  );
}
