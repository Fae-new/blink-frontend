import { useState } from 'react';
import { MdClose, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { Button } from '../common/Button';
import type { CreateEnvironmentPayload, EnvironmentVariable } from '../../types/environment';

interface EnvironmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnvironmentManagerModal({ isOpen, onClose }: EnvironmentManagerModalProps) {
  const { environments, createEnvironment, updateEnvironment, deleteEnvironment } = useEnvironment();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    variables: {} as EnvironmentVariable,
  });

  if (!isOpen) return null;

  const environmentsList = Array.isArray(environments) ? environments : [];

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ name: '', description: '', variables: {} });
  };

  const handleEdit = (id: number) => {
    const env = environmentsList.find(e => e.id === id);
    if (env) {
      setEditingId(id);
      setFormData({
        name: env.name,
        description: env.description,
        variables: { ...env.variables },
      });
    }
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const payload: CreateEnvironmentPayload = {
          ...formData,
          created_by: 'user', // TODO: Add actual user management
        };
        await createEnvironment(payload);
      } else if (editingId) {
        await updateEnvironment(editingId, formData);
      }
      setIsCreating(false);
      setEditingId(null);
      setFormData({ name: '', description: '', variables: {} });
    } catch (error) {
      // Error handled by context
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this environment?')) {
      try {
        await deleteEnvironment(id);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '', variables: {} });
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: { ...formData.variables, '': '' },
    });
  };

  const updateVariable = (oldKey: string, newKey: string, value: string) => {
    const newVariables = { ...formData.variables };
    if (oldKey !== newKey) {
      delete newVariables[oldKey];
    }
    newVariables[newKey] = value;
    setFormData({ ...formData, variables: newVariables });
  };

  const deleteVariable = (key: string) => {
    const newVariables = { ...formData.variables };
    delete newVariables[key];
    setFormData({ ...formData, variables: newVariables });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Manage Environments
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!isCreating && !editingId && (
            <>
              <Button variant="primary" size="sm" onClick={handleCreate} className="mb-4">
                <MdAdd className="inline mr-1" />
                New Environment
              </Button>

              <div className="space-y-2">
                {environmentsList.map((env) => (
                  <div
                    key={env.id}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{env.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{env.description}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {Object.keys(env.variables).length} variable(s)
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(env.id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(env.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(isCreating || editingId) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                  placeholder="Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                  placeholder="Development environment variables"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Variables
                  </label>
                  <Button variant="secondary" size="sm" onClick={addVariable}>
                    <MdAdd className="inline mr-1" />
                    Add Variable
                  </Button>
                </div>

                <div className="border border-gray-300 dark:border-gray-600 rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                          Key
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                          Value
                        </th>
                        <th className="w-10 px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      {Object.entries(formData.variables).map(([key, value], index) => (
                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={key}
                              onChange={(e) => updateVariable(key, e.target.value, value)}
                              className="w-full px-2 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                              placeholder="base_url"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateVariable(key, key, e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                              placeholder="https://api.dev.example.com"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => deleteVariable(key)}
                              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  {isCreating ? 'Create' : 'Update'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
