import { generateStory } from "../../lib/ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, parameters } = req.body;

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

    const story = await generateStory(prompt, parameters);
    res.status(200).json({ story });
  } catch (error) {
    console.error("Story generation error:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
}
