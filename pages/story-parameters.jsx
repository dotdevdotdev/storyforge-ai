import React from "react";
import Layout from "../components/Layout";
import { DataManager } from "../components/DataManager";
import { NestedObjectEditor } from "../components/NestedObjectEditor";

const parameterStructure = {
  meta: {
    type: "object",
    label: "Meta Information",
    fields: {
      title: {
        type: "string",
        label: "Title",
        placeholder: "Enter story title",
      },
      length: {
        type: "string",
        label: "Length",
        placeholder: "short/medium/long",
      },
      style: {
        type: "object",
        label: "Style",
        fields: {
          primary: { type: "string", label: "Primary Genre" },
          tone: { type: "string", label: "Tone" },
          pacing: { type: "string", label: "Pacing" },
        },
      },
      format: {
        type: "object",
        label: "Format",
        fields: {
          structure: { type: "string", label: "Structure" },
          narrative_voice: { type: "string", label: "Narrative Voice" },
          scene_style: { type: "string", label: "Scene Style" },
        },
      },
    },
  },
  cast: {
    type: "object",
    label: "Cast",
    fields: {
      protagonist: {
        type: "object",
        label: "Protagonist",
        fields: {
          character: { type: "string", label: "Character" },
          focus: { type: "string", label: "Focus" },
          quirk_emphasis: { type: "string", label: "Quirk Emphasis" },
        },
      },
      main_cast: {
        type: "array",
        label: "Main Cast",
        itemType: "object",
      },
      supporting_cast: {
        type: "object",
        label: "Supporting Cast",
        fields: {
          protagonist_side: { type: "array", itemType: "object" },
          antagonist_side: { type: "array", itemType: "object" },
          neutral: { type: "array", itemType: "object" },
        },
      },
      antagonist: {
        type: "object",
        label: "Antagonist",
        fields: {
          character: { type: "string", label: "Character" },
          type: { type: "string", label: "Type" },
          resolution: { type: "string", label: "Resolution" },
        },
      },
    },
  },
  themes: {
    type: "object",
    label: "Themes",
    fields: {
      primary_theme: { type: "string", label: "Primary Theme" },
      secondary_themes: { type: "array", label: "Secondary Themes" },
      required_archetypes: { type: "array", label: "Required Archetypes" },
    },
  },
  setting: {
    type: "object",
    label: "Setting",
    fields: {
      primary_location: { type: "string", label: "Primary Location" },
      secondary_locations: { type: "array", label: "Secondary Locations" },
      ship_state: { type: "string", label: "Ship State" },
      time_period: { type: "string", label: "Time Period" },
    },
  },
  plot_elements: {
    type: "object",
    label: "Plot Elements",
    fields: {
      inciting_incident: { type: "string", label: "Inciting Incident" },
      complications: { type: "array", label: "Complications" },
      climax_type: { type: "string", label: "Climax Type" },
      resolution_style: { type: "string", label: "Resolution Style" },
    },
  },
  special_requirements: {
    type: "object",
    label: "Special Requirements",
    fields: {
      callbacks: { type: "array", label: "Callbacks" },
      running_gags: { type: "array", label: "Running Gags" },
      required_props: { type: "array", label: "Required Props" },
      setup_elements: { type: "array", label: "Setup Elements" },
    },
  },
  generation_flags: {
    type: "object",
    label: "Generation Flags",
    fields: {
      emphasis_on: { type: "array", label: "Emphasis On" },
      avoid: { type: "array", label: "Avoid" },
      maintain_continuity: { type: "array", label: "Maintain Continuity" },
      break_fourth_wall: { type: "string", label: "Break Fourth Wall" },
    },
  },
};

const storyParameterFields = [
  {
    name: "name",
    label: "Parameter Set Name",
    type: "text",
    required: true,
    preview: true,
    defaultValue: "",
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    required: true,
    preview: true,
    defaultValue: "",
  },
  {
    name: "story_parameters",
    label: "Story Parameters",
    type: "custom",
    component: NestedObjectEditor,
    required: true,
    preview: false,
    defaultValue: {},
    componentProps: {
      structure: parameterStructure,
    },
  },
];

const StoryParameters = () => {
  const fetchParameters = async () => {
    const response = await fetch("/api/story-parameters");
    if (!response.ok) throw new Error("Failed to fetch story parameters");
    return response.json();
  };

  const createParameter = async (data) => {
    const response = await fetch("/api/story-parameters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create story parameters");
    return response.json();
  };

  const updateParameter = async (data) => {
    const response = await fetch(`/api/story-parameters/${data._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update story parameters");
    return response.json();
  };

  const deleteParameter = async (id) => {
    const response = await fetch(`/api/story-parameters/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete story parameters");
    return response.json();
  };

  return (
    <Layout>
      <DataManager
        title="Story Parameters"
        entityType="story parameter"
        fields={storyParameterFields}
        fetchData={fetchParameters}
        createRecord={createParameter}
        updateRecord={updateParameter}
        deleteRecord={deleteParameter}
      />
    </Layout>
  );
};

export default StoryParameters;
