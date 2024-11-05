import React, { useState } from "react";

export const JsonModal = ({
  isOpen,
  onClose,
  onImport,
  entityType,
  fields,
}) => {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState(null);

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonText);
      onImport(data);
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Import {entityType} from JSON</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Paste JSON data:</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
          />
        </div>
        <div className="format-help">
          <h3>Expected Format:</h3>
          <pre>
            {JSON.stringify(
              {
                [fields[0].name]: "value",
                // Show example of each field
                ...fields.reduce(
                  (acc, field) => ({
                    ...acc,
                    [field.name]: field.example || "value",
                  }),
                  {}
                ),
              },
              null,
              2
            )}
          </pre>
        </div>
        <div className="actions">
          <button onClick={handleImport}>Import</button>
          <button onClick={onClose}>Cancel</button>
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
        }
        .modal {
          background: white;
          padding: 2rem;
          border-radius: 4px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .error {
          color: red;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group textarea {
          width: 100%;
          font-family: monospace;
        }
        .format-help {
          margin-top: 1rem;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .format-help pre {
          overflow-x: auto;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};
