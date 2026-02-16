import { MdClose, MdFileDownload } from 'react-icons/md';
import { Button } from '../common/Button';

interface AgentDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AgentDownloadModal({ isOpen, onClose }: AgentDownloadModalProps) {
    if (!isOpen) return null;

    const downloadLinks = [
        {
            os: 'macOS (Apple Silicon)',
            url: 'http://localhost:8080/downloads/blink-agent-darwin-arm64',
            icon: '🍎',
        },
        {
            os: 'macOS (Intel)',
            url: 'http://localhost:8080/downloads/blink-agent-darwin-amd64',
            icon: '🍎',
        },
        {
            os: 'Windows (x64)',
            url: 'http://localhost:8080/downloads/blink-agent-windows-amd64.exe',
            icon: '🪟',
        },
        {
            os: 'Linux (x64)',
            url: 'http://localhost:8080/downloads/blink-agent-linux-amd64',
            icon: '🐧',
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Download Local Agent
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    To send requests to localhost or private IP addresses, you need to run the Local Agent on your machine.
                </p>

                <div className="space-y-3">
                    {downloadLinks.map((link) => (
                        <a
                            key={link.os}
                            href={link.url}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{link.icon}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {link.os}
                                </span>
                            </div>
                            <MdFileDownload className="text-gray-400 group-hover:text-blue-500" size={24} />
                        </a>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Installation (Auto-Start):
                    </h3>
                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">macOS & Linux:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Open Terminal</li>
                                <li>Make executable: <code>chmod +x blink-agent...</code></li>
                                <li>Install: <code>./blink-agent... --install</code></li>
                            </ol>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Windows (PowerShell):</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Install: <code>.\blink-agent... --install</code></li>
                            </ol>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Uninstall:</p>
                            <p className="ml-1">Run with <code>--uninstall</code> flag (e.g. <code>./blink-agent... --uninstall</code>)</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
