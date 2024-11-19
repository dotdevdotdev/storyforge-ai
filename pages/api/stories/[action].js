import { asyncHandler } from '../../../lib/errors/handler';
import storyService from '../../../lib/services/storyService';

// Temporary user ID until auth is implemented
const TEMP_USER_ID = 'temp_user_123';

const handlers = {
  save: async (req, res) => {
    const storyData = {
      ...req.body,
      userId: TEMP_USER_ID,
    };
    const story = await storyService.saveStory(storyData);
    res.json(story);
  },

  update: async (req, res) => {
    const { storyId, ...updates } = req.body;
    const story = await storyService.updateStory(storyId, updates);
    res.json(story);
  },

  get: async (req, res) => {
    const { storyId } = req.query;
    const story = await storyService.getStory(storyId);
    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }
    res.json(story);
  },

  list: async (req, res) => {
    const { skip, limit, includeUnpublished } = req.query;
    const stories = await storyService.getUserStories(TEMP_USER_ID, {
      skip: parseInt(skip),
      limit: parseInt(limit),
      includeUnpublished: includeUnpublished === 'true',
    });
    res.json(stories);
  },

  draft: async (req, res) => {
    const draftData = {
      ...req.body,
      userId: TEMP_USER_ID,
    };
    const draft = await storyService.saveDraft(draftData);
    res.json(draft);
  },

  'update-draft': async (req, res) => {
    const { draftId, ...updates } = req.body;
    const success = await storyService.updateDraft(draftId, updates);
    res.json({ success });
  },

  drafts: async (req, res) => {
    const drafts = await storyService.getUserDrafts(TEMP_USER_ID);
    res.json(drafts);
  },

  recover: async (req, res) => {
    const { draftId } = req.body;
    const story = await storyService.recoverStory(draftId);
    res.json(story);
  },

  search: async (req, res) => {
    const { term } = req.query;
    const stories = await storyService.searchStories(TEMP_USER_ID, term);
    res.json(stories);
  },
};

export default asyncHandler(async (req, res) => {
  const { action } = req.query;
  const handler = handlers[action];

  if (!handler) {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }

  await handler(req, res);
});
