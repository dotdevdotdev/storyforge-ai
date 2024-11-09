import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { DataManager } from "../components/DataManager";
import { StoryParameterEditor } from "../components/editors/StoryParameterEditor";

const PARAMETER_TEMPLATE = {
  NAME: "",
  GENRE: "",
  LENGTH: "",
  TONE: "",
  NARRATIVE_STYLE: "",
  PROTAGONIST: "",
  PROTAGONIST_GOAL: "",
  DEUTERAGONIST: "",
  ANTAGONIST: "",
  ALLIES: "",
  OBSTACLES: "",
  WILD_CARD: "",
  MAIN_CONFLICT: "",
  COMPLICATIONS: "",
  RESOLUTION_TYPE: "",
  PACING: "",
  TONE_REQUIREMENTS: "",
  NARRATIVE_FOCUS: "",
  RUNNING_GAGS: "",
  KEY_DYNAMICS: "",
};

const parameterFields = [
  {
    name: "name",
    type: "string",
    label: "Name",
    required: true,
    preview: true,
  },
  {
    name: "genre",
    type: "string",
    label: "Genre",
    required: true,
    preview: true,
  },
  {
    name: "parameters",
    type: "custom",
    component: StoryParameterEditor,
    label: "Parameters",
    required: true,
  },
];

const StoryParameters = () => {
  const fetchParameters = async () => {
    const response = await fetch("/api/story-parameters");
    if (!response.ok) throw new Error("Failed to fetch parameters");
    return response.json();
  };

  const createParameter = async (data) => {
    const response = await fetch("/api/story-parameters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create parameter");
    return response.json();
  };

  const updateParameter = async (data) => {
    const response = await fetch(`/api/story-parameters/${data._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update parameter");
    return response.json();
  };

  const deleteParameter = async (id) => {
    const response = await fetch(`/api/story-parameters/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete parameter");
    return response.json();
  };

  return (
    <Layout>
      <DataManager
        title="Story Parameters"
        entityType="story parameter"
        fields={parameterFields}
        fetchData={fetchParameters}
        createRecord={createParameter}
        updateRecord={updateParameter}
        deleteRecord={deleteParameter}
        renderListItem={(param) => (
          <div className="story-card">
            <div className="story-header">
              <span className="story-title">{param.name || "(unnamed)"}</span>
              <span className="story-preview">
                {param.genre || "(no genre yet)"}
              </span>
            </div>
          </div>
        )}
      />
    </Layout>
  );
};

export default StoryParameters;
