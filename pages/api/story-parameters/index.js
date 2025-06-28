import { connectToDatabase } from "../../../lib/database";

export default async function handler(req, res) {
  try {
    const { db, getObjectId, isUsingMock } = await connectToDatabase();
    const collection = db.collection("story_parameters");

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
    console.error("Database operation failed:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
