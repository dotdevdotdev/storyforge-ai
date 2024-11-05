import React, { useState, useEffect } from "react";
import { ListEditor } from "../ListEditor";
import { KeyValueEditor } from "../KeyValueEditor";
import { ScenarioEditor } from "../ScenarioEditor";

export const EditModal = ({
  isOpen,
  onClose,
  record,
  fields,
  onSave,
  entityType,
}) => {
  const [formData, setFormData] = useState({});
  const [jsonErrors, setJsonErrors] = useState({});
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState("");

  useEffect(() => {
    if (record) {
      setFormData(record);
      setJsonEditorValue(JSON.stringify(record, null, 2));
    } else {
      const defaultData = {};
      fields.forEach((field) => {
        defaultData[field.name] = field.defaultValue || "";
      });
      setFormData(defaultData);
      setJsonEditorValue(JSON.stringify(defaultData, null, 2));
    }
  }, [record, fields]);

  const handleJsonChange = (fieldName, value) => {
    try {
      const parsedValue = JSON.parse(value);
      setFormData({ ...formData, [fieldName]: parsedValue });
      setJsonErrors({ ...jsonErrors, [fieldName]: null });
    } catch (err) {
      setJsonErrors({ ...jsonErrors, [fieldName]: "Invalid JSON format" });
    }
  };

  const handleListChange = (fieldName, subFieldName, newList) => {
    setFormData({
      ...formData,
      [fieldName]: {
        ...formData[fieldName],
        [subFieldName]: newList,
      },
    });
  };

  const formatJsonValue = (value) => {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(jsonErrors).some((error) => error)) {
      return;
    }
    onSave(formData);
  };

  const handleJsonUpdate = () => {
    try {
      const parsedData = JSON.parse(jsonEditorValue);
      // Preserve the _id if it exists
      if (formData._id) {
        parsedData._id = formData._id;
      }
      onSave(parsedData);
    } catch (err) {
      setJsonErrors({ json: "Invalid JSON format" });
    }
  };

  const renderField = (field) => {
    if (field.type === "json") {
      if (field.name === "locations") {
        return (
          <div className="json-field-group">
            <div className="key-value-section">
              <KeyValueEditor
                pairs={formData.locations || {}}
                onChange={(newPairs) =>
                  setFormData({ ...formData, locations: newPairs })
                }
                keyPlaceholder="Enter location type (e.g., primary, secondary)"
                valuePlaceholder="Enter location name"
              />
            </div>
          </div>
        );
      } else if (field.name === "elements") {
        return (
          <div className="json-field-group">
            <div className="list-section">
              <h3>Core Concepts</h3>
              <ListEditor
                items={formData.elements?.core_concepts || []}
                onChange={(newList) =>
                  handleListChange("elements", "core_concepts", newList)
                }
                placeholder="Add a core concept"
              />
            </div>
            <div className="list-section">
              <h3>Common Props</h3>
              <ListEditor
                items={formData.elements?.common_props || []}
                onChange={(newList) =>
                  handleListChange("elements", "common_props", newList)
                }
                placeholder="Add a prop"
              />
            </div>
            <div className="list-section">
              <h3>Typical Outcomes</h3>
              <ListEditor
                items={formData.elements?.typical_outcomes || []}
                onChange={(newList) =>
                  handleListChange("elements", "typical_outcomes", newList)
                }
                placeholder="Add an outcome"
              />
            </div>
          </div>
        );
      } else if (field.name === "characters") {
        return (
          <div className="json-field-group">
            <div className="list-section">
              <h3>Instigators</h3>
              <ListEditor
                items={formData.characters?.instigators || []}
                onChange={(newList) =>
                  handleListChange("characters", "instigators", newList)
                }
                placeholder="Add an instigator"
              />
            </div>
            <div className="list-section">
              <h3>Common Victims</h3>
              <ListEditor
                items={formData.characters?.common_victims || []}
                onChange={(newList) =>
                  handleListChange("characters", "common_victims", newList)
                }
                placeholder="Add a victim type"
              />
            </div>
          </div>
        );
      } else if (field.name === "sample_scenarios") {
        return (
          <div className="json-field-group">
            <ScenarioEditor
              scenarios={formData.sample_scenarios || []}
              onChange={(newScenarios) =>
                setFormData({ ...formData, sample_scenarios: newScenarios })
              }
            />
          </div>
        );
      }
      return (
        <>
          <textarea
            id={field.name}
            value={formatJsonValue(formData[field.name])}
            onChange={(e) => handleJsonChange(field.name, e.target.value)}
            required={field.required}
            rows={10}
            className="json-editor"
          />
          {jsonErrors[field.name] && (
            <div className="error">{jsonErrors[field.name]}</div>
          )}
          <div className="format-help">
            <small>Example format:</small>
            <pre>{JSON.stringify(field.example, null, 2)}</pre>
          </div>
        </>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          id={field.name}
          value={formData[field.name] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          required={field.required}
        />
      );
    }

    return (
      <input
        type={field.type || "text"}
        id={field.name}
        value={formData[field.name] || ""}
        onChange={(e) =>
          setFormData({ ...formData, [field.name]: e.target.value })
        }
        required={field.required}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-left">
            <h2>{record ? `Edit ${entityType}` : `New ${entityType}`}</h2>
            <button
              className={`toggle-json-btn ${showJsonEditor ? "active" : ""}`}
              onClick={() => setShowJsonEditor(!showJsonEditor)}
            >
              {showJsonEditor ? "Form Edit" : "JSON Edit"}
            </button>
          </div>
          <div className="modal-actions">
            <button
              className="save-btn"
              onClick={showJsonEditor ? handleJsonUpdate : handleSubmit}
              disabled={Object.values(jsonErrors).some((error) => error)}
            >
              Save
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>

        {showJsonEditor ? (
          <div className="json-editor-container">
            <textarea
              value={jsonEditorValue}
              onChange={(e) => setJsonEditorValue(e.target.value)}
              className="json-editor-textarea"
            />
            {jsonErrors.json && <div className="error">{jsonErrors.json}</div>}
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            {fields.map((field) => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name}>{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </form>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .modal {
          background: white;
          border-radius: 4px;
          width: 90%;
          max-width: 800px;
          max-height: calc(100vh - 4rem);
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 4px 4px 0 0;
          flex-shrink: 0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
        }
        form {
          padding: 2rem;
          overflow-y: auto;
          flex-grow: 1;
        }
        .json-editor-container {
          padding: 2rem;
          overflow-y: auto;
          flex-grow: 1;
        }
        .form-group {
          margin-bottom: 1.5rem;
          padding-right: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }
        .form-group :global(input),
        .form-group :global(textarea) {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          line-height: 1.5;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group :global(input:focus),
        .form-group :global(textarea:focus) {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
        }
        .form-group :global(textarea) {
          min-height: 120px;
          resize: vertical;
        }
        .json-editor {
          font-family: monospace;
          min-height: 100px;
          background: #f8f9fa;
        }
        .format-help {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }
        .format-help pre {
          margin: 0.5rem 0;
          white-space: pre-wrap;
          font-size: 0.8em;
          color: #666;
        }
        .error {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .toggle-json-btn {
          padding: 0.25rem 0.75rem;
          border: 1px solid #0070f3;
          border-radius: 4px;
          background: white;
          color: #0070f3;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .toggle-json-btn:hover {
          background: #f0f7ff;
        }
        .toggle-json-btn.active {
          background: #0070f3;
          color: white;
        }
        .json-editor-container {
          padding: 2rem;
          height: 100%;
        }
        .json-editor-textarea {
          width: 100%;
          height: calc(90vh - 200px);
          padding: 1rem;
          font-family: monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: none;
        }
        .json-editor-textarea:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
        }
        .save-btn {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .save-btn:hover:not(:disabled) {
          background: #0060df;
        }
        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .cancel-btn {
          padding: 0.5rem 1rem;
          background: #f5f5f5;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .cancel-btn:hover {
          background: #e5e5e5;
        }
        .json-field-group {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .list-section {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }
        .list-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};
