import { MdAdd, MdDelete } from 'react-icons/md';
import type { ExtractionRule } from '../../types/environment';

interface ExtractionEditorProps {
  extractionRules: ExtractionRule[];
  onChange: (rules: ExtractionRule[]) => void;
}

export function ExtractionEditor({ extractionRules, onChange }: ExtractionEditorProps) {
  const addRule = () => {
    onChange([...extractionRules, { id: crypto.randomUUID(), enabled: true, jsonPath: '', variableName: '' }]);
  };

  const updateRule = (index: number, field: keyof ExtractionRule, value: string | boolean) => {
    const updated = [...extractionRules];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const deleteRule = (index: number) => {
    onChange(extractionRules.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="w-6 px-2 py-1.5"></th>
            <th className="px-2 py-1.5 text-left text-gray-700 dark:text-gray-300 font-medium text-xs">JSON Path</th>
            <th className="px-2 py-1.5 text-left text-gray-700 dark:text-gray-300 font-medium text-xs">Variable Name</th>
            <th className="w-8 px-2 py-1.5"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800">
          {extractionRules.map((rule, index) => (
            <tr key={rule.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => updateRule(index, 'enabled', e.target.checked)}
                  className="rounded"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={rule.jsonPath}
                  onChange={(e) => updateRule(index, 'jsonPath', e.target.value)}
                  placeholder="data.token"
                  className="w-full px-2 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  disabled={!rule.enabled}
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={rule.variableName}
                  onChange={(e) => updateRule(index, 'variableName', e.target.value)}
                  placeholder="auth_token"
                  className="w-full px-2 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  disabled={!rule.enabled}
                />
              </td>
              <td className="px-2 py-1">
                <button
                  onClick={() => deleteRule(index)}
                  className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete rule"
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
          onClick={addRule}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <MdAdd className="w-3.5 h-3.5" />
          Add Rule
        </button>
      </div>
    </div>
  );
}
