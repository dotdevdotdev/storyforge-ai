import React, { useState, useEffect } from "react";
import { ListEditor } from "../ListEditor";
import { KeyValueEditor } from "../KeyValueEditor";
import { ScenarioEditor } from "../ScenarioEditor";
import { Button, Input, Textarea } from "../ui";

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
        <Textarea
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
          rows={10}
          className="font-mono"
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
          <Textarea
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
            rows={10}
            className="font-mono"
          />
        );
      default:
        return (
          <Input
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-backdrop">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-hidden flex flex-col animate-fade-in">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? `Edit ${entityType}` : `New ${entityType}`}
          </h2>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJsonMode(!jsonMode)}
            >
              {jsonMode ? "Form Mode" : "JSON Mode"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {jsonError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{jsonError}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(formData);
            }}
            className="space-y-6"
          >
            {fields.map((field) => (
              <div key={field.name} className={`${field.className || ""}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.example && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Example:</span> {JSON.stringify(field.example)}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {record ? 'Update' : 'Create'} {entityType}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
