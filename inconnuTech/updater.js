const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const { UpdateDB, setCommitHash, getCommitHash } = require('../inconnuboy/store/autoUpdate');
const axios = require('axios');

gmd({ pattern: 'update', aliases: ['checkupdate','botupdate'], react: '🔄', category: 'owner', description: 'Check for bot updates' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mek, botName, newsletterJid, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  try {
    await react(await t('updater.checking', {}, lang).slice(0,2));
    await reply(await t('updater.checking', {}, lang));
    const res = await axios.get('https://api.github.com/repos/INCONNU-BOY/INCONNU-XD-V3/commits/main', { timeout: 10000 });
    const latestHash = res.data?.sha?.slice(0, 7);
    const currentHash = await getCommitHash();
    if (latestHash === currentHash) {
      await react('✅');
      return reply(await t('updater.upToDate', {}, lang));
    }
    const notes = res.data?.commit?.message || (lang === 'fr' ? 'Nouvelles améliorations disponibles.' : 'New improvements available.');
    await Gifted.sendMessage(from, {
      text: await t('updater.updateAvailable', { notes }, lang),
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 } }
    }, { quoted: mek });
    await react('🔔');
  } catch (e) { await react('❌'); return reply(await t('updater.updateFailed', { error: e.message }, lang)); }
});

gmd({ pattern: 'updatebot', aliases: ['pullupdate','gitpull'], react: '⬆️', category: 'owner', description: 'Pull latest update from GitHub' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  try {
    await react(await t('updater.updating', {}, lang).slice(0,2));
    await reply(await t('updater.updating', {}, lang));
    const { execSync } = require('child_process');
    execSync('git pull', { cwd: process.cwd(), stdio: 'pipe' });
    execSync('npm install --omit=dev', { cwd: process.cwd(), stdio: 'pipe' });
    await react('✅');
    await reply(await t('updater.updateDone', {}, lang));
    setTimeout(() => process.exit(0), 2000);
  } catch (e) { await react('❌'); return reply(await t('updater.updateError', { error: e.message }, lang)); }
});
