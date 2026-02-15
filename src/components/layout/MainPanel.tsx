import { RequestEditor } from '../request/RequestEditor';
import { ResponseViewer } from '../response/ResponseViewer';

export function MainPanel() {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="min-h-[350px] flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <RequestEditor />
      </div>
      <div className="flex-1 min-h-[200px] overflow-auto">
        <ResponseViewer />
      </div>
    </div>
  );
}
