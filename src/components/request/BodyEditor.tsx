import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useUI } from '../../contexts/UIContext';
import { Button } from '../common/Button';
import { formatJson, isValidJson } from '../../utils/validators';
import { MdFormatAlignLeft } from 'react-icons/md';

interface BodyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BodyEditor({ value, onChange }: BodyEditorProps) {
  const { theme } = useUI();
  const [jsonError, setJsonError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(200);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setEditorHeight(height);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleFormatJson = () => {
    const formatted = formatJson(value);
    onChange(formatted);
  };

  const handleEditorChange = (newValue: string | undefined) => {
    const text = newValue || '';
    onChange(text);

    // Validate JSON
    if (text.trim()) {
      const validation = isValidJson(text);
      setJsonError(validation.valid ? null : validation.error || null);
    } else {
      setJsonError(null);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {jsonError ? (
            <span className="text-red-500">Invalid JSON: {jsonError}</span>
          ) : (
            'JSON'
          )}
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleFormatJson}
          disabled={!!jsonError || !value.trim()}
        >
          <MdFormatAlignLeft className="inline mr-1" />
          Format
        </Button>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" style={{ minHeight: '150px' }}>
        <Editor
          height={editorHeight}
          language="json"
          value={value}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            fontSize: 13,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

