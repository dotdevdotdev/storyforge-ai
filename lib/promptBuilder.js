export function buildStoryPrompt(storyParameters) {
  const { name, genre, parameters } = storyParameters;

  return `
Generate a story with the following requirements:

STORY NAME: ${name}
GENRE: ${genre}

KEY STORY PARAMETERS:
${Object.entries(parameters)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

The story MUST incorporate all parameters while maintaining consistency with the specified genre and style.
`;
}
