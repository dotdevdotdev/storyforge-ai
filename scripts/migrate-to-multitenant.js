#!/usr/bin/env node

require('dotenv').config();
const { connectToDatabase } = require('../lib/database');
const { COLLECTION_NAMES } = require('../lib/collectionNames');

async function migrateToMultitenant() {
  console.log('Starting multi-tenant migration...');
  
  try {
    const { db } = await connectToDatabase();
    
    // Get or create system user
    const systemUserId = 'system';
    const now = new Date();
    
    // Collections to migrate
    const collections = [
      COLLECTION_NAMES.stories,
      COLLECTION_NAMES.story_drafts,
      COLLECTION_NAMES.story_parameters,
      COLLECTION_NAMES.characters,
      COLLECTION_NAMES.locations,
      COLLECTION_NAMES.themes,
      COLLECTION_NAMES.archetypes
    ];
    
    // Migrate each collection
    for (const collectionName of collections) {
      console.log(`\nMigrating collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      
      // Count documents without userId
      const documentsWithoutUserId = await collection.countDocuments({
        userId: { $exists: false }
      });
      
      console.log(`  - Found ${documentsWithoutUserId} documents without userId`);
      
      if (documentsWithoutUserId > 0) {
        // Update all documents without userId
        const result = await collection.updateMany(
          { userId: { $exists: false } },
          {
            $set: {
              userId: systemUserId,
              createdAt: now,
              updatedAt: now,
              createdBy: systemUserId
            }
          }
        );
        
        console.log(`  - Updated ${result.modifiedCount} documents`);
      }
      
      // Create index on userId for performance
      await collection.createIndex({ userId: 1 });
      console.log(`  - Created index on userId`);
    }
    
    // Create text index on stories for search
    const storiesCollection = db.collection(COLLECTION_NAMES.stories);
    try {
      await storiesCollection.createIndex({ title: 'text', content: 'text' });
      console.log('\nCreated text index on stories collection');
    } catch (error) {
      console.log('Text index already exists or failed to create:', error.message);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('- All existing resources have been assigned to the system user');
    console.log('- UserId indexes have been created for all collections');
    console.log('- Text search index created on stories');
    console.log('\nNext steps:');
    console.log('1. Test the application with authentication');
    console.log('2. Create some user-specific resources');
    console.log('3. Verify data isolation is working correctly');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToMultitenant();