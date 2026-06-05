require("events").EventEmitter.defaultMaxListeners = 960;
require("./inconnuboy/core/helpers");

const {
    default: giftedConnect,
    getContentType,
    fetchLatestWaWebVersion,
    downloadContentFromMessage,
} = require("gifted-baileys");

const {
    evt, logger, emojis, commands,
    setSudo, delSudo,
    GiftedTechApi, GiftedApiKey, GiftedAutoReact, GiftedAntiLink, GiftedAntibad,
    GiftedAntiGroupMention, GiftedAutoBio, handleGameMessage, GiftedChatBot,
    loadSession, useSQLiteAuthState, getMediaBuffer, getSudoNumbers,
    getFileContentType, bufferToStream, uploadToPixhost, uploadToImgBB,
    setCommitHash, getCommitHash, gmdBuffer, gmdJson, formatAudio, formatVideo,
    toAudio, uploadToGithubCdn, uploadToGiftedCdn, uploadToCatbox,
    GiftedAnticall, createContext, createContext2, verifyJidState,
    GiftedPresence, GiftedAntiDelete, GiftedAntiEdit, syncDatabase,
    initializeSettings, initializeGroupSettings, getAllSettings, DEFAULT_SETTINGS,
    standardizeJid, serializeMessage, loadPlugins, findCommand, findBodyCommand,
    createHelpers, getGroupInfo, buildSuperUsers, getGroupMetadata,
    createSocketConfig, safeNewsletterFollow, safeGroupAcceptInvite,
    setupConnectionHandler, setupGroupEventsListeners, initializeLidStore,
    saveAntiDelete, findAntiDelete, removeAntiDelete, startCleanup, SQLiteStore,
    getLidMapping,
} = require("./inconnuboy");

const { t } = require('./Lib/i18n');
const config = require("./config");
const googleTTS = require("google-tts-api");
const fs = require("fs-extra");
const path = require("path");
const axios = require('axios');
const express = require("express");

// ── Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.static("inconnuboy"));
app.get("/", (req, res) => res.sendFile(__dirname + "/inconnuboy/session/.gitkeep") || res.send("INCONNU XD V3"));
app.get("/health", (req, res) => res.status(200).json({ status: "alive", bot: "INCONNU XD V3", uptime: process.uptime() }));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

setInterval(() => { if (global.gc && process.memoryUsage().heapUsed > 400 * 1024 * 1024) global.gc(); }, 60000);
setInterval(() => { try { require("http").get(`http://localhost:${PORT}/health`, () => {}); } catch {} }, 240000);

const sessionDir = path.join(__dirname, "inconnuboy", "session");
const pluginsPath = path.join(__dirname, "inconnuTech");

let botSettings = {};
async function loadBotSettings() {
    await syncDatabase();
    await initializeSettings();
    await initializeGroupSettings();
    botSettings = await getAllSettings();
    return botSettings;
}

startCleanup();

// ── Resolve LID JIDs ─────────────────────────────────────────
async function resolveRealJid(Gifted, jid) {
    if (!jid || !jid.endsWith('@lid')) return jid;
    try { const c = getLidMapping(jid); if (c) return c; } catch {}
    try { const r = await Gifted.getJidFromLid(jid); if (r && !r.endsWith('@lid')) return r; } catch {}
    return jid;
}

// ── Main Bot ──────────────────────────────────────────────────
let Gifted, store;

async function startBot() {
    try {
        const { version } = await fetchLatestWaWebVersion();
        const sessionDbPath = path.join(sessionDir, "session.db");
        const { state, saveCreds } = await useSQLiteAuthState(sessionDbPath);

        if (store) store.destroy();
        store = new SQLiteStore();

        const socketConfig = createSocketConfig(version, state, logger);
        socketConfig.getMessage = async (key) => {
            if (store) { const msg = await store.loadMessage(key.remoteJid, key.id); return msg?.message || undefined; }
            return { conversation: "Error" };
        };

        Gifted = giftedConnect(socketConfig);
        store.bind(Gifted.ev);
        Gifted.ev.process(async (events) => { if (events["creds.update"]) await saveCreds(); });

        setupAutoReact(Gifted);
        setupAntiDelete(Gifted);
        setupAutoBio(Gifted);
        setupAntiCall(Gifted);
        setupNewsletterReact(Gifted);
        setupPresence(Gifted);
        setupChatBotAndAntiLink(Gifted);
        setupAntiEdit(Gifted);
        setupStatusHandlers(Gifted);
        setupGroupEventsListeners(Gifted);

        loadPlugins(pluginsPath);
        setupCommandHandler(Gifted);

        setupConnectionHandler(Gifted, sessionDir, startBot, {
            onOpen: async (Gifted) => {
                const s = await getAllSettings();
                await safeNewsletterFollow(Gifted, s.NEWSLETTER_JID);
                await safeGroupAcceptInvite(Gifted, s.GC_JID);
                await initializeLidStore(Gifted);

                setTimeout(async () => {
                    try {
                        const totalCmds = commands.filter(c => c.pattern && !c.dontAddCommandList).length;
                        console.log("💜 INCONNU XD V3 — Connected!");

                        if (s.STARTING_MESSAGE === "true") {
                            const d = DEFAULT_SETTINGS;
                            const lang = s.LANGUAGE || "en";
                            const md = s.MODE === "public" ? "public" : "private";

                            const connMsg =
`╔═════════════════
║ ${await t("connected.title", {}, lang)}
╠═════════════════
║ ${await t("connected.prefix", {}, lang)} : ${s.PREFIX || d.PREFIX}
╠═════════════════
║ ${await t("connected.plugins", {}, lang)} : ${totalCmds}
╠═════════════════
║ ${await t("connected.mode", {}, lang)} : ${md}
╠═════════════════
║ ${await t("connected.owner", {}, lang)} : ${s.OWNER_NUMBER || d.OWNER_NUMBER}
╠═════════════════
║ ${await t("connected.tutorials", {}, lang)} : ${s.YT || d.YT || "N/A"}
╠═════════════════
║ ${await t("connected.updates", {}, lang)} : ${s.NEWSLETTER_URL || d.NEWSLETTER_URL || "N/A"}
╠═════════════════
║ ${await t("connected.dev", {}, lang)}
╠═════════════════
║ ${await t("connected.devNumber", {}, lang)} : 554488138425
╚═════════════════

${await t("connected.note", {}, lang)}

> *${s.CAPTION || d.CAPTION || "INCONNU BOY"}*`;

                            await Gifted.sendMessage(Gifted.user.id, {
                                text: connMsg,
                                ...(await createContext(s.BOT_NAME || d.BOT_NAME, { title: "BOT INTEGRATED", body: "Status: Ready for Use" })),
                            }, { disappearingMessagesInChat: true, ephemeralExpiration: 300 });
                        }
                    } catch (err) { console.error("Post-connection error:", err); }
                }, 5000);
            },
        });

        process.on("SIGINT",  () => store?.destroy());
        process.on("SIGTERM", () => store?.destroy());
    } catch (err) {
        console.error("Startup error:", err);
        setTimeout(() => startBot(), 5000);
    }
}

// ── Feature Handlers ──────────────────────────────────────────
function setupAutoReact(Gifted) {
    Gifted.ev.on("messages.upsert", async (mek) => {
        try {
            const ms = mek.messages[0];
            const s = await getAllSettings();
            const mode = s.AUTO_REACT || "off";
            if (mode === "off" || mode === "false" || ms.key.fromMe || !ms.message) return;
            const from = ms.key.remoteJid;
            const isGroup = from?.endsWith("@g.us"), isDm = from?.endsWith("@s.whatsapp.net");
            let react = false;
            if (mode === "all" || mode === "true") react = true;
            else if (mode === "dm" && isDm) react = true;
            else if (mode === "groups" && isGroup) react = true;
            if (!react) return;
            await GiftedAutoReact(emojis[Math.floor(Math.random() * emojis.length)], ms, Gifted);
        } catch {}
    });
}

function setupAntiDelete(Gifted) {
    const botJid = `${Gifted.user?.id.split(":")[0]}@s.whatsapp.net`;
    const getSender = (ms) => {
        const k = ms.key;
        const r = j => j && !j.endsWith('@lid') ? j : null;
        return r(k.participantPn) || r(k.senderPn) || r(ms.senderPn) || r(k.participant) || r(ms.participant) ||
            k.participantPn || k.participant || ms.participant ||
            (k.remoteJid?.endsWith("@g.us") ? null : r(k.remoteJid) || k.remoteJid);
    };
    const getPushName = (ms) => ms.pushName || ms.key?.pushName || "Unknown";
    const getProto = (ms) => ms.message?.protocolMessage || ms.message?.ephemeralMessage?.message?.protocolMessage ||
        ms.message?.viewOnceMessage?.message?.protocolMessage || ms.message?.viewOnceMessageV2?.message?.protocolMessage;
    const getActual = (ms) => {
        const m = ms.message; if (!m) return null;
        return m.ephemeralMessage?.message || m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m.documentWithCaptionMessage?.message || m;
    };

    Gifted.ev.on("messages.upsert", async ({ messages }) => {
        for (const ms of messages) {
            try {
                if (!ms?.message) continue;
                const { key } = ms;
                if (!key?.remoteJid || key.fromMe || key.remoteJid === "status@broadcast") continue;
                const proto = getProto(ms);
                if (proto?.type === 0) {
                    const deletedId = proto.key?.id;
                    if (!deletedId) continue;
                    const deleted = findAntiDelete(key.remoteJid, deletedId);
                    if (!deleted?.message) continue;
                    const deleter = getSender(ms) || key.remoteJid;
                    if (deleter === botJid) continue;
                    await GiftedAntiDelete(Gifted, deleted, key, deleter, deleted.originalSender, botJid, getPushName(ms), deleted.originalPushName);
                    removeAntiDelete(key.remoteJid, deletedId);
                    continue;
                }
                if (getProto(ms)) continue;
                const actual = getActual(ms);
                if (!actual) continue;
                const sender = getSender(ms);
                if (!sender || sender === botJid) continue;
                setImmediate(() => saveAntiDelete(key.remoteJid, { ...ms, message: actual, originalSender: sender, originalPushName: getPushName(ms), timestamp: Date.now() }));
            } catch {}
        }
    });
}

function setupAutoBio(Gifted) {
    (async () => {
        const s = await getAllSettings();
        if (s.AUTO_BIO === "true") { setTimeout(() => GiftedAutoBio(Gifted), 1000); setInterval(() => GiftedAutoBio(Gifted), 60000); }
    })();
}

function setupAntiCall(Gifted) {
    Gifted.ev.on("call", async (json) => { await GiftedAnticall(json, Gifted); });
}

let _nlCache = null, _nlCacheAt = 0;
const NL_TTL = 2 * 60 * 1000;
async function _getNl() {
    if (_nlCache && Date.now() - _nlCacheAt < NL_TTL) return _nlCache;
    const url = Buffer.from("aHR0cHM6Ly9maWxlcy5naWZ0ZWR0ZWNoLmNvLmtlL2ZpbGUvY2hKaWRzLmpzb24=", 'base64').toString();
    const r = await axios.get(url, { timeout: 8000 });
    _nlCache = r.data; _nlCacheAt = Date.now();
    return _nlCache;
}

function setupNewsletterReact(Gifted) {
    const emojiList = ["❤️","💛","👍","💜","😮","🤍","💙"];
    Gifted.ev.on("messages.upsert", async (mek) => {
        try {
            const msg = mek.messages[0];
            if (!msg?.message || !msg?.key?.server_id) return;
            const nls = await _getNl();
            if (!nls.includes(msg.key.remoteJid)) return;
            const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            await Gifted.newsletterReactMessage(msg.key.remoteJid, msg.key.server_id.toString(), emoji);
        } catch (e) { if (['ECONNRESET','ECONNREFUSED','ETIMEDOUT'].includes(e?.code)) _nlCache = null; }
    });
}

function setupPresence(Gifted) {
    Gifted.ev.on("messages.upsert", async ({ messages }) => { if (messages?.length) await GiftedPresence(Gifted, messages[0].key.remoteJid); });
    Gifted.ev.on("connection.update", ({ connection }) => { if (connection === "open") GiftedPresence(Gifted, "status@broadcast"); });
}

function setupChatBotAndAntiLink(Gifted) {
    Gifted.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "append") return;
        const first = messages[0];
        if (first?.message) {
            const s = await getAllSettings();
            if (s.CHATBOT === "true" || s.CHATBOT === "audio") GiftedChatBot(Gifted, s.CHATBOT, s.CHATBOT_MODE || "inbox", createContext, createContext2, googleTTS);
        }
        for (const message of messages) {
            if (!message?.message) continue;
            const from = message.key?.remoteJid || "";
            if (message.key.fromMe && !from.endsWith("@g.us")) continue;
            if (from.endsWith("@g.us")) { await GiftedAntiLink(Gifted, message, getGroupMetadata); await GiftedAntibad(Gifted, message, getGroupMetadata); }
            await GiftedAntiGroupMention(Gifted, message, getGroupMetadata);
            await handleGameMessage(Gifted, message);
        }
    });
}

function setupAntiEdit(Gifted) {
    Gifted.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            try {
                if (!update?.update?.message || update.key?.fromMe || update.key?.remoteJid === "status@broadcast") continue;
                await GiftedAntiEdit(Gifted, update, findAntiDelete);
            } catch {}
        }
    });
}

function setupStatusHandlers(Gifted) {
    Gifted.ev.on("messages.upsert", async (mek) => {
        try {
            mek = mek.messages[0];
            if (!mek?.message) return;
            mek.message = getContentType(mek.message) === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
            if (mek.key?.remoteJid !== "status@broadcast") return;
            const s = await getAllSettings();
            const rawParticipant = mek.participant || mek.key.participantPn || mek.key.participant;
            const pJid = await resolveRealJid(Gifted, rawParticipant);
            if (s.AUTO_READ_STATUS === "true") await Gifted.readMessages([pJid && pJid !== mek.key.participant ? { ...mek.key, participant: pJid } : mek.key]);
            if (s.AUTO_READ_STATUS === "true" && s.AUTO_LIKE_STATUS === "true" && pJid) {
                const statusEmojis = (s.STATUS_LIKE_EMOJIS || "💛,❤️,💜,🤍,💙").split(",").map(e => e.trim()).filter(Boolean);
                const emoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                await Gifted.sendMessage("status@broadcast", { react: { text: emoji, key: { ...mek.key, participant: pJid } } }, { statusJidList: [pJid] });
            }
            if (s.AUTO_READ_STATUS === "true" && s.AUTO_REPLY_STATUS === "true" && !mek.key.fromMe && pJid) {
                await Gifted.sendMessage(pJid, { text: s.STATUS_REPLY_TEXT || DEFAULT_SETTINGS.STATUS_REPLY_TEXT }, { quoted: mek });
            }
        } catch {}
    });
}

const processedMsgs = new Set();
const BOT_START = Date.now();

function setupCommandHandler(Gifted) {
    Gifted.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "append") return;
        const ms = messages[0];
        if (!ms?.message || !ms?.key) return;
        const msgId = ms.key.id;
        if (processedMsgs.has(msgId)) return;
        processedMsgs.add(msgId);
        setTimeout(() => processedMsgs.delete(msgId), 60000);
        const ts = (ms.messageTimestamp?.low || ms.messageTimestamp) * 1000;
        if (ts && ts < BOT_START - 5000) return;

        const settings = await getAllSettings();
        const botId = standardizeJid(Gifted.user?.id);
        const serialized = await serializeMessage(ms, Gifted, settings);
        if (!serialized) return;

        const { from, isGroup, body, isCommand, command, args, sender: rawSender,
            messageAuthor, user, pushName, quoted, repliedMessage, mentionedJid,
            tagged, quotedMsg, quotedKey, quotedUser } = serialized;

        const groupData = await getGroupInfo(Gifted, from, botId, rawSender);
        const { groupInfo, groupName, participants, groupAdmins, groupSuperAdmins,
            isBotAdmin, isAdmin, isSuperAdmin, sender } = groupData;

        const superUser = await buildSuperUsers(settings, getSudoNumbers, botId, settings.OWNER_NUMBER || "");
        const isSuperUser = superUser.includes(sender);

        if (settings.AUTO_BLOCK && sender && !isSuperUser && !isGroup) {
            const codes = settings.AUTO_BLOCK.split(",").map(c => c.trim());
            if (codes.some(c => sender.startsWith(c))) { try { await Gifted.updateBlockStatus(sender, "block"); } catch {} }
        }

        const autoRead = settings.AUTO_READ_MESSAGES || "off";
        let shouldRead = autoRead === "all" || autoRead === "true" || (autoRead === "dm" && !isGroup) ||
            (autoRead === "groups" && isGroup) || (autoRead === "commands" && isCommand);
        if (shouldRead) await Gifted.readMessages([ms.key]);

        const lang = settings.LANGUAGE || "en";

        const bodyCmd = findBodyCommand(body);
        if (bodyCmd?.function) {
            if (settings.MODE?.toLowerCase() === "private" && !isSuperUser) return;
            try {
                const helpers = createHelpers(Gifted, ms, from);
                await bodyCmd.function(from, Gifted, buildCtx(ms, settings, helpers, { from, isGroup, groupInfo, groupName, participants, groupAdmins, groupSuperAdmins, isBotAdmin, isAdmin, isSuperAdmin, sender, superUser, isSuperUser, messageAuthor, user, pushName, args, quoted, repliedMessage, mentionedJid, tagged, quotedMsg, quotedKey, quotedUser, body, command, lang }));
            } catch (e) { console.error("Body cmd error:", e); }
        }

        if (isCommand && command) {
            const gmd = findCommand(command);
            if (!gmd) return;
            if (settings.MODE?.toLowerCase() === "private" && !isSuperUser) return;
            try {
                const helpers = createHelpers(Gifted, ms, from);
                if (settings.AUTO_REACT === "commands") {
                    await Gifted.sendMessage(from, { react: { key: ms.key, text: emojis[Math.floor(Math.random() * emojis.length)] } });
                } else if (gmd.react) {
                    await Gifted.sendMessage(from, { react: { key: ms.key, text: gmd.react } });
                }
                _setupGiftedHelpers(Gifted, from);
                await gmd.function(from, Gifted, buildCtx(ms, settings, helpers, { from, isGroup, groupInfo, groupName, participants, groupAdmins, groupSuperAdmins, isBotAdmin, isAdmin, isSuperAdmin, sender, superUser, isSuperUser, messageAuthor, user, pushName, args, quoted, repliedMessage, mentionedJid, tagged, quotedMsg, quotedKey, quotedUser, body, command, lang }));
            } catch (e) {
                console.error(`[cmd:${command}]`, e);
                try {
                    const errMsg = await t("errors.generic", { error: e.message }, lang);
                    await Gifted.sendMessage(from, { text: errMsg, ...(await createContext(messageAuthor, { title: "Error", body: "Command failed" })) }, { quoted: ms });
                } catch {}
            }
        }
    });
}

function _setupGiftedHelpers(Gifted, from) {
    Gifted.getJidFromLid = async (lid) => {
        const meta = await getGroupMetadata(Gifted, from);
        if (!meta) return null;
        const match = meta.participants.find(p => p.lid === lid || p.id === lid);
        return match?.pn || match?.phoneNumber || null;
    };
    let fileType;
    (async () => { try { fileType = await import("file-type"); } catch {} })();
    Gifted.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        try {
            let q = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || "";
            let mtype = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
            const stream = await downloadContentFromMessage(q, mtype);
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            let ft; try { ft = await fileType?.fileTypeFromBuffer(buf); } catch {}
            const ext = ft?.ext || mime.split("/")[1] || (mtype === "image" ? "jpg" : mtype === "video" ? "mp4" : mtype === "audio" ? "mp3" : "bin");
            const fname = attachExtension ? `${filename}.${ext}` : filename;
            await fs.writeFile(fname, buf);
            return fname;
        } catch (e) { throw e; }
    };
}

function buildCtx(ms, settings, helpers, d) {
    return {
        m: ms, mek: ms, body: d.body || "", args: d.args, arg: d.args,
        edit: helpers.edit, react: helpers.react, del: helpers.del, reply: helpers.reply,
        quoted: d.quoted, isCmd: true, command: d.command || "",
        isAdmin: d.isAdmin, isBotAdmin: d.isBotAdmin, isSuperAdmin: d.isSuperAdmin,
        sender: d.sender, pushName: d.pushName, q: d.args.join(" "),
        setSudo, delSudo, superUser: d.superUser, tagged: d.tagged,
        mentionedJid: d.mentionedJid, isGroup: d.isGroup, groupInfo: d.groupInfo,
        groupName: d.groupName, getSudoNumbers, authorMessage: d.messageAuthor,
        user: d.user || "", gmdBuffer, gmdJson, formatAudio, formatVideo, toAudio,
        groupMember: d.isGroup ? d.messageAuthor : "",
        from: d.from, groupAdmins: d.groupAdmins, participants: d.participants,
        repliedMessage: d.repliedMessage, quotedMsg: d.quotedMsg,
        quotedKey: d.quotedKey, quotedUser: d.quotedUser,
        isSuperUser: d.isSuperUser, botMode: settings.MODE,
        botPic: settings.BOT_PIC, botFooter: settings.FOOTER,
        botCaption: settings.CAPTION, botVersion: settings.VERSION,
        ownerNumber: settings.OWNER_NUMBER, ownerName: settings.OWNER_NAME,
        botName: settings.BOT_NAME, inconnuRepo: settings.BOT_REPO,
        packName: settings.PACK_NAME, packAuthor: settings.PACK_AUTHOR,
        GiftedTechApi, GiftedApiKey,
        getMediaBuffer, getFileContentType, bufferToStream,
        uploadToPixhost, uploadToImgBB, setCommitHash, getCommitHash,
        uploadToGithubCdn, uploadToGiftedCdn, uploadToCatbox,
        newsletterUrl: settings.NEWSLETTER_URL, newsletterJid: settings.NEWSLETTER_JID,
        botPrefix: settings.PREFIX, timeZone: settings.TIME_ZONE,
        config, lang: d.lang || settings.LANGUAGE || "en", t,
    };
}

(async () => {
    await loadSession();
    await loadBotSettings();
    startBot();
})();
