const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');

gmd({ pattern: 'translate', aliases: ['tr','tl'], react: '🌍', category: 'tools', description: 'Translate text to any language' },
async (from, Gifted, conText) => {
  const { reply, react, args, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  const targetLang = args[0];
  const text = args.slice(1).join(' ') || quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '';
  if (!targetLang || !text) { await react('❌'); return reply(await t('tools.translate_usage', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const { translate } = require('@vitalets/google-translate-api');
    const res = await translate(text, { to: targetLang });
    const label = lang === 'fr' ? 'Traduction' : 'Translation';
    await Gifted.sendMessage(from, {
      text: `🌍 *${label} → ${targetLang}*\n\n${res.text}`,
      contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

gmd({ pattern: 'ocr', aliases: ['readimage','imgtotext'], react: '🔤', category: 'tools', description: 'Extract text from an image (OCR)' },
async (from, Gifted, conText) => {
  const { reply, react, quoted, quotedMsg, mek, botName, newsletterJid, lang } = conText;
  if (!quoted || !quotedMsg?.imageMessage) { await react('❌'); return reply(await t('general.quoteImage', {}, lang)); }
  try {
    await react(await t('tools.editWait', {}, lang).slice(0,2));
    await reply(await t('general.processing', {}, lang));
    const { downloadMediaMessage } = require('gifted-baileys');
    const { GiftedTechApi } = require('../inconnuboy');
    const buf  = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
    const form = new (require('form-data'))();
    form.append('image', buf, { filename: 'img.jpg', contentType: 'image/jpeg' });
    const res  = await GiftedTechApi.post('/ocr', form, { headers: form.getHeaders() });
    const text = res?.data?.text;
    if (!text) { await react('❌'); return reply(await t('tools.ocrNoText', {}, lang)); }
    const label = lang === 'fr' ? 'Texte extrait' : 'Extracted Text';
    await Gifted.sendMessage(from, {
      text: `🔤 *${label}:*\n\n${text}`,
      contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('tools.processImageFailed', {}, lang)); }
});

gmd({ pattern: 'calc', aliases: ['calculate','math'], react: '🧮', category: 'tools', description: 'Calculate a math expression' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.calc 2 + 2 * 10' }, lang)); }
  try {
    const math   = require('mathjs');
    const result = math.evaluate(q);
    const exprLbl   = lang === 'fr' ? 'Calcul'    : 'Expression';
    const resultLbl = lang === 'fr' ? 'Résultat'  : 'Result';
    await react('✅');
    return reply(`🧮 *${exprLbl}:* \`${q}\`\n✅ *${resultLbl}:* \`${result}\``);
  } catch (e) { await react('❌'); return reply(await t('tools.calcInvalid', { expr: q }, lang)); }
});

gmd({ pattern: 'tts', aliases: ['texttospeech','speak'], react: '🔊', category: 'tools', description: 'Convert text to speech' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.tts Hello world' }, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const gTTS = require('google-tts-api');
    const axios = require('axios');
    const url = gTTS.getAudioUrl(q, { lang: lang === 'fr' ? 'fr' : 'en', slow: false });
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    await Gifted.sendMessage(from, { audio: Buffer.from(res.data), mimetype: 'audio/mp4', ptt: true }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

gmd({ pattern: 'qr', aliases: ['qrcode','makeqr'], react: '📲', category: 'tools', description: 'Generate a QR code' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.qr https://example.com' }, lang)); }
  try {
    await react(await t('general.wait', {}, lang).slice(0,2));
    const axios = require('axios');
    const url   = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(q)}&size=300x300`;
    const res   = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    await Gifted.sendMessage(from, {
      image: Buffer.from(res.data),
      caption: `📲 *QR Code*\n\`${q}\`\n\n> *${botName}*`,
      contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});
