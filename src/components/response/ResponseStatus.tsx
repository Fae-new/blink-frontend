import { getStatusColor, formatDuration } from '../../utils/formatters';

interface ResponseStatusProps {
  status: number;
  duration: number;
}

export function ResponseStatus({ status, duration }: ResponseStatusProps) {
  const getStatusText = () => {
    if (status >= 200 && status < 300) return 'Success';
    if (status >= 300 && status < 400) return 'Redirect';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    return 'Unknown';
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
        <span className={`text-lg font-semibold ${getStatusColor(status)}`}>
          {status} {getStatusText()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}
