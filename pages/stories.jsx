import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Stories = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedParameters, setSelectedParameters] = useState(null);
  const [storyParameters, setStoryParameters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [error, setError] = useState(null);

  // Fetch story parameters on mount
  useEffect(() => {
    fetchStoryParameters();
  }, []);

  const fetchStoryParameters = async () => {
    try {
      const response = await fetch("/api/story-parameters");
      if (!response.ok) throw new Error("Failed to fetch story parameters");
      const data = await response.json();
      setStoryParameters(data);
    } catch (error) {
      setError("Failed to load story parameters");
      console.error(error);
    }
  };

  const handleGenerateStory = async (e) => {
    e.preventDefault();
    if (!selectedParameters) {
      setError("Please select story parameters");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          parameterId: selectedParameters._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Story generation failed");
      }

      const data = await response.json();

      // Store story in localStorage
      const storyData = {
        text: data.story,
        prompt: userPrompt,
        timestamp: new Date().toISOString(),
        parameters: selectedParameters.name,
      };

      const savedStories = JSON.parse(localStorage.getItem("stories") || "[]");
      savedStories.unshift(storyData);
      localStorage.setItem("stories", JSON.stringify(savedStories));

      setGeneratedStory(data.story);
    } catch (error) {
      setError(error.message);
      console.error("Story generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
          </div>

          <div className="prompt-section">
            <label>Your Story Prompt</label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe your story idea..."
            />
          </div>

          <button
            onClick={handleGenerateStory}
            disabled={isGenerating || !selectedParameters}
          >
            {isGenerating ? "Generating Story..." : "Generate Story"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </section>

        {generatedStory && (
          <section className="generated-story-section">
            <h2>Your Generated Story</h2>
            <div className="story-content">
              {generatedStory.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        <style jsx>{`
          .stories-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          .story-input-section {
            margin-bottom: 2rem;
          }
          .parameters-select,
          .prompt-section {
            margin-bottom: 1.5rem;
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          select,
          textarea {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          textarea {
            min-height: 100px;
            resize: vertical;
          }
          button {
            background: #0070f3;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
          }
          button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .error-message {
            color: red;
            margin-top: 1rem;
          }
          .generated-story-section {
            margin-top: 2rem;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .story-content {
            white-space: pre-wrap;
            line-height: 1.6;
          }
          .story-content p {
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Stories;
