import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        {/* Characters List */}
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
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{character.name}</h3>
                <p style={{ margin: 0 }}>{character.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Characters;
