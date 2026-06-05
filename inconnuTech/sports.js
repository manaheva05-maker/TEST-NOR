const { t } = require('../Lib/i18n');
const { gmd, GiftedTechApi } = require('../inconnuboy');

gmd({ pattern: 'livescore', aliases: ['scores','score','football'], react: '⚽', category: 'sports', description: 'Get live football scores' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  try {
    await react(await t('sports.fetchWait', {}, lang).slice(0,2));
    await reply(await t('sports.fetchWait', {}, lang));
    const res = await GiftedTechApi.get('/livescores', { params: q ? { league: q } : {} });
    const matches = res?.data?.matches || res?.data?.results;
    if (!matches?.length) { await react('❌'); return reply(await t('sports.noResults', {}, lang)); }
    const text = matches.slice(0, 10).map(m =>
      `⚽ *${m.home}* vs *${m.away}*\n📊 ${m.score || (lang === 'fr' ? 'Pas encore commencé' : 'Not started')}\n🏆 ${m.league || ''}\n⏰ ${m.time || ''}`
    ).join('\n\n');
    await Gifted.sendMessage(from, {
      text: `⚽ *${lang === 'fr' ? 'SCORES EN DIRECT' : 'LIVE SCORES'}*\n\n${text}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('sports.failed', { error: e.message }, lang)); }
});

gmd({ pattern: 'fixtures', aliases: ['matches','upcoming'], react: '📅', category: 'sports', description: 'Get upcoming football fixtures' },
async (from, Gifted, conText) => {
  const { reply, react, q, mek, botName, newsletterJid, lang } = conText;
  try {
    await react(await t('sports.fetchWait', {}, lang).slice(0,2));
    await reply(await t('sports.fetchWait', {}, lang));
    const res = await GiftedTechApi.get('/fixtures', { params: q ? { league: q } : {} });
    const fixtures = res?.data?.fixtures || res?.data?.results;
    if (!fixtures?.length) { await react('❌'); return reply(await t('sports.noResults', {}, lang)); }
    const text = fixtures.slice(0, 8).map(f =>
      `📅 *${f.home}* vs *${f.away}*\n🏆 ${f.league || ''}\n⏰ ${f.date || ''} ${f.time || ''}`
    ).join('\n\n');
    await Gifted.sendMessage(from, {
      text: `📅 *${lang === 'fr' ? 'PROCHAINS MATCHS' : 'UPCOMING FIXTURES'}*\n\n${text}`,
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('sports.failed', { error: e.message }, lang)); }
});
