"use client";

import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">© {currentYear} Wisora. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">Made with ❤️ for Wieland</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 text-sm">Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
