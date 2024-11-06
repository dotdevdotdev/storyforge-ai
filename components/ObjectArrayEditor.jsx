import React, { useState, useEffect } from "react";

export const ObjectArrayEditor = ({ value = [], onChange }) => {
  const [parsedValue, setParsedValue] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemFields, setNewItemFields] = useState({});

  useEffect(() => {
    try {
      const initialValue = Array.isArray(value) ? value : [];
      setParsedValue(initialValue);
    } catch (error) {
      console.error("Error parsing value:", error);
      setParsedValue([]);
    }
  }, [value]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (Object.values(newItemFields).some((val) => !val.trim())) return;

    const updatedValue = [...parsedValue, { ...newItemFields }];
    setParsedValue(updatedValue);
    onChange(updatedValue);
    setNewItemFields({});
  };

  const handleUpdateItem = (e, index) => {
    e.preventDefault();
    if (Object.values(editingItem).some((val) => !val.trim())) return;

    const updatedValue = parsedValue.map((item, i) =>
      i === index ? { ...editingItem } : item
    );
    setParsedValue(updatedValue);
    onChange(updatedValue);
    setEditingItem(null);
  };

  const handleRemoveItem = (index) => {
    const updatedValue = parsedValue.filter((_, i) => i !== index);
    setParsedValue(updatedValue);
    onChange(updatedValue);
  };

  const getFieldNames = () => {
    if (parsedValue.length > 0) {
      return Object.keys(parsedValue[0]);
    }
    return [];
  };

  return (
    <div className="object-array-editor">
      <div className="items-list">
        {parsedValue.map((item, index) => (
          <div key={index} className="item-card">
            {editingItem && index === parsedValue.indexOf(item) ? (
              <form onSubmit={(e) => handleUpdateItem(e, index)}>
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="field-group">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={editingItem[key] || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
                <div className="edit-actions">
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="field-display">
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
                <div className="item-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => setEditingItem({ ...item })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveItem(index)}
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="add-item-section">
        <h4>Add New Item</h4>
        <form onSubmit={handleAddItem}>
          {getFieldNames().map((fieldName) => (
            <div key={fieldName} className="field-group">
              <label>{fieldName}</label>
              <input
                type="text"
                value={newItemFields[fieldName] || ""}
                onChange={(e) =>
                  setNewItemFields({
                    ...newItemFields,
                    [fieldName]: e.target.value,
                  })
                }
                placeholder={`Enter ${fieldName}`}
              />
            </div>
          ))}
          {getFieldNames().length > 0 && (
            <button
              type="submit"
              disabled={Object.values(newItemFields).some(
                (val) => !val?.trim()
              )}
            >
              Add Item
            </button>
          )}
        </form>
      </div>

      <style jsx>{`
        .object-array-editor {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .item-card {
          background: white;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          position: relative;
        }
        .field-display {
          margin-bottom: 0.5rem;
        }
        .field-display strong {
          color: #495057;
        }
        .field-group {
          margin-bottom: 1rem;
        }
        .field-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #495057;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .item-actions,
        .edit-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .edit-btn {
          background: #e9ecef;
          color: #495057;
        }
        .remove-btn {
          background: none;
          color: #666;
          font-size: 1.2em;
          padding: 0 0.25rem;
        }
        .remove-btn:hover {
          color: #ff4444;
        }
        .save-btn {
          background: #0070f3;
          color: white;
        }
        .cancel-btn {
          background: #e9ecef;
          color: #495057;
        }
        .add-item-section {
          border-top: 1px solid #dee2e6;
          padding-top: 1rem;
        }
        .add-item-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
