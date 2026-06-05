const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { setSetting, getSetting } = require('../inconnuboy/store/settings');

gmd({ pattern: 'setbio', aliases: ['bio','changebio'], react: '✏️', category: 'owner', description: 'Set bot WhatsApp bio/status' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setbio Your bio here' }, lang));
  try {
    await Gifted.updateProfileStatus(q.trim());
    await react('✅');
    return reply(await t('owner.bioUpdated', { bio: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('owner.bioFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'setbotname2', aliases: ['setname','changename'], react: '✏️', category: 'owner', description: 'Set bot WhatsApp display name' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q) return reply(await t('general.provideArgs', { usage: '.setname INCONNU XD' }, lang));
  try {
    const cur = await getSetting('BOT_NAME');
    if (cur === q.trim()) return reply(await t('owner.nameAlready', { name: q.trim() }, lang));
    await Gifted.updateProfileName(q.trim());
    await setSetting('BOT_NAME', q.trim());
    await react('✅');
    return reply(await t('owner.nameBotUpdated', { name: q.trim() }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

gmd({ pattern: 'autoreadmsg', aliases: ['autoread'], react: '⚙️', category: 'settings', description: 'Toggle auto-read messages' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const valid = ['off','all','dm','groups','commands'];
  const val = q?.toLowerCase()?.trim();
  if (!val || !valid.includes(val)) return reply(await t('settings.autoReadMsgInvalid', {}, lang));
  await setSetting('AUTO_READ_MESSAGES', val);
  await react('✅');
  return reply(val === 'off'
    ? await t('settings.autoReadMsgOff', {}, lang)
    : await t('settings.autoReadMsgOn', { mode: val }, lang));
});
