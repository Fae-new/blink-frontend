
interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

export function URLInput({ value, onChange, isValid }: URLInputProps) {
  return (
    <div className="flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        className={`
          w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded text-sm
          text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${!isValid && value ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
        `}
      />
      {!isValid && value && (
        <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
      )}
    </div>
  );
}
