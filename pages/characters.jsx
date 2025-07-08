import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { Button, Input, Textarea, Card, LoadingSpinner, PageHeader } from "../components/ui";
import ImageUpload from "../components/ImageUpload";

// Define the allowed character fields
const VALID_CHARACTER_FIELDS = [
  "name",
  "fullName", 
  "appearance",
  "backstory",
  "personality",
  "otherInfo",
  "roleplayingGuidance",
  "imageUrl",
];

const CharacterModal = ({ character, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState(null);
  const [editedCharacter, setEditedCharacter] = useState(character);

  const cleanCharacterData = (data) => {
    const cleanData = {};
    VALID_CHARACTER_FIELDS.forEach((field) => {
      if (data[field] !== undefined) {
        cleanData[field] = data[field];
      }
    });

    if (cleanData.fullName) {
      cleanData.fullName = {
        firstName: cleanData.fullName.firstName || "",
        lastName: cleanData.fullName.lastName || "",
      };
    }

    if (cleanData.otherInfo) {
      cleanData.otherInfo = Array.isArray(cleanData.otherInfo)
        ? cleanData.otherInfo.filter((item) => typeof item === "string")
        : [];
    }

    return cleanData;
  };

  const handleSave = async () => {
    const characterToUpdate = isJsonMode
      ? (() => {
          try {
            const parsed = JSON.parse(jsonInput);
            return cleanCharacterData(parsed);
          } catch (error) {
            setJsonError("Invalid JSON format");
            return null;
          }
        })()
      : cleanCharacterData(editedCharacter);

    if (!characterToUpdate) return;

    try {
      const response = await fetch(`/api/characters/${character._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(characterToUpdate),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
        setIsEditing(false);
        setJsonError(null);
      }
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this character?")) return;

    try {
      const response = await fetch(`/api/characters/${character._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate(null);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  useEffect(() => {
    if (isJsonMode && character) {
      setJsonInput(JSON.stringify(cleanCharacterData(character), null, 2));
    }
  }, [isJsonMode, character]);

  if (!character) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{character.name}</h2>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsJsonMode(!isJsonMode)}>
                  {isJsonMode ? "Form Mode" : "JSON Mode"}
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isEditing && isJsonMode ? (
            <div>
              <Textarea
                label="Character JSON"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={20}
                error={jsonError}
                className="font-mono"
              />
            </div>
          ) : isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Name"
                  value={editedCharacter.name || ""}
                  onChange={(e) => setEditedCharacter({...editedCharacter, name: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={editedCharacter.fullName?.firstName || ""}
                    onChange={(e) => setEditedCharacter({
                      ...editedCharacter,
                      fullName: {...editedCharacter.fullName, firstName: e.target.value}
                    })}
                  />
                  <Input
                    label="Last Name"
                    value={editedCharacter.fullName?.lastName || ""}
                    onChange={(e) => setEditedCharacter({
                      ...editedCharacter,
                      fullName: {...editedCharacter.fullName, lastName: e.target.value}
                    })}
                  />
                </div>

                <Input
                  label="Image URL"
                  value={editedCharacter.imageUrl || ""}
                  onChange={(e) => setEditedCharacter({...editedCharacter, imageUrl: e.target.value})}
                />
              </div>

              <div>
                <Textarea
                  label="Appearance"
                  value={editedCharacter.appearance || ""}
                  onChange={(e) => setEditedCharacter({...editedCharacter, appearance: e.target.value})}
                  rows={3}
                />

                <Textarea
                  label="Backstory"
                  value={editedCharacter.backstory || ""}
                  onChange={(e) => setEditedCharacter({...editedCharacter, backstory: e.target.value})}
                  rows={4}
                />

                <Textarea
                  label="Personality"
                  value={editedCharacter.personality || ""}
                  onChange={(e) => setEditedCharacter({...editedCharacter, personality: e.target.value})}
                  rows={3}
                />

                <Textarea
                  label="Roleplaying Guidance"
                  value={editedCharacter.roleplayingGuidance || ""}
                  onChange={(e) => setEditedCharacter({...editedCharacter, roleplayingGuidance: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {character.imageUrl && (
                <div className="md:col-span-1">
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className={character.imageUrl ? "md:col-span-2" : "md:col-span-3"}>
                <div className="space-y-4">
                  {character.fullName && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Name</h3>
                      <p className="text-gray-700">{character.fullName.firstName} {character.fullName.lastName}</p>
                    </div>
                  )}

                  {character.appearance && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Appearance</h3>
                      <p className="text-gray-700">{character.appearance}</p>
                    </div>
                  )}

                  {character.backstory && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Backstory</h3>
                      <p className="text-gray-700">{character.backstory}</p>
                    </div>
                  )}

                  {character.personality && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Personality</h3>
                      <p className="text-gray-700">{character.personality}</p>
                    </div>
                  )}

                  {character.roleplayingGuidance && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Roleplaying Guidance</h3>
                      <p className="text-gray-700">{character.roleplayingGuidance}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    imageUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCharacter.name.trim()) return;

    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCharacter),
      });

      if (response.ok) {
        const result = await response.json();
        // The response includes both the character and the ID
        const newChar = result.character || result;
        
        // Add the new character to the list
        setCharacters(prevCharacters => [newChar, ...prevCharacters]);
        
        // Reset the form
        setNewCharacter({ name: "", imageUrl: "", description: "" });
        
        // Optional: Show a success message
        console.log("Character created successfully:", newChar);
      }
    } catch (error) {
      console.error("Error creating character:", error);
    }
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    if (updatedCharacter === null) {
      // Character was deleted
      setCharacters(characters.filter(c => c._id !== selectedCharacter._id));
    } else {
      // Character was updated
      setCharacters(characters.map(c => 
        c._id === updatedCharacter._id ? updatedCharacter : c
      ));
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading characters..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader 
        title="Characters"
        subtitle="Create and manage your story characters"
      />

      {/* Character Creation Form */}
      <Card className="mb-8 overflow-visible">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Character</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
              required
            />
            
            <Input
              label="Image URL"
              type="url"
              value={newCharacter.imageUrl}
              onChange={(e) => setNewCharacter({...newCharacter, imageUrl: e.target.value})}
              helperText="Optional: Add a URL to a character image"
            />
          </div>

          <Textarea
            label="Description"
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
            rows={3}
            helperText="Describe the character's appearance, personality, or background"
          />

          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Character
            </Button>
          </div>
        </form>
      </Card>

      {/* Characters List */}
      {characters.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">No characters created yet.</p>
          <p className="text-gray-400 mt-2">Create your first character using the form above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card 
              key={character._id || `temp-${character.name}`}
              onClick={() => setSelectedCharacter(character)}
              hoverable
              className="cursor-pointer"
            >
              {character.imageUrl && (
                <div className="mb-4">
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {character.name}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-3">
                {character.description || character.appearance || "No description available."}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onUpdate={handleCharacterUpdate}
        />
      )}
    </Layout>
  );
};

export default Characters;