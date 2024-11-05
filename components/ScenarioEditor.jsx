import React, { useState } from "react";
import { ListEditor } from "./ListEditor";

export const ScenarioEditor = ({ scenarios = [], onChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [newScenario, setNewScenario] = useState({
    title: "",
    setup: "",
    escalation: "",
    resolution_options: [],
  });

  const handleScenarioChange = (field, value) => {
    if (editingIndex !== null) {
      const updatedScenarios = [...scenarios];
      updatedScenarios[editingIndex] = {
        ...updatedScenarios[editingIndex],
        [field]: value,
      };
      onChange(updatedScenarios);
    } else {
      setNewScenario({
        ...newScenario,
        [field]: value,
      });
    }
  };

  const handleAdd = () => {
    if (newScenario.title && newScenario.setup && newScenario.escalation) {
      onChange([...scenarios, { ...newScenario }]);
      setNewScenario({
        title: "",
        setup: "",
        escalation: "",
        resolution_options: [],
      });
    }
  };

  const handleRemove = (index) => {
    const updatedScenarios = scenarios.filter((_, i) => i !== index);
    onChange(updatedScenarios);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="scenario-editor">
      <div className="scenarios-list">
        {scenarios.map((scenario, index) => (
          <div key={index} className="scenario-item">
            <div className="scenario-header">
              <h4>{scenario.title}</h4>
              <div className="scenario-actions">
                <button
                  type="button"
                  onClick={() =>
                    setEditingIndex(editingIndex === index ? null : index)
                  }
                  className="edit-btn"
                >
                  {editingIndex === index ? "Done" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            </div>

            {editingIndex === index ? (
              <div className="scenario-edit-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={scenario.title}
                    onChange={(e) =>
                      handleScenarioChange("title", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Setup</label>
                  <textarea
                    value={scenario.setup}
                    onChange={(e) =>
                      handleScenarioChange("setup", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Escalation</label>
                  <textarea
                    value={scenario.escalation}
                    onChange={(e) =>
                      handleScenarioChange("escalation", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Resolution Options</label>
                  <ListEditor
                    items={scenario.resolution_options}
                    onChange={(newList) =>
                      handleScenarioChange("resolution_options", newList)
                    }
                    placeholder="Add a resolution option"
                  />
                </div>
              </div>
            ) : (
              <div className="scenario-preview">
                <p>
                  <strong>Setup:</strong> {scenario.setup}
                </p>
                <p>
                  <strong>Escalation:</strong> {scenario.escalation}
                </p>
                <div className="resolution-options">
                  <strong>Resolution Options:</strong>
                  <ul>
                    {scenario.resolution_options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="add-scenario">
        <h4>Add New Scenario</h4>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={newScenario.title}
            onChange={(e) =>
              setNewScenario({ ...newScenario, title: e.target.value })
            }
            placeholder="Enter scenario title"
          />
        </div>
        <div className="form-group">
          <label>Setup</label>
          <textarea
            value={newScenario.setup}
            onChange={(e) =>
              setNewScenario({ ...newScenario, setup: e.target.value })
            }
            placeholder="Describe the initial situation"
          />
        </div>
        <div className="form-group">
          <label>Escalation</label>
          <textarea
            value={newScenario.escalation}
            onChange={(e) =>
              setNewScenario({ ...newScenario, escalation: e.target.value })
            }
            placeholder="Describe how the situation develops"
          />
        </div>
        <div className="form-group">
          <label>Resolution Options</label>
          <ListEditor
            items={newScenario.resolution_options}
            onChange={(newList) =>
              setNewScenario({ ...newScenario, resolution_options: newList })
            }
            placeholder="Add a resolution option"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="add-btn"
          disabled={
            !newScenario.title || !newScenario.setup || !newScenario.escalation
          }
        >
          Add Scenario
        </button>
      </div>

      <style jsx>{`
        .scenario-editor {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .scenarios-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .scenario-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 1rem;
        }
        .scenario-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .scenario-header h4 {
          margin: 0;
          color: #333;
        }
        .scenario-actions {
          display: flex;
          gap: 0.5rem;
        }
        .edit-btn {
          padding: 0.25rem 0.75rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .remove-btn {
          padding: 0.25rem 0.5rem;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 1.2em;
        }
        .remove-btn:hover {
          color: #ff4444;
        }
        .scenario-edit-form,
        .add-scenario {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-weight: 500;
          color: #666;
        }
        .form-group input,
        .form-group textarea {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .form-group textarea {
          min-height: 80px;
        }
        .scenario-preview {
          color: #666;
        }
        .resolution-options ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .add-btn {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          align-self: flex-start;
        }
        .add-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
