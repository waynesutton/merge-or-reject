import React, { useState } from "react";
import { Code2, Github, X } from "lucide-react";

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  const [showConvexBox, setShowConvexBox] = useState(true);

  return (
    <footer
      className={`${isDarkMode ? "bg-[#1A1A1A] border-[#1a1a1a]" : "bg-white border-gray-200"} border-t`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <a href="/">
              {" "}
              <div className="flex items-center space-x-2 mb-4">
                {" "}
                <Code2 className="w-8 h-8 text-[#EE342F]" />
                <h1 className="text-2xl">
                  <span className="text-[#ee342f]">M</span>
                  <span className="text-[#f24723]">e</span>
                  <span className="text-[#f75a18]">r</span>
                  <span className="text-[#fb6c0c]">g</span>
                  <span className="text-[#ff7f00]">e</span>
                </h1>
              </div>
            </a>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Merge or Reject AI Code Review - where developers test their code review skills vs AI.
            </p>
          </div>

          {/* Community Links */}
          <div>
            <h3 className={`text-sm mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/scores"
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:text-[#00FF94] transition-colors`}>
                  Scores
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/XcRXcWPJGG"
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:text-[#00FF94] transition-colors`}>
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className={`text-sm mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Repo
            </h3>
            <div className="flex space-x-4">
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/waynesutton/merge-or-reject"
                    className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:text-[#00FF94] transition-colors flex items-center space-x-2`}
                    aria-label="GitHub">
                    <span>GitHub</span>
                  </a>
                </li>

                <li>
                  <a
                    href="https://github.com/waynesutton/merge-or-reject/discussions"
                    className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:text-[#00FF94] transition-colors`}>
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className={`mt-8 pt-8 ${isDarkMode ? "border-[#1A1A1A]" : "border-gray-900"} border-t flex flex-col md:flex-row justify-between items-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          <div className="mb-4 md:mb-0">
            <a href="https://github.com/waynesutton/merge-or-reject">Open Source</a> powered by{" "}
            <a
              href="https://convex.link/playmerge"
              className="hover:text-[#00FF94] transition-colors">
              Convex
            </a>
          </div>
          <div className="flex space-x-6">{/* Future links can be added here */}</div>
        </div>
      </div>

      {/* {showConvexBox && (
        <div className="fixed bottom-4 right-4 bg-black rounded-lg shadow-lg overflow-hidden">
          <a href="https://convex.link/playmerge" className="block py-2.5 px-7 flex items-center">
            <span className="text-white mr-2">Powered by</span>
            <img src="/convex-logo-white-transparent.svg" alt="Convex" className="w-[100px]" />
            <button
              onClick={() => setShowConvexBox(false)}
              className="text-white hover:text-gray-300 ml-2"
              aria-label="Close">
              <X size={12} />
            </button>
          </a>
        </div>
      )} */}
    </footer>
  );
};

export default Footer;
