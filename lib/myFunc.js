const os = require("os");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { readDb, writeDb } = require("../database/database");

function getUptime() {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getCpuUsage() {
  const startUsage = process.cpuUsage();
  const startTime = process.hrtime();
  const waitTime = 100;
  const start = Date.now();
  while (Date.now() - start < waitTime);
  const endUsage = process.cpuUsage(startUsage);
  const endTime = process.hrtime(startTime);
  const elapsedTime = (endTime[0] * 1e9 + endTime[1]) / 1e6;
  const cpuTime = (endUsage.user + endUsage.system) / 1e3;
  const cpuUsage = Math.round((cpuTime / elapsedTime) * 100);
  return `${cpuUsage}%`;
}

function getRamUsage() {
  const memoryUsage = process.memoryUsage();
  const usedRam = memoryUsage.rss;
  const totalRam = os.totalmem();
  const ramUsage = Math.round((usedRam / totalRam) * 100);
  return `${ramUsage}%`;
}

function getNigeriaTime() {
  return moment().tz("Africa/Lagos").format("h:mm:ss A");
}

async function getPing() {
  const startTime = process.hrtime();
  await new Promise((resolve) => setTimeout(resolve, 10));
  const diff = process.hrtime(startTime);
  return (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2) + " ms";
}

function getSystemInfo() {
  return `OS: ${os.type()} ${os.release()} (${os.arch()})`;
}

function font(text) {
  const lowercaseABC =
    "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,1,2,3,4,5,6,7,8,9,0".split(
      ",",
    );
  const uppercaseABC =
    "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0".split(
      ",",
    );

  const monospaceLower =
    "𝙰,𝙱,𝙲,𝙳,𝙴,𝙵,𝙶,𝙷,𝙸,𝙹,𝙺,𝙻,𝙼,𝙽,𝙾,𝙿,𝚀,𝚁,𝚂,𝚃,𝚄,𝚅,𝚆,𝚇,𝚈,𝚉,𝟷,𝟸,𝟹,𝟺,𝟻,𝟼,𝟽,𝟾,𝟿,𝟶".split(
      ",",
    );
  const monospaceUpper =
    "𝙰,𝙱,𝙲,𝙳,𝙴,𝙵,𝙶,𝙷,𝙸,𝙹,𝙺,𝙻,𝙼,𝙽,𝙾,𝙿,𝚀,𝚁,𝚂,𝚃,𝚄,𝚅,𝚆,𝚇,𝚈,𝚉,𝟷,𝟸,𝟹,𝟺,𝟻,𝟼,𝟽,𝟾,𝟿,𝟶".split(
      ",",
    );

  const fontMap = {
    lowercase: {},
    uppercase: {},
  };

  lowercaseABC.forEach((char, i) => {
    fontMap.lowercase[char] = monospaceLower[i];
  });

  uppercaseABC.forEach((char, i) => {
    fontMap.uppercase[char] = monospaceUpper[i];
  });

  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) return fontMap.lowercase[char] || char;
      if (/[A-Z]/.test(char)) return fontMap.uppercase[char] || char;
      return fontMap.lowercase[char] || char;
    })
    .join("");
}

function bfont(text) {
  const letters =
    "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z".split(
      ",",
    );
  const numbers = "1,2,3,4,5,6,7,8,9,0".split(",");
  const boldLetters =
    "𝐀,𝐁,𝐂,𝐃,𝐄,𝐅,𝐆,𝐇,𝐈,𝐉,𝐊,𝐋,𝐌,𝐍,𝐎,𝐏,𝐐,𝐑,𝐒,𝐓,𝐔,𝐕,𝐖,𝐗,𝐘,𝐙,𝐀,𝐁,𝐂,𝐃,𝐄,𝐅,𝐆,𝐇,𝐈,𝐉,𝐊,𝐋,𝐌,𝐍,𝐎,𝐏,𝐐,𝐑,𝐒,𝐓,𝐔,𝐕,𝐖,𝐗,𝐘,𝐙".split(
      ",",
    );
  const boldNumbers = "1,2,3,4,5,6,7,8,9,0".split(",");

  const fontMap = {};

  letters.forEach((char, i) => (fontMap[char] = boldLetters[i]));
  numbers.forEach((char, i) => (fontMap[char] = boldNumbers[i]));

  return text
    .split("")
    .map((char) => fontMap[char] || char)
    .join("");
}

function getPrefix() {
  const db = readDb();
  return db.prefix?.prefix || ".";
}

function setPrefix(newPrefix) {
  if (typeof newPrefix !== "string" || !newPrefix.trim()) {
    throw new Error("❌ Invalid prefix: must be a non-empty string");
  }
  const db = readDb();
  db.prefix = { prefix: newPrefix.trim() };
  writeDb(db);
  return `✅ Prefix updated to "${newPrefix}"`;
}

function isPublic() {
  const db = readDb();
  return db.mode?.public || false;
}

function setMode(state) {
  const db = readDb();
  db.mode = { public: !!state };
  writeDb(db);
  return !!state;
}

function totalCase() {
  const filePath = path.join(__dirname, "..", "maki.js");
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const caseCount = (fileContent.match(/case\s+['"]/g) || []).length;
    return caseCount;
  } catch (err) {
    console.error("❌ Error reading maki.js:", err);
    return 0;
  }
}

function getAntilinkConfig() {
  const db = readDb();
  return db.antilink || {};
}

function saveAntilinkConfig(config) {
  const db = readDb();
  db.antilink = config;
  writeDb(db);
}

function setAntilinkMode(groupId, mode) {
  const config = getAntilinkConfig();
  if (!config[groupId]) {
    config[groupId] = { warnings: {} };
  }
  config[groupId].mode = mode;
  saveAntilinkConfig(config);
  return `✅ Antilink mode for this group set to ${mode}.`;
}

function setAntilinkWarnCount(groupId, count) {
  const config = getAntilinkConfig();
  if (!config[groupId]) {
    config[groupId] = { warnings: {} };
  }
  config[groupId].warn_count = count;
  saveAntilinkConfig(config);
  return `✅ Antilink warn count for this group set to ${count}.`;
}

function getAntilinkWarnCount(groupId) {
  const config = getAntilinkConfig();
  return config[groupId] ? config[groupId].warn_count : undefined;
}

function getGroupAntilinkMode(groupId) {
  const config = getAntilinkConfig();
  return config[groupId] ? config[groupId].mode : "off";
}

function recordWarning(groupId, userId) {
  const config = getAntilinkConfig();
  if (!config[groupId]) {
    config[groupId] = { mode: "warn", warnings: {} };
  }
  if (!config[groupId].warnings) {
    config[groupId].warnings = {};
  }
  const currentWarnings = (config[groupId].warnings[userId] || 0) + 1;
  config[groupId].warnings[userId] = currentWarnings;
  saveAntilinkConfig(config);
  return currentWarnings;
}

function resetWarnings(groupId, userId) {
  const config = getAntilinkConfig();
  if (
    config[groupId] &&
    config[groupId].warnings &&
    config[groupId].warnings[userId]
  ) {
    delete config[groupId].warnings[userId];
    saveAntilinkConfig(config);
  }
}

function random(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("❌ random() requires a non-empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isAutoViewStatus() {
  const db = readDb();
  return db.autoview?.enabled || false;
}

function setAutoViewStatus(state) {
  const db = readDb();
  db.autoview = { enabled: !!state };
  writeDb(db);
  return !!state;
}

function getPresence() {
  const db = readDb();
  return db.presence?.presence || "unavailable";
}

function setPresence(presence) {
  const db = readDb();
  db.presence = { presence };
  writeDb(db);
  return true;
}

function getEmoji() {
  const db = readDb();
  return db.emoji?.emoji || "🌸";
}

function setEmoji(emoji) {
  const db = readDb();
  db.emoji = { emoji };
  writeDb(db);
  return true;
}

function isAnticallEnabled() {
  const db = readDb();
  return db.anticall?.enabled || false;
}

function setAnticall(state) {
  const db = readDb();
  db.anticall = { enabled: !!state };
  writeDb(db);
  return !!state;
}

function isAutoReactEnabled() {
  const db = readDb();
  return db.autoreact?.enabled || false;
}

function setAutoReact(state) {
  const db = readDb();
  db.autoreact = { enabled: !!state };
  writeDb(db);
  return !!state;
}

function setSticker(stickerHash, cmdName) {
  const db = readDb();
  if (!db.stickerCommands) {
    db.stickerCommands = {};
  }
  db.stickerCommands[stickerHash] = cmdName;
  writeDb(db);
}

function delSticker(stickerHash) {
  const db = readDb();
  if (db.stickerCommands && db.stickerCommands[stickerHash]) {
    const deletedCommand = db.stickerCommands[stickerHash];
    delete db.stickerCommands[stickerHash];
    writeDb(db);
    return deletedCommand;
  }
  return null;
}

function clearSticker() {
  const db = readDb();
  if (db.stickerCommands) {
    db.stickerCommands = {};
    writeDb(db);
  }
}

module.exports = {
  font,
  bfont,
  getUptime,
  getCpuUsage,
  getRamUsage,
  getNigeriaTime,
  getPing,
  getSystemInfo,
  getPrefix,
  setPrefix,
  isPublic,
  setMode,
  totalCase,
  setAntilinkMode,
  getGroupAntilinkMode,
  recordWarning,
  resetWarnings,
  random,
  setAntilinkWarnCount,
  getAntilinkWarnCount,
  isAutoViewStatus,
  setAutoViewStatus,
  getPresence,
  setPresence,
  getEmoji,
  setEmoji,
  isAnticallEnabled,
  setAnticall,
  sleep,
  isAutoReactEnabled,
  setAutoReact,
  setSticker,
  delSticker,
  clearSticker,
};