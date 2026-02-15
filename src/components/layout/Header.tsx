import { useState } from 'react';
import { MdSave, MdLightMode, MdDarkMode } from 'react-icons/md';
import { useUI } from '../../contexts/UIContext';
import { Button } from '../common/Button';
import { EnvironmentSelector } from '../environment/EnvironmentSelector';
import { EnvironmentManagerModal } from '../environment/EnvironmentManagerModal';

interface HeaderProps {
  requestName: string;
  isDirty: boolean;
  onSave: () => void;
}

export function Header({ requestName, isDirty, onSave }: HeaderProps) {
  const { theme, toggleTheme } = useUI();
  const [showEnvManager, setShowEnvManager] = useState(false);

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo3.png" alt="Blink Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Blink</span>
        </div>
        {requestName && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {requestName}
              {isDirty && <span className="ml-1 text-orange-500">●</span>}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex-shrink-0">
          <EnvironmentSelector onManageClick={() => setShowEnvManager(true)} />
        </div>
        {requestName && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSave()}
            disabled={!isDirty}
          >
            <MdSave className="inline mr-1" />
            Save
          </Button>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex-shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MdDarkMode className="w-5 h-5" /> : <MdLightMode className="w-5 h-5" />}
        </button>
      </div>
      <EnvironmentManagerModal isOpen={showEnvManager} onClose={() => setShowEnvManager(false)} />
    </header>
  );
}
