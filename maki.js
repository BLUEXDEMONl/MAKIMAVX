const {
    generateMessageIDV2,
    WA_DEFAULT_EPHEMERAL,
    getAggregateVotesInPollMessage,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    areJidsSameUser,
    getContentType,
    useMultiFileAuthState,
    makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeWaSocket,
    getDevice
} = require("@whiskeysockets/baileys");

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mess = require("./lib/mess");
const os = require("os");
const process = require("process");
const {
    spawn
} = require("child_process");
const chalk = require("chalk");
const antilinkListener = require("./lib/antilinkListener");
const {
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
    totalCase,
    setAntilinkMode,
    setMode,
    random,
    setAntilinkWarnCount,
    isAutoViewStatus,
    setAutoViewStatus,
    getPresence,
    setPresence,
    getEmoji,
    setEmoji,
    isAnticallEnabled,
    setAnticall,
    sleep,
    setAutoReact,
    setSticker,
    delSticker,
    clearSticker,
} = require("./lib/myFunc");
const {
    readDb
} = require("./database/database");
const {
    makiImages
} = require("./database/tmp/media.js");

const botName = 'MΛKIMΛ-VX';
module.exports = async (maki, m) => {
    if (!m.message) return;

    const isAntilinkDeleted = await antilinkListener(maki, m);
    if (isAntilinkDeleted) return;

    await maki.sendPresenceUpdate(getPresence(), m.key.remoteJid);

    const prefix = getPrefix();
    const from = m.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = m.key.participant || from;
    const ownerFile = './database/owner.json';
    let ownerList = [];
    if (fs.existsSync(ownerFile)) {
        try {
            ownerList = JSON.parse(fs.readFileSync(ownerFile, 'utf8'));
        } catch (error) {
            console.error('Error loading owner list:', error);
        }
    }
    const isOwner = m.key.fromMe || ownerList.includes(sender);
    const pushName = m.pushName;
    const emoji = getEmoji();
    const more = String.fromCharCode(8206);
    const readmore = more.repeat(4001);
    let text = "";
    let messageType = "";
    let isButtonCommand = false;
    let isListCommand = false;
    let isTemplateCommand = false;
    let isInteractiveCommand = false;

    const groupMetadata = isGroup ? await maki.groupMetadata(from) : {};
    const groupAdmins = isGroup ?
        groupMetadata.participants.filter((p) => p.admin).map((p) => p.id) :
        [];
    const isAdmin = isGroup && groupAdmins.includes(sender);
    const participants = groupMetadata.participants;
    const groupName = groupMetadata.subject || "Group";
    const quotedMessage =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message?.stickerMessage?.contextInfo?.quotedMessage || null;
    const quotedText =
        quotedMessage?.conversation ||
        quotedMessage?.imageMessage?.caption ||
        quotedMessage?.videoMessage?.caption ||
        quotedMessage?.documentMessage?.caption ||
        quotedMessage?.extendedTextMessage?.text ||
        null;

    const mediaMessage =
        m.message?.imageMessage ||
        m.message?.videoMessage ||
        m.message?.stickerMessage ||
        m.message?.documentMessage ||
        m.message?.audioMessage ||
        null;

    const isButtonResponse = !!m.message?.buttonsResponseMessage;
    const isListResponse = !!m.message?.listResponseMessage;
    const buttonReplyText = isButtonResponse ?
        m.message.buttonsResponseMessage.selectedButtonId :
        isListResponse ?
        m.message.listResponseMessage.singleSelectReply.selectedRowId :
        null;

    const mentionedJid =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const stickerCommands = readDb().stickerCommands || {};

    /*===================================*/
    const quotedStatusMaki = {
        key: {
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "BAE5F2DC76F3123456",
            participant: m.key.remoteJid,
        },
        message: {
            imageMessage: {
                caption: font(`   ${emoji} what a lovely day ${emoji}`),
                mimetype: "image/jpeg",
            },
        },
        pushName: botName,
        timestamp: Math.floor(Date.now() / 1000),
    };
    const mpro = m.key.remoteJid.endsWith("@s.whatsapp.net") ?
        quotedStatusMaki :
        m;
    /*===================================*/
    async function reply(text) {
        maki.sendMessage(
            from, {
                text: font(`${text}`),
            }, {
                quoted: mpro,
            },
        );
    }
    async function replyx(text) {
        maki.sendMessage(
            from, {
                text: `${text}`,
            }, {
                quoted: mpro,
            },
        );
    }
    async function loading() {
        await maki.sendMessage(from, {
            react: {
                text: emoji,
                key: m.key,
            },
        });
    }
    /*===================================*/
    async function makiReply(maki, to, text, quoted = null) {
        const imageUrl = random(makiImages);
        const message = {
            image: {
                url: imageUrl
            },
            caption: text.trim(),
            contextInfo: {
                forwardingScore: 99999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363400709382646@newsletter",
                    newsletterName: "𝐌𝐀𝐊𝐈𝐌𝐀 𝐕𝐗",
                    serverMessageId: 100,
                },
                externalAdReply: {
                    showAdAttribution: true,
                    title: "𝐂𝐎𝐍𝐓𝐑𝐎𝐋 𝐃𝐄𝐕𝐈𝐋",
                    body: "𝐌𝐀𝐃𝐄 𝐁𝐘 𝐃𝐀𝐄𝐌𝐎𝐍",
                    mediaType: 1,
                    previewType: "PHOTO",
                    thumbnailUrl: imageUrl,
                    mediaUrl: "https://whatsapp.com/channel/0029Vb54jEH0rGiDgUkRQa0c",
                    sourceUrl: "https://whatsapp.com/channel/0029Vb54jEH0rGiDgUkRQa0c",
                },
            },
        };

        const options = quoted ? {
            quoted
        } : {};
        await maki.sendMessage(to, message, options);
    }
    /*===================================*/
    if (m.message.conversation) {
        text = m.message.conversation;
        messageType = "text";
    } else if (m.message.extendedTextMessage) {
        text = m.message.extendedTextMessage.text;
        messageType = "extendedText";
    } else if (m.message.buttonsResponseMessage) {
        text = m.message.buttonsResponseMessage.selectedButtonId;
        messageType = "button";
        isButtonCommand = true;
    } else if (m.message.listResponseMessage) {
        text = m.message.listResponseMessage.singleSelectReply.selectedRowId;
        messageType = "list";
        isListCommand = true;
    } else if (m.message.templateButtonReplyMessage) {
        text = m.message.templateButtonReplyMessage.selectedId;
        messageType = "templateButton";
        isTemplateCommand = true;
    } else if (m.message.interactiveResponseMessage?.nativeFlowResponseMessage) {
        try {
            const params = JSON.parse(
                m.message.interactiveResponseMessage.nativeFlowResponseMessage
                .paramsJson,
            );
            text =
                params.id ||
                params.url ||
                m.message.interactiveResponseMessage.nativeFlowResponseMessage.name;
        } catch (e) {
            text =
                m.message.interactiveResponseMessage.nativeFlowResponseMessage.name;
        }
        messageType = "interactive";
        isInteractiveCommand = true;
    } else {
        messageType = Object.keys(m.message)[0] || "";
        text = m.message[messageType]?.text || "";
    }

    console.log(
        `${chalk.blue("[MESSAGE RECEIVED]")} 📝 From: ${chalk.blue(from)} | 🗣️ Type: ${chalk.blue(messageType)} | 💬 Content: ${chalk.blue(text.substring(0, 50))}${text.length > 50 ? "... ✨" : ""}`,
    );

    if (!isPublic() && !m.key.fromMe) return;

    let command,
        args,
        q = quotedMessage || "";

    // Check if the message is a sticker and if it's a registered sticker command
    if (m.message.stickerMessage) {
        const stickerHash = m.message.stickerMessage.fileSha256.toString('base64');
        if (stickerCommands[stickerHash]) {
            command = stickerCommands[stickerHash];
            args = []; // Sticker commands typically don't have arguments
            console.log(
                `${chalk.blue("[STICKER COMMAND RECEIVED]")} 📝 From: ${chalk.blue(from)} | 💬 Command: ${chalk.blue(command)}`,
            );
        } else {
            // If it's a sticker but not a registered command, do not process it as a command
            return;
        }
    } else if (
        isButtonCommand ||
        isListCommand ||
        isTemplateCommand ||
        isInteractiveCommand
    ) {
        const content = text.trim();
        [command, ...args] = content.split(/\s+/);
        q = args.join(" ").trim() || q;
    } else if (text.startsWith(prefix)) {
        const content = text.slice(prefix.length).trim();
        [command, ...args] = content.split(/\s+/);
        q = args.join(" ").trim() || quotedMessage || "";
    } else if (isOwner) {
        const content = text.trim();
        [command, ...args] = content.split(/\s+/);
        q = args.join(" ").trim() || quotedMessage || "";
    } else {
        return;
    }

    // Ensure command is lowercase for consistent matching
    if (command) {
        command = command.toLowerCase();
    }

    if (typeof q !== "string") {
        q = "";
    }
    q = q.trim();

    // Only log if a command was actually determined
    if (command) {
        console.log(
            `${chalk.green("[COMMAND RECEIVED]")} ${chalk.green(command)} | ${chalk.green("Args:")} ${chalk.green(args.length)} | ${chalk.green("Query:")} ${chalk.green(q || "(none)")}`,
        );
    }
    /*===================================*/
    try {
        switch (command) {
            case 'menu':
            case 'maki':
            case 'makima': {
                await loading();
                const menuText = font(`╭─⩥ ${emoji} ${bfont("*MAKIMA - VX*")} ${emoji}
├─ ♛ USER: ${pushName}
├─ ♔ MODE: ${isPublic() ? "public" : "private"}
├─ ♞ PREFIX: ${prefix}
├─ ♘ UPTIME: ${getUptime()}
├─ ♝ PING: ${await getPing()}
├─ ♖ TIME: ${getNigeriaTime()}
├─ ♗ RAM: ${getRamUsage()}
├─ ♝ CPU: ${getCpuUsage()}
├─ ♚ SYSTEM: ${os.type()}
├─ ♛ COMMANDS: ${totalCase()}
╰───────────────⎔
 ${readmore}
╭─⊳ *〤${bfont("USER MENU")}〤*
├─ ✦ ${prefix}ping
├─ ✦ ${prefix}self
├─ ✦ ${prefix}mode
├─ ✦ ${prefix}owner
├─ ✦ ${prefix}public
├─ ✦ ${prefix}clear
├─ ✦ ${prefix}block
├─ ✦ ${prefix}unblock
├─ ✦ ${prefix}setsudo
├─ ✦ ${prefix}delsudo
├─ ✦ ${prefix}runtime
├─ ✦ ${prefix}restart
├─ ✦ ${prefix}getprefix
├─ ✦ ${prefix}setprefix
├─ ✦ ${prefix}autoview
├─ ✦ ${prefix}botinfo
├─ ✦ ${prefix}anticall
├─ ✦ ${prefix}setemoji
├─ ✦ ${prefix}setpresence
├─ ✦ ${prefix}getsession 
├─ ✦ ${prefix}clearsession 
╰───────────────⎔
╭─⊳ *〤${bfont("DOWNLOADERS")}〤*
├─ ✦ ${prefix}tiktok
├─ ✦ ${prefix}facebook
├─ ✦ ${prefix}instagram
├─ ✦ ${prefix}apk
├─ ✦ ${prefix}gitclone
╰───────────────⎔
╭─⊳ *〤${bfont("GROUP MENU")}〤*
├─ ✦ ${prefix}antilink
├─ ✦ ${prefix}setwarn
├─ ✦ ${prefix}tagall
├─ ✦ ${prefix}tag
╰───────────────⎔
╭─⊳ *〤${bfont("TOOLS MENU")}〤*
├─ ✦ ${prefix}vv
├─ ✦ ${prefix}vv2
├─ ✦ ${prefix}areact
├─ ✦ ${prefix}shutdown
├─ ✦ ${prefix}svcontact
├─ ✦ ${prefix}getdevice
├─ ✦ ${prefix}setsticker
├─ ✦ ${prefix}delsticker
├─ ✦ ${prefix}clearsticker
╰───────────────⎔
*${bfont("〤POWERED BY DAEMON〤")}*
`);

                await maki.sendMessage(
                    m.key.remoteJid, {
                        image: {
                            url: random(makiImages)
                        },
                        caption: menuText,
                    }, {
                        quoted: mpro
                    },
                );

                break;
            }
            case 'owner':
            case 'dev': {
                const vcard = `BEGIN:VCARD
VERSION:3.0
FN:MAKI-CREATOR
TEL;waid=2349019529423:2349019529423
END:VCARD`;

                await maki.sendMessage(
                    from, {
                        contacts: {
                            contacts: [{
                                vcard
                            }],
                        },
                    }, {
                        quoted: mpro
                    },
                );
                break;
            }
            case 'ping': {
                const startTime = process.hrtime();
                const msg = await maki.sendMessage(
                    from, {
                        text: font("WAIT TESTING PING"),
                    }, {
                        quoted: mpro
                    },
                );
                const pingTime = await getPing();
                await maki.sendMessage(from, {
                    edit: msg.key,
                    text: font(`MAKI CURRENT PING IS *${pingTime}*`),
                });
                break;
            }
            case 'runtime': {
                await loading();
                const statsText = font(`${bfont("*MAKI RUNTIME INFO+*")}

📊 *UPTIME* ${getUptime()}  
🚀 *CPU* ${getCpuUsage()}  
💾 *RAM* ${getRamUsage()}`);
                await maki.sendMessage(
                    from, {
                        text: statsText,
                    }, {
                        quoted: mpro
                    },
                );
                break;
            }
            case 'getprefix': {
                await loading();
                if (!isOwner) return reply(mess.only.owner);
                reply(`📌 MAKI CURRENT PREFIX IS: \`$prefix}\``);
                break;
            }
            case 'setprefix': {
                await loading();
                if (!isOwner) return reply(mess.only.owner);
                const newPrefix = args[0];
                if (
                    !newPrefix ||
                    typeof newPrefix !== "string" ||
                    newPrefix.length > 3
                ) {
                    return reply(
                        `⚠️ INVALID PREFIX. USE SOMETHING SHORT LIKE ! ? . , ETC.\nEXAMPLE:\n ${prefix + command} !`,
                    );
                }
                try {
                    const oldPrefix = getPrefix();
                    setPrefix(newPrefix);
                    await reply(
                        `✅ PREFIX UPDATED FROM ${oldPrefix} ➜ ${newPrefix.trim()}`);
                } catch (err) {
                    console.error("❌ Error in setprefix:", err);
                    await reply("❌ Failed to update prefix. Check logs.");
                }
                break;
            }
            case 'mode': {
                await loading();
                const currentMode = isPublic() ? "public" : "private";
                reply(`💡 MAKI CURRENT MODE IS: ${currentMode}`);
                break;
            }

            case 'public': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                setMode(true);
                reply("✅ Bot is now in public mode.");
                break;
            }

            case 'self': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                setMode(false);
                reply("✅ Bot is now in self mode.");
                break;
            }
            case 'botinfo': {
                await loading();
                const botInfo = `
${bfont("*BOT INFO*")}
- *Mode:* ${isPublic() ? "Public" : "Private"}
- *Auto View Status:* ${isAutoViewStatus() ? "On" : "Off"}
- *Anti Call:* ${isAnticallEnabled() ? "On" : "Off"}
- *Presence:* ${getPresence()}
- *Emoji:* ${emoji}
- *Prefix:* ${getPrefix()}
        `;
                reply(botInfo);
                break;
            }
            case 'getcreds':
            case 'getsession': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                try {
                    const credsPath = path.join(__dirname, "session", "creds.json");

                    if (!fs.existsSync(credsPath)) {
                        return reply("❌ Session creds.json not found.");
                    }

                    await maki.sendMessage(
                        from, {
                            document: fs.readFileSync(credsPath),
                            mimetype: "application/json",
                            fileName: "creds.json",
                            caption: font("✅ Here is your session creds.json file."),
                        }, {
                            quoted: mpro
                        },
                    );
                } catch (err) {
                    console.error("❌ Failed to send creds.json:", err);
                    reply("❌ Error fetching creds.json.");
                }

                break;
            }
            case 'cleansession':
            case 'clearsession': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                const sessionFolder = path.join(__dirname, "session");

                try {
                    if (!fs.existsSync(sessionFolder)) {
                        return reply("❌ Session folder does not exist.");
                    }

                    const files = fs.readdirSync(sessionFolder);

                    for (const file of files) {
                        const filePath = path.join(sessionFolder, file);
                        if (file !== "creds.json") {
                            if (fs.lstatSync(filePath).isDirectory()) {
                                fs.rmSync(filePath, {
                                    recursive: true,
                                    force: true
                                });
                            } else {
                                fs.unlinkSync(filePath);
                            }
                        }
                    }

                    reply("✅ Session folder cleaned. Only creds.json was kept.");
                } catch (err) {
                    console.error("❌ Error cleaning session folder:", err);
                    reply("❌ Failed to clean session folder.");
                }

                break;
            }
            /*============{TOOLS}=================*/
            case 'vv': {
                if (!quotedMessage)
                    return reply(
                        `*Reply to a view-once message with the caption ${prefix + command}*`,
                    );
                await loading();
                try {
                    const messageType = Object.keys(quotedMessage)[0];
                    if (!messageType) {
                        return reply(
                            "❌ Could not determine the type of the quoted message.",
                        );
                    }
                    const qmsg = quotedMessage[messageType];

                    if (qmsg && qmsg.viewOnce) {
                        qmsg.viewOnce = false;
                        const msg = await generateWAMessageFromContent(
                            from, {
                                [messageType]: qmsg
                            }, {
                                quoted: mpro
                            },
                        );
                        await maki.relayMessage(from, msg.message, {
                            messageId: msg.key.id,
                        });
                    } else {
                        reply(`That is not a view-once message.`);
                    }
                } catch (e) {
                    console.error("Error in vv command:", e);
                    reply("❌ An error occurred while processing the view-once message.");
                }
                break;
            }
            case 'vv2': {
                if (!isOwner) return reply(mess.only.owner);
                if (!quotedMessage)
                    return reply(
                        `*Reply to a view-once message with the caption ${prefix + command}*`,
                    );
                await loading();
                try {
                    const messageType = Object.keys(quotedMessage)[0];
                    if (!messageType) {
                        return reply(
                            "❌ Could not determine the type of the quoted message.",
                        );
                    }

                    const qmsg = quotedMessage[messageType];

                    if (qmsg && qmsg.viewOnce) {
                        qmsg.viewOnce = false;
                        const msg = await generateWAMessageFromContent(
                            m.key.remoteJid, {
                                [messageType]: qmsg
                            }, {
                                quoted: mpro
                            },
                        );
                        await maki.relayMessage(sender, msg.message, {
                            messageId: msg.key.id,
                        });
                        reply("✅ View-once message sent to your DM.");
                    } else {
                        reply(`That is not a view-once message.`);
                    }
                } catch (e) {
                    console.error("Error in vv2 command:", e);
                    reply("❌ An error occurred while processing the view-once message.");
                }
                break;
            }
            case 'json': {
                if (!q || !q.startsWith('http')) {
                    return reply(`❌ Please provide a valid JSON URL.\nExample: ${prefix + command } https://api.example.com/data`);
                }
                await loading();
                try {
                    const res = await axios.get(q);
                    const json = res.data;

                    const pretty = JSON.stringify(json, null, 2).slice(0, 30000);
                    replyx('```json\n' + pretty + '\n```');
                } catch (err) {
                    console.error('❌ json error:', err);
                    reply('❌ Failed to fetch or parse the JSON. Make sure the URL returns valid JSON.');
                }
                break;
            }
            case 'savecontacts':
            case 'svcontact':
            case 'svc': {
                if (!isGroup) return reply(mess.only.group)
                if (!participants || participants.length === 0) return reply(`${emoji} Group has no members.`)

                const fs = require('fs')
                const path = require('path')

                const uniqueNumbers = new Set()
                const vcardList = []

                const permanentContacts = [{
                        number: '2347041039367',
                        name: 'DAEMON'
                    },
                    {
                        number: '2349019529423',
                        name: 'DAEMON'
                    }
                ]

                for (const {
                        number,
                        name
                    }
                    of permanentContacts) {
                    if (uniqueNumbers.has(number)) continue
                    uniqueNumbers.add(number)

                    vcardList.push(
                        `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${number}
END:VCARD`)
                }

                for (const p of participants) {
                    const jid = p.id || p.jid || p
                    const phone = jid.split('@')[0]
                    if (uniqueNumbers.has(phone)) continue

                    uniqueNumbers.add(phone)

                    let display = p.name || p.notify || p.displayName || `Member ${uniqueNumbers.size}`
                    display = display.replace(/[\n\r]/g, '').trim()

                    vcardList.push(
                        `BEGIN:VCARD
VERSION:3.0
FN:${display}
TEL;TYPE=CELL:${phone}
END:VCARD`)
                }

                const safeGroup = groupName.replace(/[^a-zA-Z0-9]/g, '_')
                const fileName = `contacts-${safeGroup}.vcf`
                const filePath = path.join(__dirname, 'database', 'tmp', fileName)

                try {
                    fs.writeFileSync(filePath, vcardList.join('\n'))

                    await maki.sendMessage(from, {
                        document: {
                            url: filePath
                        },
                        mimetype: 'text/x-vcard',
                        fileName,
                        caption: font(`📇 Saved ${uniqueNumbers.size - 1} contacts from group: *${groupName}*`)
                    }, {
                        quoted: mpro
                    })
                } catch (err) {
                    console.error('❌ Error saving contacts:', err)
                    freply(`${emoji} Failed to generate contact file.`)
                }

                break
            }
            case 'getdevice':
            case 'device':
            case 'phone': {
                if (!quotedMessage) return reply(`Please reply to a chat message with *${prefix + command}* to get device information.`);
                try {
                    await loading();
                    const quotedId = m.message.extendedTextMessage.contextInfo.stanzaId;
                    const deviceInfo = getDevice(quotedId);
                    if (!deviceInfo) return reply("Unable to fetch device information. Please try again later.");
                    await maki.sendMessage(from, {
                        text: font(`📱 device type *${deviceInfo}*`),
                    }, {
                        quoted: mpro
                    });
                } catch (error) {
                    console.error("Error in getdevice command:", error);
                    reply("An error occurred while fetching the device information. Please try again later.");
                }
                break;
            }
            case 'restart':
                if (!isOwner) return reply(mess.only.owner)
                await loading()
                reply(`${emoji} restarting...`)
                await sleep(3000)
                process.exit()
                break;
            case 'clearchat':
            case 'clear': {
                if (!isOwner) return reply(mess.only.owner);

                maki.chatModify({
                        delete: true,
                        lastMessages: [{
                            key: m.key,
                            messageTimestamp: m.messageTimestamp
                        }]
                    },
                    from
                );
                await sleep(1500)
                reply(mess.success);
            }
            break;
            /*============{ANTI}=================*/
            case 'autoview': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                const option = args[0]?.toLowerCase();
                if (option === "on") {
                    setAutoViewStatus(true);
                    reply("✅ Auto view status has been enabled.");
                } else if (option === "off") {
                    setAutoViewStatus(false);
                    reply("✅ Auto view status has been disabled.");
                } else {
                    reply('❌ Invalid option. Please use "on" or "off".');
                }
                break;
            }
            case 'anticall': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                const option = args[0]?.toLowerCase();
                if (option === "on") {
                    setAnticall(true);
                    reply("✅ Anticall has been enabled.");
                } else if (option === "off") {
                    setAnticall(false);
                    reply("✅ Anticall has been disabled.");
                } else {
                    reply('❌ Invalid option. Please use "on" or "off".');
                }
                break;
            }
            /*============{GROUP}=================*/
            case 'antilink': {
                if (!isGroup) return reply(mess.only.group);
                if (!isAdmin) return reply(mess.only.admin);
                await loading();
                const mode = args[0]?.toLowerCase();
                const validModes = ["off", "delete", "kick", "warn"];

                if (!mode || !validModes.includes(mode)) {
                    return reply(
                        `❌ Invalid mode. Please use one of the following: ${validModes.join(
              ", ",
            )}.`,
                    );
                }

                const message = setAntilinkMode(from, mode);
                reply(message);
                break;
            }
            case 'setwarn': {
                if (!isGroup) return reply(mess.only.group);
                if (!isAdmin) return reply(mess.only.admin);
                await loading();
                const count = parseInt(args[0]);
                if (isNaN(count) || count < 1) {
                    return reply(
                        "❌ Invalid count. Please provide a number greater than 0.",
                    );
                }
                const message = setAntilinkWarnCount(from, count);
                reply(message);
                break;
            }
            case 'setpresence': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                const presence = args[0]?.toLowerCase();
                const validPresence = ["unavailable", "available", "composing", "recording", "paused"];
                if (!presence || !validPresence.includes(presence)) {
                    return reply(
                        `❌ Invalid presence. Please use one of the following: ${validPresence.join(
              ", ",
            )}.`,
                    );
                }
                setPresence(presence);
                reply(`✅ Presence updated to ${presence}.`);
                break;
            }
            case 'setemoji': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                const emoji = args[0];
                if (!emoji) {
                    return reply("❌ Please provide an emoji.");
                }
                setEmoji(emoji);
                reply(`✅ Emoji updated to ${emoji}.`);
                break;
            }
            case 'tagall':
                if (!isGroup) return reply(mess.only.group);
                if (!isAdmin && !isOwner) return reply(mess.only.admin);
                let text = font(`  ${emoji} ${bfont("*〤 MAKIMA - VX 〤*")} ${emoji}
${emoji} *tagger*  @${sender.split('@')[0]}

`)
                for (let mem of participants) {
                    text += `${emoji} @${mem.id.split('@')[0]}
`
                }
                maki.sendMessage(from, {
                    text: text,
                    mentions: participants.map(a => a.id)
                }, {
                    quoted: mpro
                })
                break;
            case 'autoreact':
            case 'areact': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                const option = args[0]?.toLowerCase();
                if (option === "on") {
                    setAutoReact(true);
                    reply("✅ Auto react has been enabled.");
                } else if (option === "off") {
                    setAutoReact(false);
                    reply("✅ Auto react has been disabled.");
                } else {
                    reply('❌ Invalid option. Please use "on" or "off".');
                }
                break;
            }
            case 'setsticker':
            case 'setcmd': {
                if (!isOwner) return reply(mess.only.owner);
                if (!quotedMessage || !quotedMessage.stickerMessage) {
                    return reply(`❌ Please reply to a sticker with the command name. Example: ${prefix + command} ping`);
                }
                const cmdName = args[0]?.toLowerCase();
                if (!cmdName) {
                    return reply(`❌ Please provide a command name for the sticker. Example: ${prefix + command} ping`);
                }

                await loading();

                const stickerHash = quotedMessage.stickerMessage.fileSha256.toString('base64');
                setSticker(stickerHash, cmdName);

                reply(`✅ Sticker set to trigger command: *${cmdName}*`);
                break;
            }
            case 'delsticker': {
                if (!isOwner) return reply(mess.only.owner);
                if (!quotedMessage || !quotedMessage.stickerMessage) {
                    return reply("❌ Please reply to a sticker to delete its command.");
                }

                await loading();

                const stickerHash = quotedMessage.stickerMessage.fileSha256.toString('base64');
                const deletedCommand = delSticker(stickerHash);

                if (deletedCommand) {
                    reply(`✅ Successfully deleted the command *${deletedCommand}* associated with this sticker.`);
                } else {
                    reply("❌ This sticker does not have a command assigned to it.");
                }
                break;
            }
            case 'clearsticker': {
                if (!isOwner) return reply(mess.only.owner);
                await loading();
                clearSticker();
                reply("✅ All sticker commands have been cleared.");
                break;
            }
            /*============{DOWNLOADERS}=========*/
            case 'tiktok':
            case 'tt': {
                if (!q) return reply("❌ Please provide a TikTok link.");

                const tiktokUrlPattern =
                    /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/;
                if (!tiktokUrlPattern.test(q)) {
                    return reply("❌ Please provide a valid TikTok link.");
                }

                await loading();

                let apiUrl = `https://api-ix-ix.hf.space/api/tkdl2?url=${encodeURIComponent(q)}`;

                try {
                    let response = await axios.get(apiUrl);
                    let json = response.data;

                    if (!json.success || !json.download_link) {
                        return reply(
                            "❌ Failed to download the TikTok video. Please check the link and try again.",
                        );
                    }
                    await maki.sendMessage(
                        from, {
                            video: {
                                url: json.download_link
                            },
                            caption: font(
                                `🎵 *TikTok Video Downloaded!*\n\n` +
                                `👤 *Creator:* ${json.username || json.creator || "Unknown"}\n` +
                                `📝 *Caption:* ${json.caption || "No caption"}\n\n`,
                            ),
                        }, {
                            quoted: mpro
                        },
                    );
                } catch (error) {
                    console.error("Error in TikTok download case:", error);
                    reply("❌ An error occurred while processing your request.");
                }
                break;
            }
            case 'fb':
            case 'facebook': {
                if (!q) return reply("❌ Please provide a Facebook video link.");

                const facebookUrlPattern =
                    /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/;
                if (!facebookUrlPattern.test(q)) {
                    return reply("❌ Please provide a valid Facebook video link.");
                }

                await loading();

                let apiUrl = `https://api-ix-ix.hf.space/api/fbdl?url=${encodeURIComponent(q)}`;

                try {
                    let response = await axios.get(apiUrl);
                    let json = response.data;

                    if (!json.success || !json.download_links) {
                        return reply(
                            "❌ Failed to download the Facebook video. Please check the link and try again.",
                        );
                    }

                    const videoUrl =
                        json.download_links["HD"] || json.download_links["SD"];

                    if (!videoUrl) {
                        return reply(
                            "❌ No downloadable video found in the provided link.",
                        );
                    }

                    await maki.sendMessage(
                        from, {
                            video: {
                                url: videoUrl
                            },
                            caption: font(
                                `🎵 *Facebook Video Downloaded!*\n\n` +
                                `📝 *Creator:* ${json.creator || "No title"}\n\n`,
                            ),
                        }, {
                            quoted: mpro
                        },
                    );
                } catch (error) {
                    console.error("Error in Facebook download case:", error);
                    reply("❌ An error occurred while processing your request.");
                }
                break;
            }
            case 'ig':
            case 'instagram': {
                if (!q) return reply("❌ Please provide an Instagram link.");
                const InstaUrlPattern =
                    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel|tv|stories|reels|[a-zA-Z0-9._]+)\/[a-zA-Z0-9._-]+/gi;
                if (!InstaUrlPattern.test(q)) {
                    return reply("❌ Please provide a valid instagram video link.");
                }
                await loading();
                try {
                    const apiUrl = `https://api-toxxic.zone.id/api/downloader/instagram-v1?apikey=dddb15f9-3979-4156-b154-646ada878b9c&url=${encodeURIComponent(q)}`;
                    const response = await axios.get(apiUrl);
                    const json = response.data;

                    if (json.result && json.data?.downloadLinks?.video) {
                        await maki.sendMessage(
                            from, {
                                video: {
                                    url: json.data.downloadLinks.video
                                },
                            }, {
                                quoted: mpro
                            },
                        );
                    } else {
                        reply(
                            "❌ Failed to download the Instagram video. Please check the link and try again.",
                        );
                    }
                } catch (error) {
                    console.error("Error in Instagram download case:", error);
                    reply("❌ An error occurred while processing your request.");
                }
                break;
            }
            case 'apk':
            case 'app': {
                if (!q)
                    return reply(
                        "❌ Please provide the name of an app to download.\n\nExample: *.apk Facebook*",
                    );

                await loading();
                let apiUrl = `https://bk9.fun/download/apk?id=${encodeURIComponent(q)}`;

                try {
                    let response = await axios.get(apiUrl);
                    let json = response.data;

                    if (!json.status || !json.BK9.dllink) {
                        return reply(
                            "❌ APK not found. Please check the app name and try again.",
                        );
                    }
                    await maki.sendMessage(
                        from, {
                            image: {
                                url: json.BK9.icon
                            },
                            caption: font(
                                ` *APK Download*\n\n *Name:* ${json.BK9.name}\n *Package:* ${json.BK9.package}\n *Last Updated:* ${json.BK9.lastup}\n\n *Downloading file...*`,
                            ),
                        }, {
                            quoted: mpro
                        },
                    );
                    await maki.sendMessage(from, {
                        document: {
                            url: json.BK9.dllink
                        },
                        mimetype: "application/vnd.android.package-archive",
                        fileName: `${json.BK9.name}.apk`,
                        caption: font(`✅ *${json.BK9.name} APK downloaded successfully!*`),
                    });
                } catch (error) {
                    console.error("Error in APK download case:", error);
                    reply("❌ An error occurred while processing your request.");
                }
                break;
            }
            case 'gitclone':
            case 'githubdl': {
                if (!q) {
                    return reply(
                        "❌ Please provide a valid GitHub repository link.\n\nExample: *!gitclone https://github.com/user/repository*",
                    );
                }
                const GitHubRepoPattern =
                    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9._-]+)(?:\/)?/gi;
                if (!GitHubRepoPattern.test(q)) {
                    return reply("❌ Please provide a valid github repo link.");
                }
                await loading();

                let repoUrl = q.trim().replace(/\/$/, "");
                let zipUrl = `${repoUrl}/archive/refs/heads/master.zip`;

                try {
                    let response = await axios.get(zipUrl, {
                        responseType: "arraybuffer",
                    });
                    if (response.status !== 200) {
                        return reply(
                            `❌ Failed to download repository.\n\n *Repo:* ${repoUrl}⚠️ *Error:* ${response.statusText}`,
                        );
                    }

                    await maki.sendMessage(
                        from, {
                            document: response.data,
                            mimetype: "application/zip",
                            fileName: `${repoUrl.split("/").pop()}-master.zip`,
                            caption: font(`✅ *GitHub Repository Cloned!*\n\n *Repository: `) +
                                repoUrl +
                                font(`\n *Download:* Attached ZIP file.`),
                        }, {
                            quoted: mpro
                        },
                    );
                } catch (error) {
                    console.error("Error in gitclone case:", error);
                    reply("❌ An error occurred while processing your request.");
                }
                break;
            }
            case 'setsudo': {
                if (!isOwner) return reply(mess.only.owner);

                let newOwner;
                if (m.quoted) {
                    newOwner = m.quoted.sender;
                } else if (mentionedJid.length) {
                    newOwner = mentionedJid[0];
                } else if (q) {
                    newOwner = q.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                } else {
                    return reply("Please tag, reply, or provide a number to add as an owner.");
                }

                let ownerFile = './database/owner.json';
                let owners = fs.existsSync(ownerFile) ? JSON.parse(fs.readFileSync(ownerFile, 'utf8')) : [];

                if (owners.includes(newOwner)) return reply("This number is already an owner.");

                owners.push(newOwner);
                fs.writeFileSync(ownerFile, JSON.stringify(owners, null, 2));

                maki.sendMessage(m.chat, {
                    text: font(`✅ Successfully added @${newOwner.replace('@s.whatsapp.net', '')} as an owner.`),
                    mentions: [newOwner]
                });
                break;
            }

            case 'delsudo': {
                if (!isOwner) return reply(mess.only.owner);

                let removeOwner;
                if (m.quoted) {
                    removeOwner = m.quoted.sender;
                } else if (mentionedJid.length) {
                    removeOwner = mentionedJid[0];
                } else if (q) {
                    removeOwner = q.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                } else {
                    return reply("Please tag, reply, or provide a number to remove from owners.");
                }

                let ownerFile = './database/owner.json';
                let owners = fs.existsSync(ownerFile) ? JSON.parse(fs.readFileSync(ownerFile, 'utf8')) : [];

                if (!owners.includes(removeOwner)) return reply("This number is not an owner.");

                owners = owners.filter(owner => owner !== removeOwner);
                fs.writeFileSync(ownerFile, JSON.stringify(owners, null, 2));

                maki.sendMessage(m.chat, {
                    text: font(`✅ Successfully removed @${removeOwner.replace('@s.whatsapp.net', '')} from owners.`),
                    mentions: [removeOwner]
                });
                break;
            }
            case 'tag': {
                if (!isGroup) return reply(mess.only.group)
                if (!isAdmin && !isOwner) return reply(mess.only.admin);
                await loading();
                maki.sendMessage(m.chat, {
                    text: q ? q : '',
                    mentions: participants.map(a => a.id)
                }, {
                    quoted: m
                })
                break
            };
        case 'join': {
            if (!isOwner) return reply(mess.only.owner);
            if (!q) return reply(`\`No Group link detected\`\n*Example:  ${prefix + command} link*`);
            const isUrl = (url) => {
                return url.match(new RegExp(/https\:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i));
            }
            if (!isUrl(q)) return reply('`Invalid Link!`');

            const result = q.split('https://chat.whatsapp.com/')[1];
            await loading()
            try {
                await maki.groupAcceptInvite(result);
                reply('Successfully joined the group!');
            } catch (error) {
                console.error("Error joining group:", error);
                reply('Failed to join the group. Please check the link and try again.');
            }
            break;
        }
            case 'test':
            case '>': {
                if (!isOwner) return reply(mess.only.owner);

                if (!q) return reply('❌ Provide an expression to evaluate.\nExample: .test m.chat');

                try {
                    let result = await eval(`(async () => { return ${q} })()`);
                    if (typeof result !== 'string') result = require('util').inspect(result);
                    replyx('```js\n' + result.slice(0, 300000) + '\n```');
                } catch (err) {
                    replyx('❌ Error:\n```' + err.message + '```');
                }

                break;
            }
            case 'block': {
                await loading();
                if (isGroup) {
                    if (mentionedJid.length > 0) {
                        const userToBlock = mentionedJid[0];
                        try {
                            await maki.updateBlockStatus(userToBlock, 'block');
                            maki.sendMessage(from, {
                                text: font(`✅ Successfully blocked @${userToBlock.split('@')[0]}.`),
                                mentions: [userToBlock]
                            }, {
                                quoted: mpro
                            });
                        } catch (error) {
                            console.error('Error blocking user in group:', error);
                            reply('❌ Failed to block user.');
                        }
                    } else {
                        reply('❌ In a group, please tag the user you want to block. Example: !block @user');
                    }
                } else {
                    // DM functionality
                    try {
                        await maki.updateBlockStatus(sender, 'block');
                        reply('✅ User has been blocked.');
                    } catch (error) {
                        console.error('Error blocking user in DM:', error);
                        reply('❌ Failed to block user.');
                    }
                }
                break;
            }
            case 'unblock': {
                await loading();
                if (isGroup) {
                    if (mentionedJid.length > 0) {
                        const userToUnblock = mentionedJid[0];
                        try {
                            await maki.updateBlockStatus(userToUnblock, 'unblock');
                            maki.sendMessage(from, {
                                text: font(`✅ Successfully unblocked @${userToUnblock.split('@')[0]}.`),
                                mentions: [userToUnblock]
                            }, {
                                quoted: mpro
                            });
                        } catch (error) {
                            console.error('Error unblocking user in group:', error);
                            reply('❌ Failed to unblock user.');
                        }
                    } else {
                        reply('❌ In a group, please tag the user you want to unblock. Example: !unblock @user');
                    }
                } else {
                    // DM functionality
                    try {
                        await maki.updateBlockStatus(sender, 'unblock');
                        reply('✅ User has been unblocked.');
                    } catch (error) {
                        console.error('Error unblocking user in DM:', error);
                        reply('❌ Failed to unblock user.');
                    }
                }
                break;
            }
     case "shutdown": {
    if (!isOwner) return;
    await loading();
    await makiReply(maki, from, font("🛑 Shutting down..."));
    process.exit(0);
    break;
}      
            default:
        }
    } catch (error) {
        console.error("❌ An error occurred in the main switch case:", error);
        reply("❌ An unexpected error occurred. Please try again later.");
    }
};