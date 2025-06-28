import { connectToDatabase } from "../../lib/database";

export default async function handler(req, res) {
  try {
    const { db, getObjectId, isUsingMock } = await connectToDatabase();
    const collection = db.collection("locations");

    if (req.method === "POST") {
      const locationData = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await collection.insertOne(locationData);
      res.status(201).json({
        message: "Location created successfully",
        id: result.insertedId,
      });
    } else if (req.method === "GET") {
      const locations = await collection.find({}).toArray();
      res.status(200).json(locations);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
