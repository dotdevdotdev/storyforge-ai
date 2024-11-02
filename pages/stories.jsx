import React, { useState } from "react";
import Layout from "../components/Layout";

const Stories = () => {
  const [prompt, setPrompt] = useState("");
  const [storyData, setStoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setStoryData(null);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      setStoryData(data);
    } catch (err) {
      setError("Failed to generate story. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="stories-container">
        <h1>Generate Your Story</h1>

        <form onSubmit={handleSubmit}>
          <div className="prompt-section">
            <label htmlFor="prompt">
              Describe your story idea:
              <p className="guidance-text">
                Try to include details about the setting, main characters, and
                the type of story you want (e.g., adventure, mystery, romance).
                The more specific you are, the better the result!
              </p>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Write a story about a young wizard who discovers an ancient spell book in their grandmother's attic..."
              rows={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="generate-button"
          >
            {isLoading ? "Generating Story..." : "Generate Story"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {storyData && (
          <div className="story-generation-results">
            {/* Story Options Section */}
            <div className="story-options">
              <h2>Story Options Considered</h2>
              <div className="options-grid">
                {storyData.generatedSkeletons.map((skeleton) => (
                  <div
                    key={skeleton.id}
                    className={`option-card ${
                      storyData.selection.selectedSkeleton.id === skeleton.id
                        ? "selected"
                        : ""
                    }`}
                  >
                    <h3>Option {skeleton.id}</h3>
                    <div className="option-content">
                      <h4>Characters:</h4>
                      <ul>
                        {skeleton.existingCharacters.map((char, i) => (
                          <li key={i}>{char}</li>
                        ))}
                        {skeleton.newCharacters?.map((char, i) => (
                          <li key={`new-${i}`} className="new-character">
                            {char.name} ({char.role})
                          </li>
                        ))}
                      </ul>
                      <h4>Locations:</h4>
                      <ul>
                        {skeleton.selectedLocations.map((loc, i) => (
                          <li key={i}>{loc}</li>
                        ))}
                      </ul>
                      <p>
                        <strong>Plot:</strong> {skeleton.plotOutline}
                      </p>
                      <p>
                        <strong>Hook:</strong> {skeleton.uniqueHook}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Reasoning Section */}
            <div className="selection-reasoning">
              <h2>Selected Story Concept</h2>
              <div className="reasoning-content">
                <p>
                  <strong>Why this concept was chosen:</strong>
                </p>
                <p>{storyData.selection.reasoning}</p>
                <h3>Suggested Improvements:</h3>
                <ul>
                  {storyData.selection.suggestedEnhancements.map(
                    (enhancement, i) => (
                      <li key={i}>{enhancement}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Final Story Section */}
            <div className="final-story">
              <h2>{storyData.story.title}</h2>

              <div className="story-metadata">
                <div className="metadata-section">
                  <h3>Story Overview</h3>
                  <p className="story-blurb">{storyData.story.blurb}</p>
                  <p>
                    <strong>Genre:</strong> {storyData.story.genre}
                  </p>
                  <p>
                    <strong>Mood:</strong> {storyData.story.mood}
                  </p>
                  <div className="themes">
                    <strong>Themes:</strong>
                    <ul>
                      {storyData.story.themes.map((theme, i) => (
                        <li key={i}>{theme}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="metadata-section">
                  <h3>Featured Characters</h3>
                  <div className="featured-characters">
                    {storyData.story.featuredCharacters.map((char, i) => (
                      <div key={i} className="featured-character">
                        <h4>{char.name}</h4>
                        <p>
                          <strong>Role:</strong> {char.role}
                        </p>
                        <p>{char.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="metadata-section">
                  <h3>Key Locations</h3>
                  <div className="featured-locations">
                    {storyData.story.featuredLocations.map((loc, i) => (
                      <div key={i} className="featured-location">
                        <h4>{loc.name}</h4>
                        <p>{loc.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="story-content">
                <h3>The Story</h3>
                <div className="content-text">{storyData.story.content}</div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .stories-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .prompt-section {
            margin-bottom: 2rem;
          }

          .guidance-text {
            font-size: 0.9rem;
            color: #666;
            margin: 0.5rem 0;
          }

          textarea {
            width: 100%;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }

          .generate-button {
            background-color: #007bff;
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .generate-button:disabled {
            background-color: #ccc;
          }

          .story-generation-results {
            margin-top: 3rem;
          }

          .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 1.5rem 0;
          }

          .option-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1.5rem;
            background: #fff;
            transition: all 0.2s;
          }

          .option-card.selected {
            border-color: #007bff;
            box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
          }

          .option-content {
            font-size: 0.9rem;
          }

          .new-character {
            color: #28a745;
          }

          .selection-reasoning {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 2rem 0;
          }

          .final-story {
            margin-top: 3rem;
          }

          .story-metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 8px;
          }

          .metadata-section {
            padding: 1rem;
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .story-blurb {
            font-style: italic;
            color: #666;
            margin: 1rem 0;
          }

          .featured-character,
          .featured-location {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
          }

          .featured-character:last-child,
          .featured-location:last-child {
            border-bottom: none;
          }

          .story-content {
            margin-top: 2rem;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .content-text {
            white-space: pre-wrap;
            line-height: 1.8;
            font-size: 1.1rem;
          }

          h2 {
            color: #2c3e50;
            margin: 2rem 0 1rem;
          }

          h3 {
            color: #34495e;
            margin: 1.5rem 0 1rem;
          }

          h4 {
            color: #007bff;
            margin: 1rem 0 0.5rem;
          }

          ul {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
          }

          li {
            margin: 0.25rem 0;
          }

          .error-message {
            color: #dc3545;
            padding: 1rem;
            border: 1px solid #dc3545;
            border-radius: 4px;
            margin: 1rem 0;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Stories;
