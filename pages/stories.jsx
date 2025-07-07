import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { StoryGenerationBoundary, APIBoundary } from "../components/ErrorBoundaryWrapper";
import { Button, Textarea, Select, Card, LoadingSpinner, PageHeader } from "../components/ui";
import StoryGenerationProgress from "../components/StoryGenerationProgress";
import { StoryModal } from "../components/modals/StoryModal";

const Stories = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedParameters, setSelectedParameters] = useState(null);
  const [storyParameters, setStoryParameters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingParams, setIsLoadingParams] = useState(true);
  const [savedStories, setSavedStories] = useState([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStoryParameters();
    fetchSavedStories();
  }, []);

  const fetchStoryParameters = async () => {
    try {
      const response = await fetch("/api/story-parameters");
      if (response.ok) {
        const data = await response.json();
        setStoryParameters(data);
      }
    } catch (error) {
      console.error("Error fetching story parameters:", error);
    } finally {
      setIsLoadingParams(false);
    }
  };

  const fetchSavedStories = async () => {
    try {
      const response = await fetch("/api/stories/list?includeUnpublished=true");
      if (response.ok) {
        const data = await response.json();
        setSavedStories(data);
      }
    } catch (error) {
      console.error("Error fetching saved stories:", error);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const handleGenerateStory = async (e) => {
    e.preventDefault();
    if (!selectedParameters) return;

    setIsGenerating(true);
    setGeneratedStory(null);
    setError(null);
    setGenerationStage("Analyzing story parameters...");

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parameters: selectedParameters,
          userPrompt: userPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedStory(data.story);
        setGenerationStage(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate story");
      }
    } catch (error) {
      setError("Network error occurred while generating story");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveStory = async () => {
    if (!generatedStory) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedStory,
          parameters: selectedParameters,
          userPrompt: userPrompt,
        }),
      });

      if (response.ok) {
        const savedStory = await response.json();
        setSavedStories([savedStory, ...savedStories]);
        setError(null);
      } else {
        setError("Failed to save story");
      }
    } catch (error) {
      setError("Network error occurred while saving story");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Story Generator"
        subtitle="Create amazing stories with AI assistance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Story Generation Form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Story</h2>

            <form onSubmit={handleGenerateStory} className="space-y-6">
              {/* Story Parameters Selection */}
              {isLoadingParams ? (
                <LoadingSpinner text="Loading story parameters..." />
              ) : (
                <Select
                  label="Story Parameters"
                  value={selectedParameters?._id || ""}
                  onChange={(e) => {
                    const selected = storyParameters.find(
                      (p) => p._id === e.target.value
                    );
                    setSelectedParameters(selected);
                  }}
                  required
                  options={[
                    { value: "", label: "Select parameters..." },
                    ...storyParameters.map((params) => ({
                      value: params._id,
                      label: `${params.name} - ${params.genre}`
                    }))
                  ]}
                />
              )}

              {/* User Prompt */}
              <Textarea
                label="Additional Story Prompt (Optional)"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
                helperText="Add any specific details or requirements for your story..."
              />

              {/* Generate Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={!selectedParameters || isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Story"}
              </Button>
            </form>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="mt-6">
                <StoryGenerationProgress stage={generationStage} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </Card>

          {/* Generated Story Display */}
          {generatedStory && (
            <Card className="mt-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generated Story</h2>
                <Button
                  onClick={saveStory}
                  disabled={isSaving}
                  variant="outline"
                >
                  {isSaving ? "Saving..." : "Save Story"}
                </Button>
              </div>
              
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {generatedStory}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Saved Stories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Stories</h2>
            {isLoadingStories ? (
              <LoadingSpinner text="Loading your stories..." />
            ) : savedStories.length > 0 ? (
              <div className="space-y-3">
                {savedStories.map((story, index) => (
                  <div
                    key={story._id || index}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedStory(story);
                      setIsModalOpen(true);
                    }}
                  >
                    <h3 className="font-medium text-sm text-gray-900 mb-1">
                      {story.title || `Story ${index + 1}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                      {story.content?.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No stories saved yet</p>
                <p className="text-gray-400 text-sm mt-1">Generated stories will appear here</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <StoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStory(null);
        }}
        story={selectedStory}
      />
    </Layout>
  );
};

// Wrap the Stories component with error boundaries
const StoriesWithErrorBoundaries = () => (
  <StoryGenerationBoundary>
    <APIBoundary>
      <Stories />
    </APIBoundary>
  </StoryGenerationBoundary>
);

export default StoriesWithErrorBoundaries;