import React, { useState, useEffect } from "react";

export const NestedArrayEditor = ({ value = {}, onChange }) => {
  const [newKey, setNewKey] = useState("");
  const [newItem, setNewItem] = useState("");
  const [selectedArray, setSelectedArray] = useState(null);
  const [parsedValue, setParsedValue] = useState({});

  useEffect(() => {
    // Handle initial value parsing
    try {
      const initialValue =
        typeof value === "string" ? JSON.parse(value) : value;
      setParsedValue(initialValue);
    } catch (error) {
      console.error("Error parsing value:", error);
      setParsedValue({});
    }
  }, [value]);

  const handleAddKey = (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const updatedValue = {
      ...parsedValue,
      [newKey.trim()]: [],
    };
    setParsedValue(updatedValue);
    onChange(updatedValue);
    setNewKey("");
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedArray || !newItem.trim()) return;

    const updatedValue = {
      ...parsedValue,
      [selectedArray]: [...(parsedValue[selectedArray] || []), newItem.trim()],
    };
    setParsedValue(updatedValue);
    onChange(updatedValue);
    setNewItem("");
  };

  const handleRemoveKey = (key) => {
    const newValue = { ...parsedValue };
    delete newValue[key];
    setParsedValue(newValue);
    onChange(newValue);
    if (selectedArray === key) {
      setSelectedArray(null);
    }
  };

  const handleRemoveItem = (key, index) => {
    const updatedValue = {
      ...parsedValue,
      [key]: parsedValue[key].filter((_, i) => i !== index),
    };
    setParsedValue(updatedValue);
    onChange(updatedValue);
  };

  return (
    <div className="nested-array-editor">
      <div className="key-section">
        <h4>Categories</h4>
        <form onSubmit={handleAddKey} className="add-key-form">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Add new category"
          />
          <button type="submit" disabled={!newKey.trim()}>
            Add
          </button>
        </form>
        <div className="keys-list">
          {Object.keys(parsedValue).map((key) => (
            <div
              key={key}
              className={`key-item ${selectedArray === key ? "selected" : ""}`}
              onClick={() => setSelectedArray(key)}
            >
              <span className="key-name">{key}</span>
              <span className="item-count">
                ({(parsedValue[key] || []).length})
              </span>
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveKey(key);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedArray && (
        <div className="items-section">
          <h4>{selectedArray}</h4>
          <form onSubmit={handleAddItem} className="add-item-form">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Add to ${selectedArray}`}
            />
            <button type="submit" disabled={!newItem.trim()}>
              Add
            </button>
          </form>
          <div className="items-list">
            {(parsedValue[selectedArray] || []).map((item, index) => (
              <div key={index} className="item">
                <span>{item}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveItem(selectedArray, index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .nested-array-editor {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .key-section,
        .items-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        h4 {
          margin: 0;
          color: #333;
        }
        .add-key-form,
        .add-item-form {
          display: flex;
          gap: 0.5rem;
        }
        input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background: #ccc;
        }
        .keys-list,
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .key-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        .key-item.selected {
          border-color: #0070f3;
          background: #f0f7ff;
        }
        .key-name {
          flex: 1;
        }
        .item-count {
          color: #666;
          font-size: 0.9em;
        }
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0 0.25rem;
          font-size: 1.2em;
        }
        .remove-btn:hover {
          color: #ff4444;
        }
      `}</style>
    </div>
  );
};
