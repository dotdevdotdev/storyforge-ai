import dal from "../../../lib/services/dataAccessLayer";
import { withAuth } from "../../../middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = req.userId; // From auth middleware
    const stats = await dal.getUserStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Failed to get user stats:", error);
    res.status(500).json({ error: "Failed to retrieve statistics" });
  }
}

export default (req, res) => withAuth(req, res, handler);