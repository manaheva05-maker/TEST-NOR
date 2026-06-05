const { t } = require('../Lib/i18n');
const { gmd, uploadToGiftedCdn, uploadToPixhost, uploadToImgBB, uploadToCatbox, MAX_MEDIA_SIZE, formatBytes } = require('../inconnuboy');
const { downloadMediaMessage } = require('gifted-baileys');

gmd({ pattern: 'tourl', aliases: ['mediaurl','upload','medialink'], react: '🔗', category: 'tools', description: 'Upload media and get a URL' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  const hasMedia = quotedMsg?.imageMessage || quotedMsg?.videoMessage || quotedMsg?.audioMessage || quotedMsg?.documentMessage;
  if (!quoted || !hasMedia) { await react('❌'); return reply(await t('tourl.quoteMedia', {}, lang)); }
  try {
    await react(await t('tourl.wait', {}, lang).slice(0,2));
    await reply(await t('tourl.wait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('tourl.fileTooLarge', {}, lang)); }
    const url = await uploadToCatbox(buf) || await uploadToGiftedCdn(buf) || await uploadToPixhost(buf);
    if (!url) throw new Error('All upload providers failed');
    await Gifted.sendMessage(from, {
      text: await t('tourl.done', { url }, lang),
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('tourl.failed', { error: e.message }, lang)); }
});
