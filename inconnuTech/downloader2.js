const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi, MAX_MEDIA_SIZE, formatBytes } = require('../inconnuboy');
const axios = require('axios');

gmd({ pattern: 'spotify', aliases: ['spotsong','spotifydl'], react: '🎵', category: 'downloader', description: 'Download Spotify track' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.spotify Blinding Lights' }, lang)); }
  try {
    await react(await t('downloader.downloadWait', {}, lang).slice(0,2));
    await reply(await t('downloader.downloadWait', {}, lang));
    const res = await GiftedTechApi.get('/spotify', { params: { q } });
    const data = res?.data;
    if (!data?.url) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
    const audioRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 120000 });
    const buf = Buffer.from(audioRes.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      audio: buf, mimetype: 'audio/mp4', ptt: false,
      fileName: `${data.title || 'spotify'}.mp3`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('downloader.downloadFailed', {}, lang)); }
});

gmd({ pattern: 'github', aliases: ['gitrepo','gitdl'], react: '🐙', category: 'downloader', description: 'Download a GitHub repository as ZIP' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.github INCONNU-BOY/INCONNU-XD-V3' }, lang)); }
  const match = q.trim().match(/^([^/]+)\/([^/]+)$/);
  if (!match) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.github user/repo' }, lang)); }
  const [, user, repo] = match;
  try {
    await react(await t('downloader.fetchingRepo', { repo: `${user}/${repo}` }, lang).slice(0,2));
    await reply(await t('downloader.fetchingRepo', { repo: `${user}/${repo}` }, lang));
    const zipUrl = `https://github.com/${user}/${repo}/archive/refs/heads/main.zip`;
    const res = await axios.get(zipUrl, { responseType: 'arraybuffer', timeout: 120000 });
    const buf = Buffer.from(res.data);
    if (buf.length > MAX_MEDIA_SIZE) { await react('❌'); return reply(await t('downloader.fileTooLarge', { size: formatBytes(buf.length), max: formatBytes(MAX_MEDIA_SIZE) }, lang)); }
    await Gifted.sendMessage(from, {
      document: buf, mimetype: 'application/zip',
      fileName: `${repo}.zip`,
      caption: `🐙 *${user}/${repo}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) {
    await react('❌');
    if (e.response?.status === 404) return reply(await t('downloader.repoNotFound', {}, lang));
    return reply(await t('downloader.repoFailed', { error: e.message }, lang));
  }
});
