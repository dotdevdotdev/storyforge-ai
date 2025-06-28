const { MongoClient, ObjectId } = require('mongodb');
const { DatabaseError } = require('../errors/types');
const { MockClient, MockObjectId } = require('../mockDatabase');
require('dotenv').config();

const MONGODB_DB = process.env.MONGODB_DB || 'storyforge';
const MONGODB_URI = `mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || '27017'}/${MONGODB_DB}`;

class StoryService {
  constructor() {
    this.client = null;
    this.stories = null;
    this.drafts = null;
    this.parameters = null;
    this.usingMockDatabase = false;
    this.initialize();
  }

  async initialize() {
    try {
      if (!this.client) {
        // Try MongoDB first
        try {
          const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
          this.client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          await this.client.connect();
          
          const db = this.client.db(MONGODB_DB);
          this.stories = db.collection('stories');
          this.drafts = db.collection('story_drafts');
          this.parameters = db.collection('story_parameters');
          
          console.log('✅ MongoDB connection initialized');
          this.usingMockDatabase = false;
        } catch (mongoError) {
          console.warn('⚠️ MongoDB connection failed, falling back to mock database');
          
          // Fallback to mock database
          this.client = new MockClient();
          await this.client.connect();
          
          const db = this.client.db(MONGODB_DB);
          this.stories = db.collection('stories');
          this.drafts = db.collection('story_drafts');
          this.parameters = db.collection('story_parameters');
          
          this.usingMockDatabase = true;
        }
      }
    } catch (error) {
      console.error('Failed to initialize any database connection:', error);
      throw new DatabaseError('Failed to connect to database', error);
    }
  }

  async ensureConnection() {
    if (!this.client || !this.stories || !this.drafts || !this.parameters) {
      await this.initialize();
    }
  }

  // Helper method to get the correct ObjectId class
  getObjectId(id) {
    if (this.usingMockDatabase) {
      return new MockObjectId(id);
    } else {
      return new ObjectId(id);
    }
  }

  // Story CRUD operations
  async saveStory(storyData) {
    try {
      await this.ensureConnection();

      const story = {
        ...storyData,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isPublished: false
      };
      const result = await this.stories.insertOne(story);
      return { ...story, _id: result.insertedId };
    } catch (error) {
      console.error('Failed to save story:', error);
      throw new DatabaseError('Failed to save story', error);
    }
  }

  async updateStory(storyId, updates) {
    try {
      await this.ensureConnection();

      const story = await this.stories.findOne({ _id: this.getObjectId(storyId) });
      if (!story) throw new Error('Story not found');

      const updatedStory = {
        ...story,
        ...updates,
        updatedAt: new Date(),
        version: story.version + 1
      };

      await this.stories.updateOne(
        { _id: this.getObjectId(storyId) },
        { $set: updatedStory }
      );

      return updatedStory;
    } catch (error) {
      console.error('Failed to update story:', error);
      throw new DatabaseError('Failed to update story', error);
    }
  }

  async getStory(storyId) {
    try {
      await this.ensureConnection();

      return await this.stories.findOne({ _id: this.getObjectId(storyId) });
    } catch (error) {
      console.error('Failed to get story:', error);
      throw new DatabaseError('Failed to get story', error);
    }
  }

  async getUserStories(userId, { skip = 0, limit = 10, includeUnpublished = false } = {}) {
    try {
      await this.ensureConnection();

      const query = includeUnpublished ? {} : { isPublished: true };
      if (userId) {
        query.userId = userId;
      }

      return await this.stories
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Failed to get user stories:', error);
      throw new DatabaseError('Failed to get user stories', error);
    }
  }

  // Draft management
  async saveDraft(draft) {
    try {
      await this.ensureConnection();

      const result = await this.drafts.insertOne(draft);
      return { ...draft, _id: result.insertedId };
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new DatabaseError('Failed to save draft', error);
    }
  }

  async updateDraft(draftId, updates) {
    try {
      await this.ensureConnection();

      const result = await this.drafts.updateOne(
        { _id: this.getObjectId(draftId) },
        {
          $set: {
            ...updates,
            lastSaved: new Date()
          }
        }
      );
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to update draft:', error);
      throw new DatabaseError('Failed to update draft', error);
    }
  }

  async getDraft(draftId) {
    try {
      await this.ensureConnection();

      return await this.drafts.findOne({ _id: this.getObjectId(draftId) });
    } catch (error) {
      console.error('Failed to get draft:', error);
      throw new DatabaseError('Failed to get draft', error);
    }
  }

  async getUserDrafts(userId) {
    try {
      await this.ensureConnection();

      return await this.drafts
        .find({ userId, isRecoverable: true })
        .sort({ lastSaved: -1 })
        .toArray();
    } catch (error) {
      console.error('Failed to get user drafts:', error);
      throw new DatabaseError('Failed to get user drafts', error);
    }
  }

  // Recovery operations
  async getRecoverableStories(userId) {
    try {
      await this.ensureConnection();

      return await this.drafts
        .find({ userId, isRecoverable: true })
        .sort({ lastSaved: -1 })
        .toArray();
    } catch (error) {
      console.error('Failed to get recoverable stories:', error);
      throw new DatabaseError('Failed to get recoverable stories', error);
    }
  }

  async recoverStory(draftId) {
    try {
      await this.ensureConnection();

      const draft = await this.getDraft(draftId);
      if (!draft) throw new Error('Draft not found');

      // Save as a new story
      const story = await this.saveStory({
        ...draft,
        recoveredFrom: draftId,
        isRecovered: true
      });

      // Mark draft as recovered
      await this.drafts.updateOne(
        { _id: this.getObjectId(draftId) },
        { $set: { isRecoverable: false, recoveredTo: story._id } }
      );

      return story;
    } catch (error) {
      console.error('Failed to recover story:', error);
      throw new DatabaseError('Failed to recover story', error);
    }
  }

  // Search operations
  async searchStories(userId, searchTerm) {
    try {
      await this.ensureConnection();

      return await this.stories
        .find({
          userId,
          $text: { $search: searchTerm }
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .toArray();
    } catch (error) {
      console.error('Failed to search stories:', error);
      throw new DatabaseError('Failed to search stories', error);
    }
  }
}

// Export singleton instance
const storyService = new StoryService();
module.exports = storyService;
