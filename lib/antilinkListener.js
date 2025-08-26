const fs = require("fs");
const path = require("path");
const {
  getGroupAntilinkMode,
  recordWarning,
  resetWarnings,
  getAntilinkWarnCount,
  font,
} = require("./myFunc");

async function antilinkListener(maki, m) {
  try {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) return false;

    const antilinkMode = getGroupAntilinkMode(from);
    if (antilinkMode === "off") return false;

    const messageText =
      m.message?.conversation || m.message?.extendedTextMessage?.text || "";
    const linkRegex =
      /\b(?:(?:https?|ftp):\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/gi;

    if (linkRegex.test(messageText)) {
      const senderJid = m.key.participant;
      if (!senderJid) return false;
      const botNumber = maki.user.id.split(":")[0] + "@s.whatsapp.net";
      const metadata = await maki.groupMetadata(from);
      const admins = metadata.participants
        .filter((p) => p.admin != null)
        .map((p) => p.id);
      const isBotAdmin = admins.includes(botNumber);
      const isAdmin = admins.includes(senderJid);

      if (isAdmin) return false;

      if (isBotAdmin) {
        const key = {
          remoteJid: from,
          fromMe: false,
          id: m.key.id,
          participant: senderJid,
        };

        switch (antilinkMode) {
          case "delete":
            await maki.sendMessage(from, { delete: key });
            return true;
          case "kick":
            await maki.sendMessage(from, { delete: key });
            await maki.groupParticipantsUpdate(from, [senderJid], "remove");
            await maki.sendMessage(from, {
              text: font(
                `🚫 Link detected! @${senderJid.split("@")[0]} has been removed.`,
              ),
              mentions: [senderJid],
            });
            return true;
          case "warn":
            const warnCount = getAntilinkWarnCount(from);
            if (warnCount === undefined) {
              await maki.sendMessage(from, {
                text: font(
                  `Antilink is set to "warn", but no warning count has been configured for this group. Admins can set a warning count with the setwarn command.`,
                ),
              });
              return true;
            }
            const warnings = recordWarning(from, senderJid);
            if (warnings >= warnCount) {
              await maki.sendMessage(from, { delete: key });
              await maki.groupParticipantsUpdate(from, [senderJid], "remove");
              await maki.sendMessage(from, {
                text: font(
                  `🚫 Link detected! @${senderJid.split("@")[0]} has been removed after ${warnCount} warnings.`,
                ),
                mentions: [senderJid],
              });
              resetWarnings(from, senderJid);
              return true;
            } else {
              await maki.sendMessage(from, { delete: key });
              await maki.sendMessage(from, {
                text: font(
                  `🚫 Link detected! @${senderJid.split("@")[0]}, you have ${warnings} warning(s). You will be removed after ${warnCount} warnings.`,
                ),
                mentions: [senderJid],
              });
              return true;
            }
        }
      }
    }
  } catch (err) {
    console.error("❌ Antilink listener error:", err);
  }
  return false;
}

module.exports = antilinkListener;
