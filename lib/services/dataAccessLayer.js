const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../database');
const { DatabaseError } = require('../errors/types');

class DataAccessLayer {
  constructor() {
    this.systemUserId = 'system'; // Special ID for system/global resources
  }

  /**
   * Get database connection
   */
  async getDb() {
    const { db } = await connectToDatabase();
    return db;
  }

  /**
   * Create a resource with user ownership
   */
  async create(collection, data, userId) {
    if (!userId) {
      throw new DatabaseError('userId is required for creating resources');
    }

    const db = await this.getDb();
    const now = new Date();
    
    const document = {
      ...data,
      userId,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    const result = await db.collection(collection).insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  /**
   * Find resources filtered by user ownership
   * Includes both user-owned and system resources
   */
  async find(collection, query = {}, userId, options = {}) {
    if (!userId) {
      throw new DatabaseError('userId is required for finding resources');
    }

    const db = await this.getDb();
    
    // Build query that includes user's resources and system resources
    const ownershipQuery = {
      $or: [
        { userId: userId },
        { userId: this.systemUserId }
      ]
    };

    const finalQuery = {
      ...query,
      ...ownershipQuery
    };

    const cursor = db.collection(collection).find(finalQuery);
    
    if (options.sort) {
      cursor.sort(options.sort);
    }
    
    if (options.limit) {
      cursor.limit(options.limit);
    }
    
    if (options.skip) {
      cursor.skip(options.skip);
    }

    return await cursor.toArray();
  }

  /**
   * Find a single resource by ID with ownership check
   */
  async findById(collection, id, userId) {
    if (!userId) {
      throw new DatabaseError('userId is required for finding resources');
    }

    const db = await this.getDb();
    
    const resource = await db.collection(collection).findOne({
      _id: new ObjectId(id),
      $or: [
        { userId: userId },
        { userId: this.systemUserId }
      ]
    });

    if (!resource) {
      throw new DatabaseError('Resource not found or access denied');
    }

    return resource;
  }

  /**
   * Update a resource with ownership check
   */
  async update(collection, id, updates, userId) {
    if (!userId) {
      throw new DatabaseError('userId is required for updating resources');
    }

    const db = await this.getDb();
    
    // First check if user owns the resource
    const existing = await db.collection(collection).findOne({
      _id: new ObjectId(id),
      userId: userId // Can only update own resources, not system resources
    });

    if (!existing) {
      throw new DatabaseError('Resource not found or access denied');
    }

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new DatabaseError('Failed to update resource');
    }

    return await this.findById(collection, id, userId);
  }

  /**
   * Delete a resource with ownership check
   */
  async delete(collection, id, userId) {
    if (!userId) {
      throw new DatabaseError('userId is required for deleting resources');
    }

    const db = await this.getDb();
    
    // Can only delete own resources, not system resources
    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (result.deletedCount === 0) {
      throw new DatabaseError('Resource not found or access denied');
    }

    return { success: true };
  }

  /**
   * Count resources for a user
   */
  async count(collection, query = {}, userId) {
    if (!userId) {
      throw new DatabaseError('userId is required for counting resources');
    }

    const db = await this.getDb();
    
    const ownershipQuery = {
      $or: [
        { userId: userId },
        { userId: this.systemUserId }
      ]
    };

    const finalQuery = {
      ...query,
      ...ownershipQuery
    };

    return await db.collection(collection).countDocuments(finalQuery);
  }

  /**
   * Create system/global resource (admin only)
   */
  async createSystemResource(collection, data) {
    return await this.create(collection, data, this.systemUserId);
  }

  /**
   * Migrate existing resources to a user
   */
  async migrateResourcesToUser(collection, userId) {
    const db = await this.getDb();
    const now = new Date();
    
    // Find all resources without userId
    const result = await db.collection(collection).updateMany(
      { userId: { $exists: false } },
      { 
        $set: {
          userId: userId,
          createdAt: now,
          updatedAt: now,
          createdBy: userId
        }
      }
    );

    return {
      migrated: result.modifiedCount,
      matched: result.matchedCount
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    if (!userId) {
      throw new DatabaseError('userId is required for getting statistics');
    }

    const stats = {};
    const collections = [
      'stories',
      'story_parameters',
      'characters',
      'locations',
      'themes',
      'archetypes'
    ];

    for (const collection of collections) {
      stats[collection] = await this.count(collection, { userId }, userId);
    }

    return stats;
  }
}

module.exports = new DataAccessLayer();