import { MongoClient, ObjectId } from "mongodb";

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
    return res.status(400).json({ message: "Character ID is required" });
  }

  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection("Characters");

    if (req.method === "PUT") {
      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };
      delete updateData._id;

      console.log("Attempting to update character with ID:", id);
      console.log("Update data:", updateData);

      try {
        const objectId = new ObjectId(id);
        console.log("Parsed ObjectId:", objectId);

        const result = await collection.findOneAndUpdate(
          { _id: objectId },
          { $set: updateData },
          {
            returnDocument: "after",
          }
        );

        console.log("MongoDB result:", result);

        if (!result) {
          console.log("No character found with ID:", id);
          return res.status(404).json({ message: "Character not found" });
        }

        res.status(200).json(result);
      } catch (idError) {
        console.error("Error parsing ObjectId:", idError);
        return res.status(400).json({ message: "Invalid character ID format" });
      }
    } else if (req.method === "GET") {
      const character = await collection.findOne({ _id: new ObjectId(id) });

      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.status(200).json(character);
    } else if (req.method === "DELETE") {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.status(200).json({ message: "Character deleted successfully" });
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
