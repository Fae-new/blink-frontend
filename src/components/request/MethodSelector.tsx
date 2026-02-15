
interface MethodSelectorProps {
  value: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onChange: (method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') => void;
}

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="GET">GET</option>
      <option value="POST">POST</option>
      <option value="PUT">PUT</option>
      <option value="PATCH">PATCH</option>
      <option value="DELETE">DELETE</option>
    </select>
  );
}
