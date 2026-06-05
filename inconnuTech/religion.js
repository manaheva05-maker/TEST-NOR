const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');

gmd({ pattern: 'quran', aliases: ['verse','ayah'], react: '📖', category: 'religion', description: 'Get a Quran verse (surah:verse)' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.quran 1:1' }, lang)); }
  try {
    await react(await t('religion.quranWait', {}, lang).slice(0,2));
    await reply(await t('religion.quranWait', {}, lang));
    const [surah, verse] = q.split(':');
    const res = await GiftedTechApi.get('/quran', { params: { surah: surah?.trim(), verse: verse?.trim() } });
    const d = res?.data;
    if (!d) throw new Error('No data');
    await Gifted.sendMessage(from, {
      text: `📖 *${lang==='fr'?'Coran':'Quran'} — ${d.surah_name} (${d.surah}:${d.ayah})*\n\n${d.arabic}\n\n_${d.translation}_`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('religion.quranFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'hadith', react: '📜', category: 'religion', description: 'Get a random Hadith' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  try {
    await react(await t('religion.hadithWait', {}, lang).slice(0,2));
    await reply(await t('religion.hadithWait', {}, lang));
    const res = await GiftedTechApi.get('/hadith', { params: { collection: q || 'bukhari' } });
    const d = res?.data;
    if (!d) throw new Error('No data');
    await Gifted.sendMessage(from, {
      text: `📜 *Hadith — ${d.collection || ''}*\n\n${d.hadith}\n\n_${d.reference || ''}_`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('religion.hadithFailed', { error: e.message }, lang)); }
});
