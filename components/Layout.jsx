import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="navbar">
        <nav>
          <a href="/" className="logo">
            StoryForge AI
          </a>
          <div className="nav-links">
            <a href="/characters">Characters</a>
            <a href="/themes">Themes</a>
            <a href="/locations">Locations</a>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <div className="scroll-container">{children}</div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2023 StoryForge AI. All rights reserved.</p>
      </footer>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .navbar {
          position: sticky;
          top: 0;
          background-color: #f8f9fa;
          padding: 1rem;
          z-index: 1000;
        }
        .navbar nav {
          display: flex;
          justify-content: space-around;
        }
        .navbar a {
          text-decoration: none;
          color: #333;
          font-weight: bold;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .content-wrapper {
          flex: 1;
          overflow: hidden;
        }
        .scroll-container {
          height: 100%;
          overflow-y: auto;
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
