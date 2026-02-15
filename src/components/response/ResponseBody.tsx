
import Editor from '@monaco-editor/react';
import { useUI } from '../../contexts/UIContext';
import { Button } from '../common/Button';
import { MdContentCopy } from 'react-icons/md';
import { detectContentType } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface ResponseBodyProps {
  body: string;
  headers: Record<string, string>;
}

export function ResponseBody({ body, headers }: ResponseBodyProps) {
  const { theme } = useUI();
  const { showToast } = useToast();
  const contentType = detectContentType(headers, body);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      showToast('Copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy', 'error');
    }
  };

  if (!body) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">No response body</div>
    );
  }

  const languageMap = {
    json: 'json',
    xml: 'xml',
    html: 'html',
    text: 'plaintext',
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        <span className="text-xs text-gray-600 dark:text-gray-400 uppercase">
          {contentType}
        </span>
        <Button size="sm" variant="secondary" onClick={handleCopy}>
          <MdContentCopy className="inline mr-1" />
          Copy
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={languageMap[contentType]}
          value={body}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
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
