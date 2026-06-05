const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');
const { downloadMediaMessage } = require('gifted-baileys');
const axios = require('axios');

gmd({ pattern: 'fetch', aliases: ['readurl','scrape'], react: '🌐', category: 'tools', description: 'Fetch content from a URL' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('tools.provide', {}, lang)); }
  if (!q.startsWith('http')) { await react('❌'); return reply(await t('general.invalidUrl', {}, lang)); }
  try {
    await react(await t('tools.fetchWait', {}, lang).slice(0,2));
    await reply(await t('tools.fetchWait', {}, lang));
    const res = await axios.get(q, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    let text = typeof res.data === 'string' ? res.data.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 3000) : JSON.stringify(res.data, null, 2).slice(0, 3000);
    await Gifted.sendMessage(from, {
      text: `🌐 *${q}*\n\n${text}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('tools.fetchFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'domain', aliases: ['whois','domaininfo'], react: '🔍', category: 'tools', description: 'Get domain WHOIS info' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.domain google.com' }, lang)); }
  try {
    await react(await t('tools.domainWait', {}, lang).slice(0,2));
    await reply(await t('tools.domainWait', {}, lang));
    const res = await GiftedTechApi.get('/whois', { params: { domain: q } });
    const d = res?.data;
    if (!d) { await react('❌'); return reply(await t('tools.domainFailed', { error: 'No data returned' }, lang)); }
    const text = `🔍 *WHOIS: ${q}*\n\n` +
      `📛 *Domain:* ${d.domain || q}\n` +
      `📅 *${lang==='fr'?'Créé':'Created'}:* ${d.created || 'N/A'}\n` +
      `📅 *${lang==='fr'?'Expire':'Expires'}:* ${d.expires || 'N/A'}\n` +
      `🏢 *Registrar:* ${d.registrar || 'N/A'}\n` +
      `✅ *Status:* ${d.status || 'N/A'}`;
    await Gifted.sendMessage(from, {
      text,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('tools.domainFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'removebg', aliases: ['rmbg','nobg'], react: '✂️', category: 'tools', description: 'Remove background from image' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  if (!quoted || !quotedMsg?.imageMessage) { await react('❌'); return reply(await t('general.quoteImage', {}, lang)); }
  try {
    await react(await t('tools.editWait', {}, lang).slice(0,2));
    await reply(await t('tools.editWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    const form = new (require('form-data'))();
    form.append('image', buf, { filename: 'image.jpg', contentType: 'image/jpeg' });
    const res = await GiftedTechApi.post('/removebg', form, { headers: form.getHeaders(), responseType: 'arraybuffer' });
    const resultBuf = Buffer.from(res.data);
    await Gifted.sendMessage(from, {
      image: resultBuf,
      caption: lang === 'fr' ? '✅ Arrière-plan supprimé!' : '✅ Background removed!',
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) {
    await react('❌');
    if (e.message?.includes('process')) return reply(await t('tools.processImageFailed', {}, lang));
    return reply(await t('tools.editFailed', { error: e.message }, lang));
  }
});

gmd({ pattern: 'topdf', aliases: ['img2pdf','imagetopdf'], react: '📄', category: 'tools', description: 'Convert image(s) to PDF' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  if (!quoted || !quotedMsg?.imageMessage) { await react('❌'); return reply(await t('general.quoteImage', {}, lang)); }
  try {
    await react(await t('tools.pdfWait', {}, lang).slice(0,2));
    await reply(await t('tools.pdfWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    const form = new (require('form-data'))();
    form.append('image', buf, { filename: 'image.jpg', contentType: 'image/jpeg' });
    const res = await GiftedTechApi.post('/topdf', form, { headers: form.getHeaders(), responseType: 'arraybuffer' });
    const pdfBuf = Buffer.from(res.data);
    await Gifted.sendMessage(from, {
      document: pdfBuf,
      mimetype: 'application/pdf',
      fileName: 'converted.pdf',
      caption: lang === 'fr' ? '✅ PDF créé!' : '✅ PDF created!',
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) {
    await react('❌');
    if (e.message?.includes('process')) return reply(await t('tools.processImageFailed', {}, lang));
    return reply(await t('tools.pdfFailed', { error: e.message }, lang));
  }
});
