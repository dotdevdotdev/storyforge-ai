import { COLLECTION_NAMES } from "../../lib/collectionNames";
import dal from "../../lib/services/dataAccessLayer";
import { withAuth } from "../../middleware/withAuth";

async function handler(req, res) {
  try {
    const userId = req.userId; // Added by withAuth middleware

    if (req.method === "POST") {
      const archetypeData = {
        ...req.body,
      };
      const result = await dal.create(COLLECTION_NAMES.archetypes, archetypeData, userId);
      res.status(201).json({
        message: "Archetype created successfully",
        id: result._id,
        archetype: result,
      });
    } else if (req.method === "GET") {
      const archetypes = await dal.find(COLLECTION_NAMES.archetypes, {}, userId);
      res.status(200).json(archetypes);
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

export default (req, res) => withAuth(req, res, handler);