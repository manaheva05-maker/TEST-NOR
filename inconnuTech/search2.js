const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');

gmd({ pattern: 'giphy', aliases: ['gif','findgif'], react: '🎞️', category: 'search', description: 'Search and send a GIF' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('search.provide', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const res = await GiftedTechApi.get('/gif', { params: { q }, responseType: 'arraybuffer' });
    const buf = Buffer.from(res.data);
    await Gifted.sendMessage(from, {
      video: buf, gifPlayback: true, caption: `🎞️ *${q}*\n\n> *${botName}*`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

gmd({ pattern: 'wiki', aliases: ['wikipedia'], react: '📚', category: 'search', description: 'Search Wikipedia' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('search.provide', {}, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const res = await GiftedTechApi.get('/wikipedia', { params: { q, lang: lang === 'fr' ? 'fr' : 'en' } });
    const d = res?.data;
    if (!d?.summary) { await react('❌'); return reply(await t('search.noResults', {}, lang)); }
    await Gifted.sendMessage(from, {
      text: `📚 *${d.title}*\n\n${d.summary.slice(0, 1500)}${d.summary.length > 1500 ? '...' : ''}\n\n🔗 ${d.url || ''}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('search.failed', {}, lang)); }
});

gmd({ pattern: 'weather', aliases: ['meteo','temperature'], react: '🌤️', category: 'search', description: 'Get weather info for a city' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('general.provideArgs', { usage: '.weather Paris' }, lang)); }
  try {
    await react(await t('general.processing', {}, lang).slice(0,2));
    const res = await GiftedTechApi.get('/weather', { params: { city: q, lang } });
    const d = res?.data;
    if (!d) { await react('❌'); return reply(await t('search.noResults', {}, lang)); }
    const tempLabel = lang === 'fr' ? 'Température' : 'Temperature';
    const humLabel  = lang === 'fr' ? 'Humidité' : 'Humidity';
    const windLabel = lang === 'fr' ? 'Vent' : 'Wind';
    const descLabel = lang === 'fr' ? 'Description' : 'Description';
    await Gifted.sendMessage(from, {
      text: `🌤️ *${lang === 'fr' ? 'Météo' : 'Weather'} — ${d.city || q}*\n\n🌡️ *${tempLabel}:* ${d.temp || 'N/A'}°C\n💧 *${humLabel}:* ${d.humidity || 'N/A'}%\n💨 *${windLabel}:* ${d.wind || 'N/A'} km/h\n📝 *${descLabel}:* ${d.description || 'N/A'}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('search.failed', {}, lang)); }
});
