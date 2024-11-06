import OpenAI from "openai";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGES = {
  storyPlanning: `You are a master storyteller specializing in crafting engaging narratives within established universes. You must:

1. STORY STRUCTURE & QUALITY:
- Create emotionally resonant story arcs with clear stakes
- Use established story tropes and motifs effectively
- Build tension and pacing according to the story parameters
- Ensure satisfying payoffs for all setups
- Include character-revealing moments of both action and quiet

2. CHARACTER USAGE:
- Use existing characters' established traits and quirks naturally
- Write dialogue that reveals character personality and emotions
- Create meaningful character interactions and conflicts
- Only add new background characters if absolutely necessary
- Maintain consistent character voices

3. WORLD CONSISTENCY:
- Incorporate specified themes and archetypes organically
- Use established locations to enhance atmosphere and story
- Reference past events and running gags appropriately
- Follow all special requirements and generation flags
- Maintain established world rules and tone

4. TECHNICAL REQUIREMENTS:
- Include at least one required archetype
- Feature primary and secondary themes as specified
- Use primarily existing characters and locations
- Keep new characters to minor background roles only
- Follow all parameter constraints exactly`,

  storyGeneration: `You are a skilled narrative writer who excels at crafting emotionally engaging stories. You must:

1. WRITING STYLE:
- Write vivid, sensory descriptions that bring scenes to life
- Craft natural, character-driven dialogue with subtext
- Balance action, dialogue, and introspection
- Use varied sentence structure for pacing
- Include emotional beats and character reactions

2. SCENE CONSTRUCTION:
- Open scenes with strong hooks
- Build tension through escalating complications
- Include meaningful character interactions
- Use setting details to enhance mood
- End scenes with compelling hooks

3. DIALOGUE MASTERY:
- Write distinct character voices based on their personalities
- Include character-specific verbal tics and patterns
- Use dialogue to advance plot and reveal character
- Balance dialogue with action and description
- Include emotional subtext in conversations

4. TECHNICAL EXCELLENCE:
- Maintain consistent POV and tense
- Use proper paragraph breaks and formatting
- Include clear scene transitions
- Balance showing vs telling
- Follow all story parameters exactly`,
};

async function connectToDb() {
  const uri = process.env.MONGODB_URI;
  const client = await MongoClient.connect(uri);
  return client.db(process.env.MONGODB_DB);
}

async function fetchAllResources(db, parameterId) {
  if (!parameterId) {
    throw new Error("Parameter ID is required");
  }

  try {
    const [characters, locations, archetypes, themes, storyParameters] =
      await Promise.all([
        db.collection("Characters").find({}).toArray(),
        db.collection("Locations").find({}).toArray(),
        db.collection("Archetypes").find({}).toArray(),
        db.collection("Themes").find({}).toArray(),
        db
          .collection("StoryParameters")
          .findOne({ _id: new ObjectId(parameterId) }),
      ]);

    if (!storyParameters) {
      throw new Error(`Story parameters not found for ID: ${parameterId}`);
    }

    return [storyParameters, characters, locations, archetypes, themes];
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw new Error(`Failed to fetch resources: ${error.message}`);
  }
}

async function generateStoryPlan(prompt, resources) {
  console.log("\n=== STORY PLAN GENERATION ===");
  console.log("Building planning prompt with:");
  console.log(
    "- Story Parameters:",
    JSON.stringify(resources.storyParameters, null, 2)
  );

  // Validate and safely access nested properties
  const storyParams = resources.storyParameters?.story_parameters || {};
  const themes = storyParams.themes || {};
  const requiredArchetypes = themes.required_archetypes || [];
  const primaryTheme = themes.primary_theme || "none specified";
  const secondaryThemes = themes.secondary_themes || [];
  const generationFlags = storyParams.generation_flags || {};

  const planningPrompt = `
Create a detailed story plan following these parameters:

STORY PARAMETERS:
${JSON.stringify(storyParams, null, 2)}

USER PROMPT:
${prompt}

AVAILABLE CHARACTERS:
${resources.characters
  .map(
    (c) => `- ${c.name}:
  Description: ${c.description || "No description"}
  Personality: ${c.personality || "Not specified"}
  Key Traits: ${c.traits || "Not specified"}
  Speech Pattern: ${c.speechPattern || "Standard"}`
  )
  .join("\n")}

AVAILABLE LOCATIONS:
${resources.locations
  .map(
    (l) => `- ${l.name}:
  Description: ${l.description || "No description"}
  Atmosphere: ${l.atmosphere || "Not specified"}
  Notable Features: ${l.features || "Not specified"}`
  )
  .join("\n")}

REQUIRED ELEMENTS:
- Must use at least one archetype from: ${
    requiredArchetypes.join(", ") || "any available archetype"
  }
- Primary theme: ${primaryTheme}
- Secondary themes: ${secondaryThemes.join(", ") || "none specified"}

STORY REQUIREMENTS:
1. Emotional Core:
   - Clear emotional stakes for main characters
   - Character growth opportunities
   - Meaningful relationships and conflicts

2. Structure:
   - Strong hook and inciting incident
   - Rising action with complications
   - Satisfying climax and resolution
   - Proper setup and payoff

3. Character Usage:
   - Leverage existing character dynamics
   - Use established quirks and traits
   - Create meaningful interactions
   - Include character-specific running gags

4. World Integration:
   - Reference past events naturally
   - Use locations meaningfully
   - Include appropriate callbacks
   - Maintain world consistency

GENERATION FLAGS:
Emphasis on: ${
    (generationFlags.emphasis_on || []).join(", ") || "none specified"
  }
Avoid: ${(generationFlags.avoid || []).join(", ") || "none specified"}
Maintain continuity with: ${
    (generationFlags.maintain_continuity || []).join(", ") || "none specified"
  }

Provide a story plan in this JSON format:
{
  "title": "Story title",
  "synopsis": "Brief story overview",
  "emotionalCore": {
    "mainConflict": "The central emotional conflict",
    "characterStakes": "What characters stand to gain or lose",
    "thematicResonance": "How themes connect to emotional core"
  },
  "selectedCharacters": [
    {
      "name": "Character name",
      "role": "Role in story",
      "emotionalArc": "Character's emotional journey",
      "keyScenes": ["Important scenes for this character"]
    }
  ],
  "newBackgroundCharacters": [
    {
      "name": "Name",
      "role": "Minor role description",
      "purpose": "Specific story function"
    }
  ],
  "selectedLocations": [
    {
      "name": "Location name",
      "scenes": ["Scenes that occur here"],
      "atmosphere": "How location enhances story"
    }
  ],
  "selectedArchetype": {
    "name": "chosen archetype name",
    "implementation": "How it's used in story"
  },
  "sceneOutline": [
    {
      "scene": "Scene description",
      "purpose": "Scene's story function",
      "emotionalBeat": "Key emotional moment"
    }
  ],
  "thematicElements": [
    {
      "theme": "Theme name",
      "execution": "How theme is expressed"
    }
  ]
}`;

  console.log("\nSending Planning Prompt to OpenAI:");
  console.log(planningPrompt);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: SYSTEM_MESSAGES.storyPlanning,
      },
      {
        role: "user",
        content: planningPrompt,
      },
    ],
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  console.log("\nReceived Story Plan:");
  console.log(response);

  return JSON.parse(response);
}

async function generateStorySkeleton(storyPlan, resources) {
  console.log("\n=== STORY SKELETON GENERATION ===");

  const skeletonPrompt = `
Create a detailed story skeleton based on this story plan:
${JSON.stringify(storyPlan, null, 2)}

Follow these requirements:
1. Expand each scene in the scene outline
2. Detail character interactions and dialogue moments
3. Specify emotional beats and atmosphere
4. Include setup/payoff points
5. Note where running gags and callbacks occur

Respond with a JSON skeleton in this format:
{
  "title": "${storyPlan.title}",
  "scenes": [
    {
      "setting": "Location and atmosphere description",
      "characters": ["Characters present"],
      "action": "What happens in the scene",
      "dialogue_moments": ["Key dialogue points"],
      "emotional_beats": ["Emotional moments"],
      "setups_payoffs": ["Elements being setup or paid off"],
      "callbacks_gags": ["Running gags or callbacks used"]
    }
  ],
  "character_arcs": [
    {
      "character": "Character name",
      "arc_points": ["Key character moments through story"]
    }
  ],
  "thematic_elements": [
    {
      "theme": "Theme name",
      "story_points": ["How theme manifests in story"]
    }
  ]
}`;

  console.log("Sending Skeleton Prompt to OpenAI");

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: SYSTEM_MESSAGES.storyPlanning,
      },
      {
        role: "user",
        content: skeletonPrompt,
      },
    ],
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  console.log("\nReceived Story Skeleton");

  return JSON.parse(response);
}

async function generateFinalStory(userPrompt, skeleton, resources) {
  console.log("\n=== FINAL STORY GENERATION ===");

  // Keep the character and location extraction logic...
  const existingCharDetails = skeleton.scenes
    .flatMap((scene) => scene.characters)
    .filter((char, index, self) => self.indexOf(char) === index)
    .map((charName) => {
      const char = resources.characters.find(
        (c) => (c.fullName?.firstName || c.name) === charName
      );
      return char
        ? {
            name: char.fullName?.firstName || char.name,
            description: char.description || char.appearance,
            personality: char.personality,
            backstory: char.backstory,
          }
        : null;
    })
    .filter(Boolean);

  const selectedLocDetails = skeleton.scenes
    .map((scene) => {
      const location = resources.locations.find((l) =>
        scene.setting.includes(l.name)
      );
      return location
        ? {
            name: location.name,
            description: location.description,
          }
        : null;
    })
    .filter(Boolean);

  const finalPrompt = `
Write a complete story based on these elements:

USER PROMPT: "${userPrompt}"

STORY OUTLINE:
Title: ${skeleton.title}

SCENES:
${skeleton.scenes
  .map(
    (scene) => `
SCENE:
Setting: ${scene.setting}
Characters Present: ${scene.characters.join(", ")}
Action: ${scene.action}
Key Dialogue: ${scene.dialogue_moments.join(" | ")}
Emotional Beats: ${scene.emotional_beats.join(" | ")}
`
  )
  .join("\n")}

CHARACTER ARCS:
${skeleton.character_arcs
  .map(
    (arc) => `
${arc.character}:
${arc.arc_points.join("\n- ")}
`
  )
  .join("\n")}

THEMATIC ELEMENTS:
${skeleton.thematic_elements
  .map(
    (theme) => `
${theme.theme}:
${theme.story_points.join("\n- ")}
`
  )
  .join("\n")}

CHARACTERS:
${existingCharDetails
  .map(
    (char) => `
- ${char.name}:
  Description: ${char.description}
  Personality: ${char.personality || "Not specified"}
  Background: ${char.backstory || "Not specified"}`
  )
  .join("\n")}

LOCATIONS:
${selectedLocDetails
  .map((loc) => `- ${loc.name}: ${loc.description}`)
  .join("\n")}

Write a complete story following these requirements:
1. The story should be approximately 1500-2500 words
2. Include proper paragraphs and dialogue
3. Have a clear beginning, middle, and end
4. Focus on character interactions and development
5. Use descriptive language for locations and atmosphere
6. Use the characters and locations provided in the resources
7. Use the themes and archetypes provided in the resources
8. Include at least one of the required archetypes
9. Include the primary and secondary themes as specified
10. Brainstorm and include at least one running gag
11. Improvise with dialogue and character interactions
12. Include a satisfying resolution
13. Maintain a consistent tone and mood
14. Include a callback to a previous event or character
15. Make dialogue feel natural and believable

IMPORTANT: Return ONLY the story text with proper paragraphs and formatting. Do not include any metadata, JSON formatting, or additional information.`;

  console.log("Sending Final Story Prompt to OpenAI");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_MESSAGES.storyGeneration,
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      max_tokens: 16384,
      temperature: 0.8,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Story generation error:", error);
    throw new Error(`Failed to generate final story: ${error.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, parameterId } = req.body;
    if (!prompt || !parameterId) {
      return res
        .status(400)
        .json({ error: "Prompt and parameterId are required" });
    }

    console.log("\n=== STARTING STORY GENERATION ===");
    console.log("User Prompt:", prompt);
    console.log("Parameter ID:", parameterId);

    // 1. Gather all required data
    console.log("\nStep 1: Gathering Resources...");
    const db = await connectToDb();
    const [storyParameters, characters, locations, archetypes, themes] =
      await fetchAllResources(db, parameterId);

    console.log("Retrieved:");
    console.log("- Story Parameters:", storyParameters?.name);
    console.log("- Characters:", characters.length);
    console.log("- Locations:", locations.length);
    console.log("- Archetypes:", archetypes.length);
    console.log("- Themes:", themes.length);

    const resources = {
      storyParameters,
      characters,
      locations,
      archetypes,
      themes,
    };

    // 2. Generate story plan
    console.log("\nStep 2: Generating Story Plan...");
    const storyPlan = await generateStoryPlan(prompt, resources);
    console.log("Story Plan Generated:", {
      title: storyPlan.title,
      selectedCharacters: storyPlan.selectedCharacters.map((c) => c.name),
      selectedLocations: storyPlan.selectedLocations.map((l) => l.name),
      selectedArchetype: storyPlan.selectedArchetype,
    });

    // 3. Generate story skeleton
    console.log("\nStep 3: Generating Story Skeleton...");
    const skeleton = await generateStorySkeleton(storyPlan, resources);
    console.log("Skeleton Generated");

    // 4. Generate final story
    console.log("\nStep 4: Generating Final Story...");
    const finalStory = await generateFinalStory(prompt, skeleton, resources);

    console.log("\n=== STORY GENERATION COMPLETE ===");
    console.log("Story Length:", finalStory.length);
    console.log("Word Count:", finalStory.split(" ").length);

    res.status(200).json({
      story: finalStory,
      debug: {
        storyPlan,
        skeleton,
      },
    });
  } catch (error) {
    console.error("\n=== STORY GENERATION ERROR ===");
    console.error("Error Type:", error.constructor.name);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    if (error.response) {
      console.error("OpenAI Response Error:", error.response.data);
    }
    res.status(500).json({
      error: "Failed to generate story",
      details: error.message,
      type: error.constructor.name,
    });
  }
}
