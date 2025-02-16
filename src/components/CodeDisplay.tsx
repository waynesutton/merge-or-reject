import React from 'react';

interface CodeDisplayProps {
  code: string;
  isDarkMode: boolean;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, isDarkMode }) => {
  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-8 ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-gray-200'} flex items-center px-4`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <pre className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-gray-200'} p-8 pt-12 rounded-lg overflow-x-auto`}>
        <code className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{code}</code>
      </pre>
    </div>
  );
}

export default CodeDisplay