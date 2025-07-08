import { COLLECTION_NAMES } from "../../lib/collectionNames";
import dal from "../../lib/services/dataAccessLayer";
import { withAuth } from "../../middleware/withAuth";

// Migration function to update existing characters to new schema
async function migrateCharacter(character) {
  if (!character.fullName) {
    return {
      ...character,
      fullName: {
        firstName: character.name.split(" ")[0] || "",
        lastName: character.name.split(" ").slice(1).join(" ") || "",
      },
      appearance: character.description || "",
      backstory: "",
      personality: "",
      otherInfo: [],
      roleplayingGuidance: "",
      imageUrl: character.imageUrl || "",
      createdAt: character.createdAt || new Date(),
      updatedAt: character.updatedAt,
    };
  }
  return character;
}

async function handler(req, res) {
  try {
    const userId = req.userId; // Added by withAuth middleware

    if (req.method === "POST") {
      const characterData = {
        ...req.body,
      };
      const result = await dal.create(COLLECTION_NAMES.characters, characterData, userId);
      res.status(201).json({
        message: "Character created successfully",
        id: result._id,
        character: result,
      });
    } else if (req.method === "GET") {
      const characters = await dal.find(COLLECTION_NAMES.characters, {}, userId);
      const migratedCharacters = await Promise.all(
        characters.map(migrateCharacter)
      );
      res.status(200).json(migratedCharacters);
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
