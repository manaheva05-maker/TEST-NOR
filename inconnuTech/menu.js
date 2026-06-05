const { t, ts } = require('../Lib/i18n');
const { gmd, commands, runtime } = require('../inconnuboy');
const { getAllSettings } = require('../inconnuboy/store/settings');
const { sendButtons } = require('gifted-btns');

// Category display order
const CATEGORY_ORDER = [
  'general', 'owner', 'group', 'settings',
  'ai', 'downloader', 'converter', 'search',
  'tools', 'games', 'notes', 'religion', 'sports', 'play'
];

const buildMenu = async (lang, settings) => {
  const allCmds = commands.filter(c => c.pattern && !c.dontAddCommandList);

  // Group by category
  const byCategory = {};
  for (const cmd of allCmds) {
    const cat = cmd.category || 'general';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(cmd.pattern);
  }

  const mode   = settings.MODE    || 'public';
  const prefix = settings.PREFIX  || '.';
  const owner  = settings.OWNER_NAME || 'INCONNU BOY';
  const botNm  = settings.BOT_NAME   || 'INCONNU XD V3';
  const up     = runtime(process.hrtime(process.hrtime()));

  const header  = ts('menu.header',   { runtime: up, mode, prefix, ownerName: owner }, lang);
  const welcome = ts('menu.welcome',  { botName: botNm }, lang);

  let body = `${header}\n${welcome}\n`;

  const orderedCats = [
    ...CATEGORY_ORDER.filter(c => byCategory[c]),
    ...Object.keys(byCategory).filter(c => !CATEGORY_ORDER.includes(c))
  ];

  for (const cat of orderedCats) {
    const cmds = byCategory[cat];
    if (!cmds?.length) continue;
    const catTitle = ts(`menu.categories.${cat}`, {}, lang) || cat.toUpperCase();
    body += `\n${ts('menu.categoryHeader', { title: catTitle }, lang)}\n`;
    for (const cmd of cmds.sort()) {
      body += `${ts('menu.cmdItem', { cmd }, lang)}\n`;
    }
    body += `${ts('menu.categoryFooter', {}, lang)}\n`;
  }

  body += `\n${ts('menu.footer', {}, lang)}`;
  body += `\n\n_${ts('menu.cmdCount', { count: allCmds.length }, lang)}_`;

  return body;
};

// ─── menu ─────────────────────────────────────────────────────
gmd(
  {
    pattern: 'menu',
    aliases: ['help', 'cmds', 'commands', 'list'],
    react: '📋',
    category: 'general',
    description: 'Show all bot commands grouped by category',
    dontAddCommandList: true,
  },
  async (from, Gifted, conText) => {
    const {
      react, mek, botName, botPic, newsletterJid, newsletterUrl,
      botPrefix, botFooter, lang, q
    } = conText;

    const settings = await getAllSettings();

    // If a category is specified, show only that category
    if (q?.trim()) {
      const cat = q.trim().toLowerCase();
      const catCmds = commands.filter(
        c => c.pattern && !c.dontAddCommandList && (c.category || 'general') === cat
      );
      if (!catCmds.length) {
        await react('❌');
        const catKeys = CATEGORY_ORDER.join(', ');
        return Gifted.sendMessage(
          from,
          {
            text: `${await t('menu.invalidCategory', {}, lang)}\n\n_${catKeys}_`,
            contextInfo: {
              forwardingScore: 1, isForwarded: true,
              forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 }
            }
          },
          { quoted: mek }
        );
      }
      const catTitle = ts(`menu.categories.${cat}`, {}, lang) || cat.toUpperCase();
      let body = `⭓──────────────────⭓『 ${catTitle} 』\n`;
      for (const cmd of catCmds.sort((a, b) => a.pattern.localeCompare(b.pattern))) {
        body += `│ ⬡ ${cmd.pattern}`;
        if (cmd.aliases?.length) body += ` _(${cmd.aliases.slice(0, 2).join(', ')})_`;
        body += '\n';
      }
      body += `╰──────────────────⭓\n\n`;
      body += `_${await t('menu.cmdCount', { count: catCmds.length }, lang)}_\n\n`;
      body += `> *${botFooter}*`;

      await Gifted.sendMessage(
        from,
        {
          image: { url: settings.BOT_PIC || 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg' },
          caption: body,
          contextInfo: {
            forwardingScore: 1, isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 }
          }
        },
        { quoted: mek }
      );
      await react('✅');
      return;
    }

    // Full menu
    const menuText = await buildMenu(lang, settings);

    const catList = CATEGORY_ORDER.filter(c =>
      commands.some(cmd => cmd.pattern && !cmd.dontAddCommandList && (cmd.category || 'general') === c)
    );
    const btnLabel = lang === 'fr' ? 'Catégorie' : 'Category';

    await sendButtons(Gifted, from, {
      title: botName,
      text: menuText,
      footer: `> *${botFooter}*`,
      buttons: [
        ...catList.slice(0, 3).map(c => ({
          id: `${botPrefix}menu ${c}`,
          text: `📂 ${ts(`menu.categories.${c}`, {}, lang) || c}`
        })),
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: lang === 'fr' ? 'Chaîne WA' : 'WaChannel',
            url: newsletterUrl || 'https://whatsapp.com/channel/0029VbCpYtZLtOj5LDuj7Q1p'
          })
        }
      ],
      image: settings.BOT_PIC || 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg'
    });
    await react('✅');
  }
);

// ─── owner (contact owner) ────────────────────────────────────
gmd(
  {
    pattern: 'owner',
    aliases: ['contact', 'dev'],
    react: '👑',
    category: 'general',
    description: 'Get the bot owner contact',
  },
  async (from, Gifted, conText) => {
    const { mek, botName, newsletterJid, ownerNumber, ownerName, botFooter, lang } = conText;
    const ownerJid = `${ownerNumber}@s.whatsapp.net`;
    const devJid   = '554488138425@s.whatsapp.net';
    const text = lang === 'fr'
      ? `👑 *Propriétaire du Bot*\n\n👤 *Nom:* ${ownerName || 'INCONNU BOY'}\n📱 *Numéro:* @${ownerNumber}\n\n💻 *Développeur:* INCONNU BOY\n📱 *Dev:* @554488138425\n\n> *${botFooter}*`
      : `👑 *Bot Owner*\n\n👤 *Name:* ${ownerName || 'INCONNU BOY'}\n📱 *Number:* @${ownerNumber}\n\n💻 *Developer:* INCONNU BOY\n📱 *Dev:* @554488138425\n\n> *${botFooter}*`;
    await Gifted.sendMessage(
      from,
      {
        text,
        mentions: [ownerJid, devJid],
        contextInfo: {
          forwardingScore: 1, isForwarded: true,
          forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 }
        }
      },
      { quoted: mek }
    );
  }
);

// ─── repo ─────────────────────────────────────────────────────
gmd(
  {
    pattern: 'repo',
    aliases: ['source', 'github', 'git'],
    react: '🐙',
    category: 'general',
    description: 'Get bot GitHub repository link',
  },
  async (from, Gifted, conText) => {
    const { reply, react, botName, newsletterJid, botFooter, lang } = conText;
    const url = 'https://github.com/INCONNU-BOY/INCONNU-XD-V3';
    const text = lang === 'fr'
      ? `🐙 *Dépôt GitHub*\n\n*${botName}*\n\n🔗 ${url}\n\n> *${botFooter}*`
      : `🐙 *GitHub Repository*\n\n*${botName}*\n\n🔗 ${url}\n\n> *${botFooter}*`;
    await reply(text);
    await react('✅');
  }
);

// ─── join (join a group via link) ─────────────────────────────
gmd(
  {
    pattern: 'join',
    aliases: ['joingroup'],
    react: '🔗',
    category: 'owner',
    description: 'Join a group via invite link',
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, isSuperUser, lang } = conText;
    const { safeGroupAcceptInvite } = require('../inconnuboy');
    if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
    if (!q || !q.includes('chat.whatsapp.com/')) {
      await react('❌');
      return reply(await t('group.join_invalidLink', {}, lang));
    }
    try {
      const code = q.split('chat.whatsapp.com/')[1]?.trim();
      if (!code) throw new Error('Invalid link');
      await Gifted.groupAcceptInvite(code);
      await react('✅');
      return reply(await t('group.joinSuccess', {}, lang));
    } catch (e) {
      await react('❌');
      return reply(await t('errors.generic', { error: e.message }, lang));
    }
  }
);

// ─── uptime ───────────────────────────────────────────────────
gmd(
  {
    pattern: 'uptime',
    aliases: ['up'],
    react: '⏱️',
    category: 'general',
    description: 'Show bot uptime',
  },
  async (from, Gifted, conText) => {
    const { reply, react, botName, newsletterJid, botFooter, lang } = conText;
    const up = runtime(process.hrtime(process.hrtime()));
    const label = lang === 'fr' ? '⏱️ *Temps de fonctionnement:*' : '⏱️ *Bot Uptime:*';
    await reply(`${label} ${up}\n\n> *${botFooter}*`);
    await react('✅');
  }
);
