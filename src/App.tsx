import { useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { CollectionsProvider } from './contexts/CollectionsContext';
import { RequestProvider, useRequest } from './contexts/RequestContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainPanel } from './components/layout/MainPanel';
import { ToastContainer } from './components/common/Toast';

function AppContent() {
  const { selectedItem, isDirty, saveWorkingCopy } = useRequest();
  const { isSidebarCollapsed } = useUI();

  const requestName = selectedItem?.item_type === 'request' ? selectedItem.name : '';

  // Handle Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && requestName) {
          saveWorkingCopy();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, requestName, saveWorkingCopy]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header requestName={requestName} isDirty={isDirty} onSave={saveWorkingCopy} />
      <div className="flex-1 overflow-hidden flex">
        {!isSidebarCollapsed && (
          <div className="w-80 flex-shrink-0">
            <Sidebar />
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}
        <div className="flex-1">
          <MainPanel />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <UIProvider>
        <EnvironmentProvider>
          <CollectionsProvider>
            <RequestProvider>
              <AppContent />
            </RequestProvider>
          </CollectionsProvider>
        </EnvironmentProvider>
      </UIProvider>
    </ToastProvider>
  );
}

export default App;
