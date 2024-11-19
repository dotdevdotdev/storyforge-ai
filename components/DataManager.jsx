import React, { useState, useEffect } from "react";
import { JsonModal } from "./modals/JsonModal";
import { EditModal } from "./modals/EditModal";
import { DataBoundary, APIBoundary } from "./ErrorBoundaryWrapper";

const formatPreviewValue = (value, field) => {
  if (field.type === "json") {
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return `${value.length} items`;
      }
      return `${Object.keys(value).length} properties`;
    }
    return "Invalid JSON";
  }
  return value;
};

const DataManager = ({
  title,
  entityType,
  fields,
  fetchData,
  createRecord,
  updateRecord,
  deleteRecord,
}) => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchData();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createRecord(data);
      await loadData();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateRecord(data);
      await loadData();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteRecord(id);
        await loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleImportJson = async (jsonData) => {
    try {
      const records = Array.isArray(jsonData) ? jsonData : [jsonData];
      for (const record of records) {
        await createRecord(record);
      }
      await loadData();
      setShowJsonModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="data-manager">
      <div className="header">
        <div className="title-section">
          <h1>{title}</h1>
          <div className="modal-controls">
            <button
              className={`modal-control ${showEditModal ? "active" : ""}`}
              onClick={() => {
                setShowEditModal(true);
                setShowJsonModal(false);
              }}
            >
              Add New
            </button>
            <button
              className={`modal-control ${showJsonModal ? "active" : ""}`}
              onClick={() => {
                setShowJsonModal(true);
                setShowEditModal(false);
              }}
            >
              Import JSON
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="records-grid">
          {records.map((record) => (
            <div
              key={record._id}
              className="record-card"
              onClick={() => {
                setSelectedRecord(record);
                setShowEditModal(true);
              }}
            >
              <h3>{record.name}</h3>
              <p className="description">{record.description}</p>
              {fields.map(
                (field) =>
                  field.preview &&
                  field.name !== "name" &&
                  field.name !== "description" && (
                    <div key={field.name} className="preview-field">
                      <strong>{field.label}:</strong>{" "}
                      {formatPreviewValue(record[field.name], field)}
                    </div>
                  )
              )}
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record._id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        fields={fields}
        onSave={selectedRecord ? handleUpdate : handleCreate}
        entityType={entityType}
      />

      <JsonModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        onImport={handleImportJson}
        entityType={entityType}
        fields={fields}
      />

      <style jsx>{`
        .data-manager {
          padding: 2rem;
        }
        .header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }
        .title-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .title-section h1 {
          margin: 0;
        }
        .modal-controls {
          display: flex;
          gap: 1rem;
        }
        .modal-control {
          padding: 0.5rem 1rem;
          border: 2px solid #0070f3;
          border-radius: 4px;
          background: white;
          color: #0070f3;
          cursor: pointer;
          transition: all 0.2s;
        }
        .modal-control:hover {
          background: #f0f7ff;
        }
        .modal-control.active {
          background: #0070f3;
          color: white;
        }
        .records-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .record-card {
          border: 1px solid #ddd;
          padding: 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        .record-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .record-card h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        .description {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9em;
        }
        .preview-field {
          font-size: 0.9em;
          margin: 0.25rem 0;
        }
        .delete-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .record-card:hover .delete-btn {
          opacity: 1;
        }
        .error {
          color: red;
          margin-bottom: 1rem;
        }
        .loading {
          text-align: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

// Wrap DataManager with error boundaries
const DataManagerWithErrorBoundaries = (props) => (
  <DataBoundary>
    <APIBoundary>
      <DataManager {...props} />
    </APIBoundary>
  </DataBoundary>
);

export default DataManagerWithErrorBoundaries;
