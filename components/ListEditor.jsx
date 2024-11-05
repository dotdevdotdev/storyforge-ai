import React, { useState } from "react";

export const ListEditor = ({
  items = [],
  onChange,
  placeholder = "Add new item",
}) => {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="list-editor">
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item">
            <span>{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="remove-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="add-item">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        <button type="button" onClick={handleAdd} className="add-btn">
          Add
        </button>
      </div>

      <style jsx>{`
        .list-editor {
          margin-bottom: 1rem;
        }
        .items-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .item {
          display: flex;
          align-items: center;
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          gap: 0.5rem;
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
        .add-item {
          display: flex;
          gap: 0.5rem;
        }
        .add-item input {
          flex: 1;
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
        .add-btn:hover {
          background: #0060df;
        }
      `}</style>
    </div>
  );
};
