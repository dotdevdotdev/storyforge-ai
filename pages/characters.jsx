import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
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
    // Create a clean object with only valid fields
    const cleanData = {};

    // Copy only valid fields
    VALID_CHARACTER_FIELDS.forEach((field) => {
      if (data[field] !== undefined) {
        cleanData[field] = data[field];
      }
    });

    // Ensure fullName has correct structure
    if (cleanData.fullName) {
      cleanData.fullName = {
        firstName: cleanData.fullName.firstName || "",
        lastName: cleanData.fullName.lastName || "",
      };
    }

    // Ensure otherInfo is an array
    if (cleanData.otherInfo) {
      cleanData.otherInfo = Array.isArray(cleanData.otherInfo)
        ? cleanData.otherInfo.filter((item) => typeof item === "string")
        : [];
    }

    // Explicitly handle imageUrl
    cleanData.imageUrl = data.imageUrl || "";

    // Preserve the original ID and timestamps
    cleanData._id = character._id;
    cleanData.createdAt = character.createdAt;

    console.log("Clean data before update:", cleanData); // Debug log
    return cleanData;
  };

  const handleJsonImport = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);

      // Clean and validate the imported data
      const cleanedData = cleanCharacterData(parsedJson);

      // Log the cleaning results
      console.log("Original JSON:", parsedJson);
      console.log("Cleaned character data:", cleanedData);

      // Update the edited character with cleaned data
      setEditedCharacter({
        ...editedCharacter,
        ...cleanedData,
      });

      setJsonError(null);
      setIsJsonMode(false); // Exit JSON mode after successful import
    } catch (error) {
      console.error("JSON import error:", error);
      setJsonError(
        "Invalid JSON format or data structure. Please check your input."
      );
    }
  };

  const handleUpdate = async () => {
    try {
      // Clean the data before sending to API
      const cleanedCharacter = cleanCharacterData(editedCharacter);

      console.log("Character ID for update:", character._id);
      console.log("Cleaned character data for update:", cleanedCharacter);

      const response = await fetch(`/api/characters/${character._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedCharacter),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update response error:", errorData);
        throw new Error(
          `Failed to update character: ${
            errorData.message || response.statusText
          }`
        );
      }

      const updatedCharacter = await response.json();
      console.log("Update successful:", updatedCharacter);
      onUpdate(updatedCharacter);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating character:", error);
      alert(`Failed to update character: ${error.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        {isEditing ? (
          <div className="edit-mode">
            <div className="edit-mode-controls">
              <button
                onClick={() => setIsJsonMode(!isJsonMode)}
                className={`mode-toggle ${isJsonMode ? "active" : ""}`}
              >
                {isJsonMode ? "Switch to Form Mode" : "Switch to JSON Mode"}
              </button>
            </div>

            {isJsonMode ? (
              <div className="json-mode">
                <h3>Paste Character JSON</h3>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError(null);
                  }}
                  className="json-input"
                  placeholder="Paste your character JSON here..."
                />
                {jsonError && <div className="error-message">{jsonError}</div>}
                <div className="button-group">
                  <button onClick={handleJsonImport} className="import-button">
                    Import JSON
                  </button>
                  <button
                    onClick={() => setIsJsonMode(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3>Full Name</h3>
                <div className="name-inputs">
                  <input
                    type="text"
                    value={editedCharacter.fullName?.firstName || ""}
                    onChange={(e) =>
                      setEditedCharacter({
                        ...editedCharacter,
                        fullName: {
                          ...editedCharacter.fullName,
                          firstName: e.target.value,
                        },
                      })
                    }
                    placeholder="First Name"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={editedCharacter.fullName?.lastName || ""}
                    onChange={(e) =>
                      setEditedCharacter({
                        ...editedCharacter,
                        fullName: {
                          ...editedCharacter.fullName,
                          lastName: e.target.value,
                        },
                      })
                    }
                    placeholder="Last Name"
                    className="edit-input"
                  />
                </div>

                <h3>Character Image</h3>
                <ImageUpload
                  existingUrl={editedCharacter.imageUrl}
                  onSuccess={(url) => {
                    console.log("Received new image URL in modal:", url);
                    const updatedCharacter = {
                      ...editedCharacter,
                      imageUrl: url,
                    };
                    console.log(
                      "Updated character with new image:",
                      updatedCharacter
                    );
                    setEditedCharacter(updatedCharacter);
                  }}
                  onError={(error) => {
                    console.error("Upload error in modal:", error);
                    alert(`Upload failed: ${error}`);
                  }}
                />

                <h3>Appearance</h3>
                <textarea
                  value={editedCharacter.appearance || ""}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      appearance: e.target.value,
                    })
                  }
                  className="edit-textarea"
                  placeholder="Describe the character's appearance..."
                />

                <h3>Backstory</h3>
                <textarea
                  value={editedCharacter.backstory || ""}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      backstory: e.target.value,
                    })
                  }
                  className="edit-textarea"
                  placeholder="Write the character's backstory..."
                />

                <h3>Personality</h3>
                <textarea
                  value={editedCharacter.personality || ""}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      personality: e.target.value,
                    })
                  }
                  className="edit-textarea"
                  placeholder="Describe the character's personality..."
                />

                <h3>Other Information</h3>
                <textarea
                  value={editedCharacter.otherInfo?.join("\n") || ""}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      otherInfo: e.target.value
                        .split("\n")
                        .filter((info) => info.trim()),
                    })
                  }
                  className="edit-textarea"
                  placeholder="Add additional information (one item per line)..."
                />

                <h3>Roleplaying Guidance</h3>
                <textarea
                  value={editedCharacter.roleplayingGuidance || ""}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      roleplayingGuidance: e.target.value,
                    })
                  }
                  className="edit-textarea"
                  placeholder="Add roleplaying guidance..."
                />

                <div className="button-group">
                  <button onClick={handleUpdate} className="save-button">
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditedCharacter(character);
                      setIsEditing(false);
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="view-mode">
            <div className="header-row">
              <h2>
                {character.fullName?.firstName} {character.fullName?.lastName}
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                Edit
              </button>
            </div>

            {character.imageUrl && (
              <div className="character-image">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  onError={(e) => {
                    console.error("Image failed to load:", character.imageUrl);
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="character-details">
              <section>
                <h3>Appearance</h3>
                <p>{character.appearance}</p>
              </section>

              <section>
                <h3>Backstory</h3>
                <p>{character.backstory}</p>
              </section>

              <section>
                <h3>Personality</h3>
                <p>{character.personality}</p>
              </section>

              {character.otherInfo?.length > 0 && (
                <section>
                  <h3>Other Information</h3>
                  <ul>
                    {character.otherInfo.map((info, index) => (
                      <li key={index}>{info}</li>
                    ))}
                  </ul>
                </section>
              )}

              {character.roleplayingGuidance && (
                <section>
                  <h3>Roleplaying Guidance</h3>
                  <p>{character.roleplayingGuidance}</p>
                </section>
              )}

              <p>
                <strong>Created:</strong>{" "}
                {new Date(character.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .edit-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .edit-button:hover {
          background: #5a6268;
        }

        .edit-input {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .edit-textarea {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          min-height: 150px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .save-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .save-button:hover {
          background: #218838;
        }

        .cancel-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-button:hover {
          background: #c82333;
        }

        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: none;
          font-size: 24px;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 4px;
        }

        .close-button:hover {
          background-color: #f0f0f0;
        }

        .character-details {
          margin-top: 1rem;
        }

        .character-details p {
          margin: 0.5rem 0;
        }

        .character-image {
          margin: 1rem 0;
          text-align: center;
        }

        .character-image img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          object-fit: cover;
        }

        section {
          margin: 1.5rem 0;
        }

        section h3 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .name-inputs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        ul {
          list-style-type: disc;
          margin-left: 1.5rem;
        }

        li {
          margin: 0.5rem 0;
        }

        .edit-mode-controls {
          margin-bottom: 1rem;
          text-align: right;
        }

        .mode-toggle {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .mode-toggle.active {
          background: #495057;
        }

        .mode-toggle:hover {
          background: #5a6268;
        }

        .json-mode {
          margin-top: 1rem;
        }

        .json-input {
          width: 100%;
          min-height: 300px;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.9rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .error-message {
          color: #dc3545;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: #f8d7da;
          border-radius: 4px;
        }

        .import-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .import-button:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
};

const Characters = () => {
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCharacters();
    }
  }, [mounted]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters");
      if (!response.ok) throw new Error("Failed to fetch characters");
      const data = await response.json();
      setCharacters(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCharacter),
      });

      if (!response.ok) throw new Error("Failed to create character");

      // Refresh the characters list
      await fetchCharacters();

      // Reset the form
      setNewCharacter({ name: "", description: "", imageUrl: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCharacter = async (updatedCharacter) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates

    setIsUpdating(true);
    try {
      // Update local state first for immediate feedback
      setCharacters(
        characters.map((char) =>
          char._id === updatedCharacter._id ? updatedCharacter : char
        )
      );

      // Fetch fresh data from server
      await fetchCharacters();

      // Update selected character if it's still selected
      if (selectedCharacter?._id === updatedCharacter._id) {
        setSelectedCharacter(updatedCharacter);
      }
    } catch (error) {
      console.error("Error updating character list:", error);
      setError("Failed to update character list");
    } finally {
      setIsUpdating(false);
    }
  };

  // Only render content when mounted
  if (!mounted) {
    return (
      <Layout>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchCharacters();
            }}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading characters...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Characters</h1>

        {/* Updated Character Creation Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="name"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={newCharacter.name}
              onChange={(e) =>
                setNewCharacter({ ...newCharacter, name: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="imageUrl"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              Image URL:
            </label>
            <input
              type="url"
              id="imageUrl"
              value={newCharacter.imageUrl}
              onChange={(e) =>
                setNewCharacter({ ...newCharacter, imageUrl: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="description"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              Description:
            </label>
            <textarea
              id="description"
              value={newCharacter.description}
              onChange={(e) =>
                setNewCharacter({
                  ...newCharacter,
                  description: e.target.value,
                })
              }
              style={{ width: "100%", padding: "0.5rem", minHeight: "100px" }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              background: "#007bff",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create Character
          </button>
        </form>

        {/* Updated Characters List */}
        {characters.length === 0 ? (
          <p>No characters created yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {characters.map((character) => (
              <li
                key={character._id || `temp-${character.name}`}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
                onClick={() => setSelectedCharacter(character)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {character.imageUrl && (
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>{character.name}</h3>
                  <p
                    style={{
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {character.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Character Modal */}
        {selectedCharacter && (
          <CharacterModal
            key={selectedCharacter._id}
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
            onUpdate={handleUpdateCharacter}
          />
        )}
      </div>
    </Layout>
  );
};

// Update ErrorBoundary to handle cleanup
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Character component error:", error, errorInfo);
  }

  componentWillUnmount() {
    // Cleanup
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

// Export with proper error boundary and mounting checks
export default function CharactersPage() {
  return (
    <ErrorBoundary>
      <Characters />
    </ErrorBoundary>
  );
}
