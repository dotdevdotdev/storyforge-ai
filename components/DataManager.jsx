import React, { useState, useEffect } from "react";
import { JsonModal } from "./modals/JsonModal";
import { EditModal } from "./modals/EditModal";
import { DataBoundary, APIBoundary } from "./ErrorBoundaryWrapper";
import { Button, Card, LoadingSpinner, PageHeader } from "./ui";

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
    <div>
      <PageHeader 
        title={title}
        subtitle={`Create and manage ${entityType}s for your stories`}
      />

      {/* Action Buttons */}
      <Card className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Button
            variant={showEditModal ? "primary" : "outline"}
            onClick={() => {
              setShowEditModal(true);
              setShowJsonModal(false);
            }}
          >
            Add New {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </Button>
          <Button
            variant={showJsonModal ? "primary" : "outline"}
            onClick={() => {
              setShowJsonModal(true);
              setShowEditModal(false);
            }}
          >
            Import JSON
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Card className="text-center py-12">
          <LoadingSpinner text={`Loading ${entityType}s...`} size="lg" />
        </Card>
      ) : records.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">No {entityType}s created yet.</p>
          <p className="text-gray-400 mt-2">Create your first {entityType} using the button above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <Card
              key={record._id}
              onClick={() => {
                setSelectedRecord(record);
                setShowEditModal(true);
              }}
              hoverable
              className="cursor-pointer relative group"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {record.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {record.description || "No description available."}
              </p>

              {/* Preview Fields */}
              <div className="space-y-2 mb-4">
                {fields.map(
                  (field) =>
                    field.preview &&
                    field.name !== "name" &&
                    field.name !== "description" && (
                      <div key={field.name} className="text-xs text-gray-500">
                        <span className="font-medium">{field.label}:</span>{" "}
                        <span>{formatPreviewValue(record[field.name], field)}</span>
                      </div>
                    )
                )}
              </div>

              {/* Delete Button */}
              <Button
                variant="danger"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record._id);
                }}
              >
                ×
              </Button>
            </Card>
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
