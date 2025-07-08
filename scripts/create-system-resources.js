#!/usr/bin/env node

require('dotenv').config();
const { connectToDatabase } = require('../lib/database');
const { COLLECTION_NAMES } = require('../lib/collectionNames');

const systemResources = {
  themes: [
    {
      name: "Adventure & Discovery",
      description: "Stories about exploring new places and finding treasures"
    },
    {
      name: "Friendship & Teamwork", 
      description: "Tales of working together and forming bonds"
    },
    {
      name: "Magic & Wonder",
      description: "Enchanting stories filled with magical elements"
    },
    {
      name: "Problem Solving",
      description: "Stories where characters overcome challenges through cleverness"
    },
    {
      name: "Family & Love",
      description: "Heartwarming tales about family bonds and caring"
    }
  ],
  
  archetypes: [
    {
      name: "The Hero",
      description: "Brave character who saves the day"
    },
    {
      name: "The Mentor",
      description: "Wise teacher who guides others"
    },
    {
      name: "The Trickster",
      description: "Playful character who uses wit and humor"
    },
    {
      name: "The Helper",
      description: "Loyal friend who supports the hero"
    },
    {
      name: "The Explorer",
      description: "Curious adventurer seeking new experiences"
    }
  ],
  
  characters: [
    {
      fullName: {
        firstName: "Luna",
        lastName: "Starwhisper"
      },
      age: "10",
      species: "Human",
      occupation: "Young Wizard Apprentice",
      appearance: "Curly purple hair, sparkling silver eyes, and a star-shaped birthmark",
      personality: "Curious, brave, and always eager to learn new spells",
      backstory: "Found a magical book in her grandmother's attic that changed her life",
      imageUrl: ""
    },
    {
      fullName: {
        firstName: "Captain",
        lastName: "Whiskers"
      },
      age: "7",
      species: "Cat",
      occupation: "Sky Pirate",
      appearance: "Orange tabby with a tiny pirate hat and eye patch",
      personality: "Adventurous, loyal, and loves fish-flavored treats",
      backstory: "Saved from a storm by sky pirates and became their mascot",
      imageUrl: ""
    }
  ],
  
  locations: [
    {
      name: "The Enchanted Library",
      description: "A magical library where books come to life",
      country: "Fantasyland",
      characteristics: ["Floating books", "Talking portraits", "Secret passages"],
      imageUrl: ""
    },
    {
      name: "Crystal Cave",
      description: "A cave filled with glowing crystals that sing",
      country: "Mountain Kingdom", 
      characteristics: ["Musical crystals", "Rainbow lights", "Echo chambers"],
      imageUrl: ""
    }
  ],
  
  storyParameters: [
    {
      name: "Classic Fairy Tale",
      genre: "Fantasy",
      parameters: {
        TONE: "Whimsical and enchanting",
        SETTING: "Magical kingdom with castles and forests",
        CONFLICT: "Good versus evil with a happy ending",
        THEMES: "Courage, kindness, and believing in yourself"
      }
    },
    {
      name: "Space Adventure",
      genre: "Science Fiction",
      parameters: {
        TONE: "Exciting and wonder-filled",
        SETTING: "Outer space with alien planets",
        CONFLICT: "Exploration challenges and making new friends",
        THEMES: "Discovery, cooperation, and embracing differences"
      }
    }
  ]
};

async function createSystemResources() {
  console.log('Creating system default resources...');
  
  try {
    const { db } = await connectToDatabase();
    const systemUserId = 'system';
    const now = new Date();
    
    // Helper to add system fields
    const addSystemFields = (item) => ({
      ...item,
      userId: systemUserId,
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId
    });
    
    // Create resources for each collection
    for (const [collectionKey, resources] of Object.entries(systemResources)) {
      const collectionName = COLLECTION_NAMES[collectionKey];
      const collection = db.collection(collectionName);
      
      console.log(`\nCreating ${collectionKey}...`);
      
      // Check if system resources already exist
      const existingCount = await collection.countDocuments({ userId: systemUserId });
      
      if (existingCount > 0) {
        console.log(`  - Skipping: ${existingCount} system resources already exist`);
        continue;
      }
      
      // Insert system resources
      const documentsToInsert = resources.map(addSystemFields);
      const result = await collection.insertMany(documentsToInsert);
      
      console.log(`  - Created ${result.insertedCount} system ${collectionKey}`);
    }
    
    console.log('\n✅ System resources created successfully!');
    console.log('\nThese resources will be available to all users as defaults.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to create system resources:', error);
    process.exit(1);
  }
}

// Run the script
createSystemResources();