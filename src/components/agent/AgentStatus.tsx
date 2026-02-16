import { useState, useEffect } from 'react';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { agentService } from '../../services/agentService';
import { AgentDownloadModal } from './AgentDownloadModal';

export function AgentStatus() {
    const [isAgentConnected, setIsAgentConnected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const checkStatus = async () => {
        const isConnected = await agentService.checkHealth();
        setIsAgentConnected(isConnected);
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div
                className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="flex items-center gap-2">
                    {isAgentConnected ? (
                        <MdCheckCircle className="text-green-500 w-4 h-4" />
                    ) : (
                        <MdError className="text-red-500 w-4 h-4" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Local Agent: {isAgentConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <AgentDownloadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
