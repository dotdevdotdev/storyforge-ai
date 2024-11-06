import OpenAI from "openai";
import { MongoClient } from "mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Database connection helper
async function connectToDb() {
  const uri = process.env.MONGODB_URI;
  const client = await MongoClient.connect(uri);
  return client.db(process.env.MONGODB_DB);
}

// Step 1: Fetch all characters and locations from DB
async function fetchWorldData() {
  const db = await connectToDb();
  const characters = await db.collection("Characters").find({}).toArray();
  const locations = await db.collection("Locations").find({}).toArray();
  return { characters, locations };
}

// Step 2: Generate multiple story skeletons
async function generateStorySkeletons(userPrompt, worldData) {
  const { characters, locations } = worldData;

  const skeletonsPrompt = `
Generate 3 different story ideas using primarily the existing characters from our world.

USER PROMPT: "${userPrompt}"

EXISTING CHARACTERS (USE THESE AS YOUR MAIN CHARACTERS):
${characters
  .map(
    (char) =>
      `- ${char.fullName?.firstName || char.name}: ${
        char.description || char.appearance || "No description"
      }
      ${char.personality ? `Personality: ${char.personality}` : ""}
      ${char.backstory ? `Background: ${char.backstory}` : ""}`
  )
  .join("\n")}

AVAILABLE LOCATIONS:
${locations
  .map((loc) => `- ${loc.name}: ${loc.description || "No description"}`)
  .join("\n")}

IMPORTANT GUIDELINES:
1. Use ONLY existing characters as protagonists and supporting characters
2. You may create new antagonists/villains if needed
3. Each story should involve at least 2 existing characters
4. Focus on character dynamics and relationships that make sense given their backgrounds

Provide exactly 3 story outlines in this JSON format:
{
  "skeletons": [
    {
      "id": 1,
      "existingCharacters": ["character1", "character2"],
      "newCharacters": [{
        "name": "villain_name",
        "role": "antagonist",
        "briefDescription": "brief character description"
      }],
      "selectedLocations": ["location1"],
      "plotOutline": "Brief outline of the story structure",
      "themes": ["theme1", "theme2"],
      "tone": "intended tone of the story",
      "uniqueHook": "what makes this version special",
      "characterDynamics": "how the characters interact and why these specific characters work well together"
    },
    // ... similar structure for options 2 and 3
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a story planner. Respond only with valid JSON containing exactly 3 story skeletons. Do not include markdown formatting or any other text.",
        },
        {
          role: "user",
          content: skeletonsPrompt,
        },
      ],
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content;

    // Enhanced JSON parsing with fallbacks
    try {
      // First attempt: Direct JSON parse
      return JSON.parse(response);
    } catch (parseError) {
      console.log("Initial JSON parse failed, attempting cleanup...");

      // Remove any markdown formatting or extra text
      let cleanedResponse = response;

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n|\n```/g, "");

      // Remove any text before the first {
      cleanedResponse = cleanedResponse.substring(
        cleanedResponse.indexOf("{"),
        cleanedResponse.lastIndexOf("}") + 1
      );

      try {
        const parsedData = JSON.parse(cleanedResponse);

        // Validate the expected structure
        if (!parsedData.skeletons || !Array.isArray(parsedData.skeletons)) {
          throw new Error("Invalid story skeletons structure");
        }

        return parsedData;
      } catch (fallbackError) {
        console.error("Failed to parse cleaned response:", cleanedResponse);
        throw new Error(
          "Could not parse story skeletons response into valid JSON"
        );
      }
    }
  } catch (error) {
    console.error("Story skeleton generation error:", {
      error,
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(`Failed to generate story skeletons: ${error.message}`);
  }
}

// Step 3: Select the best skeleton
async function selectBestSkeleton(userPrompt, skeletons) {
  const selectionPrompt = `
Select the best story outline based on this prompt.

USER PROMPT: "${userPrompt}"

STORY OPTIONS:
${skeletons.skeletons
  .map(
    (skeleton) => `
OPTION ${skeleton.id}:
Plot: ${skeleton.plotOutline}
Existing Characters: ${skeleton.existingCharacters.join(", ")}
${
  skeleton.newCharacters?.length
    ? `New Characters: ${skeleton.newCharacters
        .map((c) => `${c.name} (${c.role})`)
        .join(", ")}`
    : ""
}
Locations: ${skeleton.selectedLocations.join(", ")}
Character Dynamics: ${skeleton.characterDynamics}
Hook: ${skeleton.uniqueHook}
`
  )
  .join("\n")}

Select the option that:
1. Makes best use of existing character relationships
2. Has the most compelling character dynamics
3. Introduces new characters only when necessary
4. Best fulfills the user's prompt

Respond with this exact JSON:
{
  "selectedSkeletonId": <number 1-3>,
  "reasoning": "<why this combination of characters and plot works best>",
  "suggestedEnhancements": [
    "<enhancement 1>",
    "<enhancement 2>"
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a story editor. Select exactly one story outline and respond only with valid JSON.",
      },
      {
        role: "user",
        content: selectionPrompt,
      },
    ],
    temperature: 0.7,
  });

  const selection = JSON.parse(completion.choices[0].message.content);
  const selectedSkeleton =
    skeletons.skeletons.find((s) => s.id === selection.selectedSkeletonId) ||
    skeletons.skeletons[0];

  return {
    skeleton: selectedSkeleton,
    reasoning: selection.reasoning,
    suggestedEnhancements: selection.suggestedEnhancements,
  };
}

// Step 4: Generate final story
async function generateFinalStory(userPrompt, skeletonData, worldData) {
  const { skeleton, suggestedEnhancements } = skeletonData;
  const { characters, locations } = worldData;

  // Get full details for existing characters
  const existingCharDetails = skeleton.existingCharacters
    .map((charName) =>
      characters.find((c) => (c.fullName?.firstName || c.name) === charName)
    )
    .filter(Boolean)
    .map((char) => ({
      name: char.fullName?.firstName || char.name,
      description: char.description || char.appearance,
      personality: char.personality,
      backstory: char.backstory,
    }));

  // Include any new characters (typically villains)
  const allCharacters = [
    ...existingCharDetails,
    ...(skeleton.newCharacters || []),
  ];

  const selectedLocDetails = skeleton.selectedLocations
    .map((locName) => locations.find((l) => l.name === locName))
    .filter(Boolean)
    .map((loc) => ({
      name: loc.name,
      description: loc.description,
    }));

  const finalPrompt = `
Create a complete story package based on these elements:

USER PROMPT: "${userPrompt}"

PLOT OUTLINE: ${skeleton.plotOutline}

CHARACTERS:
EXISTING CHARACTERS:
${existingCharDetails
  .map(
    (char) => `- ${char.name}:
   Description: ${char.description}
   Personality: ${char.personality || "Not specified"}
   Background: ${char.backstory || "Not specified"}`
  )
  .join("\n")}

${
  skeleton.newCharacters?.length
    ? `
NEW CHARACTERS:
${skeleton.newCharacters
  .map(
    (char) => `- ${char.name} (${char.role}):
   Description: ${char.briefDescription}`
  )
  .join("\n")}
`
    : ""
}

CHARACTER DYNAMICS: ${skeleton.characterDynamics}

LOCATIONS:
${selectedLocDetails
  .map((loc) => `- ${loc.name}: ${loc.description}`)
  .join("\n")}

TONE: ${skeleton.tone}

SUGGESTED IMPROVEMENTS:
${suggestedEnhancements.join("\n")}

Write a complete story package following these requirements:
1. The story should be approximately 1000-1500 words
2. Include proper paragraphs and dialogue
3. Have a clear beginning, middle, and end
4. Focus on character interactions and development
5. Use descriptive language for locations and atmosphere

IMPORTANT: Respond ONLY with a valid JSON object in exactly this format:
{
  "title": "An engaging title for the story",
  "blurb": "A compelling 2-3 sentence preview of the story",
  "featuredCharacters": [
    {
      "name": "Character Name",
      "role": "Role in the story (protagonist, antagonist, supporting, etc.)",
      "significance": "Brief note about their importance to the plot"
    }
  ],
  "featuredLocations": [
    {
      "name": "Location Name",
      "significance": "Brief note about how this location is used in the story"
    }
  ],
  "content": "YOUR FULL 1000-1500 WORD STORY HERE WITH PROPER PARAGRAPHS AND DIALOGUE",
  "themes": ["theme1", "theme2"],
  "genre": "Primary genre of the story",
  "mood": "Overall mood/atmosphere of the story"
}

Remember: 
- The story in the 'content' field must be a complete narrative of 1000-1500 words
- Include proper paragraph breaks and dialogue
- No additional text or formatting outside the JSON structure
- The JSON must be valid and parseable`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            "You are a creative writer that responds only in valid JSON format. Never include markdown formatting or additional text.",
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content;

    try {
      // First attempt: Direct JSON parse
      return JSON.parse(response);
    } catch (parseError) {
      console.log("Initial JSON parse failed, attempting cleanup...");

      // Remove any markdown formatting or extra text
      let cleanedResponse = response;

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n|\n```/g, "");

      // Remove any text before the first { and after the last }
      cleanedResponse = cleanedResponse.substring(
        cleanedResponse.indexOf("{"),
        cleanedResponse.lastIndexOf("}") + 1
      );

      try {
        const parsedData = JSON.parse(cleanedResponse);

        // Validate the expected structure
        const requiredFields = [
          "title",
          "blurb",
          "content",
          "featuredCharacters",
          "featuredLocations",
        ];
        for (const field of requiredFields) {
          if (!parsedData[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        return parsedData;
      } catch (fallbackError) {
        console.error("Failed to parse cleaned response:", cleanedResponse);
        throw new Error("Could not parse story response into valid JSON");
      }
    }
  } catch (error) {
    console.error("Story generation error:", {
      error,
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(`Failed to generate final story: ${error.message}`);
  }
}

async function generateStory(req, res) {
  try {
    const { prompt, parameterId } = req.body;

    // 1. Gather all required data
    const [storyParameters, characters, locations, archetypes, themes] =
      await Promise.all([
        fetchStoryParameters(parameterId),
        fetchCharacters(),
        fetchLocations(),
        fetchArchetypes(),
        fetchThemes(),
      ]);

    // 2. Build the LLM prompt
    const systemPrompt = `
You are a story generator that must strictly follow these story parameters:
${JSON.stringify(storyParameters.story_parameters, null, 2)}

Key Requirements:
- Use ONLY existing characters and locations unless absolutely necessary
- Include at least one archetype from: ${storyParameters.story_parameters.themes.required_archetypes.join(
      ", "
    )}
- Include themes: Primary: ${
      storyParameters.story_parameters.themes.primary_theme
    }, Secondary: ${storyParameters.story_parameters.themes.secondary_themes.join(
      ", "
    )}
- Follow all special requirements and generation flags exactly
- Any new characters should be minor background characters only

Available Resources:
Characters: ${JSON.stringify(characters.map((c) => c.name))}
Locations: ${JSON.stringify(locations.map((l) => l.name))}
Archetypes: ${JSON.stringify(archetypes.map((a) => a.name))}
Themes: ${JSON.stringify(themes.map((t) => t.name))}

User's Story Prompt:
${prompt}

Generate a detailed story skeleton that follows all parameters and requirements.
`;

    // 3. Generate story skeleton
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Generate a story skeleton following all parameters.",
        },
      ],
      temperature: 0.7,
    });

    // 4. Process and validate the skeleton
    const skeleton = completion.data.choices[0].text;
    const validatedSkeleton = validateStoryRequirements(
      skeleton,
      storyParameters
    );

    // 5. Generate the full story
    // ... rest of the story generation process ...

    res.status(200).json({ story: finalStory });
  } catch (error) {
    console.error("Story generation failed:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let pipelineData = {};

    try {
      console.log("Step 1: Fetching world data...");
      const worldData = await fetchWorldData();
      pipelineData.worldData = true;

      console.log("Step 2: Generating multiple story skeletons...");
      const skeletons = await generateStorySkeletons(prompt, worldData);
      pipelineData.skeletons = true;

      console.log("Step 3: Selecting best skeleton...");
      const selectedSkeletonData = await selectBestSkeleton(prompt, skeletons);
      pipelineData.selection = true;

      console.log("Step 4: Generating final story...");
      const storyPackage = await generateFinalStory(
        prompt,
        selectedSkeletonData,
        worldData
      );
      pipelineData.story = true;

      res.status(200).json({
        userPrompt: prompt,
        generatedSkeletons: skeletons.skeletons,
        selection: {
          selectedSkeleton: selectedSkeletonData.skeleton,
          reasoning: selectedSkeletonData.reasoning,
          suggestedEnhancements: selectedSkeletonData.suggestedEnhancements,
        },
        story: storyPackage,
      });
    } catch (error) {
      console.error("Pipeline step error:", {
        error,
        pipelineProgress: pipelineData,
      });

      res.status(500).json({
        error: "Story generation pipeline failed",
        details: error.message,
        step: Object.keys(pipelineData).length + 1,
        pipelineProgress: pipelineData,
      });
    }
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      error: "Request handler failed",
      details: error.message,
    });
  }
}
