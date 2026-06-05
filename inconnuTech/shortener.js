const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');

gmd({ pattern: 'shorten', aliases: ['short','tinyurl','bitly'], react: '✂️', category: 'tools', description: 'Shorten a URL' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('shortener.provide', {}, lang)); }
  if (!q.startsWith('http')) { await react('❌'); return reply(await t('shortener.invalid', {}, lang)); }
  try {
    await react(await t('shortener.wait', {}, lang).slice(0,2));
    await reply(await t('shortener.wait', {}, lang));
    const res = await GiftedTechApi.get('/shorten', { params: { url: q } });
    const short = res?.data?.short || res?.data?.result;
    if (!short) throw new Error('No short URL returned');
    await Gifted.sendMessage(from, {
      text: await t('shortener.done', { original: q, short }, lang),
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('shortener.failed', { error: e.message }, lang)); }
});
