import React, { useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface CodeDisplayProps {
  code: string;
  explanation?: string;
  isDarkMode: boolean;
  isDragging?: boolean;
  dragOffset?: number;
  rotation?: number;
  opacity?: number;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  explanation,
  isDarkMode,
  isDragging = false,
  dragOffset = 0,
  rotation = 0,
  opacity = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <motion.div
          ref={cardRef}
          className={`rounded-lg overflow-hidden ${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} shadow-lg border ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
          animate={{
            x: isDragging ? dragOffset : 0,
            rotate: isDragging ? rotation : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <SyntaxHighlighter
            language="typescript"
            style={isDarkMode ? materialDark : materialLight}
            customStyle={{
              margin: 0,
              padding: "1.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
            showLineNumbers={true}>
            {code}
          </SyntaxHighlighter>

          {explanation && (
            <div
              className={`p-4 border-t ${isDarkMode ? "border-gray-800 bg-black/30" : "border-gray-200 bg-gray-50"}`}>
              <h3
                className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Explanation:
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} whitespace-pre-wrap`}>
                {explanation}
              </p>
            </div>
          )}
        </motion.div>

        {/* Swipe indicators */}
        {isDragging && (
          <>
            {dragOffset > 0 && (
              <div
                className="fixed top-1/2 left-4 transform -translate-y-1/2 bg-green-500/80 rounded-full p-3"
                style={{ opacity }}>
                <Check className="w-8 h-8" />
              </div>
            )}
            {dragOffset < 0 && (
              <div
                className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-red-500/80 rounded-full p-3"
                style={{ opacity }}>
                <X className="w-8 h-8" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodeDisplay;
