import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

export default async function handler(req, res) {
  if (!uri) {
    console.error("MONGODB_URI is not defined");
    return res.status(500).json({ error: "MongoDB URI is not configured" });
  }

  if (!dbName) {
    console.error("MONGODB_DB is not defined");
    return res
      .status(500)
      .json({ error: "MongoDB database name is not configured" });
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
      res.status(200).json(characters);
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
