const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { getSetting } = require('../inconnuboy/store/settings');
const db = require('../inconnuboy/store/database');

const getNotes = async (jid) => {
  try { const r = db.DATABASE.prepare('SELECT * FROM notes WHERE jid = ?').all(jid); return r || []; }
  catch { return []; }
};
const saveNote = async (jid, name, content) => {
  db.DATABASE.prepare('INSERT OR REPLACE INTO notes (jid, name, content) VALUES (?, ?, ?)').run(jid, name, content);
};
const deleteNote = async (jid, name) => {
  db.DATABASE.prepare('DELETE FROM notes WHERE jid = ? AND name = ?').run(jid, name);
};

// ─── save note ────────────────────────────────────────────────
gmd({ pattern: 'save', aliases: ['addnote','savenote'], react: '📝', category: 'notes', description: 'Save a note' },
async (from, Gifted, conText) => {
  const { reply, react, args, q, quotedMsg, lang } = conText;
  const name = args[0];
  if (!name) { await react('❌'); return reply(await t('notes.provideContent', {}, lang)); }
  const content = args.slice(1).join(' ') || quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '';
  if (!content) { await react('❌'); return reply(await t('notes.provideContent', {}, lang)); }
  try {
    await saveNote(from, name.toLowerCase(), content);
    await react('✅');
    return reply(await t('notes.saved', { name: name.toLowerCase() }, lang));
  } catch (e) { await react('❌'); return reply(await t('notes.saveFailed', { error: e.message }, lang)); }
});

// ─── get note ─────────────────────────────────────────────────
gmd({ pattern: 'note', aliases: ['getnote','#'], react: '📋', category: 'notes', description: 'Get a saved note' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  const name = q?.trim()?.toLowerCase();
  if (!name) { await react('❌'); return reply(await t('notes.provide', {}, lang)); }
  const notes = await getNotes(from);
  const note = notes.find(n => n.name === name);
  if (!note) { await react('❌'); return reply(await t('notes.notFound', { name }, lang)); }
  await Gifted.sendMessage(from, {
    text: `📝 *#${note.name}*\n\n${note.content}`,
    contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
  }, { quoted: mek });
  await react('✅');
});

// ─── list notes ───────────────────────────────────────────────
gmd({ pattern: 'notes', aliases: ['listnotes','allnotes'], react: '📋', category: 'notes', description: 'List all saved notes' },
async (from, Gifted, conText) => {
  const { reply, react, mek, botName, newsletterJid, lang } = conText;
  const notes = await getNotes(from);
  if (!notes.length) { await react('📭'); return reply(await t('notes.empty', {}, lang)); }
  const list = notes.map((n, i) => `${i+1}. *#${n.name}*`).join('\n');
  const title = await t('notes.listTitle', {}, lang);
  await Gifted.sendMessage(from, {
    text: `${title}\n\n${list}\n\n_${lang==='fr'?'Utilisez':'Use'} .note <nom> ${lang==='fr'?'pour lire':'to read'}_`,
    contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
  }, { quoted: mek });
  await react('✅');
});

// ─── delete note ──────────────────────────────────────────────
gmd({ pattern: 'delnote', aliases: ['deletenote','removenote'], react: '🗑️', category: 'notes', description: 'Delete a saved note' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  const name = q?.trim()?.toLowerCase();
  if (!name) { await react('❌'); return reply(await t('notes.provide', {}, lang)); }
  const notes = await getNotes(from);
  if (!notes.find(n => n.name === name)) { await react('❌'); return reply(await t('notes.notFound', { name }, lang)); }
  try {
    await deleteNote(from, name);
    await react('✅');
    return reply(await t('notes.deleted', { name }, lang));
  } catch (e) { await react('❌'); return reply(await t('notes.deleteFailed', { error: e.message }, lang)); }
});
