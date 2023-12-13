const fs = require("fs").promises;

// Function for file reading
async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
}

// Function for file writing
async function writeFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    throw error;
  }
}

module.exports = {
  readFile,
  writeFile,
};
