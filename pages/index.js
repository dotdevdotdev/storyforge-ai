import { useState } from "react";
import Layout from "../components/Layout";

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

  return <Layout></Layout>;
}
