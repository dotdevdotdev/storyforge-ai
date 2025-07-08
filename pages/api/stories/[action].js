import { asyncHandler } from '../../../lib/errors/handler';
import storyService from '../../../lib/services/storyService';
import { withAuth } from '../../../middleware/withAuth';

const handlers = {
  save: async (req, res) => {
    const userId = req.userId; // From auth middleware
    const storyData = {
      ...req.body,
      userId,
    };
    const story = await storyService.saveStory(storyData);
    res.json(story);
  },

  update: async (req, res) => {
    const userId = req.userId;
    const { storyId, ...updates } = req.body;
    // Verify ownership before updating
    const existing = await storyService.getStory(storyId);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Story not found or access denied' });
    }
    const story = await storyService.updateStory(storyId, updates);
    res.json(story);
  },

  get: async (req, res) => {
    const userId = req.userId;
    const { storyId } = req.query;
    const story = await storyService.getStory(storyId);
    if (!story || (story.userId !== userId && story.visibility !== 'public')) {
      res.status(404).json({ error: 'Story not found or access denied' });
      return;
    }
    res.json(story);
  },

  list: async (req, res) => {
    const userId = req.userId;
    const { skip, limit, includeUnpublished } = req.query;
    const stories = await storyService.getUserStories(userId, {
      skip: parseInt(skip),
      limit: parseInt(limit),
      includeUnpublished: includeUnpublished === 'true',
    });
    res.json(stories);
  },

  draft: async (req, res) => {
    const userId = req.userId;
    const draftData = {
      ...req.body,
      userId,
    };
    const draft = await storyService.saveDraft(draftData);
    res.json(draft);
  },

  'update-draft': async (req, res) => {
    const userId = req.userId;
    const { draftId, ...updates } = req.body;
    // Verify ownership before updating
    const existingDraft = await storyService.getDraft(draftId);
    if (!existingDraft || existingDraft.userId !== userId) {
      return res.status(404).json({ error: 'Draft not found or access denied' });
    }
    const success = await storyService.updateDraft(draftId, updates);
    res.json({ success });
  },

  drafts: async (req, res) => {
    const userId = req.userId;
    const drafts = await storyService.getUserDrafts(userId);
    res.json(drafts);
  },

  recover: async (req, res) => {
    const userId = req.userId;
    const { draftId } = req.body;
    // Verify ownership before recovering
    const existingDraft = await storyService.getDraft(draftId);
    if (!existingDraft || existingDraft.userId !== userId) {
      return res.status(404).json({ error: 'Draft not found or access denied' });
    }
    const story = await storyService.recoverStory(draftId);
    res.json(story);
  },

  search: async (req, res) => {
    const userId = req.userId;
    const { term } = req.query;
    const stories = await storyService.searchStories(userId, term);
    res.json(stories);
  },
};

async function handler(req, res) {
  const { action } = req.query;
  const handlerFunc = handlers[action];

  if (!handlerFunc) {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }

  await handlerFunc(req, res);
}

export default (req, res) => withAuth(req, res, asyncHandler(handler));