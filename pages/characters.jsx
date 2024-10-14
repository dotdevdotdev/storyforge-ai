import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Image from "next/image";

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    appearance: "",
    backstory: "",
    personality: "",
    otherInfo: "",
    imageUrl: "",
  });

  useEffect(() => {
    // Load characters from the API when the component mounts
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    const response = await fetch("/api/characters");
    const data = await response.json();
    setCharacters(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCharacter({ ...newCharacter, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCharacter.name && newCharacter.appearance && newCharacter.imageUrl) {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCharacter),
      });

      if (response.ok) {
        setNewCharacter({
          name: "",
          appearance: "",
          backstory: "",
          personality: "",
          otherInfo: "",
          imageUrl: "",
        });
        fetchCharacters(); // Refresh the character list
      }
    }
  };

  return (
    <Layout>
      <div>
        <h1>Characters</h1>

        <h2>Create a New Character</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCharacter.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="appearance">Appearance:</label>
            <textarea
              id="appearance"
              name="appearance"
              value={newCharacter.appearance}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="backstory">Backstory:</label>
            <textarea
              id="backstory"
              name="backstory"
              value={newCharacter.backstory}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="personality">Personality:</label>
            <textarea
              id="personality"
              name="personality"
              value={newCharacter.personality}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="otherInfo">Other Info:</label>
            <textarea
              id="otherInfo"
              name="otherInfo"
              value={newCharacter.otherInfo}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="imageUrl">Image URL:</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={newCharacter.imageUrl}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Create Character</button>
        </form>

        <h2>Your Characters</h2>
        {characters.length === 0 ? (
          <p>You haven't created any characters yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {characters.map((character) => (
              <li
                key={character._id}
                style={{
                  marginBottom: "20px",
                  border: "1px solid #ccc",
                  padding: "10px",
                }}
              >
                <h3>{character.name}</h3>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover", marginRight: "10px" }}
                  />
                  <div>
                    <p>
                      <strong>Appearance:</strong> {character.appearance}
                    </p>
                    <p>
                      <strong>Backstory:</strong> {character.backstory}
                    </p>
                    <p>
                      <strong>Personality:</strong> {character.personality}
                    </p>
                    <p>
                      <strong>Other Info:</strong> {character.otherInfo}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Characters;
