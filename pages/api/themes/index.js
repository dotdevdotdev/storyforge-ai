import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

export default async function handler(req, res) {
  if (!uri || !dbName) {
    console.error("MongoDB configuration missing");
    return res.status(500).json({ error: "MongoDB configuration missing" });
  }

  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection("Themes");

    if (req.method === "POST") {
      const themeData = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await collection.insertOne(themeData);
      res.status(201).json({
        message: "Theme created successfully",
        id: result.insertedId,
      });
    } else if (req.method === "GET") {
      const themes = await collection.find({}).toArray();
      res.status(200).json(themes);
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
