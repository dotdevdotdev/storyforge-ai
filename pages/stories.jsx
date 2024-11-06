import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Stories = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedParameters, setSelectedParameters] = useState(null);
  const [storyParameters, setStoryParameters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch story parameters on mount
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await fetch("/api/story-parameters");
        if (!response.ok) throw new Error("Failed to fetch story parameters");
        const data = await response.json();
        setStoryParameters(data);
      } catch (error) {
        setError("Failed to load story parameters");
      }
    };
    fetchParameters();
  }, []);

  return (
    <Layout>
      <div className="stories-container">
        <section className="story-input-section">
          <h1>Generate a New Story</h1>

          <div className="parameters-select">
            <label>Story Parameters</label>
            <select
              value={selectedParameters?._id || ""}
              onChange={(e) => {
                const selected = storyParameters.find(
                  (p) => p._id === e.target.value
                );
                setSelectedParameters(selected);
              }}
            >
              <option value="">Select story parameters...</option>
              {storyParameters.map((param) => (
                <option key={param._id} value={param._id}>
                  {param.name}
                </option>
              ))}
            </select>
            {selectedParameters && (
              <div className="selected-parameters-preview">
                <h4>Selected Parameters: {selectedParameters.name}</h4>
                <p>{selectedParameters.description}</p>
              </div>
            )}
          </div>

          <div className="prompt-section">
            <label>Your Story Prompt</label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe your story idea..."
            />
            <p className="guidance-text">
              Your prompt will be combined with the selected parameters to
              generate a story
            </p>
          </div>

          <button
            className="generate-button"
            disabled={!selectedParameters || !userPrompt.trim() || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? "Generating..." : "Generate Story"}
          </button>
        </section>

        {/* ... rest of the component ... */}

        <style jsx>{`
          .stories-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .story-input-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .parameters-select {
            margin-bottom: 2rem;
          }
          .selected-parameters-preview {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 4px;
          }
          /* ... existing styles ... */
        `}</style>
      </div>
    </Layout>
  );
};

export default Stories;
