const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { getSetting } = require('../inconnuboy/store/settings');
const db = require('../inconnuboy/store/database');
const axios = require('axios');

const MAILTM = 'https://api.mail.tm';

const getSession = (jid) => {
  try { return db.DATABASE.prepare('SELECT * FROM tempmail WHERE jid = ?').get(jid) || null; }
  catch { return null; }
};
const saveSession = (jid, email, token) => {
  db.DATABASE.prepare('INSERT OR REPLACE INTO tempmail (jid, email, token, created_at) VALUES (?, ?, ?, ?)').run(jid, email, token, Date.now());
};
const deleteSession = (jid) => {
  try { db.DATABASE.prepare('DELETE FROM tempmail WHERE jid = ?').run(jid); } catch {}
};

gmd({ pattern: 'tempmail', aliases: ['tmpmail','fakemail','disposable'], react: '📧', category: 'tools', description: 'Create a temporary email address' },
async (from, Gifted, conText) => {
  const { reply, react, mek, botName, newsletterJid, lang } = conText;
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    await reply(await t('general.processing', {}, lang));
    const domRes = await axios.get(`${MAILTM}/domains`);
    const domain = domRes.data?.['hydra:member']?.[0]?.domain;
    if (!domain) throw new Error('No domain available');
    const rand = Math.random().toString(36).slice(2, 10);
    const email = `${rand}@${domain}`;
    const password = Math.random().toString(36).slice(2, 12);
    await axios.post(`${MAILTM}/accounts`, { address: email, password });
    const tokenRes = await axios.post(`${MAILTM}/token`, { address: email, password });
    const token = tokenRes.data?.token;
    if (!token) throw new Error('Authentication failed');
    saveSession(from, email, token);
    await Gifted.sendMessage(from, {
      text: await t('tempmail.created', { email, expiry: '24h' }, lang),
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('tempmail.createFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'checkmail', aliases: ['inbox','readmail'], react: '📬', category: 'tools', description: 'Check your temporary email inbox' },
async (from, Gifted, conText) => {
  const { reply, react, mek, botName, newsletterJid, lang } = conText;
  const session = getSession(from);
  if (!session) { await react('❌'); return reply(await t('tempmail.noActive', {}, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const res = await axios.get(`${MAILTM}/messages`, { headers: { Authorization: `Bearer ${session.token}` } });
    const msgs = res.data?.['hydra:member'] || [];
    if (!msgs.length) { await react('📭'); return reply(await t('tempmail.noInbox', {}, lang)); }
    const title = await t('tempmail.inboxTitle', { email: session.email }, lang);
    const list = msgs.slice(0, 5).map((m, i) =>
      `*${i+1}.* 📨 *${lang==='fr'?'De':'From'}:* ${m.from?.address || 'unknown'}\n*${lang==='fr'?'Sujet':'Subject'}:* ${m.subject || 'No subject'}\n📅 ${new Date(m.createdAt).toLocaleString()}`
    ).join('\n\n');
    await Gifted.sendMessage(from, {
      text: `${title}\n\n${list}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('tempmail.inboxFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'delmail', aliases: ['deletemail','clearmail'], react: '🗑️', category: 'tools', description: 'Delete your temporary email session' },
async (from, Gifted, conText) => {
  const { reply, react, lang } = conText;
  const session = getSession(from);
  if (!session) { await react('❌'); return reply(await t('tempmail.noActive', {}, lang)); }
  deleteSession(from);
  await react('✅');
  return reply(await t('tempmail.deleted', {}, lang));
});
