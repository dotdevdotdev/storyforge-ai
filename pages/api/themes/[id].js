import { COLLECTION_NAMES } from "../../../lib/collectionNames";
import dal from "../../../lib/services/dataAccessLayer";
import { withAuth } from "../../../middleware/withAuth";

async function handler(req, res) {
  const { id } = req.query;
  const userId = req.userId; // Added by withAuth middleware

  if (!id) {
    return res.status(400).json({ message: "Theme ID is required" });
  }

  try {
    if (req.method === "PUT") {
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.createdBy;

      const result = await dal.update(
        COLLECTION_NAMES.themes,
        id,
        updateData,
        userId
      );

      res.status(200).json(result);
    } else if (req.method === "GET") {
      const theme = await dal.findById(
        COLLECTION_NAMES.themes,
        id,
        userId
      );
      res.status(200).json(theme);
    } else if (req.method === "DELETE") {
      await dal.delete(COLLECTION_NAMES.themes, id, userId);
      res.status(200).json({ message: "Theme deleted successfully" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    
    if (error.message === "Resource not found or access denied") {
      return res.status(404).json({ message: "Theme not found" });
    }
    
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export default (req, res) => withAuth(req, res, handler);