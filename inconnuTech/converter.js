const { t } = require('../Lib/i18n');
const { gmd, toAudio, toPtt, formatAudio, formatVideo, gmdSticker } = require('../inconnuboy');
const { downloadMediaMessage } = require('gifted-baileys');

const getQuotedMedia = (quotedMsg) => {
  if (!quotedMsg) return null;
  return quotedMsg.imageMessage || quotedMsg.videoMessage || quotedMsg.stickerMessage ||
    quotedMsg.audioMessage || quotedMsg.documentMessage || null;
};

// ─── sticker ──────────────────────────────────────────────────
gmd({ pattern: 'sticker', aliases: ['s','stiker','stk'], react: '🎭', category: 'converter', description: 'Convert image/video/gif to sticker' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, packName, packAuthor, lang } = conText;
  const media = getQuotedMedia(quotedMsg);
  if (!quoted || (!quotedMsg?.imageMessage && !quotedMsg?.videoMessage && !quotedMsg?.stickerMessage)) {
    await react('❌'); return reply(await t('general.quoteImageVideoSticker', {}, lang));
  }
  if (quotedMsg?.stickerMessage) { await react('❌'); return reply(await t('general.quoteImageOrVideo', {}, lang)); }
  try {
    await react(await t('converter.stickerWait', {}, lang).slice(0,2));
    await reply(await t('converter.stickerWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    const sticker = await gmdSticker(buf, packName || 'INCONNU', packAuthor || 'INCONNU BOY');
    await Gifted.sendMessage(from, { sticker }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('converter.stickerFailed', { error: e.message }, lang)); }
});

// ─── toimage ──────────────────────────────────────────────────
gmd({ pattern: 'toimage', aliases: ['stickertoimage','stoimg'], react: '🖼️', category: 'converter', description: 'Convert sticker to image' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, lang } = conText;
  if (!quoted || !quotedMsg?.stickerMessage) { await react('❌'); return reply(await t('general.quoteSticker', {}, lang)); }
  try {
    await react(await t('converter.toImageWait', {}, lang).slice(0,2));
    await reply(await t('converter.toImageWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    await Gifted.sendMessage(from, { image: buf }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('converter.toImageFailed', { error: e.message }, lang)); }
});

// ─── toaudio ──────────────────────────────────────────────────
gmd({ pattern: 'toaudio', aliases: ['mp3','extractaudio'], react: '🎵', category: 'converter', description: 'Extract audio from video' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, lang } = conText;
  if (!quoted || !quotedMsg?.videoMessage) { await react('❌'); return reply(await t('general.quoteVideo', {}, lang)); }
  try {
    await react(await t('converter.toAudioWait', {}, lang).slice(0,2));
    await reply(await t('converter.toAudioWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    const mime = quotedMsg.videoMessage?.mimetype || 'video/mp4';
    let audioBuf;
    try { audioBuf = await formatAudio(buf); }
    catch (e) {
      if (e.message?.includes('audio')) return reply(await t('converter.noAudioTrack', {}, lang));
      throw e;
    }
    await Gifted.sendMessage(from, { audio: audioBuf, mimetype: 'audio/mp4', ptt: false }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('converter.toAudioFailed', { error: e.message }, lang)); }
});

// ─── tovoice ──────────────────────────────────────────────────
gmd({ pattern: 'tovoice', aliases: ['ptt','tovn','voice'], react: '🎤', category: 'converter', description: 'Convert audio to voice note (PTT)' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, lang } = conText;
  if (!quoted || !quotedMsg?.audioMessage) { await react('❌'); return reply(await t('general.quoteAudio', {}, lang)); }
  try {
    await react(await t('converter.toVoiceWait', {}, lang).slice(0,2));
    await reply(await t('converter.toVoiceWait', {}, lang));
    const buf = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    const pttBuf = await toPtt(buf);
    await Gifted.sendMessage(from, { audio: pttBuf, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('converter.toVoiceFailed', { error: e.message }, lang)); }
});
