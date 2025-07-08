#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Template for list endpoints (GET all, POST new)
const listEndpointTemplate = (collectionName, resourceName) => `import { COLLECTION_NAMES } from "../../lib/collectionNames";
import dal from "../../lib/services/dataAccessLayer";
import { withAuth } from "../../middleware/withAuth";

async function handler(req, res) {
  try {
    const userId = req.userId; // Added by withAuth middleware

    if (req.method === "POST") {
      const ${resourceName}Data = {
        ...req.body,
      };
      const result = await dal.create(COLLECTION_NAMES.${collectionName}, ${resourceName}Data, userId);
      res.status(201).json({
        message: "${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} created successfully",
        id: result._id,
        ${resourceName}: result,
      });
    } else if (req.method === "GET") {
      const ${collectionName} = await dal.find(COLLECTION_NAMES.${collectionName}, {}, userId);
      res.status(200).json(${collectionName});
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export default (req, res) => withAuth(req, res, handler);`;

// Template for individual resource endpoints (GET one, PUT, DELETE)
const idEndpointTemplate = (collectionName, resourceName) => `import { COLLECTION_NAMES } from "../../../lib/collectionNames";
import dal from "../../../lib/services/dataAccessLayer";
import { withAuth } from "../../../middleware/withAuth";

async function handler(req, res) {
  const { id } = req.query;
  const userId = req.userId; // Added by withAuth middleware

  if (!id) {
    return res.status(400).json({ message: "${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} ID is required" });
  }

  try {
    if (req.method === "PUT") {
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.createdBy;

      const result = await dal.update(
        COLLECTION_NAMES.${collectionName},
        id,
        updateData,
        userId
      );

      res.status(200).json(result);
    } else if (req.method === "GET") {
      const ${resourceName} = await dal.findById(
        COLLECTION_NAMES.${collectionName},
        id,
        userId
      );
      res.status(200).json(${resourceName});
    } else if (req.method === "DELETE") {
      await dal.delete(COLLECTION_NAMES.${collectionName}, id, userId);
      res.status(200).json({ message: "${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} deleted successfully" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    
    if (error.message === "Resource not found or access denied") {
      return res.status(404).json({ message: "${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} not found" });
    }
    
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export default (req, res) => withAuth(req, res, handler);`;

// Endpoints to update
const endpoints = [
  { 
    listPath: 'pages/api/themes/index.js',
    idPath: 'pages/api/themes/[id].js',
    collectionName: 'themes',
    resourceName: 'theme'
  },
  { 
    listPath: 'pages/api/archetypes/index.js',
    idPath: 'pages/api/archetypes/[id].js',
    collectionName: 'archetypes',
    resourceName: 'archetype'
  }
];

// Update files
endpoints.forEach(({ listPath, idPath, collectionName, resourceName }) => {
  const apiDir = path.join(__dirname, '..');
  
  // Update list endpoint
  const listFullPath = path.join(apiDir, listPath);
  console.log(`Updating ${listPath}...`);
  fs.writeFileSync(listFullPath, listEndpointTemplate(collectionName, resourceName));
  
  // Update ID endpoint
  const idFullPath = path.join(apiDir, idPath);
  console.log(`Updating ${idPath}...`);
  fs.writeFileSync(idFullPath, idEndpointTemplate(collectionName, resourceName));
});

console.log('API endpoints updated successfully!');