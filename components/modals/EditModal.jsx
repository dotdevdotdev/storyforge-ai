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
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      const defaultData = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue ?? "";
        return acc;
      }, {});
      setFormData(defaultData);
    }
  }, [record, fields]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderField = (field) => {
    if (jsonMode && (field.type === "json" || field.type === "custom")) {
      return (
        <textarea
          value={JSON.stringify(formData[field.name], null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleChange(field.name, parsed);
              setJsonError(null);
            } catch (err) {
              setJsonError(`Invalid JSON in ${field.label}`);
            }
          }}
          style={{ fontFamily: "monospace", minHeight: "200px" }}
        />
      );
    }

    switch (field.type) {
      case "custom":
        const CustomComponent = field.component;
        return (
          <CustomComponent
            value={formData[field.name]}
            onChange={(value) => handleChange(field.name, value)}
            {...field.componentProps}
          />
        );
      case "json":
        return (
          <textarea
            value={JSON.stringify(formData[field.name], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(field.name, parsed);
                setJsonError(null);
              } catch (err) {
                setJsonError(`Invalid JSON in ${field.label}`);
              }
            }}
            style={{ fontFamily: "monospace", minHeight: "200px" }}
          />
        );
      default:
        return (
          <input
            type="text"
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full p-2 border rounded"
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>{record ? `Edit ${entityType}` : `New ${entityType}`}</h2>
            <div className="header-controls">
              <button
                type="button"
                className="mode-toggle"
                onClick={() => setJsonMode(!jsonMode)}
              >
                {jsonMode ? "Form Mode" : "JSON Mode"}
              </button>
              <button type="button" className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {jsonError && <div className="error">{jsonError}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(formData);
            }}
          >
            {fields.map((field) => (
              <div
                key={field.name}
                className={`form-group ${field.className || ""}`}
              >
                <label className="block font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                {renderField(field)}
                {field.example && (
                  <div className="example">
                    Example: {JSON.stringify(field.example)}
                  </div>
                )}
              </div>
            ))}

            <div className="actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save
              </button>
            </div>
          </form>
        </div>
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
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-content h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }
        .header-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .mode-toggle {
          padding: 0.5rem 1rem;
          background: #e9ecef;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #495057;
        }
        .mode-toggle:hover {
          background: #dee2e6;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          line-height: 1;
        }
        .close-btn:hover {
          color: #333;
        }
        .modal-body {
          padding: 2rem;
          overflow-y: auto;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #495057;
        }
        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .example {
          font-size: 0.8em;
          color: #666;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        .cancel-btn {
          padding: 0.5rem 1rem;
          background: #e9ecef;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: #495057;
        }
        .save-btn {
          padding: 0.5rem 1.5rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .save-btn:hover {
          background: #0060df;
        }
        .error {
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
