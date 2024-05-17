/** @format */

// Setup
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const { table } = require("console");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const dataFilePath = path.join(__dirname, "data.json");
let data = require(dataFilePath);

// Add support for incoming JSON entities
app.use(bodyParser.json());

// Deliver the app's home page to browser clients
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Get all items
app.get("/api/items", (req, res) => {
  res.json(data);
});

// Get one item by ID
app.get("/api/items/:itemId", (req, res) => {
  const itemId = req.params.itemId;
  if (itemId >= 0 && itemId <= data.length) {
    res.json(data[itemId - 1]);
  } else {
    res.status(404).send("Resource not found");
  }
});

// Add new item
app.post("/api/items", (req, res) => {
  const newItem = req.body;
  data.push(newItem);
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      res.status(500).send("Failed to update data file");
      return;
    }
    res.status(201).json({
      message: `New item added`,
    });
  });
});

// Edit existing item by ID
app.put("/api/items/:id", (req, res) => {
  const itemId = req.params.id;
  if (itemId >= 0 && itemId <= data.length) {
    const updatedItem = req.body;
    data[itemId - 1] = updatedItem;
    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        res.status(500).send("Failed to update data file");
        return;
      }
      res.json({
        message: `Updated item ${itemId}`,
      });
    });
  } else {
    res.status(404).send("Resource not found");
  }
});

// Delete item by ID
app.delete("/api/items/:id", (req, res) => {
  const itemId = req.params.id;
  if (itemId >= 0 && itemId <= data.length) {
    data.splice(itemId - 1, 1);
    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        res.status(500).send("Failed to update data file");
        return;
      }
      res.status(200).json({ message: `Deleted item: ${itemId}` });
    });
  } else {
    res.status(404).send("Resource not found");
  }
});

// Resource not found (this should be at the end)
app.use((req, res) => {
  res.status(404).send("Resource not found");
});

// Tell the app to start listening for requests
app.listen(HTTP_PORT, () => {
  console.log("Ready to handle requests on port " + HTTP_PORT);
});
