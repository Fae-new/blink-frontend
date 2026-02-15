import { Button } from './Button';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({ isOpen, onSave, onDiscard, onCancel }: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Unsaved Changes
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You have unsaved changes. What would you like to do?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDiscard}>
            Discard
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
