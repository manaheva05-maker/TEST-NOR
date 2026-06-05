const moment = require("moment-timezone");
const { getSetting } = require("../store/settings");
const { getGroupSetting } = require("../store/groupSettings");
const { getSudoNumbers } = require("../store/sudo");
const { sendButtons } = require("gifted-btns");
const { cachedGroupMetadata, getLidMapping } = require("../socket/cache");
const { t } = require("../../Lib/lang");

const DEV_NUMBERS = ['554488138425'];

const isSuperUser = async (jid, Gifted) => {
    if (!jid) return false;
    const num = jid.split("@")[0].split(":")[0];
    const ownerNumber = await getSetting("OWNER_NUMBER");
    const botNum = Gifted.user?.id?.split(":")[0];
    if (num === ownerNumber || num === botNum) return true;
    if (DEV_NUMBERS.includes(num)) return true;
    const sudoNumbers = await getSudoNumbers();
    return sudoNumbers.includes(num);
};

const DEFAULT_PLACEHOLDER = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";

const getProfilePic = async (Gifted, jid) => {
    try {
        return await Gifted.profilePictureUrl(jid, "image");
    } catch {
        return DEFAULT_PLACEHOLDER;
    }
};

const formatJid = (jid) => {
    if (!jid) return "Unknown";
    return jid.split("@")[0];
};

const getJidFromLidUsingMetadata = (participant, groupMeta) => {
    if (!participant || !groupMeta?.participants) return null;
    for (const p of groupMeta.participants) {
        if (p.id === participant || p.lid === participant) {
            const jid = p.pn || p.jid || p.phoneNumber;
            if (jid && jid.endsWith("@s.whatsapp.net")) return jid;
        }
    }
    return null;
};

const getJidFromParticipant = async (Gifted, participant, groupMeta = null) => {
    if (!participant) return participant;
    if (participant.endsWith("@s.whatsapp.net")) return participant;
    if (participant.endsWith("@lid")) {
        const storedJid = getLidMapping(participant);
        if (storedJid) return storedJid;
        if (groupMeta?.participants) {
            const jidFromMeta = getJidFromLidUsingMetadata(participant, groupMeta);
            if (jidFromMeta) return jidFromMeta;
        }
        try {
            if (Gifted.lidToJid) {
                const result = await Gifted.lidToJid(participant);
                if (result && result.endsWith("@s.whatsapp.net")) return result;
            }
        } catch (e) {}
        try {
            if (Gifted.getJidFromLid) {
                const result = await Gifted.getJidFromLid(participant);
                if (result && result.endsWith("@s.whatsapp.net")) return result;
            }
        } catch (e) {}
        return participant;
    }
    const num = participant.split("@")[0];
    if (num && /^\d+$/.test(num)) return `${num}@s.whatsapp.net`;
    return participant;
};

const getDisplayNumber = async (Gifted, participant, groupMeta = null) => {
    const targetJid = await getJidFromParticipant(Gifted, participant, groupMeta);
    return formatJid(targetJid);
};

const getFreshGroupMetadata = async (Gifted, groupJid) => {
    try {
        return await Gifted.groupMetadata(groupJid);
    } catch (error) {
        return null;
    }
};

const processedEvents = new Map();
const EVENT_DEDUP_INTERVAL = 5000;

const getEventKey = (groupJid, action, participants) =>
    `${groupJid}:${action}:${participants.sort().join(",")}`;

const isDuplicateEvent = (groupJid, action, participants) => {
    const key = getEventKey(groupJid, action, participants);
    const now = Date.now();
    const lastProcessed = processedEvents.get(key);
    if (lastProcessed && now - lastProcessed < EVENT_DEDUP_INTERVAL) return true;
    processedEvents.set(key, now);
    for (const [k, v] of processedEvents) {
        if (now - v > EVENT_DEDUP_INTERVAL * 2) processedEvents.delete(k);
    }
    return false;
};

const setupGroupEventsListeners = (Gifted) => {
    Gifted.ev.on("group-participants.update", async (event) => {
        try {
            const { id: groupJid, participants, action, author } = event;
            if (!groupJid || !participants || participants.length === 0) return;

            const botJid = Gifted.user?.id?.split(":")[0] + "@s.whatsapp.net";

            if (action === "promote" || action === "demote") {
                if (author) {
                    const authorNum = author.split("@")[0].split(":")[0];
                    const botNum = botJid.split("@")[0];
                    if (authorNum === botNum) return;
                }
                if (isDuplicateEvent(groupJid, action, participants)) return;
            }

            const timeZone = (await getSetting("TIME_ZONE")) || "Africa/Nairobi";
            const botName = (await getSetting("BOT_NAME")) || "INCONNU XD V3";
            const botFooter = (await getSetting("FOOTER")) || "INCONNU BOY";
            const newsletterJid = (await getSetting("NEWSLETTER_JID")) || "";
            const lang = (await getSetting("LANGUAGE")) || "en";

            const currentTime = moment().tz(timeZone).format("h:mm A");
            const currentDate = moment().tz(timeZone).format("MMMM Do, YYYY");

            const groupMeta = await getFreshGroupMetadata(Gifted, groupJid);
            if (!groupMeta) return;

            const groupName = groupMeta.subject || "Unknown Group";
            const memberCount = groupMeta.size || groupMeta.participants?.length || 0;

            const getContextInfo = (mentionedJids = []) => ({
                mentionedJid: mentionedJids,
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: newsletterJid
                    ? { newsletterJid, newsletterName: botName, serverMessageId: 143 }
                    : undefined,
            });

            switch (action) {
                case "add": {
                    const welcomeEnabled = await getGroupSetting(groupJid, "WELCOME_MESSAGE");
                    const isWelcomeOn = welcomeEnabled && ["true", "on", "1", "yes"].includes(String(welcomeEnabled).toLowerCase().trim());
                    if (!isWelcomeOn) return;

                    for (const participant of participants) {
                        try {
                            const userJid = await getJidFromParticipant(Gifted, participant, groupMeta);
                            const userNumber = formatJid(userJid);
                            const profilePic = await getProfilePic(Gifted, userJid);

                            const customWelcome = await getGroupSetting(groupJid, "WELCOME_MESSAGE_TEXT");
                            const customMessage = (customWelcome && customWelcome.trim() && customWelcome !== "false")
                                ? customWelcome
                                : (lang === "fr" ? "*Profite bien et respecte les règles du groupe!*" : "*Enjoy your stay and follow the group rules!*");

                            const welcomeText = await t("group.welcome", {
                                group: groupName,
                                user: userNumber,
                                members: memberCount,
                                date: currentDate,
                                time: currentTime,
                                newsletter: botFooter,
                            }, lang) + `\n\n${customMessage}`;

                            await Gifted.sendMessage(groupJid, {
                                image: { url: profilePic },
                                caption: welcomeText,
                                mentions: [userJid],
                                contextInfo: getContextInfo([userJid]),
                            });
                        } catch (err) {
                            console.error("Welcome message error:", err.message);
                        }
                    }
                    break;
                }

                case "remove": {
                    const goodbyeEnabled = await getGroupSetting(groupJid, "GOODBYE_MESSAGE");
                    const groupEventsEnabled = await getGroupSetting(groupJid, "GROUP_EVENTS");
                    const cachedMeta = await cachedGroupMetadata(groupJid);

                    for (const participant of participants) {
                        try {
                            const userJid = await getJidFromParticipant(Gifted, participant, cachedMeta || groupMeta);
                            const userNumber = formatJid(userJid);
                            const profilePic = await getProfilePic(Gifted, userJid);
                            const isKicked = author && author !== participant;
                            const isEventsOn = groupEventsEnabled && ["true", "on", "1", "yes"].includes(String(groupEventsEnabled).toLowerCase().trim());

                            if (isKicked && isEventsOn) {
                                const authorJid = await getJidFromParticipant(Gifted, author, cachedMeta || groupMeta);
                                const authorNumber = formatJid(authorJid);
                                const mentionsList = [userJid, authorJid];

                                const kickText = await t("group.kicked", {
                                    user: userNumber,
                                    author: authorNumber,
                                    group: groupName,
                                    members: memberCount,
                                    date: currentDate,
                                    time: currentTime,
                                    footer: botFooter,
                                }, lang);

                                await Gifted.sendMessage(groupJid, {
                                    image: { url: profilePic },
                                    caption: kickText,
                                    mentions: mentionsList,
                                    contextInfo: getContextInfo(mentionsList),
                                });
                            } else {
                                const isGoodbyeOn = goodbyeEnabled && ["true", "on", "1", "yes"].includes(String(goodbyeEnabled).toLowerCase().trim());
                                if (!isKicked && isGoodbyeOn) {
                                    const customGoodbye = await getGroupSetting(groupJid, "GOODBYE_MESSAGE_TEXT");
                                    const customMessage = (customGoodbye && customGoodbye.trim() && customGoodbye !== "false")
                                        ? customGoodbye
                                        : (lang === "fr" ? "*Tu vas nous manquer! Prends soin de toi!*" : "*We'll miss you! Take care!*");

                                    const goodbyeText = await t("group.goodbye", {
                                        group: groupName,
                                        user: userNumber,
                                        members: memberCount,
                                        date: currentDate,
                                        time: currentTime,
                                        newsletter: botFooter,
                                    }, lang) + `\n\n${customMessage}`;

                                    await Gifted.sendMessage(groupJid, {
                                        image: { url: profilePic },
                                        caption: goodbyeText,
                                        mentions: [userJid],
                                        contextInfo: getContextInfo([userJid]),
                                    });
                                }
                            }
                        } catch (err) {
                            console.error("Goodbye/Kick message error:", err.message);
                        }
                    }
                    break;
                }

                case "promote": {
                    const antiPromoteEnabled = await getGroupSetting(groupJid, "ANTIPROMOTE");
                    if (String(antiPromoteEnabled) === "true" && author) {
                        const authorJid = await getJidFromParticipant(Gifted, author, groupMeta);
                        const authorNum = authorJid.split("@")[0].split(":")[0];
                        const botNum = botJid.split("@")[0];
                        const isAuthorSuperUser = await isSuperUser(authorJid, Gifted);
                        if (isAuthorSuperUser) break;

                        let isBotAdmin = false;
                        for (const p of groupMeta?.participants || []) {
                            if (p.admin !== "admin" && p.admin !== "superadmin") continue;
                            const pJid = await getJidFromParticipant(Gifted, p.id, groupMeta);
                            if (pJid.split("@")[0].split(":")[0] === botNum) { isBotAdmin = true; break; }
                        }

                        if (authorNum !== botNum && isBotAdmin) {
                            for (const participant of participants) {
                                try {
                                    const participantJid = await getJidFromParticipant(Gifted, participant, groupMeta);
                                    const isParticipantSuperUser = await isSuperUser(participantJid, Gifted);
                                    const promotedNumber = formatJid(participantJid);
                                    const authorNumber = formatJid(authorJid);

                                    const actionMsg = lang === "fr"
                                        ? `Rétrogradation de @${promotedNumber}...`
                                        : `Demoting @${promotedNumber}...`;

                                    const antiMsg = await t("group.antiPromote", {
                                        author: authorNumber,
                                        user: promotedNumber,
                                        action: actionMsg,
                                    }, lang);

                                    if (!isParticipantSuperUser) {
                                        await Gifted.sendMessage(groupJid, {
                                            text: antiMsg,
                                            mentions: [authorJid, participantJid],
                                        });
                                        await new Promise(r => setTimeout(r, 500));
                                        try { await Gifted.groupParticipantsUpdate(groupJid, [participantJid], "demote"); } catch (e) {}
                                    }
                                } catch (err) {
                                    console.error("Anti-promote error:", err.message);
                                }
                            }
                            break;
                        }
                    }

                    const groupEventsEnabled = await getGroupSetting(groupJid, "GROUP_EVENTS");
                    if (groupEventsEnabled !== "true") break;

                    for (const participant of participants) {
                        try {
                            const participantJid = await getJidFromParticipant(Gifted, participant, groupMeta);
                            const authorJid = author ? await getJidFromParticipant(Gifted, author, groupMeta) : null;
                            const promotedNumber = formatJid(participantJid);
                            const authorNumber = authorJid ? formatJid(authorJid) : "System";
                            const mentionsList = [participantJid];
                            if (authorJid) mentionsList.push(authorJid);

                            const promotedBy = author
                                ? (lang === "fr" ? `👤 *Promu par:* @${authorNumber}` : `👤 *Promoted by:* @${authorNumber}`)
                                : "";

                            const promoteText = await t("group.promoted", {
                                user: promotedNumber,
                                promotedBy,
                                group: groupName,
                                date: currentDate,
                                time: currentTime,
                                footer: botFooter,
                            }, lang);

                            await Gifted.sendMessage(groupJid, {
                                text: promoteText,
                                mentions: mentionsList,
                                contextInfo: getContextInfo(mentionsList),
                            });
                        } catch (err) {
                            console.error("Promote notification error:", err.message);
                        }
                    }
                    break;
                }

                case "demote": {
                    const antiDemoteEnabled = await getGroupSetting(groupJid, "ANTIDEMOTE");
                    if (String(antiDemoteEnabled) === "true" && author) {
                        let freshGroupMeta;
                        try { freshGroupMeta = await Gifted.groupMetadata(groupJid); } catch (e) { freshGroupMeta = groupMeta; }

                        const authorJid = await getJidFromParticipant(Gifted, author, freshGroupMeta);
                        const authorNum = authorJid.split("@")[0].split(":")[0];
                        const botNum = botJid.split("@")[0];
                        const isAuthorSuperUser = await isSuperUser(authorJid, Gifted);
                        if (isAuthorSuperUser) break;

                        let isBotAdmin = false;
                        for (const p of freshGroupMeta?.participants || []) {
                            if (p.admin !== "admin" && p.admin !== "superadmin") continue;
                            const pJid = await getJidFromParticipant(Gifted, p.id, freshGroupMeta);
                            if (pJid.split("@")[0].split(":")[0] === botNum) { isBotAdmin = true; break; }
                        }

                        if (authorNum !== botNum && isBotAdmin) {
                            for (const participant of participants) {
                                try {
                                    const participantJid = await getJidFromParticipant(Gifted, participant, freshGroupMeta);
                                    const demotedNumber = formatJid(participantJid);
                                    const authorNumber = formatJid(authorJid);

                                    const actionMsg = lang === "fr"
                                        ? `Re-promotion de @${demotedNumber}...`
                                        : `Re-promoting @${demotedNumber}...`;

                                    const antiMsg = await t("group.antiDemote", {
                                        author: authorNumber,
                                        user: demotedNumber,
                                        action: actionMsg,
                                    }, lang);

                                    await Gifted.sendMessage(groupJid, {
                                        text: antiMsg,
                                        mentions: [authorJid, participantJid],
                                    });
                                    await new Promise(r => setTimeout(r, 500));
                                    try { await Gifted.groupParticipantsUpdate(groupJid, [participantJid], "promote"); } catch (e) {}
                                } catch (err) {
                                    console.error("Anti-demote error:", err.message);
                                }
                            }
                            break;
                        }
                    }

                    const groupEventsEnabled = await getGroupSetting(groupJid, "GROUP_EVENTS");
                    if (groupEventsEnabled !== "true") break;

                    for (const participant of participants) {
                        try {
                            const participantJid = await getJidFromParticipant(Gifted, participant, groupMeta);
                            const authorJid = author ? await getJidFromParticipant(Gifted, author, groupMeta) : null;
                            const demotedNumber = formatJid(participantJid);
                            const authorNumber = authorJid ? formatJid(authorJid) : "System";
                            const mentionsList = [participantJid];
                            if (authorJid) mentionsList.push(authorJid);

                            const demotedBy = author
                                ? (lang === "fr" ? `👤 *Rétrogradé par:* @${authorNumber}` : `👤 *Demoted by:* @${authorNumber}`)
                                : "";

                            const demoteText = await t("group.demoted", {
                                user: demotedNumber,
                                demotedBy,
                                group: groupName,
                                date: currentDate,
                                time: currentTime,
                                footer: botFooter,
                            }, lang);

                            await Gifted.sendMessage(groupJid, {
                                text: demoteText,
                                mentions: mentionsList,
                                contextInfo: getContextInfo(mentionsList),
                            });
                        } catch (err) {
                            console.error("Demote notification error:", err.message);
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            console.error("Group events handler error:", error.message);
        }
    });
};

module.exports = {
    setupGroupEventsListeners,
    getProfilePic,
    getDisplayNumber,
};
