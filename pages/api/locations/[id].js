import { MongoClient, ObjectId } from "mongodb";
import { COLLECTION_NAMES } from "../../../lib/collectionNames";


const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

export default async function handler(req, res) {
  if (!uri || !dbName) {
    console.error("MongoDB configuration missing");
    return res.status(500).json({ error: "MongoDB configuration missing" });
  }

  const { id } = req.query;
  console.log("Received ID:", id);

  if (!id) {
    return res.status(400).json({ message: "Location ID is required" });
  }

  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection(COLLECTION_NAMES.locations);

    if (req.method === "PUT") {
      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };
      delete updateData._id;

      try {
        const objectId = new ObjectId(id);
        const result = await collection.findOneAndUpdate(
          { _id: objectId },
          { $set: updateData },
          { returnDocument: "after" }
        );

        if (!result) {
          return res.status(404).json({ message: "Location not found" });
        }

        res.status(200).json(result);
      } catch (idError) {
        return res.status(400).json({ message: "Invalid location ID format" });
      }
    } else if (req.method === "GET") {
      const location = await collection.findOne({ _id: new ObjectId(id) });

      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.status(200).json(location);
    } else if (req.method === "DELETE") {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.status(200).json({ message: "Location deleted successfully" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
