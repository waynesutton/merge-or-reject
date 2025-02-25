import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Home } from 'lucide-react';

interface NotFoundPageProps {
  isDarkMode: boolean;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="relative">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2">
          <Code2 className="w-16 h-16 text-[#00FF94]" />
        </div>
        
        <div className="text-center">
          <h1 className="text-[12rem] leading-none tracking-tight bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
            404
          </h1>
          
          <div className="mt-8 mb-12">
            <h2 className="text-2xl mb-4">Page not found</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back to reviewing some code.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="absolute top-1/2 left-0 right-0 -z-10 select-none pointer-events-none">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 opacity-10">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white h-24 rounded-lg transform transition-transform"
                  style={{
                    transform: `rotate(${Math.random() * 10 - 5}deg) translateY(${Math.random() * 20 - 10}px)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage