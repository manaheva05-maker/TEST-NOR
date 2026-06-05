const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');
const { downloadMediaMessage } = require('gifted-baileys');

gmd({ pattern: 'google', aliases: ['search','gsearch'], react: '🔍', category: 'search', description: 'Search Google' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('search.provide', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const res = await GiftedTechApi.get('/google', { params: { q } });
    const results = res?.data?.results;
    if (!results?.length) { await react('❌'); return reply(await t('search.noResults', {}, lang)); }
    const text = results.slice(0,5).map((r,i) => `*${i+1}.* ${r.title}\n${r.description}\n🔗 ${r.url}`).join('\n\n');
    await Gifted.sendMessage(from, {
      text: `🔍 *Google: ${q}*\n\n${text}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('search.googleFailed', {}, lang)); }
});

gmd({ pattern: 'lyrics', aliases: ['lyric'], react: '🎵', category: 'search', description: 'Get song lyrics' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('search.provide', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const res = await GiftedTechApi.get('/lyrics', { params: { q } });
    if (!res?.data?.lyrics) { await react('❌'); return reply(await t('search.lyricsNotFound', {}, lang)); }
    const { title, artist, lyrics } = res.data;
    const text = `🎵 *${title}*\n👤 *${artist}*\n\n${lyrics}`;
    const chunks = text.match(/.{1,3500}/gs) || [text];
    for (const chunk of chunks) {
      await Gifted.sendMessage(from, {
        text: chunk,
        contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
      }, { quoted: mek });
    }
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('search.lyricsFailed', {}, lang)); }
});

gmd({ pattern: 'identify', aliases: ['songid','shazam','musid'], react: '🎵', category: 'search', description: 'Identify a song from audio/video' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  if (!quoted || (!quotedMsg?.audioMessage && !quotedMsg?.videoMessage)) {
    await react('❌'); return reply(await t('general.quoteAudio', {}, lang));
  }
  try {
    await react(await t('search.identifyWait', {}, lang).slice(0,2));
    await reply(await t('search.identifyWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {}).catch(e => {
      if (e?.message?.includes('expired') || e?.message?.includes('key')) throw new Error('expired');
      throw e;
    });
    const form = new (require('form-data'))();
    form.append('audio', buf, { filename: 'audio.mp3', contentType: 'audio/mpeg' });
    const res = await GiftedTechApi.post('/identify', form, { headers: form.getHeaders() });
    if (!res?.data?.result) { await react('❌'); return reply(await t('search.identifyFailed', {}, lang)); }
    const { title, artist, album, release } = res.data.result;
    await Gifted.sendMessage(from, {
      text: `🎵 *${lang==='fr'?'Musique Identifiée':'Music Identified'}*\n\n🎤 *${lang==='fr'?'Titre':'Title'}:* ${title}\n👤 *${lang==='fr'?'Artiste':'Artist'}:* ${artist}\n💿 *Album:* ${album||'N/A'}\n📅 *${lang==='fr'?'Sortie':'Release'}:* ${release||'N/A'}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) {
    await react('❌');
    if (e.message === 'expired') return reply(await t('search.identifyMediaExpired', {}, lang));
    return reply(await t('search.identifyFailed', {}, lang));
  }
});

gmd({ pattern: 'appsearch', aliases: ['playstore','findapp'], react: '📱', category: 'search', description: 'Search for apps on Play Store' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('search.provide', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const res = await GiftedTechApi.get('/playstore', { params: { q } });
    const apps = res?.data?.results;
    if (!apps?.length) { await react('❌'); return reply(await t('search.appNotFound', {}, lang)); }
    const text = apps.slice(0,5).map((a,i) => `*${i+1}. ${a.title}*\n⭐ ${a.score||'N/A'} | 📥 ${a.installs||'N/A'}\n${a.description?.slice(0,100)||''}...`).join('\n\n');
    await Gifted.sendMessage(from, {
      text: `📱 *${lang==='fr'?'Résultats':'Results'}: ${q}*\n\n${text}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('search.apkFailed', {}, lang)); }
});
