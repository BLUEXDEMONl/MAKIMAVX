const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
  delay,
  getMessage,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const chalk = require("chalk");
const CFonts = require("cfonts");
const Pino = require("pino");
const axios = require("axios");
const handleListeners = require("./maki");
const { isAutoViewStatus } = require("./lib/myFunc");
const anticallListener = require("./lib/anticallListener.js");
const autoreactListener = require("./lib/autoreactListener.js");
const excludedFiles = ["index.js"];
const watchedModules = new Map();
const http = require("http");
const PORT =
  process.env.PORT || Math.floor(Math.random() * (9000 - 1000 + 1)) + 1000;

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
const store = makeInMemoryStore({ logger: Pino().child({ level: "silent" }) });

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

let maki;
let restartCount = 0;
const MAX_RESTARTS = 3;

async function connectBot() {
  try {
    console.clear();
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    maki = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" })),
      },
      logger: Pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.windows("Chrome"),
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      getMessage,
    });

    store.bind(maki.ev);
    maki.ev.on("creds.update", saveCreds);

    CFonts.say("MAKIMA-VX", {
      font: "chrome",
      align: "left",
      gradient: ["blue", "cyan"],
      transitionGradient: true,
    });

    if (!maki.authState.creds.registered) {
      const pair = "MAKIMAVX";
      console.log(
        chalk.hex(getRandomColor()).bold(`\n🔗 Send Your WhatsApp Number?\n`),
      );
      const phoneNumber = await question(
        chalk.yellow("📲 Enter your phone number with country code: "),
      );
      let code = await maki.requestPairingCode(phoneNumber, pair);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(
        chalk
          .hex(getRandomColor())
          .bold(`\n🔗 Your Pairing Code:\n\n${code}\n`),
      );
    }

    maki.ev.on("messages.upsert", async ({ messages }) => {
      for (const message of messages) {
        if (isAutoViewStatus() && message.key && message.key.remoteJid === 'status@broadcast') {
            await maki.readMessages([message.key]);
        }
        const handleListeners = watchedModules.get('maki.js');
        if (handleListeners) {
          await handleListeners(maki, message);
        }
        await autoreactListener(maki, message);
      }
    });

    maki.ev.on("call", async (callData) => {
      for (const call of callData) {
        await anticallListener(maki, call);
      }
    });

    maki.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      const reason = lastDisconnect?.error?.output?.statusCode;

      switch (connection) {
        case "open":
          console.log(
            chalk.yellowBright("MAKIMA-VX Has Connected Successfully✅"),
          );
          break;

        case "close":
          console.log(chalk.red("⚠️ Lost connection. Reawakening..."));
          if (reason === 401) {
            console.log(
              chalk.red(
                "❌ Authentication failed. Purge 'session' and restart.",
              ),
            );
          } else if (reason === 403) {
            console.log(
              chalk.red("🚫 Banned from the battlefield. Get a new number."),
            );
          } else if (reason === 408) {
            console.log(
              chalk.yellow("⏳ Delay detected. Retrying in 5 seconds..."),
            );
            setTimeout(connectBot, 5000);
          } else if (reason === 440) {
            console.log(chalk.red("🛑 Session expired. Reforge the link."));
          } else if (reason === 500) {
            console.log(chalk.red("⚡ Internal disruption. Restarting..."));
            setTimeout(connectBot, 5000);
          } else if (reason === 503) {
            console.log(
              chalk.yellow("🛠️ WhatsApp down. Retrying in 1 minute..."),
            );
            setTimeout(connectBot, 60000);
          } else if (reason === 515) {
            console.log(chalk.red("⚠️ Reconnection needed."));
            await connectBot();
          } else {
            console.log(
              chalk.yellow("🔄 Unknown interference. Retrying in 5 seconds..."),
            );
            setTimeout(connectBot, 5000);
          }
          break;

        case "connecting":
          console.log(chalk.blue("🔄 Reconnecting to Servers..."));
          break;

        case "disconnected":
          console.log(chalk.red("❌ Connection lost. Preparing a new link..."));
          setTimeout(connectBot, 5000);
          break;

        default:
      }
    });
  } catch (error) {
    console.error(chalk.red("\n💥 An Error Has Been Detected: "), error);

    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(
        chalk.yellow(
          `🔄 Respawning in 2 seconds... (${restartCount}/${MAX_RESTARTS})\n`,
        ),
      );
      setTimeout(connectBot, 2000);
    } else {
      console.log(
        chalk.red("🚨 Maximum attempts reached! Manual restart required."),
      );
    }
  }
}
connectBot();

function hotReloadModule(file) {
    const fullPath = path.resolve(__dirname, file);
    try {
        delete require.cache[require.resolve(fullPath)];
        const updatedModule = require(fullPath);
        watchedModules.set(file, updatedModule);
        console.log(chalk.greenBright(`🔄 Reloaded module: ${file}`));
    } catch (err) {
        console.error(chalk.red(`❌ Failed to reload ${file}:`, err.message));
    }
}

fs.readdirSync(__dirname).forEach(file => {
    if (
        excludedFiles.includes(file) ||
        file.startsWith('.') ||
        !file.endsWith('.js') ||
        fs.statSync(path.join(__dirname, file)).isDirectory()
    ) return;

    const fullPath = path.join(__dirname, file);
    watchedModules.set(file, require(fullPath));

    fs.watch(fullPath, { persistent: true }, (eventType) => {
        if (eventType === 'change') {
            hotReloadModule(file);
        }
    });
});

http
  .createServer((req, res) => {
    if (req.url === "/") {
      const filePath = path.join(__dirname, "MAKIMA", "Maki.html");
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("500: Internal Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404: Not Found");
    }
  })
  .listen(PORT, () => console.log(`🌸 Makima is running on port ${PORT}`));