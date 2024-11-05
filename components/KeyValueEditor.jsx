import React, { useState } from "react";

export const KeyValueEditor = ({
  pairs = {},
  onChange,
  keyPlaceholder = "Enter key",
  valuePlaceholder = "Enter value",
}) => {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({
        ...pairs,
        [newKey.trim()]: newValue.trim(),
      });
      setNewKey("");
      setNewValue("");
    }
  };

  const handleRemove = (key) => {
    const newPairs = { ...pairs };
    delete newPairs[key];
    onChange(newPairs);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newKey && newValue) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="key-value-editor">
      <div className="pairs-list">
        {Object.entries(pairs).map(([key, value]) => (
          <div key={key} className="pair-item">
            <div className="pair-content">
              <span className="key">{key}:</span>
              <span className="value">{value}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(key)}
              className="remove-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="add-pair">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={keyPlaceholder}
          className="key-input"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={valuePlaceholder}
          className="value-input"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="add-btn"
          disabled={!newKey.trim() || !newValue.trim()}
        >
          Add
        </button>
      </div>

      <style jsx>{`
        .key-value-editor {
          margin-bottom: 1rem;
        }
        .pairs-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .pair-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0f0f0;
          padding: 0.5rem;
          border-radius: 4px;
        }
        .pair-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        .key {
          color: #666;
          font-weight: 500;
        }
        .value {
          color: #333;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0 0.25rem;
          font-size: 1.2em;
          line-height: 1;
        }
        .remove-btn:hover {
          color: #ff4444;
        }
        .add-pair {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 0.5rem;
          align-items: center;
        }
        .key-input,
        .value-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .add-btn {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .add-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .add-btn:not(:disabled):hover {
          background: #0060df;
        }
      `}</style>
    </div>
  );
};
