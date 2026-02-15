import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useCollections } from '../../contexts/CollectionsContext';
import { Button } from '../common/Button';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number;
  parentName?: string;
}

export function CreateItemModal({ isOpen, onClose, parentId, parentName }: CreateItemModalProps) {
  const { createItem } = useCollections();
  const [itemType, setItemType] = useState<'folder' | 'request'>('request');
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [url, setUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const data: any = {
        name: name.trim(),
        item_type: itemType,
      };

      if (parentId) {
        data.parent_id = parentId;
      }

      if (itemType === 'request') {
        data.method = method;
        data.url = url || '';
        data.headers = [];
        data.body = '';
      }

      await createItem(data);
      handleClose();
    } catch (error) {
      // Error handled by context
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setUrl('');
    setMethod('GET');
    setItemType('request');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create New {itemType === 'folder' ? 'Folder' : 'Request'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <MdClose className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {parentName && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Location: <span className="font-medium">{parentName}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setItemType('folder')}
                className={`flex-1 py-2 px-4 rounded border ${
                  itemType === 'folder'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Folder
              </button>
              <button
                type="button"
                onClick={() => setItemType('request')}
                className={`flex-1 py-2 px-4 rounded border ${
                  itemType === 'request'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Request
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${itemType} name`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          {itemType === 'request' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL (optional)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="{{BASE_URL}}/endpoint"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating || !name.trim()}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
