const { getSetting } = require("./database/settings");

async function getContextInfo(mentionedJid = []) {
    const botName = await getSetting("BOT_NAME") || "INCONNU XD V3";
    const channelJid = await getSetting("NEWSLETTER_JID") || "120363403408693274@newsletter";
    return {
        mentionedJid,
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: channelJid,
            newsletterName: botName,
            serverMessageId: -1
        }
    };
}

module.exports = { getContextInfo };
