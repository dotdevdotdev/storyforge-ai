// Shared Database Utility with MongoDB and Mock Fallback
const { MongoClient, ObjectId } = require('mongodb');
const { MockClient, MockObjectId } = require('./mockDatabase');

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.usingMockDatabase = false;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB || 'storyforge';

    try {
      // Try MongoDB first
      console.log('🔌 Attempting MongoDB connection...');
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      
      await this.client.connect();
      this.db = this.client.db(dbName);
      
      // Test the connection
      await this.db.admin().ping();
      
      console.log('✅ MongoDB connection successful');
      this.usingMockDatabase = false;
      this.isInitialized = true;
      
    } catch (mongoError) {
      console.warn('⚠️ MongoDB connection failed, falling back to mock database');
      console.warn('MongoDB error:', mongoError.message);
      
      // Fallback to mock database
      try {
        this.client = new MockClient();
        await this.client.connect();
        this.db = this.client.db(dbName);
        
        this.usingMockDatabase = true;
        this.isInitialized = true;
        
      } catch (mockError) {
        console.error('❌ Failed to initialize mock database:', mockError);
        throw new Error('Failed to initialize any database connection');
      }
    }
  }

  async getDatabase() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.db;
  }

  async getCollection(collectionName) {
    const db = await this.getDatabase();
    return db.collection(collectionName);
  }

  getObjectId(id) {
    if (this.usingMockDatabase) {
      return new MockObjectId(id);
    } else {
      return new ObjectId(id);
    }
  }

  isUsingMockDatabase() {
    return this.usingMockDatabase;
  }

  async close() {
    if (this.client && !this.usingMockDatabase) {
      await this.client.close();
    }
    this.isInitialized = false;
    this.client = null;
    this.db = null;
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

// Helper function for API routes
async function connectToDatabase() {
  try {
    await databaseManager.initialize();
    return {
      db: await databaseManager.getDatabase(),
      getObjectId: (id) => databaseManager.getObjectId(id),
      isUsingMock: databaseManager.isUsingMockDatabase(),
      close: () => databaseManager.close()
    };
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Export both the manager and the helper function
module.exports = {
  databaseManager,
  connectToDatabase,
  DatabaseManager
};