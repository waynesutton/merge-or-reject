import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  
  return (
    <div className="w-full mt-6 mb-4">
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: percentage <= 25 ? '#EF4444' : percentage <= 50 ? '#F59E0B' : '#00FF94'
          }}
        />
      </div>
      <div className="mt-2 text-right text-sm text-gray-400">
        {timeLeft} seconds remaining
      </div>
    </div>
  );
};

export default Timer