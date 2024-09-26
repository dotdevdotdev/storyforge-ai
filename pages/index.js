import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setStory(data.story);
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>StoryForge AI</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a story prompt"
        />
        <button type="submit">Generate Story</button>
      </form>
      {story && (
        <div>
          <h2>Generated Story:</h2>
          <p>{story}</p>
        </div>
      )}
      {imageUrl && (
        <div>
          <h2>Generated Image:</h2>
          <img src={imageUrl} alt="Generated story image" />
        </div>
      )}
    </div>
  );
}
