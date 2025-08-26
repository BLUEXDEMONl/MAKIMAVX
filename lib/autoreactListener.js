const { isAutoReactEnabled } = require("./myFunc");

async function autoreactListener(maki, m) {
  if (!m.message || !await isAutoReactEnabled()) {
    return;
  }

  try {
    const emojis = [
      "💖", "🔥", "✨", "👍", "😂", "😮", "😢", "😠", "🎉", "💯",
      "✅", "🙏", "🤣", "🥰", "😍", "🤩", "🥳", "🤗", "🤔", "🫡",
      "👀", "👑", "🌸", "💎", "😈", "👻", "🤖", "👾", "😎", "❤️‍🔥"
    ];
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    if (m.key && m.key.remoteJid) {
      await maki.sendMessage(m.key.remoteJid, {
        react: {
          text: randomEmoji,
          key: m.key,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error in autoreactListener:", error);
  }
}

module.exports = autoreactListener;
