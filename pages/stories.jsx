import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { StoryGenerationBoundary, APIBoundary } from "../components/ErrorBoundaryWrapper";
import LoadingSpinner from "../components/LoadingSpinner";
import StoryGenerationProgress from "../components/StoryGenerationProgress";

const Stories = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedParameters, setSelectedParameters] = useState(null);
  const [storyParameters, setStoryParameters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingParams, setIsLoadingParams] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);

  // Fetch story parameters and saved stories on mount
  useEffect(() => {
    fetchStoryParameters();
    fetchSavedStories();
  }, []);

  const fetchStoryParameters = async () => {
    try {
      setIsLoadingParams(true);
      const response = await fetch("/api/story-parameters");
      if (!response.ok) throw new Error("Failed to fetch story parameters");
      const data = await response.json();
      setStoryParameters(data);
    } catch (error) {
      setError("Failed to load story parameters");
      console.error(error);
    } finally {
      setIsLoadingParams(false);
    }
  };

  const fetchSavedStories = async () => {
    try {
      setIsLoadingStories(true);
      const response = await fetch("/api/stories/list?includeUnpublished=true");
      if (!response.ok) throw new Error("Failed to fetch saved stories");
      const data = await response.json();
      setSavedStories(data);
    } catch (error) {
      console.error("Failed to load saved stories:", error);
    } finally {
      setIsLoadingStories(false);
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
    setGeneratedStory(null);

    try {
      // Start the generation process
      setGenerationStage('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGenerationStage('planning');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGenerationStage('writing');
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

      setGenerationStage('refining');
      const data = await response.json();
      
      // Save story draft automatically
      await saveDraft(data.story);

      // Short delay to show the refining stage
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneratedStory(data.story);
    } catch (error) {
      setError(error.message);
      console.error("Story generation error:", error);
    } finally {
      setIsGenerating(false);
      setGenerationStage(null);
    }
  };

  const saveDraft = async (storyText) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/stories/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: storyText,
          prompt: userPrompt,
          parameters: selectedParameters,
          metadata: {
            title: `Draft - ${new Date().toLocaleString()}`,
            status: 'draft'
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to save draft");
      
      // Refresh saved stories list
      fetchSavedStories();
    } catch (error) {
      console.error("Failed to save draft:", error);
      setError("Failed to save draft. Don't worry, your story is still here!");
    } finally {
      setIsSaving(false);
    }
  };

  const saveStory = async () => {
    if (!generatedStory) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedStory,
          prompt: userPrompt,
          parameters: selectedParameters,
          metadata: {
            title: `Story - ${new Date().toLocaleString()}`,
            status: 'published'
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to save story");

      // Refresh saved stories list
      fetchSavedStories();
    } catch (error) {
      console.error("Failed to save story:", error);
      setError("Failed to save story");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story Generation Form */}
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold mb-4">Generate Story</h1>

            <form onSubmit={handleGenerateStory} className="space-y-6">
              {/* Story Parameters Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Parameters
                </label>
                {isLoadingParams ? (
                  <LoadingSpinner message="Loading story parameters..." />
                ) : (
                  <select
                    value={selectedParameters?._id || ""}
                    onChange={(e) => {
                      const selected = storyParameters.find(
                        (p) => p._id === e.target.value
                      );
                      setSelectedParameters(selected);
                    }}
                    className="w-full p-2 border rounded shadow-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select parameters...</option>
                    {storyParameters.map((param) => (
                      <option key={param._id} value={param._id}>
                        {param.name} - {param.genre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* User Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Story Prompt (Optional)
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full p-2 border rounded shadow-sm focus:ring-primary focus:border-primary"
                  rows="4"
                  placeholder="Add any specific details or requirements for your story..."
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !selectedParameters}
                className={`w-full py-2 px-4 rounded font-medium ${
                  isGenerating || !selectedParameters
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                } text-white transition-colors`}
              >
                {isGenerating ? "Generating..." : "Generate Story"}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Generation Progress */}
            {isGenerating && generationStage && (
              <div className="mt-8">
                <StoryGenerationProgress stage={generationStage} />
              </div>
            )}

            {/* Generated Story Display */}
            {generatedStory && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Generated Story</h2>
                  <button
                    onClick={saveStory}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded ${
                      isSaving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white transition-colors`}
                  >
                    {isSaving ? "Saving..." : "Save Story"}
                  </button>
                </div>
                <div className="prose max-w-none">
                  {generatedStory.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index} className="mb-4">{paragraph}</p> : null
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Stories Sidebar */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Your Stories</h2>
            {isLoadingStories ? (
              <LoadingSpinner message="Loading your stories..." />
            ) : savedStories.length > 0 ? (
              <div className="space-y-4">
                {savedStories.map((story) => (
                  <div
                    key={story._id}
                    className="p-4 border rounded hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium">{story.metadata?.title || 'Untitled Story'}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {story.metadata?.status === 'draft' ? (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Draft
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No stories saved yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrap the Stories component with error boundaries
const StoriesWithErrorBoundaries = () => (
  <Layout>
    <StoryGenerationBoundary>
      <APIBoundary>
        <Stories />
      </APIBoundary>
    </StoryGenerationBoundary>
  </Layout>
);

export default StoriesWithErrorBoundaries;
