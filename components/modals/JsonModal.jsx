import React, { useState } from "react";
import { Button, Textarea, Card } from "../ui";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-backdrop">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Import {entityType} from JSON
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* JSON Input */}
          <Textarea
            label="Paste JSON data:"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            className="font-mono"
            helperText="Paste your JSON data here. You can import a single object or an array of objects."
          />

          {/* Format Help */}
          <Card className="bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Expected Format:</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto bg-white p-3 rounded border">
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
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImport}>
              Import JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
