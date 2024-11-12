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
          parameters: selectedParameters,
        }),
      });

      if (!response.ok) {
        throw new Error("Story generation failed");
      }

      const data = await response.json();
      setGeneratedStory(data.story);

      // Store story in localStorage
      const storyData = {
        text: data.story,
        prompt: userPrompt,
        parameters: selectedParameters,
        timestamp: new Date().toISOString(),
      };

      const savedStories = JSON.parse(localStorage.getItem("stories") || "[]");
      localStorage.setItem(
        "stories",
        JSON.stringify([storyData, ...savedStories])
      );
    } catch (error) {
      setError(error.message);
      console.error("Story generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Generate Story</h1>

        <form onSubmit={handleGenerateStory}>
          {/* Story Parameters Selection */}
          <div className="mb-4">
            <label className="block mb-2">Story Parameters</label>
            <select
              value={selectedParameters?._id || ""}
              onChange={(e) => {
                const selected = storyParameters.find(
                  (p) => p._id === e.target.value
                );
                setSelectedParameters(selected);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select parameters...</option>
              {storyParameters.map((param) => (
                <option key={param._id} value={param._id}>
                  {param.name} - {param.genre}
                </option>
              ))}
            </select>
          </div>

          {/* User Prompt Input */}
          <div className="mb-4">
            <label className="block mb-2">Additional Prompt (optional)</label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Add any specific details or requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isGenerating ? "Generating..." : "Generate Story"}
          </button>
        </form>

        {error && <div className="text-red-500 mt-4">{error}</div>}

        {generatedStory && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Generated Story</h2>
            <div className="whitespace-pre-wrap border p-4 rounded">
              {generatedStory}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Stories;
