import { MdAdd, MdDelete } from 'react-icons/md';
import type { HeaderItem } from '../../types/request';

interface HeadersEditorProps {
  headers: HeaderItem[];
  onChange: (headers: HeaderItem[]) => void;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const addHeader = () => {
    onChange([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: keyof HeaderItem, value: string | boolean) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const deleteHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="w-6 px-2 py-1.5"></th>
            <th className="px-2 py-1.5 text-left text-gray-700 dark:text-gray-300 font-medium text-xs">Key</th>
            <th className="px-2 py-1.5 text-left text-gray-700 dark:text-gray-300 font-medium text-xs">Value</th>
            <th className="w-8 px-2 py-1.5"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800">
          {headers.map((header, index) => (
            <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                  className="rounded"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder="Content-Type"
                  className="w-full px-2 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  disabled={!header.enabled}
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder="application/json"
                  className="w-full px-2 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  disabled={!header.enabled}
                />
              </td>
              <td className="px-2 py-1">
                <button
                  onClick={() => deleteHeader(index)}
                  className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete header"
                >
                  <MdDelete className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-2 py-1.5 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={addHeader}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <MdAdd className="w-3.5 h-3.5" />
          Add Header
        </button>
      </div>
    </div>
  );
}
