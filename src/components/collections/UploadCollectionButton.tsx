import React, { useRef } from 'react';
import { MdUpload } from 'react-icons/md';
import { useCollections } from '../../contexts/CollectionsContext';
import { useToast } from '../../contexts/ToastContext';

export function UploadCollectionButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadCollection } = useCollections();
  const { showToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      showToast('Please select a JSON file', 'error');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Basic Postman collection validation
      if (!data.info || !data.item) {
        showToast('Invalid Postman collection format. Must have "info" and "item" fields', 'error');
        return;
      }

      // Check version
      const schema = data.info?.schema;
      if (!schema || (!schema.includes('v2.0') && !schema.includes('v2.1'))) {
        showToast('Only Postman Collection v2.0 and v2.1 are supported', 'error');
        return;
      }

      await uploadCollection(data);
    } catch (error) {
      if (error instanceof SyntaxError) {
        showToast('Invalid JSON file', 'error');
      }
      // Other errors handled by context
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        title="Upload Collection"
        aria-label="Upload Collection"
      >
        <MdUpload className="w-5 h-5" />
      </button>
    </>
  );
}
