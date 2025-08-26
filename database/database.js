const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "database.json");

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return {};
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database:", error);
  }
}

module.exports = {
  readDb,
  writeDb,
};
