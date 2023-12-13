const fileService = require("./fileService");

// Retrieve items from the file specified by filePath using the provided key,
async function getItems(filePath, res, key) {
  try {
    const data = await fileService.readFile(filePath);
    res.json(data[key]);
  } catch (error) {
    console.error(`Error reading data from ${filePath}:`, error);
    res.status(500).send("Internal Server Error");
  }
}

// Add a new item to the file specified by filePath.
async function addItem(filePath, newItem, res, key) {
  try {
    const data = await fileService.readFile(filePath);

    data[key].push(newItem);
    await fileService.writeFile(filePath, data);

    res.json(newItem);
  } catch (error) {
    console.error(`Error adding item to ${filePath}:`, error);
    res.status(500).send("Internal Server Error");
  }
}

// Update an existing item in the file specified by filePath.
async function updateItem(filePath, itemId, updatedItem, res, key) {
  try {
    const data = await fileService.readFile(filePath);

    const index = data[key].findIndex((item) => item.id === itemId);

    if (index !== -1) {
      data[key][index] = { ...data[key][index], ...updatedItem };

      await fileService.writeFile(filePath, data);

      res.json(data[key][index]);
    } else {
      res.status(404).send("Item not found");
    }
  } catch (error) {
    console.error(`Error updating item in ${filePath}:`, error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getItems,
  addItem,
  updateItem,
};
