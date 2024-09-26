import { generateStory, generateImage } from "../../lib/ai";
import { saveStory } from "../../models/Story";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { prompt } = req.body;
      const story = await generateStory(prompt);
      const imageUrl = await generateImage(prompt);
      await saveStory(story, imageUrl);
      res.status(200).json({ story, imageUrl });
    } catch (error) {
      res.status(500).json({ error: "Error generating and saving story" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
