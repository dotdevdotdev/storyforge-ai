import React, { useState, useEffect } from "react";
import { ObjectArrayEditor } from "./ObjectArrayEditor";

export const NestedObjectEditor = ({
  value = {},
  onChange,
  structure = {},
}) => {
  const [parsedValue, setParsedValue] = useState({});

  useEffect(() => {
    try {
      const initialValue =
        typeof value === "string" ? JSON.parse(value) : value;
      setParsedValue(initialValue || {});
    } catch (error) {
      console.error("Error parsing value:", error);
      setParsedValue({});
    }
  }, [value]);

  const handleChange = (key, newValue) => {
    const updatedValue = {
      ...parsedValue,
      [key]: newValue,
    };
    setParsedValue(updatedValue);
    onChange(updatedValue);
  };

  const renderField = (key, fieldConfig) => {
    const currentValue = parsedValue[key] || fieldConfig.defaultValue;

    switch (fieldConfig.type) {
      case "string":
        return (
          <input
            type="text"
            value={currentValue || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={fieldConfig.placeholder}
          />
        );
      case "object":
        return (
          <NestedObjectEditor
            value={currentValue}
            onChange={(val) => handleChange(key, val)}
            structure={fieldConfig.fields}
          />
        );
      case "array":
        if (fieldConfig.itemType === "object") {
          return (
            <ObjectArrayEditor
              value={currentValue}
              onChange={(val) => handleChange(key, val)}
            />
          );
        }
        return (
          <div className="array-input">
            <textarea
              value={Array.isArray(currentValue) ? currentValue.join("\n") : ""}
              onChange={(e) =>
                handleChange(key, e.target.value.split("\n").filter(Boolean))
              }
              placeholder={fieldConfig.placeholder}
            />
          </div>
        );
      default:
        return <div>Unsupported field type: {fieldConfig.type}</div>;
    }
  };

  return (
    <div className="nested-object-editor">
      {structure &&
        Object.entries(structure).map(([key, fieldConfig]) => (
          <div key={key} className="field-group">
            <label>{fieldConfig.label || key}</label>
            {renderField(key, fieldConfig)}
            {fieldConfig.description && (
              <div className="field-description">{fieldConfig.description}</div>
            )}
          </div>
        ))}
      {!structure && (
        <div className="error-message">
          No structure provided for the editor
        </div>
      )}

      <style jsx>{`
        .nested-object-editor {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        label {
          font-weight: 500;
          color: #495057;
        }
        input,
        textarea {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        textarea {
          min-height: 100px;
          font-family: inherit;
        }
        .field-description {
          font-size: 0.8rem;
          color: #666;
        }
        .array-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .error-message {
          color: #dc3545;
          padding: 1rem;
          background: #f8d7da;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};
