import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeDisplayProps {
  code: string;
  explanation?: string;
  isDarkMode: boolean;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, explanation, isDarkMode }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`rounded-lg overflow-hidden ${isDarkMode ? "bg-[#1A1A1A]" : "bg-white"} shadow-lg border ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
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
      </div>
    </div>
  );
};

export default CodeDisplay;
