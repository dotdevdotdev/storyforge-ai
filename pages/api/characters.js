import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Migration function to update existing characters to new schema
async function migrateCharacter(character) {
  if (!character.fullName) {
    return {
      ...character,
      fullName: {
        firstName: character.name.split(" ")[0] || "",
        lastName: character.name.split(" ").slice(1).join(" ") || "",
      },
      appearance: character.description || "",
      backstory: "",
      personality: "",
      otherInfo: [],
      roleplayingGuidance: "",
      imageUrl: character.imageUrl || "",
      createdAt: character.createdAt || new Date(),
      updatedAt: character.updatedAt,
    };
  }
  return character;
}

export default async function handler(req, res) {
  if (!uri || !dbName) {
    console.error("MongoDB configuration missing");
    return res.status(500).json({ error: "MongoDB configuration missing" });
  }

  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection("Characters");

    if (req.method === "POST") {
      const characterData = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await collection.insertOne(characterData);
      res.status(201).json({
        message: "Character created successfully",
        id: result.insertedId,
      });
    } else if (req.method === "GET") {
      const characters = await collection.find({}).toArray();
      const migratedCharacters = await Promise.all(
        characters.map(migrateCharacter)
      );
      res.status(200).json(migratedCharacters);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
