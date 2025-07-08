import { COLLECTION_NAMES } from "../../../lib/collectionNames";
import dal from "../../../lib/services/dataAccessLayer";
import { withAuth } from "../../../middleware/withAuth";

async function handler(req, res) {
  try {
    const userId = req.userId; // Added by withAuth middleware

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

      const result = await dal.create(
        COLLECTION_NAMES.storyParameters,
        parameterData,
        userId
      );
      
      res.status(201).json({
        message: "Story parameters created successfully",
        id: result._id,
        storyParameter: result,
      });
    } else if (req.method === "GET") {
      const parameters = await dal.find(
        COLLECTION_NAMES.storyParameters,
        {},
        userId
      );
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

export default (req, res) => withAuth(req, res, handler);