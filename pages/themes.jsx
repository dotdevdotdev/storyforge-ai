import React from "react";
import Layout from "../components/Layout";
import DataManagerWithErrorBoundaries from "../components/DataManager";

const themeFields = [
  {
    name: "name",
    label: "Theme Name",
    type: "text",
    required: true,
    preview: true,
    example: "Conspiracy Capers",
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    required: true,
    preview: true,
  },
  {
    name: "elements",
    label: "Theme Elements",
    type: "json",
    required: true,
    preview: false,
    defaultValue: {
      core_concepts: [],
      common_props: [],
      typical_outcomes: [],
    },
    example: {
      core_concepts: ["mysterious disappearances", "suspicious coincidences"],
      common_props: ["red string", "cork boards"],
      typical_outcomes: ["mundane explanations", "accidental cover-ups"],
    },
  },
  {
    name: "locations",
    label: "Locations",
    type: "json",
    required: true,
    preview: false,
    defaultValue: {},
    example: {
      primary: "Doodle Bug's Detective Office",
      secondary: "Ella's Camera Screens",
      hideout: "Meeting Room",
      banned_from: "Captain's Quarters",
    },
  },
  {
    name: "characters",
    label: "Characters",
    type: "json",
    required: true,
    preview: false,
    defaultValue: {
      instigators: [],
      common_victims: [],
    },
    example: {
      instigators: ["Doodle Bug", "Ella CSL"],
      common_victims: ["innocent bystanders", "confused crew members"],
    },
  },
  {
    name: "sample_scenarios",
    label: "Sample Scenarios",
    type: "json",
    required: true,
    preview: false,
    defaultValue: [],
    example: [
      {
        title: "The Sock Conspiracy",
        setup: "Doodle Bug notices missing socks in the laundry",
        escalation: "Elaborate theory involving sock-stealing aliens develops",
        resolution_options: [
          "Find socks stuck in dryer",
          "Uncover actual sock-collecting robot",
        ],
      },
    ],
  },
];

const Themes = () => {
  const fetchThemes = async () => {
    const response = await fetch("/api/themes");
    if (!response.ok) throw new Error("Failed to fetch themes");
    return response.json();
  };

  const createTheme = async (data) => {
    const response = await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create theme");
    return response.json();
  };

  const updateTheme = async (data) => {
    const response = await fetch(`/api/themes/${data._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update theme");
    return response.json();
  };

  const deleteTheme = async (id) => {
    const response = await fetch(`/api/themes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete theme");
    return response.json();
  };

  return (
    <Layout>
      <DataManagerWithErrorBoundaries
        title="Themes"
        entityType="theme"
        fields={themeFields}
        fetchData={fetchThemes}
        createRecord={createTheme}
        updateRecord={updateTheme}
        deleteRecord={deleteTheme}
      />
    </Layout>
  );
};

export default Themes;
