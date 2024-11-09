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
    const collection = db.collection("StoryParameters");

    if (req.method === "POST") {
      const parameterData =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (
        !parameterData.name ||
        !parameterData.genre ||
        !parameterData.parameters
      ) {
        return res.status(400).json({
          error: "Must include name, genre, and parameters",
        });
      }

      if (typeof parameterData.parameters !== "object") {
        return res.status(400).json({
          error: "Parameters must be an object",
        });
      }

      for (const [key, value] of Object.entries(parameterData.parameters)) {
        if (typeof value !== "string") {
          return res.status(400).json({
            error: `Value for ${key} must be a string`,
          });
        }
        if (!/^[A-Z_]+$/.test(key)) {
          return res.status(400).json({
            error: `Key "${key}" must be uppercase with underscores only`,
          });
        }
      }

      const dataToSave = {
        ...parameterData,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(dataToSave);
      res.status(201).json({
        message: "Story parameters created successfully",
        id: result.insertedId,
      });
    } else if (req.method === "GET") {
      const parameters = await collection.find({}).toArray();
      console.log("Fetched parameters:", parameters);
      res.status(200).json(parameters);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
