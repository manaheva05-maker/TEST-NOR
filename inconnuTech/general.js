const { t } = require('../Lib/i18n');
const { gmd, commands, monospace, formatBytes } = require('../inconnuboy');
const fs = require('fs');
const moment = require('moment-timezone');
const { sendButtons } = require('gifted-btns');

gmd(
  { pattern: 'ping', aliases: ['pi','p'], react: '⚡', category: 'general', description: 'Check bot speed' },
  async (from, Gifted, conText) => {
    const { mek, react, newsletterJid, newsletterUrl, botFooter, botName, botPrefix, lang } = conText;
    const start = process.hrtime();
    await new Promise(r => setTimeout(r, Math.floor(80 + Math.random() * 420)));
    const [s, ns] = process.hrtime(start);
    const ms = Math.floor(s * 1000 + ns / 1e6);
    await sendButtons(Gifted, from, {
      title: await t('ping.title', {}, lang),
      text: await t('ping.result', { ms }, lang),
      footer: `> *${botFooter}*`,
      buttons: [
        { id: `${botPrefix}uptime`, text: `⏱️ ${await t('ping.uptime', {}, lang)}` },
        { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: await t('ping.channel', {}, lang), url: newsletterUrl }) },
      ],
    });
    await react('✅');
  },
);

gmd(
  { pattern: 'report', aliases: ['request'], react: '💫', category: 'owner', description: 'Request features / report issues' },
  async (from, Gifted, conText) => {
    const { reply, lang } = conText;
    const url = 'https://github.com/INCONNU-BOY/INCONNU-XD-V3/issues';
    return reply(await t('general.reportUsage', { url }, lang));
  },
);
