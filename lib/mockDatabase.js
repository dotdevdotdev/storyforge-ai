// Mock Database for Development
// Provides sample data when MongoDB is not available

class MockObjectId {
  constructor(id) {
    this.id = id || Math.random().toString(36).substring(2, 15);
  }
  
  toString() {
    return this.id;
  }
}

// Sample data for development
const mockData = {
  stories: [
    {
      _id: new MockObjectId('story1'),
      content: 'Once upon a time in a magical kingdom, there lived a brave knight who embarked on an epic quest to save the realm from an ancient curse.',
      imageUrl: 'https://via.placeholder.com/400x300/6366f1/white?text=Fantasy+Story',
      name: 'The Knight\'s Quest',
      genre: 'Fantasy',
      parameters: {
        characters: ['Sir Galahad', 'Princess Elena'],
        themes: ['courage', 'sacrifice'],
        setting: 'Medieval Kingdom'
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      version: 1,
      isPublished: true,
      userId: 'user1'
    },
    {
      _id: new MockObjectId('story2'),
      content: 'In the year 2150, humanity had colonized Mars, but something strange was happening in the underground tunnels of the red planet.',
      imageUrl: 'https://via.placeholder.com/400x300/ef4444/white?text=Sci-Fi+Story',
      name: 'Mars Underground',
      genre: 'Science Fiction',
      parameters: {
        characters: ['Dr. Sarah Chen', 'Commander Rex'],
        themes: ['exploration', 'mystery'],
        setting: 'Mars Colony 2150'
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      version: 1,
      isPublished: true,
      userId: 'user1'
    }
  ],
  
  characters: [
    {
      _id: new MockObjectId('char1'),
      name: 'Sir Galahad',
      description: 'A noble knight of the Round Table, known for his purity and courage.',
      imageUrl: 'https://via.placeholder.com/200x200/3b82f6/white?text=Knight',
      tags: ['noble', 'brave', 'pure'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: new MockObjectId('char2'),
      name: 'Dr. Sarah Chen',
      description: 'A brilliant xenobiologist studying life on Mars.',
      imageUrl: 'https://via.placeholder.com/200x200/10b981/white?text=Scientist',
      tags: ['intelligent', 'curious', 'determined'],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ],
  
  themes: [
    {
      _id: new MockObjectId('theme1'),
      name: 'Courage',
      description: 'The theme of bravery in the face of danger.',
      tags: ['heroism', 'bravery', 'valor'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: new MockObjectId('theme2'),
      name: 'Mystery',
      description: 'Unknown elements that need to be discovered.',
      tags: ['unknown', 'discovery', 'suspense'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  
  archetypes: [
    {
      _id: new MockObjectId('arch1'),
      name: 'The Hero',
      description: 'The protagonist who overcomes challenges.',
      tags: ['protagonist', 'brave', 'determined'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: new MockObjectId('arch2'),
      name: 'The Mentor',
      description: 'The wise guide who helps the hero.',
      tags: ['wise', 'helpful', 'experienced'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  
  locations: [
    {
      _id: new MockObjectId('loc1'),
      name: 'Camelot',
      description: 'The legendary castle and court of King Arthur.',
      imageUrl: 'https://via.placeholder.com/300x200/8b5cf6/white?text=Castle',
      tags: ['medieval', 'castle', 'legendary'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: new MockObjectId('loc2'),
      name: 'Mars Colony Alpha',
      description: 'The first human settlement on Mars.',
      imageUrl: 'https://via.placeholder.com/300x200/f59e0b/white?text=Mars+Base',
      tags: ['futuristic', 'colony', 'space'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  
  story_parameters: [
    {
      _id: new MockObjectId('param1'),
      name: 'Fantasy Adventure',
      genre: 'Fantasy',
      parameters: {
        characters: ['Sir Galahad', 'Princess Elena'],
        themes: ['courage', 'sacrifice'],
        setting: 'Medieval Kingdom',
        length: 'medium',
        tone: 'heroic'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: new MockObjectId('param2'),
      name: 'Sci-Fi Mystery',
      genre: 'Science Fiction',
      parameters: {
        characters: ['Dr. Sarah Chen', 'Commander Rex'],
        themes: ['exploration', 'mystery'],
        setting: 'Mars Colony 2150',
        length: 'long',
        tone: 'mysterious'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]
};

// Mock Collection class that mimics MongoDB collection methods
class MockCollection {
  constructor(data) {
    this.data = [...data]; // Copy the data
  }
  
  find(query = {}) {
    // Simple query matching - in real implementation would be more sophisticated
    let results = this.data;
    
    if (Object.keys(query).length > 0) {
      results = this.data.filter(item => {
        return Object.entries(query).every(([key, value]) => {
          if (key === '_id' && typeof value === 'object' && value.id) {
            return item._id.toString() === value.toString();
          }
          return item[key] === value;
        });
      });
    }
    
    // Return a cursor-like object that mimics MongoDB cursor
    const cursor = {
      sort: (sortObj) => cursor,
      skip: (count) => cursor,
      limit: (count) => {
        results = results.slice(0, count);
        return cursor;
      },
      toArray: async () => [...results]
    };
    
    return cursor;
  }
  
  async findOne(query) {
    const results = this.data.filter(item => {
      return Object.entries(query).every(([key, value]) => {
        if (key === '_id' && typeof value === 'object' && value.id) {
          return item._id.toString() === value.toString();
        }
        return item[key] === value;
      });
    });
    return results[0] || null;
  }
  
  async insertOne(doc) {
    const newDoc = {
      ...doc,
      _id: new MockObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(newDoc);
    return { insertedId: newDoc._id };
  }
  
  async updateOne(query, update) {
    const index = this.data.findIndex(item => {
      return Object.entries(query).every(([key, value]) => {
        if (key === '_id' && typeof value === 'object' && value.id) {
          return item._id.toString() === value.toString();
        }
        return item[key] === value;
      });
    });
    
    if (index !== -1) {
      if (update.$set) {
        this.data[index] = { ...this.data[index], ...update.$set, updatedAt: new Date() };
      }
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }
  
  async deleteOne(query) {
    const index = this.data.findIndex(item => {
      return Object.entries(query).every(([key, value]) => {
        if (key === '_id' && typeof value === 'object' && value.id) {
          return item._id.toString() === value.toString();
        }
        return item[key] === value;
      });
    });
    
    if (index !== -1) {
      this.data.splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

// Mock Database class
class MockDatabase {
  constructor() {
    this.collections = {
      stories: new MockCollection(mockData.stories),
      characters: new MockCollection(mockData.characters),
      themes: new MockCollection(mockData.themes),
      archetypes: new MockCollection(mockData.archetypes),
      locations: new MockCollection(mockData.locations),
      story_parameters: new MockCollection(mockData.story_parameters),
      story_drafts: new MockCollection([])
    };
  }
  
  collection(name) {
    return this.collections[name] || new MockCollection([]);
  }
}

// Mock Client class
class MockClient {
  constructor() {
    this.isConnected = false;
  }
  
  async connect() {
    console.log('🎭 Using Mock Database - MongoDB not available');
    this.isConnected = true;
    return this;
  }
  
  db(name) {
    return new MockDatabase();
  }
  
  async close() {
    this.isConnected = false;
  }
}

module.exports = {
  MockClient,
  MockObjectId,
  mockData
};