import { generateStory } from "../../lib/ai";
import { withAuth } from "../../middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, parameters } = req.body;
    const userId = req.userId; // From auth middleware

    if (
      !parameters ||
      !parameters.name ||
      !parameters.genre ||
      !parameters.parameters
    ) {
      return res.status(400).json({
        error: "Missing required parameters structure",
      });
    }

    // Generate story with user context (for future features like personalization)
    const story = await generateStory(prompt, parameters);
    
    // Return story with userId context
    res.status(200).json({ 
      story,
      userId // Include so frontend knows which user generated it
    });
  } catch (error) {
    console.error("Story generation error:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
}

export default (req, res) => withAuth(req, res, handler);