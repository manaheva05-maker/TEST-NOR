const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi, MAX_MEDIA_SIZE, formatBytes } = require('../inconnuboy');
const axios = require('axios');

gmd({ pattern: 'play', aliases: ['song','music'], react: '🎵', category: 'play', description: 'Search and play a song' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('play.provide', {}, lang)); }
  try {
    await react(await t('play.searching', { query: q }, lang).slice(0,2));
    await reply(await t('play.searching', { query: q }, lang));
    const searchRes = await GiftedTechApi.get('/ytsearch', { params: { q } });
    const result = searchRes?.data?.results?.[0];
    if (!result) { await react('❌'); return reply(await t('play.notFound', { query: q }, lang)); }
    await reply(await t('play.downloading', { title: result.title }, lang));
    const dlRes = await GiftedTechApi.get('/ytmp3', { params: { url: result.url } });
    const dlData = dlRes?.data;
    if (!dlData?.url) { await react('❌'); return reply(await t('play.failed', { error: 'No download URL' }, lang)); }
    const audioRes = await axios.get(dlData.url, { responseType: 'arraybuffer', timeout: 120000 });
    const buf = Buffer.from(audioRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('play.fileTooLarge', {}, lang)); }
    await Gifted.sendMessage(from, {
      audio: buf,
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${result.title}.mp3`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('play.failed', { error: e.message }, lang)); }
});

gmd({ pattern: 'playvid', aliases: ['playvideo','pvid'], react: '🎬', category: 'play', description: 'Search and play a video' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('play.provide', {}, lang)); }
  try {
    await react(await t('play.searching', { query: q }, lang).slice(0,2));
    await reply(await t('play.searching', { query: q }, lang));
    const searchRes = await GiftedTechApi.get('/ytsearch', { params: { q } });
    const result = searchRes?.data?.results?.[0];
    if (!result) { await react('❌'); return reply(await t('play.notFound', { query: q }, lang)); }
    await reply(await t('play.downloading', { title: result.title }, lang));
    const dlRes = await GiftedTechApi.get('/ytmp4', { params: { url: result.url } });
    const dlData = dlRes?.data;
    if (!dlData?.url) { await react('❌'); return reply(await t('play.failed', { error: 'No download URL' }, lang)); }
    const vidRes = await axios.get(dlData.url, { responseType: 'arraybuffer', timeout: 120000 });
    const buf = Buffer.from(vidRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('play.fileTooLarge', {}, lang)); }
    await Gifted.sendMessage(from, {
      video: buf,
      caption: `🎬 *${result.title}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('play.failed', { error: e.message }, lang)); }
});
