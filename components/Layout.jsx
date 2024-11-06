import React from "react";
import Link from "next/link";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="navbar">
        <nav>
          <div className="nav-container">
            <Link href="/" className="logo">
              StoryForge AI
            </Link>
            <div className="nav-links">
              <Link href="/stories">Stories</Link>
              <Link href="/characters">Characters</Link>
              <Link href="/themes">Themes</Link>
              <Link href="/archetypes">Archetypes</Link>
              <Link href="/story-parameters">Story Parameters</Link>
              <Link href="/locations">Locations</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} StoryForge AI. All rights reserved.
        </p>
      </footer>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .navbar {
          background-color: #f8f9fa;
          padding: 1rem;
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .nav-links {
          display: flex;
          gap: 1rem;
        }
        .main-content {
          flex: 1;
          padding: 2rem;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Layout;
