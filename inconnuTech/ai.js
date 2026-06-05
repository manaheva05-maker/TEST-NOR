const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi, GiftedApiKey } = require('../inconnuboy');
const axios = require('axios');

gmd({ pattern: 'ai', aliases: ['gpt','ask','chat'], react: '🤖', category: 'ai', description: 'Ask the AI a question' },
async (from, Gifted, conText) => {
  const { reply, react, q, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  const prompt = q || quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '';
  if (!prompt) { await react('❌'); return reply(await t('ai.provide', {}, lang)); }
  try {
    await react(await t('ai.thinking', {}, lang).slice(0,2));
    await reply(await t('ai.thinking', {}, lang));
    const res = await GiftedTechApi.get('/ai', { params: { q: prompt } });
    if (!res?.data?.result) throw new Error('empty response');
    await Gifted.sendMessage(from, {
      text: res.data.result,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('ai.failed', {}, lang)); }
});

gmd({ pattern: 'imagine', aliases: ['imagine','txt2img','aiimage'], react: '🎨', category: 'ai', description: 'Generate an image from text' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('ai.provide', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    await reply(await t('general.processing', {}, lang));
    const res = await GiftedTechApi.get('/imagine', { params: { prompt: q }, responseType: 'arraybuffer' });
    const buf = Buffer.from(res.data);
    await Gifted.sendMessage(from, {
      image: buf,
      caption: `🎨 *${q}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('ai.error', { error: e.message }, lang)); }
});
