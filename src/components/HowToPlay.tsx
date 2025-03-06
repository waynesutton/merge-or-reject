import React, { useState } from "react";
import { Code2, ThumbsUp, ThumbsDown, Timer } from "lucide-react";
import { ConvexNudge } from "@convex-nudge/react";

interface HowToPlayProps {
  isDarkMode: boolean;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="max-w-4xl mx-auto mb-16">
      {isVisible && (
        <ConvexNudge
          variant="dark"
          position="top"
          animation="fade"
          textSize="base"
          logoSize={26}
          referralCode="?dub_id=WgqQVZqxw7aOhm0B"
          fixed
          dismissible
          onDismiss={handleDismiss}
        />
      )}
      <h2 className="text-2xl mb-6 text-center">How to Play</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#00FF94] rounded-full flex items-center justify-center text-black font-medium">
              1
            </div>
            <h3 className="font-medium">Review the Code</h3>
          </div>
          <div className={`${isDarkMode ? "bg-black/30" : "bg-gray-100"} rounded-lg p-4 mb-4`}>
            <div className="flex space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className={`font-mono text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              function example(){" "}
              {
                // Code snippet
              }
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Each round shows you a code snippet. Your job is to determine if it's valid or contains
            bugs.
          </p>
        </div>

        <div className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#00FF94] rounded-full flex items-center justify-center text-black font-medium">
              2
            </div>
            <h3 className="font-medium">Make Your Decision</h3>
          </div>
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-red-500 text-white shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </div>
              <span className="mt-1 text-sm">Reject</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-gray-500 text-white shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </div>
              <span className="mt-1 text-sm">Skip</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-green-500 text-white shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="mt-1 text-sm">Merge</span>
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} space-y-2`}>
            <p>Multiple ways to play:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Click buttons: Merge (correct) or Reject (issues)</li>
              <li>Keyboard: Enter (Merge), Esc (Reject), 'S' (Skip)</li>
              <li>Swipe: Right (Merge), Left (Reject), Up (Skip)</li>
            </ul>
          </div>
        </div>

        <div className={`${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#00FF94] rounded-full flex items-center justify-center text-black font-medium">
              3
            </div>
            <h3 className="font-medium">Beat the Clock</h3>
          </div>
          <div className="mb-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF94] w-3/4"></div>
            </div>
            <div
              className={`mt-2 text-right text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              <Timer className="w-4 h-4 inline mr-2" />
              Time remaining
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Complete the rounds based on difficulty level within the time limit. A perfect score to
            unlock the confetti celebration!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
