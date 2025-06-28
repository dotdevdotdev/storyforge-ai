import React from "react";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} StoryForge AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
