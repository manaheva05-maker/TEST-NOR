const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');
const axios = require('axios');

gmd({ pattern: 'logo', aliases: ['makelogo','textlogo'], react: '🎨', category: 'tools', description: 'Create a text logo' },
async (from, Gifted, conText) => {
  const { reply, react, q, args, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('logo.provide', {}, lang)); }
  try {
    await react(await t('logo.wait', {}, lang).slice(0,2));
    await reply(await t('logo.wait', {}, lang));
    const text = args.slice(0, -1).join(' ') || q;
    const style = args[args.length - 1] || '1';
    const res = await GiftedTechApi.get('/logo', { params: { text, style }, responseType: 'arraybuffer' });
    const buf = Buffer.from(res.data);
    await Gifted.sendMessage(from, {
      image: buf,
      caption: `🎨 *${text}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('logo.failed', { error: e.message }, lang)); }
});
