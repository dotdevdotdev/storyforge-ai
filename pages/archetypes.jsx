import React from "react";
import Layout from "../components/Layout";
import { DataManager } from "../components/DataManager";
import { NestedArrayEditor } from "../components/NestedArrayEditor";
import { ObjectArrayEditor } from "../components/ObjectArrayEditor";

const archetypeFields = [
  {
    name: "name",
    label: "Archetype Name",
    type: "text",
    required: true,
    preview: true,
    example: "Character Quirk Escalation",
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    required: true,
    preview: true,
    example: "The way character traits spiral into plot-driving forces",
  },
  {
    name: "narrative_elements",
    label: "Narrative Elements",
    type: "custom",
    component: NestedArrayEditor,
    required: true,
    preview: false,
    defaultValue: {
      tone: [],
      language_style: [],
      story_beats: [],
    },
    example: {
      tone: [
        "escalating obsessions",
        "quirk-based problem solving",
        "personality-driven chaos",
      ],
      language_style: [
        "recurring character catchphrases",
        "personality-specific descriptions",
        "quirk-based metaphors",
      ],
      story_beats: [
        "minor trait becomes major plot point",
        "quirk creates unexpected solution",
        "personality conflicts drive story",
      ],
    },
  },
  {
    name: "character_patterns",
    label: "Character Patterns",
    type: "custom",
    component: NestedArrayEditor,
    required: true,
    preview: false,
    defaultValue: {
      trait_expressions: [],
      interaction_types: [],
    },
    example: {
      trait_expressions: [
        "Dr. Fizz's color obsession",
        "Captain Zapp's self-aggrandizement",
        "Gloria's exasperation",
      ],
      interaction_types: [
        "quirk reinforcement",
        "trait clash",
        "characteristic misunderstanding",
      ],
    },
  },
  {
    name: "sample_applications",
    label: "Sample Applications",
    type: "custom",
    component: ObjectArrayEditor,
    required: true,
    preview: false,
    defaultValue: [],
    example: [
      {
        situation: "Simple decision",
        quirk_evolution: "Each character approaches based on their obsession",
        typical_resolution: "Multiple quirks combine for unlikely solution",
      },
    ],
  },
];

const Archetypes = () => {
  const fetchArchetypes = async () => {
    const response = await fetch("/api/archetypes");
    if (!response.ok) throw new Error("Failed to fetch archetypes");
    return response.json();
  };

  const createArchetype = async (data) => {
    const response = await fetch("/api/archetypes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create archetype");
    return response.json();
  };

  const updateArchetype = async (data) => {
    const response = await fetch(`/api/archetypes/${data._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update archetype");
    return response.json();
  };

  const deleteArchetype = async (id) => {
    const response = await fetch(`/api/archetypes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete archetype");
    return response.json();
  };

  return (
    <Layout>
      <DataManager
        title="Archetypes"
        entityType="archetype"
        fields={archetypeFields}
        fetchData={fetchArchetypes}
        createRecord={createArchetype}
        updateRecord={updateArchetype}
        deleteRecord={deleteArchetype}
      />
    </Layout>
  );
};

export default Archetypes;
