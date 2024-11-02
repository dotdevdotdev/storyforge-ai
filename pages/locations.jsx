import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import ImageUpload from "../components/ImageUpload";

// Define valid location fields
const VALID_LOCATION_FIELDS = [
  "name",
  "description",
  "people",
  "objects",
  "interactions",
  "otherInfo",
  "connections",
  "imageUrl",
];

const LocationModal = ({ location, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState(null);
  const [editedLocation, setEditedLocation] = useState(location);

  const cleanLocationData = (data) => {
    const cleanData = {};

    VALID_LOCATION_FIELDS.forEach((field) => {
      if (data[field] !== undefined) {
        cleanData[field] = data[field];
      }
    });

    // Ensure arrays are properly formatted
    if (cleanData.people) {
      cleanData.people = Array.isArray(cleanData.people)
        ? cleanData.people.filter((item) => typeof item === "string")
        : [];
    }

    if (cleanData.objects) {
      cleanData.objects = Array.isArray(cleanData.objects)
        ? cleanData.objects.filter((item) => typeof item === "string")
        : [];
    }

    if (cleanData.otherInfo) {
      cleanData.otherInfo = Array.isArray(cleanData.otherInfo)
        ? cleanData.otherInfo.filter((item) => typeof item === "string")
        : [];
    }

    if (cleanData.interactions) {
      cleanData.interactions = Array.isArray(cleanData.interactions)
        ? cleanData.interactions.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.keyword === "string" &&
              typeof item.interaction === "string"
          )
        : [];
    }

    if (cleanData.connections) {
      cleanData.connections = Array.isArray(cleanData.connections)
        ? cleanData.connections.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.location === "string" &&
              typeof item.description === "string"
          )
        : [];
    }

    // Handle imageUrl
    cleanData.imageUrl = data.imageUrl || "";

    // Preserve metadata
    cleanData._id = location._id;
    cleanData.createdAt = location.createdAt;

    console.log("Clean location data:", cleanData);
    return cleanData;
  };

  const handleJsonImport = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const cleanedData = cleanLocationData(parsedJson);
      setEditedLocation({
        ...editedLocation,
        ...cleanedData,
      });
      setJsonError(null);
      setIsJsonMode(false);
    } catch (error) {
      console.error("JSON import error:", error);
      setJsonError("Invalid JSON format. Please check your input.");
    }
  };

  const handleUpdate = async () => {
    try {
      const cleanedLocation = cleanLocationData(editedLocation);
      console.log("Updating location:", cleanedLocation);

      const response = await fetch(`/api/locations/${location._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedLocation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update location: ${errorData.message}`);
      }

      const updatedLocation = await response.json();
      onUpdate(updatedLocation);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating location:", error);
      alert(error.message);
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
                <h3>Paste Location JSON</h3>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError(null);
                  }}
                  className="json-input"
                  placeholder="Paste your location JSON here..."
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
                <h3>Name</h3>
                <input
                  type="text"
                  value={editedLocation.name || ""}
                  onChange={(e) =>
                    setEditedLocation({
                      ...editedLocation,
                      name: e.target.value,
                    })
                  }
                  className="edit-input"
                />

                <h3>Location Image</h3>
                <ImageUpload
                  existingUrl={editedLocation.imageUrl}
                  onSuccess={(url) => {
                    console.log("New image URL:", url);
                    setEditedLocation({
                      ...editedLocation,
                      imageUrl: url,
                    });
                  }}
                  onError={(error) => alert(`Upload failed: ${error}`)}
                />

                <h3>Description</h3>
                <textarea
                  value={editedLocation.description || ""}
                  onChange={(e) =>
                    setEditedLocation({
                      ...editedLocation,
                      description: e.target.value,
                    })
                  }
                  className="edit-textarea"
                />

                <h3>People</h3>
                <textarea
                  value={editedLocation.people?.join("\n") || ""}
                  onChange={(e) =>
                    setEditedLocation({
                      ...editedLocation,
                      people: e.target.value
                        .split("\n")
                        .filter((p) => p.trim()),
                    })
                  }
                  className="edit-textarea"
                  placeholder="Add people (one per line)..."
                />

                <h3>Objects</h3>
                <textarea
                  value={editedLocation.objects?.join("\n") || ""}
                  onChange={(e) =>
                    setEditedLocation({
                      ...editedLocation,
                      objects: e.target.value
                        .split("\n")
                        .filter((o) => o.trim()),
                    })
                  }
                  className="edit-textarea"
                  placeholder="Add objects (one per line)..."
                />

                <h3>Interactions</h3>
                <div className="interactions-list">
                  {editedLocation.interactions?.map((interaction, index) => (
                    <div key={index} className="interaction-item">
                      <input
                        type="text"
                        value={interaction.keyword || ""}
                        onChange={(e) => {
                          const newInteractions = [
                            ...(editedLocation.interactions || []),
                          ];
                          newInteractions[index] = {
                            ...newInteractions[index],
                            keyword: e.target.value,
                          };
                          setEditedLocation({
                            ...editedLocation,
                            interactions: newInteractions,
                          });
                        }}
                        placeholder="Keyword"
                        className="edit-input"
                      />
                      <textarea
                        value={interaction.interaction || ""}
                        onChange={(e) => {
                          const newInteractions = [
                            ...(editedLocation.interactions || []),
                          ];
                          newInteractions[index] = {
                            ...newInteractions[index],
                            interaction: e.target.value,
                          };
                          setEditedLocation({
                            ...editedLocation,
                            interactions: newInteractions,
                          });
                        }}
                        placeholder="Interaction description"
                        className="edit-textarea"
                      />
                      <button
                        onClick={() => {
                          const newInteractions =
                            editedLocation.interactions?.filter(
                              (_, i) => i !== index
                            );
                          setEditedLocation({
                            ...editedLocation,
                            interactions: newInteractions,
                          });
                        }}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditedLocation({
                        ...editedLocation,
                        interactions: [
                          ...(editedLocation.interactions || []),
                          { keyword: "", interaction: "" },
                        ],
                      });
                    }}
                    className="add-button"
                  >
                    Add Interaction
                  </button>
                </div>

                <h3>Other Information</h3>
                <textarea
                  value={editedLocation.otherInfo?.join("\n") || ""}
                  onChange={(e) =>
                    setEditedLocation({
                      ...editedLocation,
                      otherInfo: e.target.value
                        .split("\n")
                        .filter((info) => info.trim()),
                    })
                  }
                  className="edit-textarea"
                  placeholder="Add other information (one item per line)..."
                />

                <h3>Connected Locations</h3>
                <div className="connections-list">
                  {editedLocation.connections?.map((connection, index) => (
                    <div key={index} className="connection-item">
                      <input
                        type="text"
                        value={connection.location || ""}
                        onChange={(e) => {
                          const newConnections = [
                            ...(editedLocation.connections || []),
                          ];
                          newConnections[index] = {
                            ...newConnections[index],
                            location: e.target.value,
                          };
                          setEditedLocation({
                            ...editedLocation,
                            connections: newConnections,
                          });
                        }}
                        placeholder="Location name"
                        className="edit-input"
                      />
                      <textarea
                        value={connection.description || ""}
                        onChange={(e) => {
                          const newConnections = [
                            ...(editedLocation.connections || []),
                          ];
                          newConnections[index] = {
                            ...newConnections[index],
                            description: e.target.value,
                          };
                          setEditedLocation({
                            ...editedLocation,
                            connections: newConnections,
                          });
                        }}
                        placeholder="Connection description"
                        className="edit-textarea"
                      />
                      <button
                        onClick={() => {
                          const newConnections =
                            editedLocation.connections?.filter(
                              (_, i) => i !== index
                            );
                          setEditedLocation({
                            ...editedLocation,
                            connections: newConnections,
                          });
                        }}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditedLocation({
                        ...editedLocation,
                        connections: [
                          ...(editedLocation.connections || []),
                          { location: "", description: "" },
                        ],
                      });
                    }}
                    className="add-button"
                  >
                    Add Connection
                  </button>
                </div>

                <div className="button-group">
                  <button onClick={handleUpdate} className="save-button">
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditedLocation(location);
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
              <h2>{location.name}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                Edit
              </button>
            </div>

            {location.imageUrl && (
              <div className="location-image">
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  onError={(e) => {
                    console.error("Image failed to load:", location.imageUrl);
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="location-details">
              <section>
                <h3>Description</h3>
                <p>{location.description}</p>
              </section>

              {location.people?.length > 0 && (
                <section>
                  <h3>People</h3>
                  <ul>
                    {location.people.map((person, index) => (
                      <li key={index}>{person}</li>
                    ))}
                  </ul>
                </section>
              )}

              {location.objects?.length > 0 && (
                <section>
                  <h3>Objects</h3>
                  <ul>
                    {location.objects.map((object, index) => (
                      <li key={index}>{object}</li>
                    ))}
                  </ul>
                </section>
              )}

              {location.interactions?.length > 0 && (
                <section>
                  <h3>Interactions</h3>
                  {location.interactions.map((interaction, index) => (
                    <div key={index} className="interaction-item">
                      <strong>{interaction.keyword}:</strong>
                      <p>{interaction.interaction}</p>
                    </div>
                  ))}
                </section>
              )}

              {location.otherInfo?.length > 0 && (
                <section>
                  <h3>Other Information</h3>
                  <ul>
                    {location.otherInfo.map((info, index) => (
                      <li key={index}>{info}</li>
                    ))}
                  </ul>
                </section>
              )}

              {location.connections?.length > 0 && (
                <section>
                  <h3>Connected Locations</h3>
                  {location.connections.map((connection, index) => (
                    <div key={index} className="connection-item">
                      <strong>{connection.location}:</strong>
                      <p>{connection.description}</p>
                    </div>
                  ))}
                </section>
              )}

              <p>
                <strong>Created:</strong>{" "}
                {new Date(location.createdAt).toLocaleDateString()}
              </p>
              {location.updatedAt && (
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(location.updatedAt).toLocaleDateString()}
                </p>
              )}
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
          padding: 2rem;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          margin: 2rem auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 4px;
          z-index: 1002;
        }

        .close-button:hover {
          background-color: #f0f0f0;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-right: 2rem;
        }

        .location-details {
          padding: 0 1rem;
        }

        .edit-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .edit-button:hover {
          background: #0056b3;
        }

        .location-details section {
          margin: 1.5rem 0;
        }

        .location-details h3 {
          color: #333;
          margin-bottom: 0.8rem;
        }

        .location-image {
          margin: 1rem 0;
          text-align: center;
        }

        .location-image img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          object-fit: cover;
        }

        .edit-input {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .edit-textarea {
          width: 100%;
          min-height: 100px;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .save-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .save-button:hover {
          background: #218838;
        }

        .cancel-button:hover {
          background: #c82333;
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
      `}</style>
    </div>
  );
};

const Locations = () => {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchLocations();
    }
  }, [mounted]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocation),
      });

      if (!response.ok) throw new Error("Failed to create location");

      await fetchLocations();
      setNewLocation({ name: "", description: "", imageUrl: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateLocation = async (updatedLocation) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      setLocations(
        locations.map((loc) =>
          loc._id === updatedLocation._id ? updatedLocation : loc
        )
      );

      await fetchLocations();

      if (selectedLocation?._id === updatedLocation._id) {
        setSelectedLocation(updatedLocation);
      }
    } catch (error) {
      console.error("Error updating location list:", error);
      setError("Failed to update location list");
    } finally {
      setIsUpdating(false);
    }
  };

  const validateLocationData = (data) => {
    const requiredFields = [
      "name",
      "description",
      "people",
      "objects",
      "interactions",
      "otherInfo",
      "connections",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate interactions structure
    if (!Array.isArray(data.interactions)) {
      throw new Error("Interactions must be an array");
    }
    data.interactions.forEach((interaction, index) => {
      if (!interaction.keyword || !interaction.interaction) {
        throw new Error(`Invalid interaction at index ${index}`);
      }
    });

    // Validate connections structure
    if (!Array.isArray(data.connections)) {
      throw new Error("Connections must be an array");
    }
    data.connections.forEach((connection, index) => {
      if (!connection.location || !connection.description) {
        throw new Error(`Invalid connection at index ${index}`);
      }
    });

    return true;
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    setJsonError(null);

    try {
      const parsedData = JSON.parse(jsonInput);
      validateLocationData(parsedData);

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        throw new Error("Failed to create location");
      }

      await fetchLocations();
      setJsonInput("");
      setIsJsonMode(false);
    } catch (error) {
      console.error("JSON import error:", error);
      setJsonError(error.message);
    }
  };

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
              fetchLocations();
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
          <p>Loading locations...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Locations</h1>

        <div className="form-mode-toggle" style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setIsJsonMode(!isJsonMode)}
            className={`mode-toggle ${isJsonMode ? "active" : ""}`}
            style={{
              background: isJsonMode ? "#0056b3" : "#007bff",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isJsonMode ? "Switch to Form Mode" : "Switch to JSON Mode"}
          </button>
        </div>

        {isJsonMode ? (
          <div className="json-import">
            <h3>Import Location from JSON</h3>
            <form onSubmit={handleJsonSubmit}>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setJsonError(null);
                }}
                style={{
                  width: "100%",
                  minHeight: "300px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  fontFamily: "monospace",
                }}
                placeholder="Paste your location JSON here..."
              />
              {jsonError && (
                <div
                  style={{
                    color: "#dc3545",
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    background: "#f8d7da",
                    borderRadius: "4px",
                  }}
                >
                  {jsonError}
                </div>
              )}
              <button
                type="submit"
                style={{
                  background: "#28a745",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Import Location
              </button>
            </form>
          </div>
        ) : (
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
                value={newLocation.name}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, name: e.target.value })
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
                value={newLocation.description}
                onChange={(e) =>
                  setNewLocation({
                    ...newLocation,
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
              Create Location
            </button>
          </form>
        )}

        {locations.length === 0 ? (
          <p>No locations created yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {locations.map((location) => (
              <li
                key={location._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onClick={() => setSelectedLocation(location)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  {location.imageUrl && (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{location.name}</h3>
                    <p
                      style={{
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {location.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {selectedLocation && (
          <LocationModal
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onUpdate={handleUpdateLocation}
          />
        )}
      </div>
    </Layout>
  );
};

// Add error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Location component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Something went wrong.</h2>
            <button
              onClick={() => window.location.reload()}
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

// Export with error boundary
export default function LocationsPage() {
  return (
    <ErrorBoundary>
      <Locations />
    </ErrorBoundary>
  );
}
