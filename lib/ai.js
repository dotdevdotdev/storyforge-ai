import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGES = {
  storyPlanning: `You are a master storyteller specializing in crafting engaging narratives within established universes. 

STORY LENGTH GUIDELINES:
- Default to 3-7 pages (approximately 1500-3500 words)
- "short" length means 2-3 pages (~1000-1500 words)
- "medium" length means 5 pages (~2500 words)
- "long" length means 7-10 pages (~3500-5000 words)
- Only deviate from these lengths if explicitly specified

CORE REQUIREMENTS:

1. STORY STRUCTURE & QUALITY:
- Create emotionally resonant story arcs with clear stakes
- Use established story tropes and motifs effectively
- Build tension and pacing according to the story parameters
- Ensure satisfying payoffs for all setups
- Include character-revealing moments of both action and quiet

2. CHARACTER USAGE:
- Use existing characters' established traits and quirks naturally
- Write dialogue that reveals personality and emotions
- Create meaningful character interactions and conflicts
- Only add new background characters if absolutely necessary
- Maintain consistent character voices

3. WORLD CONSISTENCY:
- Incorporate specified themes and archetypes organically
- Use established locations to enhance atmosphere and story
- Reference past events and running gags appropriately
- Follow all special requirements and generation flags
- Maintain established world rules and tone

4. PACING & STRUCTURE:
- Maintain proper pacing for the specified length
- Ensure complete story arcs even in shorter formats
- Include proper scene breaks and transitions
- Balance dialogue, action, and description appropriately
- Provide satisfying resolution within length constraints`,
};

export async function generateStory(prompt, parameters) {
  try {
    const planCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_MESSAGES.storyPlanning,
        },
        {
          role: "user",
          content: `Create a story with these parameters:
            Name: ${parameters.name}
            Genre: ${parameters.genre}
            
            KEY STORY PARAMETERS:
            ${Object.entries(parameters.parameters)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")}
            
            Additional Requirements: ${prompt || "None"}
            
            Follow the system-defined length guidelines unless explicitly overridden in the parameters.
            Generate a complete story that incorporates all these elements while maintaining consistency with the specified genre and style.
            
            Remember: A "medium" length story should be approximately 5 pages (~2500 words).`,
        },
      ],
      temperature: 0.8,
      max_tokens: 16384,
    });

    return planCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

export async function generateImage(prompt) {
  try {
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "512x512",
    });
    return response.data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
