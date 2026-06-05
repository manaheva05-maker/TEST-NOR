const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');

gmd({ pattern: 'check', aliases: ['isonwa','checkwa','isonwhatsapp'], react: '📱', category: 'tools', description: 'Check if a number is on WhatsApp' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('whatsapp.provide', {}, lang)); }
  const num = q.replace(/\D/g, '');
  if (num.length < 10) { await react('❌'); return reply(await t('general.invalidNumber', {}, lang)); }
  try {
    await react(await t('whatsapp.checkWait', {}, lang).slice(0,2));
    await reply(await t('whatsapp.checkWait', {}, lang));
    const [result] = await Gifted.onWhatsApp(num);
    const msgKey = result?.exists ? 'whatsapp.onWA' : 'whatsapp.notOnWA';
    await Gifted.sendMessage(from, {
      text: await t(msgKey, { number: num }, lang),
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react(result?.exists ? '✅' : '❌');
  } catch (e) { await react('❌'); return reply(await t('whatsapp.checkFailed', { error: e.message }, lang)); }
});
