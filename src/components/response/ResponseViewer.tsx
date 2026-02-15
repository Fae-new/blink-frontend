import { useState } from 'react';
import { useRequest } from '../../contexts/RequestContext';
import { ResponseStatus } from './ResponseStatus';
import { ResponseHeaders } from './ResponseHeaders';
import { ResponseBody } from './ResponseBody';

export function ResponseViewer() {
  const { responseData } = useRequest();
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  if (!responseData) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No response yet</p>
          <p className="text-sm">Click Run to execute the request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Status Bar and Tabs Combined */}
      <div className="border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 py-2">
        <ResponseStatus status={responseData.status} duration={responseData.duration_ms} />
        <div className="flex">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-4 py-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'body'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-4 py-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'headers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Headers
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'body' ? (
          <div className="p-3 h-full">
            <ResponseBody body={responseData.body} headers={responseData.headers} />
          </div>
        ) : (
          <div className="p-3">
            <ResponseHeaders headers={responseData.headers} />
          </div>
        )}
      </div>
    </div>
  );
}
