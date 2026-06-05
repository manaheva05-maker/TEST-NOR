const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi, MAX_MEDIA_SIZE, formatBytes } = require('../inconnuboy');
const axios = require('axios');

gmd({ pattern: 'tiktok', aliases: ['tt','tiktokdl'], react: '🎵', category: 'downloader', description: 'Download TikTok video' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('downloader.provideTikTokUrl', {}, lang)); }
  if (!q.includes('tiktok.com') && !q.includes('vm.tiktok')) { await react('❌'); return reply(await t('downloader.invalidTikTokUrl', {}, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/tiktok', { params: { url: q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.noVideoFound', {}, lang)); }
    const vidRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    const buf = Buffer.from(vidRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      video: buf,
      caption: `🎵 *${data.title || 'TikTok'}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});

gmd({ pattern: 'facebook', aliases: ['fb','fbdl','facebookdl'], react: '📘', category: 'downloader', description: 'Download Facebook video' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('downloader.provideFbUrl', {}, lang)); }
  if (!q.includes('facebook.com') && !q.includes('fb.watch') && !q.includes('fb.com')) { await react('❌'); return reply(await t('downloader.invalidFbUrl', {}, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/facebook', { params: { url: q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.noVideoFound', {}, lang)); }
    const vidRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    const buf = Buffer.from(vidRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      video: buf,
      caption: `📘 *${data.title || 'Facebook'}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});

gmd({ pattern: 'twitter', aliases: ['x','xdl','twitterdl'], react: '🐦', category: 'downloader', description: 'Download Twitter/X video' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('downloader.provideTwitterUrl', {}, lang)); }
  if (!q.includes('twitter.com') && !q.includes('x.com') && !q.includes('t.co')) { await react('❌'); return reply(await t('downloader.invalidTwitterUrl', {}, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/twitter', { params: { url: q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.noVideoFound', {}, lang)); }
    const vidRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    const buf = Buffer.from(vidRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      video: buf,
      caption: `🐦 *Twitter/X*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});

gmd({ pattern: 'instagram', aliases: ['ig','igdl','instadl'], react: '📸', category: 'downloader', description: 'Download Instagram media' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('downloader.provideIgUrl', {}, lang)); }
  if (!q.includes('instagram.com') && !q.includes('instagr.am')) { await react('❌'); return reply(await t('downloader.invalidIgUrl', {}, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/instagram', { params: { url: q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.noVideoFound', {}, lang)); }
    const mediaRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    const buf = Buffer.from(mediaRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    const isVideo = data.type === 'video' || data.url.includes('.mp4');
    await Gifted.sendMessage(from, {
      [isVideo ? 'video' : 'image']: buf,
      caption: `📸 *Instagram*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});

gmd({ pattern: 'ytmp3', aliases: ['ytaudio','youtubeaudio','yta'], react: '🎵', category: 'downloader', description: 'Download YouTube audio (MP3)' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('downloader.provideYtUrl', {}, lang)); }
  if (!q.includes('youtu')) { await react('❌'); return reply(await t('downloader.invalidYtUrl', {}, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/ytmp3', { params: { url: q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
    const audioRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 120000 });
    const buf = Buffer.from(audioRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      audio: buf,
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${data.title || 'audio'}.mp3`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});

gmd({ pattern: 'ytmp4', aliases: ['ytvideo','youtubevideo','ytv'], react: '🎬', category: 'downloader', description: 'Download YouTube video (MP4)' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('downloader.provideYtUrl', {}, lang)); }
  if (!q.includes('youtu')) { await react('❌'); return reply(await t('downloader.invalidYtUrl', {}, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/ytmp4', { params: { url: q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
    const vidRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 120000 });
    const buf = Buffer.from(vidRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      video: buf,
      caption: `🎬 *${data.title || 'YouTube'}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});
