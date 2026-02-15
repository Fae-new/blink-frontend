
interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const headerEntries = Object.entries(headers);

  if (headerEntries.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">No headers</div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">Key</th>
            <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800">
          {headerEntries.map(([key, value], index) => (
            <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{key}</td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
