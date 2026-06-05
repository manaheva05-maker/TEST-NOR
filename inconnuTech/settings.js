const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { getSetting, setSetting, getAllSettings, resetSetting, resetAllSettings, DEFAULT_SETTINGS } = require('../inconnuboy/store/settings');
const { sendButtons } = require('gifted-btns');
const moment = require('moment-timezone');

const _L = (lang, a, b) => lang === 'fr' ? a : b;

// ─── settings (view all) ──────────────────────────────────────
gmd({ pattern: 'settings', aliases: ['config','botconfig'], react: '⚙️', category: 'settings', description: 'View all bot settings' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mek, botName, newsletterJid, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  try {
    const s = await getAllSettings();
    const on = v => (v === 'true' || v === true) ? '✅ ON' : '❌ OFF';
    const title = await t('settings.current', {}, lang);
    const text = `*${title}*\n\n` +
      `🔹 *PREFIX:* ${s.PREFIX}\n` +
      `🔹 *BOT NAME:* ${s.BOT_NAME}\n` +
      `🔹 *OWNER:* ${s.OWNER_NUMBER}\n` +
      `🔹 *MODE:* ${s.MODE}\n` +
      `🔹 *LANGUAGE:* ${s.LANGUAGE || 'en'}\n` +
      `🔹 *AUTO READ STATUS:* ${on(s.AUTO_READ_STATUS)}\n` +
      `🔹 *AUTO LIKE STATUS:* ${on(s.AUTO_LIKE_STATUS)}\n` +
      `🔹 *AUTO REACT:* ${s.AUTO_REACT || 'off'}\n` +
      `🔹 *AUTO BIO:* ${on(s.AUTO_BIO)}\n` +
      `🔹 *CHATBOT:* ${on(s.CHATBOT)}\n` +
      `🔹 *ANTICALL:* ${on(s.ANTICALL)}\n` +
      `🔹 *ANTIDELETE:* ${on(s.ANTIDELETE)}\n` +
      `🔹 *STARTING MSG:* ${on(s.STARTING_MESSAGE)}\n` +
      `🔹 *FOOTER:* ${s.FOOTER}`;
    await Gifted.sendMessage(from, { text, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } } }, { quoted: mek });
    await react('✅');
  } catch (e) { return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setprefix ────────────────────────────────────────────────
gmd({ pattern: 'setprefix', react: '⚙️', category: 'settings', description: 'Set bot command prefix' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setprefix !' }, lang));
  try {
    const cur = await getSetting('PREFIX');
    if (cur === q.trim()) return reply(await t('settings.prefixAlready', { value: q.trim() }, lang));
    await setSetting('PREFIX', q.trim());
    await react('✅');
    return reply(await t('settings.prefixSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setbotname ───────────────────────────────────────────────
gmd({ pattern: 'setbotname', aliases: ['botname'], react: '⚙️', category: 'settings', description: 'Set bot name' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setbotname INCONNU XD' }, lang));
  try {
    const cur = await getSetting('BOT_NAME');
    if (cur === q.trim()) return reply(await t('settings.botNameAlready', { value: q.trim() }, lang));
    await setSetting('BOT_NAME', q.trim());
    await react('✅');
    return reply(await t('settings.botNameSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setownername ─────────────────────────────────────────────
gmd({ pattern: 'setownername', react: '⚙️', category: 'settings', description: 'Set owner name' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setownername YourName' }, lang));
  try {
    await setSetting('OWNER_NAME', q.trim());
    await react('✅');
    return reply(await t('settings.ownerNameSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setownernumber ───────────────────────────────────────────
gmd({ pattern: 'setownernumber', react: '⚙️', category: 'settings', description: 'Set owner number' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setownernumber 554712345678' }, lang));
  const num = q.replace(/\D/g, '');
  if (num.length < 10) return reply(await t('general.invalidNumber', {}, lang));
  try {
    await setSetting('OWNER_NUMBER', num);
    await react('✅');
    return reply(await t('settings.ownerNumSet', { value: num }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setfooter ────────────────────────────────────────────────
gmd({ pattern: 'setfooter', react: '⚙️', category: 'settings', description: 'Set bot footer text' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setfooter INCONNU BOY' }, lang));
  try {
    await setSetting('FOOTER', q.trim());
    await react('✅');
    return reply(await t('settings.footerSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setcaption ───────────────────────────────────────────────
gmd({ pattern: 'setcaption', react: '⚙️', category: 'settings', description: 'Set bot caption' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setcaption My Caption' }, lang));
  try {
    await setSetting('CAPTION', q.trim());
    await react('✅');
    return reply(await t('settings.captionSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setbotpic ────────────────────────────────────────────────
gmd({ pattern: 'setbotpic', react: '⚙️', category: 'settings', description: 'Set bot profile picture URL' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setbotpic https://...' }, lang));
  try {
    const cur = await getSetting('BOT_PIC');
    if (cur === q.trim()) return reply(await t('settings.botPicAlready', {}, lang));
    await setSetting('BOT_PIC', q.trim());
    await react('✅');
    return reply(await t('settings.botPicSet', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setmode ──────────────────────────────────────────────────
gmd({ pattern: 'setmode', aliases: ['mode'], react: '⚙️', category: 'settings', description: 'Set bot mode (public/private)' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const val = q?.toLowerCase()?.trim();
  if (!val || !['public', 'private'].includes(val)) return reply(await t('settings.modeInvalid', {}, lang));
  try {
    const cur = await getSetting('MODE');
    if (cur === val) return reply(await t('settings.modeAlready', { value: val }, lang));
    await setSetting('MODE', val);
    await react('✅');
    return reply(await t('settings.modeSet', { value: val }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── autolikestatus ───────────────────────────────────────────
gmd({ pattern: 'autolikestatus', aliases: ['likestatus'], react: '⚙️', category: 'settings', description: 'Toggle auto-like status' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on', 'off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  try {
    const cur = await getSetting('AUTO_LIKE_STATUS');
    const curBool = cur === 'true';
    if ((val === 'on' && curBool) || (val === 'off' && !curBool))
      return reply(await t(val === 'on' ? 'settings.alreadyOn' : 'settings.alreadyOff', { key: 'Auto Like Status' }, lang));
    await setSetting('AUTO_LIKE_STATUS', val === 'on' ? 'true' : 'false');
    await react('✅');
    return reply(await t(val === 'on' ? 'settings.autoLikeOn' : 'settings.autoLikeOff', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── autoreadstatus ───────────────────────────────────────────
gmd({ pattern: 'autoreadstatus', aliases: ['readstatus'], react: '⚙️', category: 'settings', description: 'Toggle auto-read status' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on', 'off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  try {
    const cur = await getSetting('AUTO_READ_STATUS');
    const curBool = cur === 'true';
    if ((val === 'on' && curBool) || (val === 'off' && !curBool))
      return reply(await t(val === 'on' ? 'settings.alreadyOn' : 'settings.alreadyOff', { key: 'Auto Read Status' }, lang));
    await setSetting('AUTO_READ_STATUS', val === 'on' ? 'true' : 'false');
    await react('✅');
    return reply(await t(val === 'on' ? 'settings.autoReadOn' : 'settings.autoReadOff', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setstatusemojis ──────────────────────────────────────────
gmd({ pattern: 'setstatusemojis', react: '⚙️', category: 'settings', description: 'Set emojis used for auto-liking statuses' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setstatusemojis ❤️,💛,💜' }, lang));
  try {
    const cur = await getSetting('STATUS_LIKE_EMOJIS');
    if (cur === q.trim()) return reply(await t('settings.statusEmojisAlready', { value: q.trim() }, lang));
    await setSetting('STATUS_LIKE_EMOJIS', q.trim());
    await react('✅');
    return reply(await t('settings.statusEmojisSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setstatusreply ───────────────────────────────────────────
gmd({ pattern: 'setstatusreply', react: '⚙️', category: 'settings', description: 'Set text used for auto status reply' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setstatusreply Nice status!' }, lang));
  try {
    const cur = await getSetting('STATUS_REPLY_TEXT');
    if (cur === q.trim()) return reply(await t('settings.statusReplyAlready', {}, lang));
    await setSetting('STATUS_REPLY_TEXT', q.trim());
    await react('✅');
    return reply(await t('settings.statusReplySet', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── autoreact ────────────────────────────────────────────────
gmd({ pattern: 'autoreact', react: '⚙️', category: 'settings', description: 'Set auto-react mode (off/all/dm/groups/commands)' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const valid = ['off', 'all', 'dm', 'groups', 'commands'];
  const val = q?.toLowerCase()?.trim();
  if (!val || !valid.includes(val)) return reply(await t('settings.autoReactInvalid', {}, lang));
  try {
    await setSetting('AUTO_REACT', val);
    await react('✅');
    return reply(await t('settings.autoReactSet', { value: val.toUpperCase() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── autobio ──────────────────────────────────────────────────
gmd({ pattern: 'autobio', react: '⚙️', category: 'settings', description: 'Toggle auto bio update' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on', 'off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  try {
    await setSetting('AUTO_BIO', val === 'on' ? 'true' : 'false');
    await react('✅');
    return reply(await t(val === 'on' ? 'settings.autoBioOn' : 'settings.autoBioOff', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── autoblock ────────────────────────────────────────────────
gmd({ pattern: 'autoblock', react: '⚙️', category: 'settings', description: 'Auto-block numbers by country code (e.g. +1,+44)' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  try {
    const cur = await getSetting('AUTO_BLOCK');
    if (!q || q.toLowerCase() === 'off') {
      if (!cur) return reply(await t('settings.autoBlockAlreadyOff', {}, lang));
      await setSetting('AUTO_BLOCK', '');
      await react('✅');
      return reply(await t('settings.autoBlockOff', {}, lang));
    }
    if (cur === q.trim()) return reply(await t('settings.autoBlockAlready', { value: q.trim() }, lang));
    await setSetting('AUTO_BLOCK', q.trim());
    await react('✅');
    return reply(await t('settings.autoBlockSet', { value: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── resetbot ─────────────────────────────────────────────────
gmd({ pattern: 'resetbot', aliases: ['resetsettings'], react: '🔄', category: 'settings', description: 'Reset all bot settings to defaults' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  try {
    await resetAllSettings();
    await react('✅');
    return reply(await t('settings.resetAll', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── setlang ──────────────────────────────────────────────────
gmd({ pattern: 'setlang', aliases: ['language', 'langue', 'lang'], react: '🌍', category: 'settings', description: 'Set bot language (en/fr)' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const newLang = q?.trim()?.toLowerCase();
  const { LANG_NAMES } = require('../Lib/i18n');
  if (!newLang || !['en', 'fr', 'cr', 'es', 'pt', 'hi', 'si'].includes(newLang)) {
    const list = Object.entries(LANG_NAMES).map(([code, name]) => `• *${code}* — ${name}`).join('\n');
    return reply(await t('settings.langInvalid', { current: lang }, lang) + '\n\n' + list);
  }
  await setSetting('LANGUAGE', newLang);
  await react('✅');
  const langName = LANG_NAMES[newLang] || newLang;
  return reply(`✅ Language set to *${langName}*`);
});
