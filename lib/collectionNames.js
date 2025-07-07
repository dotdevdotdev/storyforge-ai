// MongoDB collection name mappings
// Update these to match your actual MongoDB collection names

const COLLECTION_NAMES = {
  characters: 'Characters',      // MongoDB has 'Characters' with capital C
  archetypes: 'Archetypes',     // MongoDB has 'Archetypes' with capital A
  locations: 'Locations',        // MongoDB has 'Locations' with capital L
  themes: 'Themes',              // MongoDB has 'Themes' with capital T
  storyParameters: 'StoryParameters',  // MongoDB has 'StoryParameters' in camelCase
  stories: 'stories',            // Assuming lowercase (not mentioned in your list)
  story_drafts: 'story_drafts',  // Assuming lowercase (not mentioned in your list)
  story_parameters: 'StoryParameters',  // Same as storyParameters
  story_audio: 'story_audio'     // Audio cache for TTS
};

module.exports = { COLLECTION_NAMES };