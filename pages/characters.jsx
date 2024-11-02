import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const CharacterModal = ({ character, onClose }) => {
  if (!character) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{character.name}</h2>
        <div className="character-details">
          <p>
            <strong>Description:</strong> {character.description}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(character.createdAt).toLocaleDateString()}
          </p>
          {/* Add more character details here as needed */}
        </div>
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
      `}</style>
    </div>
  );
};

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Fetch characters when component mounts
  useEffect(() => {
    fetchCharacters();
  }, []);

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
      fetchCharacters();

      // Reset the form
      setNewCharacter({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <Layout>
        <div>Loading characters...</div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div>Error: {error}</div>
      </Layout>
    );

  return (
    <Layout>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Characters</h1>

        {/* Character Creation Form */}
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
                key={character._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onClick={() => setSelectedCharacter(character)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
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
              </li>
            ))}
          </ul>
        )}

        {/* Character Modal */}
        {selectedCharacter && (
          <CharacterModal
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Characters;
