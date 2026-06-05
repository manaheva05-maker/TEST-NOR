const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { getSudoNumbers, setSudo, delSudo } = require('../inconnuboy/store/sudo');
const { downloadMediaMessage } = require('gifted-baileys');
const fs = require('fs-extra');
const path = require('path');

// ─── sudo ─────────────────────────────────────────────────────
gmd({ pattern: 'addsudo', aliases: ['sudo'], react: '👑', category: 'owner', description: 'Add a sudo user' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mentionedJid, quotedUser, q, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  let jid = mentionedJid?.[0] || quotedUser;
  if (!jid && q) { const n = q.replace(/\D/g,''); if (n.length >= 10) jid = n + '@s.whatsapp.net'; }
  if (!jid) return reply(await t('general.provideArgs', { usage: '.addsudo @user' }, lang));
  const num = jid.split('@')[0];
  const existing = await getSudoNumbers();
  if (existing.includes(num)) { await react('⚠️'); return reply(await t('owner.sudoAlready', { user: num }, lang)); }
  await setSudo(num);
  await react('✅');
  return reply(await t('owner.sudoAdded', { user: num }, lang), { mentions: [jid] });
});

// ─── delsudo ──────────────────────────────────────────────────
gmd({ pattern: 'delsudo', aliases: ['removesudo'], react: '👑', category: 'owner', description: 'Remove a sudo user' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mentionedJid, quotedUser, q, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  let jid = mentionedJid?.[0] || quotedUser;
  if (!jid && q) { const n = q.replace(/\D/g,''); if (n.length >= 10) jid = n + '@s.whatsapp.net'; }
  if (!jid) return reply(await t('general.provideArgs', { usage: '.delsudo @user' }, lang));
  const num = jid.split('@')[0];
  const existing = await getSudoNumbers();
  if (!existing.includes(num)) { await react('⚠️'); return reply(await t('owner.sudoNotFound', { user: num }, lang)); }
  await delSudo(num);
  await react('✅');
  return reply(await t('owner.sudoRemoved', { user: num }, lang), { mentions: [jid] });
});

// ─── sudolist ─────────────────────────────────────────────────
gmd({ pattern: 'sudolist', aliases: ['listsudo'], react: '📋', category: 'owner', description: 'List all sudo users' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const nums = await getSudoNumbers();
  if (!nums.length) { await react('📭'); return reply(await t('owner.sudoEmpty', {}, lang)); }
  const list = nums.map((n, i) => `${i+1}. +${n}`).join('\n');
  await react('✅');
  return reply(await t('owner.sudoList', { list }, lang));
});

// ─── setpp (set bot profile pic) ──────────────────────────────
gmd({ pattern: 'setpp', aliases: ['setbotpp','botpp'], react: '🔮', category: 'owner', description: 'Set bot profile picture' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, quoted, quotedMsg, mek, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!quoted || !quotedMsg?.imageMessage) { await react('❌'); return reply(await t('general.quoteImage', {}, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    await Gifted.updateProfilePicture(Gifted.user.id, buf);
    await react('✅');
    return reply(await t('owner.ppUpdated', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('owner.ppFailed', { error: e.message }, lang)); }
});

// ─── setppfull (full/cropped bot pic) ─────────────────────────
gmd({ pattern: 'setppfull', aliases: ['setbotppfull'], react: '🔮', category: 'owner', description: 'Set bot profile picture (full image)' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, quoted, quotedMsg, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!quoted || !quotedMsg?.imageMessage) { await react('❌'); return reply(await t('general.quoteImage', {}, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    await Gifted.updateProfilePicture(Gifted.user.id, { img: buf });
    await react('✅');
    return reply(await t('owner.ppUpdatedFull', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('owner.ppFailed', { error: e.message }, lang)); }
});

// ─── getpp (get user profile pic) ─────────────────────────────
gmd({ pattern: 'getpp', aliases: ['profilepic','pfp'], react: '👀', category: 'owner', description: 'Get a user\'s profile picture' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mentionedJid, quotedUser, q, mek, botName, newsletterJid, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  let jid = mentionedJid?.[0] || quotedUser;
  if (!jid && q) { const n = q.replace(/\D/g,''); if (n.length >= 10) jid = n + '@s.whatsapp.net'; }
  if (!jid) return reply(await t('general.provideArgs', { usage: '.getpp @user or .getpp 554712345678' }, lang));
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    let ppUrl;
    try { ppUrl = await Gifted.profilePictureUrl(jid, 'image'); }
    catch { ppUrl = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg'; }
    await Gifted.sendMessage(from, {
      image: { url: ppUrl },
      caption: `👤 *@${jid.split('@')[0]}*\n\n> *${botName}*`,
      mentions: [jid],
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('owner.ppFetchFailed', { error: e.message }, lang)); }
});

// ─── getgcpp (get group profile pic) ──────────────────────────
gmd({ pattern: 'getgcpp', aliases: ['grouppp','gcpic'], react: '👀', category: 'owner', description: 'Get group profile picture' },
async (from, Gifted, conText) => {
  const { reply, react, isGroup, mek, botName, newsletterJid, lang } = conText;
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    let ppUrl;
    try { ppUrl = await Gifted.profilePictureUrl(from, 'image'); }
    catch { await react('❌'); return reply(await t('owner.ppNoGroup', {}, lang)); }
    const meta = await Gifted.groupMetadata(from);
    await Gifted.sendMessage(from, {
      image: { url: ppUrl },
      caption: `🏠 *${meta.subject}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('owner.ppFetchFailed', { error: e.message }, lang)); }
});

// ─── setgcpp (set group profile pic) ──────────────────────────
gmd({ pattern: 'setgcpp', aliases: ['setgrouppic','setgcpic'], react: '🔮', category: 'owner', description: 'Set group profile picture' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, isAdmin, isSuperAdmin, isGroup, isBotAdmin, quoted, quotedMsg, lang } = conText;
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isSuperUser && !isAdmin && !isSuperAdmin) return reply(await t('general.adminOnly', {}, lang));
  if (!isBotAdmin) return reply(await t('general.botAdminRequired', {}, lang));
  if (!quoted || !quotedMsg?.imageMessage) { await react('❌'); return reply(await t('general.quoteImage', {}, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    await Gifted.updateProfilePicture(from, buf);
    await react('✅');
    return reply(await t('owner.ppUpdated', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('owner.ppFailed', { error: e.message }, lang)); }
});

// ─── viewonce (reveal view-once) ──────────────────────────────
gmd({ pattern: 'viewonce', aliases: ['vo','antiviewonce'], react: '🙄', category: 'owner', description: 'Reveal a view-once message' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, quoted, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  if (!quoted) { await react('❌'); return reply(await t('general.quoteViewOnce', {}, lang)); }
  if (!isSuperUser) { await react('❌'); return reply(await t('general.superUserOnly', {}, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const viewOnceMsg = quotedMsg?.viewOnceMessage?.message || quotedMsg?.viewOnceMessageV2?.message ||
      quotedMsg?.viewOnceMessageV2Extension?.message;
    if (!viewOnceMsg) { await react('❌'); return reply(await t('general.quoteViewOnce', {}, lang)); }
    const type = Object.keys(viewOnceMsg)[0];
    if (!['imageMessage','videoMessage','audioMessage'].includes(type)) {
      await react('❌'); return reply(await t('owner.viewOnceUnsupported', {}, lang));
    }
    const buf = await downloadMediaMessage({ message: viewOnceMsg }, 'buffer', {});
    const caption = viewOnceMsg[type]?.caption || '';
    const contextInfo = { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } };
    if (type === 'imageMessage') {
      await Gifted.sendMessage(from, { image: buf, caption, contextInfo }, { quoted: mek });
    } else if (type === 'videoMessage') {
      await Gifted.sendMessage(from, { video: buf, caption, contextInfo }, { quoted: mek });
    } else if (type === 'audioMessage') {
      await Gifted.sendMessage(from, { audio: buf, mimetype: 'audio/mp4', contextInfo }, { quoted: mek });
    }
    await react('✅');
    return reply(await t('owner.viewOnceReveal', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('owner.viewOnceFailed', { error: e.message }, lang)); }
});

// ─── broadcast ────────────────────────────────────────────────
gmd({ pattern: 'broadcast', aliases: ['bc'], react: '📢', category: 'owner', description: 'Broadcast a message to all chats' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, q, quoted, quotedMsg, mek, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const text = q || quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '';
  if (!text) return reply(await t('general.provideArgs', { usage: '.broadcast Your message here' }, lang));
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const chats = await Gifted.groupFetchAllParticipating();
    const groupJids = Object.keys(chats);
    let count = 0;
    for (const jid of groupJids) {
      try { await Gifted.sendMessage(jid, { text }); count++; await new Promise(r => setTimeout(r, 500)); } catch {}
    }
    await react('✅');
    return reply(await t('owner.broadcastSent', { count }, lang));
  } catch (e) { await react('❌'); return reply(await t('owner.broadcastFailed', { error: e.message }, lang)); }
});

// ─── block ────────────────────────────────────────────────────
gmd({ pattern: 'block', react: '🚫', category: 'owner', description: 'Block a user' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mentionedJid, quotedUser, q, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  let jid = mentionedJid?.[0] || quotedUser;
  if (!jid && q) { const n = q.replace(/\D/g,''); if (n.length >= 10) jid = n + '@s.whatsapp.net'; }
  if (!jid) return reply(await t('general.provideArgs', { usage: '.block @user' }, lang));
  try {
    await Gifted.updateBlockStatus(jid, 'block');
    await react('✅');
    return reply(await t('owner.blockedUser', { user: jid.split('@')[0] }, lang), { mentions: [jid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── unblock ──────────────────────────────────────────────────
gmd({ pattern: 'unblock', react: '✅', category: 'owner', description: 'Unblock a user' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mentionedJid, quotedUser, q, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  let jid = mentionedJid?.[0] || quotedUser;
  if (!jid && q) { const n = q.replace(/\D/g,''); if (n.length >= 10) jid = n + '@s.whatsapp.net'; }
  if (!jid) return reply(await t('general.provideArgs', { usage: '.unblock @user' }, lang));
  try {
    await Gifted.updateBlockStatus(jid, 'unblock');
    await react('✅');
    return reply(await t('owner.unblockedUser', { user: jid.split('@')[0] }, lang), { mentions: [jid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── restart ──────────────────────────────────────────────────
gmd({ pattern: 'restart', aliases: ['reboot'], react: '🔄', category: 'owner', description: 'Restart the bot' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  await react('🔄');
  await reply(await t('owner.restarting', {}, lang));
  setTimeout(() => process.exit(0), 1500);
});

// ─── del (delete quoted message) ──────────────────────────────
gmd({ pattern: 'del', aliases: ['delete'], react: '🗑️', category: 'owner', description: 'Delete a quoted message' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, isAdmin, isSuperAdmin, isBotAdmin, quoted, quotedKey, mek, lang } = conText;
  if (!isSuperUser && !isAdmin && !isSuperAdmin) return reply(await t('general.adminOnly', {}, lang));
  if (!quoted || !quotedKey) { await react('❌'); return reply(await t('general.quoteMsg', {}, lang)); }
  try {
    await Gifted.sendMessage(from, { delete: quotedKey });
    await Gifted.sendMessage(from, { delete: mek.key });
    await react('🗑️');
  } catch (e) { await react('❌'); return reply(await t('owner.deleteFailed', { error: e.message }, lang)); }
});
