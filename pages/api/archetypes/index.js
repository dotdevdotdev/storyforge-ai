import { connectToDatabase } from "../../../lib/database";
import { COLLECTION_NAMES } from "../../../lib/collectionNames";


export default async function handler(req, res) {
  try {
    const { db, getObjectId, isUsingMock } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAMES.archetypes);

    if (req.method === "POST") {
      const archetypeData = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await collection.insertOne(archetypeData);
      res.status(201).json({
        message: "Archetype created successfully",
        id: result.insertedId,
      });
    } else if (req.method === "GET") {
      const archetypes = await collection.find({}).toArray();
      res.status(200).json(archetypes);
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
