import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Stories = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedParameters, setSelectedParameters] = useState(null);
  const [storyParameters, setStoryParameters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [error, setError] = useState(null);
  const [savedStories, setSavedStories] = useState([]);

  // Fetch story parameters and saved stories on mount
  useEffect(() => {
    fetchStoryParameters();
    loadSavedStories();
  }, []);

  const loadSavedStories = () => {
    const stories = JSON.parse(localStorage.getItem("stories") || "[]");
    setSavedStories(stories);
  };

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

      const updatedStories = [storyData, ...savedStories];
      localStorage.setItem("stories", JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
      setGeneratedStory(data.story);
    } catch (error) {
      setError(error.message);
      console.error("Story generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

        {savedStories.length > 0 && (
          <section className="saved-stories-section">
            <h2>Previously Generated Stories</h2>
            <div className="stories-list">
              {savedStories.map((story, index) => (
                <div key={index} className="story-card">
                  <div className="story-header">
                    <span className="story-date">
                      {formatDate(story.timestamp)}
                    </span>
                    <span className="story-params">{story.parameters}</span>
                  </div>
                  <div className="story-prompt">{story.prompt}</div>
                  <div className="story-preview">
                    {story.text.slice(0, 200)}...
                    <button
                      className="read-more"
                      onClick={() => setGeneratedStory(story.text)}
                    >
                      Read Full Story
                    </button>
                  </div>
                </div>
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
          .saved-stories-section {
            margin-top: 3rem;
          }
          .stories-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-top: 1rem;
          }
          .story-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .story-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #666;
          }
          .story-prompt {
            font-weight: 500;
            margin-bottom: 1rem;
            color: #333;
          }
          .story-preview {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          .read-more {
            display: block;
            background: none;
            border: none;
            color: #0070f3;
            padding: 0.5rem 0;
            margin-top: 0.5rem;
            cursor: pointer;
            font-size: 0.9rem;
          }
          .read-more:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Stories;
