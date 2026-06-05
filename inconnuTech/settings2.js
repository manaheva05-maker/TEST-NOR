const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { getGroupSetting, setGroupSetting } = require('../inconnuboy/store/groupSettings');

const guardGroup = async (conText) => {
  const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, reply, lang } = conText;
  if (!isGroup) { await reply(await t('general.groupOnly', {}, lang)); return false; }
  if (!isBotAdmin) { await reply(await t('general.botAdminRequired', {}, lang)); return false; }
  if (!isAdmin && !isSuperAdmin) { await reply(await t('general.adminOnly', {}, lang)); return false; }
  return true;
};

const toggleGroupSetting = async (from, key, val, labelOn, labelOff, lang) => {
  await setGroupSetting(from, key, val === 'on' ? 'true' : 'false');
  const msgKey = val === 'on' ? labelOn : labelOff;
  return msgKey;
};

gmd({ pattern: 'welcome', aliases: ['setwelcome'], react: '👋', category: 'group', description: 'Toggle welcome messages for this group' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!await guardGroup(conText)) return;
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  const cur = await getGroupSetting(from, 'WELCOME_MESSAGE');
  const curBool = cur === 'true';
  if ((val === 'on' && curBool) || (val === 'off' && !curBool))
    return reply(await t(val === 'on' ? 'settings.alreadyOn' : 'settings.alreadyOff', { key: lang === 'fr' ? 'Messages de bienvenue' : 'Welcome Messages' }, lang));
  await setGroupSetting(from, 'WELCOME_MESSAGE', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'group.welcomeOn' : 'group.welcomeOff', {}, lang));
});

gmd({ pattern: 'goodbye', aliases: ['setgoodbye'], react: '👋', category: 'group', description: 'Toggle goodbye messages for this group' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!await guardGroup(conText)) return;
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  const cur = await getGroupSetting(from, 'GOODBYE_MESSAGE');
  const curBool = cur === 'true';
  if ((val === 'on' && curBool) || (val === 'off' && !curBool))
    return reply(await t(val === 'on' ? 'settings.alreadyOn' : 'settings.alreadyOff', { key: lang === 'fr' ? 'Messages d\'au revoir' : 'Goodbye Messages' }, lang));
  await setGroupSetting(from, 'GOODBYE_MESSAGE', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'group.goodbyeOn' : 'group.goodbyeOff', {}, lang));
});

gmd({ pattern: 'groupevents', aliases: ['events','gcevents'], react: '📢', category: 'group', description: 'Toggle group event notifications' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!await guardGroup(conText)) return;
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  await setGroupSetting(from, 'GROUP_EVENTS', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'group.eventsOn' : 'group.eventsOff', {}, lang));
});

gmd({ pattern: 'antilink', aliases: ['antispam'], react: '🛡️', category: 'group', description: 'Toggle anti-link protection' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!await guardGroup(conText)) return;
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  await setGroupSetting(from, 'ANTILINK', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'group.antiLinkOn' : 'group.antiLinkOff', {}, lang));
});

gmd({ pattern: 'antibad', aliases: ['antibadwords','antiswear'], react: '🛡️', category: 'group', description: 'Toggle anti-bad-words filter' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!await guardGroup(conText)) return;
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  await setGroupSetting(from, 'ANTIBAD', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'group.antiBadOn' : 'group.antiBadOff', {}, lang));
});

gmd({ pattern: 'antidelete', aliases: ['antidel'], react: '🛡️', category: 'settings', description: 'Toggle anti-delete globally' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const { setSetting } = require('../inconnuboy/store/settings');
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  await setSetting('ANTIDELETE', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'settings.turnedOn' : 'settings.turnedOff', { key: 'Anti-Delete' }, lang));
});

gmd({ pattern: 'anticall', react: '🛡️', category: 'settings', description: 'Toggle anti-call protection' },
async (from, Gifted, conText) => {
  const { reply, react, q, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  const { setSetting } = require('../inconnuboy/store/settings');
  const val = q?.toLowerCase()?.trim();
  if (!val || !['on','off'].includes(val)) return reply(await t('settings.onOffInvalid', {}, lang));
  await setSetting('ANTICALL', val === 'on' ? 'true' : 'false');
  await react('✅');
  return reply(await t(val === 'on' ? 'settings.turnedOn' : 'settings.turnedOff', { key: 'Anti-Call' }, lang));
});
