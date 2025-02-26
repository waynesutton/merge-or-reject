/**
 * Timer.tsx
 *
 * A progress bar timer component that shows remaining time.
 *
 * Changes made:
 * - Added dark mode support
 * - Fixed prop name from totalTime to total to match usage in GameContainer
 * - Improved color transitions based on remaining time
 */

import React from "react";

interface TimerProps {
  timeLeft: number;
  total: number;
  isDarkMode: boolean;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, total, isDarkMode }) => {
  const percentage = (timeLeft / total) * 100;

  return (
    <div className="w-full mt-6 mb-4">
      <div
        className={`h-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}>
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${percentage}%`,
            backgroundColor:
              percentage <= 25 ? "#EF4444" : percentage <= 50 ? "#F59E0B" : "#00FF94",
          }}
        />
      </div>
      <div className={`mt-2 text-right text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {timeLeft} seconds remaining
      </div>
    </div>
  );
};

export default Timer;
