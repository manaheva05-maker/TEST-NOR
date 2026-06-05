const { t } = require('../Lib/i18n');
const { gmd } = require('../inconnuboy');
const axios = require('axios');

gmd({ pattern: 'trivia', aliases: ['quiz'], react: '🧠', category: 'games', description: 'Play a trivia quiz' },
async (from, Gifted, conText) => {
  const { reply, react, isGroup, mek, botName, newsletterJid, lang } = conText;
  if (!isGroup) { await react('❌'); return reply(await t('games.groupOnly', {}, lang)); }
  try {
    await react(await t('games.gameStarted', {}, lang).slice(0,2));
    const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const q = res.data?.results?.[0];
    if (!q) { await react('❌'); return reply(await t('general.tryAgain', {}, lang)); }
    const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
    const labels = ['A','B','C','D'];
    const options = answers.map((a,i) => `*${labels[i]}.* ${a}`).join('\n');
    const catLbl  = lang === 'fr' ? 'Catégorie'   : 'Category';
    const diffLbl = lang === 'fr' ? 'Difficulté'  : 'Difficulty';
    const repLbl  = lang === 'fr' ? 'Répondez avec A, B, C ou D' : 'Reply with A, B, C or D';
    await Gifted.sendMessage(from, {
      text: `🧠 *TRIVIA*\n\n❓ *${q.question.replace(/&quot;/g,'"').replace(/&#039;/g,"'")}*\n\n${options}\n\n📂 *${catLbl}:* ${q.category}\n🎯 *${diffLbl}:* ${q.difficulty}\n\n_${repLbl}_`,
      contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } }
    }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

gmd({ pattern: 'coinflip', aliases: ['flip','coin'], react: '🪙', category: 'games', description: 'Flip a coin' },
async (from, Gifted, conText) => {
  const { react, reply, lang } = conText;
  const heads = Math.random() > 0.5;
  await react('🪙');
  return reply(await t(heads ? 'games.coinflipHeads' : 'games.coinflipTails', {}, lang));
});

gmd({ pattern: 'dice', aliases: ['roll','rolldice'], react: '🎲', category: 'games', description: 'Roll a dice' },
async (from, Gifted, conText) => {
  const { react, reply, q, lang } = conText;
  const sides  = parseInt(q) || 6;
  const result = Math.floor(Math.random() * sides) + 1;
  await react('🎲');
  return reply(await t('games.diceResult', { sides, result }, lang));
});

gmd({ pattern: '8ball', aliases: ['magic8ball','8b'], react: '🎱', category: 'games', description: 'Ask the magic 8-ball' },
async (from, Gifted, conText) => {
  const { react, reply, q, lang } = conText;
  if (!q) { await react('❌'); return reply(await t('ai.provide', {}, lang)); }
  const answersEn = ['Yes','Definitely yes!','Without a doubt','Most likely','Ask again later','Cannot predict now',"Don't count on it",'Very doubtful','No','My sources say no'];
  const answersFr = ['Oui','Définitivement oui!','Sans aucun doute','Très probablement','Demandez plus tard','Je ne peux pas prédire maintenant',"N'y comptez pas",'Très peu probable','Non','Mes sources disent non'];
  const answers = lang === 'fr' ? answersFr : answersEn;
  const answer  = answers[Math.floor(Math.random() * answers.length)];
  await react('🎱');
  return reply(await t('games.eightballResult', { question: q, answer }, lang));
});
