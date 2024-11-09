import React, { useState } from "react";

export const StoryParameterEditor = ({ value = {}, onChange }) => {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const parameters = (() => {
    try {
      if (typeof value === "string" && value.trim()) {
        return JSON.parse(value);
      }
      return value.parameters || value || {};
    } catch (error) {
      console.error("Error parsing parameters:", error);
      return {};
    }
  })();

  const handleAddParameter = () => {
    if (!newKey) return;
    const formattedKey = newKey.toUpperCase().replace(/\s+/g, "_");
    const updatedParameters = {
      ...parameters,
      [formattedKey]: newValue,
    };
    onChange(
      typeof value === "string"
        ? JSON.stringify(updatedParameters)
        : { parameters: updatedParameters }
    );
    setNewKey("");
    setNewValue("");
  };

  const handleRemoveParameter = (key) => {
    const updatedParameters = { ...parameters };
    delete updatedParameters[key];
    onChange(
      typeof value === "string"
        ? JSON.stringify(updatedParameters)
        : { parameters: updatedParameters }
    );
  };

  const handleParameterChange = (key, newValue) => {
    const updatedParameters = {
      ...parameters,
      [key]: newValue,
    };
    onChange(
      typeof value === "string"
        ? JSON.stringify(updatedParameters)
        : { parameters: updatedParameters }
    );
  };

  return (
    <div className="parameter-editor">
      {Object.entries(parameters).map(([key, val]) => (
        <div key={key} className="parameter-item">
          <div className="parameter-header">
            <label>{key}</label>
            <button
              onClick={() => handleRemoveParameter(key)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={val}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="parameter-input"
          />
        </div>
      ))}

      <div className="add-parameter">
        <h4>Add New Parameter</h4>
        <div className="add-inputs">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="PARAMETER_NAME"
            className="parameter-input"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Parameter value"
            className="parameter-input"
          />
          <button onClick={handleAddParameter} className="add-btn">
            Add
          </button>
        </div>
      </div>

      <style jsx>{`
        .parameter-editor {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .parameter-item {
          width: 100%;
        }
        .parameter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .parameter-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .add-parameter {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .add-inputs {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .add-btn {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .remove-btn {
          padding: 0.25rem 0.5rem;
          color: #dc3545;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
