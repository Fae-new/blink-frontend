import { MdSettings } from 'react-icons/md';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { Button } from '../common/Button';

interface EnvironmentSelectorProps {
  onManageClick: () => void;
}

export function EnvironmentSelector({ onManageClick }: EnvironmentSelectorProps) {
  const { environments, currentEnvironmentId, selectEnvironment } = useEnvironment();

  const environmentsList = Array.isArray(environments) ? environments : [];

  return (
    <div className="flex gap-2">
      <select
        value={currentEnvironmentId || ''}
        onChange={(e) => {
          const id = e.target.value ? parseInt(e.target.value, 10) : null;
          selectEnvironment(id);
        }}
        className="flex-1 min-w-[140px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">No Environment</option>
        {environmentsList.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      <Button
        variant="secondary"
        size="sm"
        onClick={onManageClick}
        title="Manage Environments"
      >
        <MdSettings className="w-4 h-4" />
      </Button>
    </div>
  );
}
