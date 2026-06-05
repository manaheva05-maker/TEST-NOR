const { t } = require('../Lib/i18n');
const { gmd, getGroupMetadata, getLidMapping } = require('../inconnuboy');
const { getGroupSetting, setGroupSetting } = require('../inconnuboy/store/groupSettings');

const guardGroup = async (conText, needAdmin = true, needBotAdmin = true) => {
  const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, reply, lang } = conText;
  if (!isGroup)   { await reply(await t('general.groupOnly', {}, lang)); return false; }
  if (needBotAdmin && !isBotAdmin) { await reply(await t('general.botAdminRequired', {}, lang)); return false; }
  if (needAdmin && !isAdmin && !isSuperAdmin) { await reply(await t('general.adminOnly', {}, lang)); return false; }
  return true;
};

const getLid = async (Gifted, jid) => {
  if (!jid || !jid.endsWith('@lid')) return jid;
  const c = getLidMapping(jid); if (c) return c;
  try { const r = await Gifted.getJidFromLid(jid); if (r) return r; } catch {}
  return jid;
};

const resolveTarget = async (Gifted, { mentionedJid, quotedUser, q, groupMetadata }) => {
  let jid = null;
  if (mentionedJid?.length) jid = await getLid(Gifted, mentionedJid[0]);
  else if (quotedUser)      jid = await getLid(Gifted, quotedUser);
  else if (q) { const n = q.replace(/\D/g, ''); if (n.length >= 10) jid = n + '@s.whatsapp.net'; }
  if (jid?.includes('@lid') && groupMetadata?.participants) {
    const n = jid.split('@')[0];
    const f = groupMetadata.participants.find(p => p.lid?.split('@')[0] === n || p.id?.split('@')[0] === n);
    if (f?.id) jid = f.id; else if (f?.pn) jid = f.pn + '@s.whatsapp.net';
  }
  if (jid && !jid.includes('@')) jid += '@s.whatsapp.net';
  return jid;
};

// ─── unmute ───────────────────────────────────────────────────
gmd({ pattern: 'unmute', react: '⏳', aliases: ['open','groupopen','gcopen'], category: 'group', description: 'Open group chat' },
async (from, Gifted, conText) => {
  const { reply, react, sender, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    await Gifted.groupSettingUpdate(from, 'not_announcement');
    await react('✅');
    return reply(await t('group.unmuteSuccess', { user: sender.split('@')[0] }, lang), { mentions: [sender] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── mute ─────────────────────────────────────────────────────
gmd({ pattern: 'mute', react: '⏳', aliases: ['close','groupmute','gcmute'], category: 'group', description: 'Close group chat' },
async (from, Gifted, conText) => {
  const { reply, react, sender, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    await Gifted.groupSettingUpdate(from, 'announcement');
    await react('✅');
    return reply(await t('group.muteSuccess', { user: sender.split('@')[0] }, lang), { mentions: [sender] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── met ──────────────────────────────────────────────────────
gmd({ pattern: 'met', react: '⚡', category: 'general', description: 'Group metadata' },
async (from, Gifted, conText) => {
  const { mek, react, newsletterJid, botName, lang } = conText;
  try {
    const g = await getGroupMetadata(Gifted, from);
    const f = jid => jid ? `@${jid.split('@')[0]}` : 'N/A';
    const sa = [], ad = [], mb = [];
    g.participants.forEach(p => {
      const fl = f(p.phoneNumber || p.pn || p.jid);
      if (p.admin === 'superadmin') sa.push(`• ${fl} - 👑`);
      else if (p.admin === 'admin') ad.push(`• ${fl} - 👮`);
      else mb.push(`• ${fl} - 👤`);
    });
    const sub  = lang === 'fr' ? 'Sujet'       : 'Subject';
    const own  = lang === 'fr' ? 'Propriétaire': 'Owner';
    const mbrs = lang === 'fr' ? 'Membres'     : 'Members';
    const desc = 'Description';
    const part = lang === 'fr' ? 'PARTICIPANTS' : 'PARTICIPANTS';
    const text = `📌 *${lang==='fr'?'MÉTADONNÉES DU GROUPE':'GROUP METADATA'}*\n\n🔹 *ID:* ${g.id}\n🔹 *${sub}:* ${g.subject||'None'}\n🔹 *${own}:* ${f(g.ownerPn||g.ownerJid)}\n🔹 *${mbrs}:* ${g.size}\n🔹 *${desc}:* ${g.desc||'None'}\n\n👥 *${part} (${g.participants.length})*\n${[...sa,...ad,...mb].join('\n')}`.trim();
    await Gifted.sendMessage(from, { text, contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); await Gifted.sendMessage(from, { text: await t('errors.generic', { error: e.message }, lang) }, { quoted: mek }); }
});

// ─── demote ───────────────────────────────────────────────────
gmd({ pattern: 'demote', react: '👑', category: 'group', description: 'Demote a user from admin' },
async (from, Gifted, conText) => {
  const { reply, react, sender, superUser, isSuperAdmin, isAdmin, groupAdmins, groupMetadata, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  const targetJid = await resolveTarget(Gifted, conText);
  if (!targetJid || targetJid.includes('@lid')) {
    await react('❌'); return reply(await t('group.cannotIdentifyUser', { example: `${botPrefix}demote 554712345678` }, lang));
  }
  const targetNum = targetJid.split('@')[0];
  if (superUser.map(u => u.split('@')[0]).includes(targetNum)) { await react('❌'); return reply(await t('group.cannotDemoteSuperuser', {}, lang)); }
  const adminNums = [...(groupAdmins||[]), ...(conText.groupSuperAdmins||[])].map(a => a.split('@')[0]);
  if (!adminNums.includes(targetNum)) { await react('⚠️'); return reply(await t('group.notAnAdmin', { user: targetNum }, lang), { mentions: [targetJid] }); }
  try {
    await Gifted.groupParticipantsUpdate(from, [targetJid], 'demote');
    await react('✅');
    return reply(await t('group.demotionNotif', { user: targetNum, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }, lang), { mentions: [targetJid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── promote ──────────────────────────────────────────────────
gmd({ pattern: 'promote', aliases: ['toadmin'], react: '👑', category: 'group', description: 'Promote a user to admin' },
async (from, Gifted, conText) => {
  const { reply, react, groupAdmins, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  const targetJid = await resolveTarget(Gifted, conText);
  if (!targetJid || targetJid.includes('@lid')) {
    await react('❌'); return reply(await t('group.cannotIdentifyUser', { example: `${botPrefix}promote 554712345678` }, lang));
  }
  const targetNum = targetJid.split('@')[0];
  const adminNums = [...(groupAdmins||[]), ...(conText.groupSuperAdmins||[])].map(a => a.split('@')[0]);
  if (adminNums.includes(targetNum)) { await react('⚠️'); return reply(await t('group.alreadyAdmin', { user: targetNum }, lang), { mentions: [targetJid] }); }
  try {
    await Gifted.groupParticipantsUpdate(from, [targetJid], 'promote');
    await react('✅');
    return reply(await t('group.promotionNotif', { user: targetNum, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }, lang), { mentions: [targetJid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── kick ─────────────────────────────────────────────────────
gmd({ pattern: 'kick', aliases: ['remove'], react: '🚫', category: 'group', description: 'Remove a user from the group' },
async (from, Gifted, conText) => {
  const { reply, react, superUser, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  const targetJid = await resolveTarget(Gifted, conText);
  if (!targetJid || targetJid.includes('@lid')) {
    await react('❌'); return reply(await t('group.cannotIdentifyUser', { example: `${botPrefix}kick 554712345678` }, lang));
  }
  const targetNum = targetJid.split('@')[0];
  if (superUser.map(u => u.split('@')[0]).includes(targetNum)) { await react('❌'); return reply(await t('group.cannotKickSuperuser', {}, lang)); }
  const botJid = Gifted.user?.id?.split(':')[0] + '@s.whatsapp.net';
  if (targetJid.toLowerCase() === botJid.toLowerCase()) { await react('❌'); return reply(await t('group.cannotKickSelf', {}, lang)); }
  try {
    await Gifted.groupParticipantsUpdate(from, [targetJid], 'remove');
    await react('✅');
    return reply(await t('group.kickSuccess', { user: targetNum }, lang), { mentions: [targetJid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── add ──────────────────────────────────────────────────────
gmd({ pattern: 'add', aliases: ['invite'], react: '➕', category: 'group', description: 'Add a user to the group' },
async (from, Gifted, conText) => {
  const { reply, react, q, lang } = conText;
  if (!await guardGroup(conText)) return;
  if (!q) { await react('❌'); return reply(await t('general.provideNumber', {}, lang)); }
  const num = q.replace(/\D/g, '');
  if (num.length < 10) { await react('❌'); return reply(await t('general.invalidNumber', {}, lang)); }
  const targetJid = num + '@s.whatsapp.net';
  try {
    const [exists] = await Gifted.onWhatsApp(num).catch(() => [null]);
    if (exists === null) { await react('⚠️'); return reply(await t('group.addVerifyFail', { number: num }, lang)); }
    if (!exists?.exists) { await react('❌'); return reply(await t('group.addNotOnWA', { number: num }, lang)); }
  } catch { await react('⚠️'); return reply(await t('group.addVerifyFail', { number: num }, lang)); }
  try {
    const result = await Gifted.groupParticipantsUpdate(from, [targetJid], 'add');
    if (result?.[0]?.status === '403') {
      const code = await Gifted.groupInviteCode(from);
      await Gifted.sendMessage(targetJid, { text: `https://chat.whatsapp.com/${code}` });
      await react('⚠️');
      return reply(await t('group.addPrivacy', { user: num }, lang), { mentions: [targetJid] });
    }
    await react('✅');
    return reply(await t('group.addSuccess', { user: num }, lang), { mentions: [targetJid] });
  } catch (e) { await react('❌'); return reply(await t('group.addFailed', { number: num, error: e.message }, lang)); }
});

// ─── link ─────────────────────────────────────────────────────
gmd({ pattern: 'link', aliases: ['gclink','grouplink','invitelink'], react: '🔗', category: 'group', description: 'Get group invite link' },
async (from, Gifted, conText) => {
  const { reply, react, mek, botName, newsletterJid, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    const meta = await Gifted.groupMetadata(from);
    const code = await Gifted.groupInviteCode(from);
    const link = `https://chat.whatsapp.com/${code}`;
    const title = await t('group.linkTitle', {}, lang);
    const grpLbl = lang === 'fr' ? 'Groupe'  : 'Group';
    const mbrLbl = lang === 'fr' ? 'Membres' : 'Members';
    const admLbl = lang === 'fr' ? 'Admins'  : 'Admins';
    const admins = meta.participants.filter(p => p.admin).length;
    const text = `${title}\n\n🏠 *${grpLbl}:* ${meta.subject}\n👥 *${mbrLbl}:* ${meta.participants.length}\n👮 *${admLbl}:* ${admins}\n\n🔗 *Link:*\n${link}`;
    await Gifted.sendMessage(from, { text, contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:0 } } }, { quoted: mek });
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── newgroup ─────────────────────────────────────────────────
gmd({ pattern: 'newgroup', aliases: ['newgc','creategroup'], react: '🆕', category: 'group', description: 'Create a new group' },
async (from, Gifted, conText) => {
  const { reply, react, sender, isSuperUser, q, mek, botName, newsletterJid, lang } = conText;
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q?.trim()) { await react('❌'); return reply(await t('group.newgroupProvide', {}, lang)); }
  try {
    const group = await Gifted.groupCreate(q.trim(), [sender]);
    const code  = await Gifted.groupInviteCode(group.id);
    const link  = `https://chat.whatsapp.com/${code}`;
    await react('✅');
    return reply(await t('group.groupCreated', { name: q.trim(), id: group.id, link }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── killgc ───────────────────────────────────────────────────
gmd({ pattern: 'killgc', aliases: ['terminategc','destroygc','nukegc'], react: '💀', category: 'group', description: 'Terminate group' },
async (from, Gifted, conText) => {
  const { reply, react, sender, isSuperUser, isGroup, isBotAdmin, isAdmin, isSuperAdmin, mek, botName, newsletterJid, lang } = conText;
  if (!isGroup)   return reply(await t('general.groupOnly', {}, lang));
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!isBotAdmin) return reply(await t('general.botAdminRequired', {}, lang));
  if (!isAdmin && !isSuperAdmin) return reply(await t('general.adminOnly', {}, lang));
  try {
    await Gifted.sendMessage(from, { text: await t('group.terminateWarn', {}, lang), contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:0 } } }, { quoted: mek });
    await new Promise(r => setTimeout(r, 1000));
    const meta   = await Gifted.groupMetadata(from);
    const botJid = Gifted.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const toRem  = meta.participants.filter(p => p.id !== botJid && p.id !== sender).map(p => p.id);
    if (toRem.length) await Gifted.groupParticipantsUpdate(from, toRem, 'remove');
    await Gifted.groupLeave(from);
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── accept ───────────────────────────────────────────────────
gmd({ pattern: 'accept', aliases: ['approve'], react: '✅', category: 'group', description: 'Accept a pending join request' },
async (from, Gifted, conText) => {
  const { reply, react, args, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  if (!args[0]) return reply(await t('group.accept_usage', { prefix: botPrefix }, lang));
  try {
    const jid = `${args[0].replace(/\D/g,'')}@s.whatsapp.net`;
    await Gifted.groupRequestParticipantsUpdate(from, [jid], 'approve');
    await react('✅');
    return reply(await t('group.accepted', { user: jid.split('@')[0] }, lang), { mentions: [jid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── reject ───────────────────────────────────────────────────
gmd({ pattern: 'reject', aliases: ['decline'], react: '❌', category: 'group', description: 'Reject a pending join request' },
async (from, Gifted, conText) => {
  const { reply, react, args, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  if (!args[0]) return reply(await t('group.reject_usage', { prefix: botPrefix }, lang));
  try {
    const jid = `${args[0].replace(/\D/g,'')}@s.whatsapp.net`;
    await Gifted.groupRequestParticipantsUpdate(from, [jid], 'reject');
    await react('✅');
    return reply(await t('group.rejected', { user: jid.split('@')[0] }, lang), { mentions: [jid] });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── acceptall ────────────────────────────────────────────────
gmd({ pattern: 'acceptall', aliases: ['approveall'], react: '✅', category: 'group', description: 'Accept all pending join requests' },
async (from, Gifted, conText) => {
  const { reply, react, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    const pending = await Gifted.groupRequestParticipantsList(from);
    if (!pending?.length) { await react('📭'); return reply(await t('group.noPending', {}, lang)); }
    await Gifted.groupRequestParticipantsUpdate(from, pending.map(r => r.jid), 'approve');
    await react('✅');
    return reply(await t('group.acceptedAll', { count: pending.length }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── rejectall ────────────────────────────────────────────────
gmd({ pattern: 'rejectall', aliases: ['declineall'], react: '❌', category: 'group', description: 'Reject all pending join requests' },
async (from, Gifted, conText) => {
  const { reply, react, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    const pending = await Gifted.groupRequestParticipantsList(from);
    if (!pending?.length) { await react('📭'); return reply(await t('group.noPending', {}, lang)); }
    await Gifted.groupRequestParticipantsUpdate(from, pending.map(r => r.jid), 'reject');
    await react('✅');
    return reply(await t('group.rejectedAll', { count: pending.length }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── resetlink ────────────────────────────────────────────────
gmd({ pattern: 'resetlink', aliases: ['revoke','newlink','revokelink'], react: '🔄', category: 'group', description: 'Reset the group invite link' },
async (from, Gifted, conText) => {
  const { reply, react, mek, botName, newsletterJid, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    await Gifted.groupRevokeInvite(from);
    const code = await Gifted.groupInviteCode(from);
    const link = `https://chat.whatsapp.com/${code}`;
    const meta = await Gifted.groupMetadata(from);
    const text = await t('group.linkReset', { group: meta.subject, members: meta.participants.length, link }, lang);
    await react('✅');
    await Gifted.sendMessage(from, { text, contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:0 } } }, { quoted: mek });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── left ─────────────────────────────────────────────────────
gmd({ pattern: 'left', aliases: ['leave','exitgroup','exitgc'], react: '👋', category: 'group', description: 'Bot leaves the group' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, mek, botName, newsletterJid, lang } = conText;
  if (!conText.isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  try {
    const text = await t('group.leftGroup', { bot: botName }, lang);
    await Gifted.sendMessage(from, { text, contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:0 } } }, { quoted: mek });
    await new Promise(r => setTimeout(r, 1000));
    await Gifted.groupLeave(from);
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── listrequests ─────────────────────────────────────────────
gmd({ pattern: 'listrequests', aliases: ['joinrequests','pendingrequests'], react: '📋', category: 'group', description: 'List all pending join requests' },
async (from, Gifted, conText) => {
  const { reply, react, mek, botName, newsletterJid, lang } = conText;
  if (!await guardGroup(conText)) return;
  try {
    const pending = await Gifted.groupRequestParticipantsList(from);
    if (!pending?.length) { await react('📭'); return reply(await t('group.noPending', {}, lang)); }
    const resolved = await Promise.all(pending.map(async r => {
      let jid = r.jid;
      if (jid.endsWith('@lid')) { const c = getLidMapping(jid); if (c) jid = c; else if (Gifted.getJidFromLid) { try { const x = await Gifted.getJidFromLid(jid); if (x) jid = x; } catch {} } }
      return jid;
    }));
    const list   = resolved.map((jid, i) => `${i+1}. @${jid.split('@')[0]}`).join('\n');
    const title  = await t('group.pendingTitle', {}, lang);
    const footer = await t('group.pendingFooter', {}, lang);
    await react('✅');
    await Gifted.sendMessage(from, { text: `${title}\n\n📊 Total: *${pending.length}*\n\n${list}\n\n${footer}`, mentions: resolved, contextInfo: { forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:0 } } }, { quoted: mek });
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── groupname ────────────────────────────────────────────────
gmd({ pattern: 'groupname', aliases: ['gcname','setgroupname'], react: '✏️', category: 'group', description: 'Change group name' },
async (from, Gifted, conText) => {
  const { reply, react, q, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  if (!q) return reply(await t('group.groupname_usage', { prefix: botPrefix }, lang));
  try {
    await Gifted.groupUpdateSubject(from, q);
    await react('✅');
    return reply(await t('group.nameChanged', { name: q }, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── gcdesc ───────────────────────────────────────────────────
gmd({ pattern: 'gcdesc', aliases: ['groupdesc','setgroupdesc'], react: '📝', category: 'group', description: 'Change group description' },
async (from, Gifted, conText) => {
  const { reply, react, q, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  if (!q) return reply(await t('group.gcdesc_usage', { prefix: botPrefix }, lang));
  try {
    await Gifted.groupUpdateDescription(from, q);
    await react('✅');
    return reply(await t('group.descChanged', {}, lang));
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── everyone ─────────────────────────────────────────────────
gmd({ pattern: 'everyone', aliases: ['tag','all','mention'], react: '📢', category: 'group', description: 'Tag everyone in the group' },
async (from, Gifted, conText) => {
  const { reply, isAdmin, isSuperAdmin, isGroup, mek, q, participants, sender, botName, newsletterJid, lang } = conText;
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isAdmin && !isSuperAdmin) { const u = sender.split('@')[0]; return reply(await t('group.everyone_adminOnly', { user: u }, lang), { mentions: [`${u}@s.whatsapp.net`] }); }
  const jids = participants.map(p => { const j = typeof p==='string'?p:p.id||p.jid||p.pn||''; return j?(j.includes('@')?j:`${j}@s.whatsapp.net`):null; }).filter(Boolean);
  try { await Gifted.sendMessage(from, { text: `@${from}`, contextInfo: { mentionedJid: jids, groupMentions: [{ groupJid: from, groupSubject: q||'everyone' }], forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } }, { quoted: mek }); }
  catch (e) { return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── hidetag ──────────────────────────────────────────────────
gmd({ pattern: 'hidetag', aliases: ['htag','hidden'], react: '📢', category: 'group', description: 'Tag everyone secretly' },
async (from, Gifted, conText) => {
  const { reply, isAdmin, isSuperAdmin, isGroup, mek, q, participants, sender, quotedMsg, botName, newsletterJid, botPrefix, lang } = conText;
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isAdmin && !isSuperAdmin) { const u = sender.split('@')[0]; return reply(await t('group.hidetag_adminOnly', { user: u }, lang), { mentions: [`${u}@s.whatsapp.net`] }); }
  const text = q||quotedMsg?.conversation||quotedMsg?.extendedTextMessage?.text||quotedMsg?.imageMessage?.caption||'';
  if (!text) return reply(await t('group.hidetag_provide', { example: botPrefix }, lang));
  const jids = participants.map(p => { const j = typeof p==='string'?p:p.id||p.jid||p.pn||''; return j?(j.includes('@')?j:`${j}@s.whatsapp.net`):null; }).filter(Boolean);
  try { await Gifted.sendMessage(from, { text, contextInfo: { mentionedJid: jids, forwardingScore:1, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } }, { quoted: mek }); }
  catch (e) { return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── tagall ───────────────────────────────────────────────────
gmd({ pattern: 'tagall', aliases: ['mentionall'], react: '📢', category: 'group', description: 'Tag all group members' },
async (from, Gifted, conText) => {
  const { reply, react, isAdmin, isSuperAdmin, isGroup, isSuperUser, mek, sender, q, botName, lang } = conText;
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply(await t('general.adminOnly', {}, lang));
  try {
    const meta = await Gifted.groupMetadata(from);
    const sa=[],ad=[],mb=[];
    for (const p of meta.participants) {
      if (p.admin==='superadmin') sa.push(p.id); else if (p.admin==='admin') ad.push(p.id); else mb.push(p.id);
    }
    const all = [...sa,...ad,...mb];
    const byLbl = lang==='fr'?'Par':'By'; const tagLbl = lang==='fr'?'Membres taguées':'Tagged Members';
    let text = `*${botName} TAGALL*\n\n${q?`*Message:* ${q}\n\n`:''} *${byLbl}:* @${sender.split('@')[0]}\n\n*${tagLbl}:*\n`;
    for (const id of sa) text += `👑 @${id.split('@')[0]}\n`;
    for (const id of ad) text += `👮 @${id.split('@')[0]}\n`;
    for (const id of mb) text += `👤 @${id.split('@')[0]}\n`;
    await Gifted.sendMessage(from, { text: text.trim(), mentions: [...all, sender] }, { quoted: mek });
    await react('✅');
  } catch (e) { return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── tagadmins ────────────────────────────────────────────────
gmd({ pattern: 'tagadmins', aliases: ['taggcadmins','taggroupadmins'], react: '👮', category: 'group', description: 'Tag all group admins' },
async (from, Gifted, conText) => {
  const { reply, react, isAdmin, isSuperAdmin, isGroup, isSuperUser, mek, sender, q, botName, lang } = conText;
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply(await t('general.adminOnly', {}, lang));
  try {
    const meta = await Gifted.groupMetadata(from);
    const sa = meta.participants.filter(p => p.admin==='superadmin').map(p=>p.id);
    const ad = meta.participants.filter(p => p.admin==='admin').map(p=>p.id);
    const all = [...sa,...ad];
    if (!all.length) { await react('❌'); return reply(await t('group.noAdminsFound', {}, lang)); }
    const byLbl = lang==='fr'?'Par':'By'; const tagLbl = lang==='fr'?'Admins taguées':'Tagged Admins';
    let text = `*${botName} TAG ADMINS*\n\n${q?`*Message:* ${q}\n\n`:''} *${byLbl}:* @${sender.split('@')[0]}\n\n*${tagLbl}:*\n`;
    for (const id of sa) text += `👑 @${id.split('@')[0]}\n`;
    for (const id of ad) text += `👮 @${id.split('@')[0]}\n`;
    await Gifted.sendMessage(from, { text: text.trim(), mentions: [...all, sender] }, { quoted: mek });
    await react('✅');
  } catch (e) { return reply(await t('errors.generic', { error: e.message }, lang)); }
});

// ─── antipromote ──────────────────────────────────────────────
gmd({ pattern: 'antipromote', react: '🛡️', category: 'group', description: 'Toggle anti-promote protection' },
async (from, Gifted, conText) => {
  const { reply, react, args, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  const action = args[0]?.toLowerCase();
  const cur = await getGroupSetting(from, 'ANTIPROMOTE');
  if (!action || !['on','off'].includes(action)) {
    const status = cur==='true'?'ON ✅':'OFF ❌';
    return reply(await t('group.antiPromote_status', { status, prefix: botPrefix }, lang));
  }
  const val = action==='on'?'true':'false';
  if (cur===val) return reply(await t(val==='true'?'settings.alreadyOn':'settings.alreadyOff', { key: 'Anti-Promote' }, lang));
  await setGroupSetting(from, 'ANTIPROMOTE', val);
  await react('✅');
  return reply(await t(action==='on'?'group.antiPromoteOn':'group.antiPromoteOff', {}, lang));
});

// ─── antidemote ───────────────────────────────────────────────
gmd({ pattern: 'antidemote', react: '🛡️', category: 'group', description: 'Toggle anti-demote protection' },
async (from, Gifted, conText) => {
  const { reply, react, args, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  const action = args[0]?.toLowerCase();
  const cur = await getGroupSetting(from, 'ANTIDEMOTE');
  if (!action || !['on','off'].includes(action)) {
    const status = cur==='true'?'ON ✅':'OFF ❌';
    return reply(await t('group.antiDemote_status', { status, prefix: botPrefix }, lang));
  }
  const val = action==='on'?'true':'false';
  if (cur===val) return reply(await t(val==='true'?'settings.alreadyOn':'settings.alreadyOff', { key: 'Anti-Demote' }, lang));
  await setGroupSetting(from, 'ANTIDEMOTE', val);
  await react('✅');
  return reply(await t(action==='on'?'group.antiDemoteOn':'group.antiDemoteOff', {}, lang));
});

// ─── antigroupmention ─────────────────────────────────────────
gmd({ pattern: 'antigroupmention', aliases: ['antigcmention','antimentiongroup'], react: '🛡️', category: 'group', description: 'Toggle anti-group-mention protection' },
async (from, Gifted, conText) => {
  const { reply, react, q, botPrefix, lang } = conText;
  if (!await guardGroup(conText)) return;
  const arg = q?.toLowerCase()?.trim();
  const cur = await getGroupSetting(from, 'ANTIGROUPMENTION');
  if (!arg) {
    const status = (!cur||cur==='false'||cur==='off')?'OFF':`ON (${cur})`;
    return reply(await t('group.antiGcMention_status', { status, prefix: botPrefix }, lang));
  }
  let val, msgKey;
  if (['on','true','warn'].includes(arg))    { val='warn';  msgKey='group.antiGcMentionWarn'; }
  else if (arg==='delete')                   { val='delete';msgKey='group.antiGcMentionDelete'; }
  else if (arg==='kick')                     { val='kick';  msgKey='group.antiGcMentionKick'; }
  else if (['off','false'].includes(arg))    { val='false'; msgKey='group.antiGcMentionOff'; }
  else { await react('❌'); return reply(await t('group.antiGcMentionInvalid', {}, lang)); }
  await setGroupSetting(from, 'ANTIGROUPMENTION', val);
  await react('✅');
  return reply(await t(msgKey, {}, lang));
});

// ─── togroupstatus ────────────────────────────────────────────
gmd({ pattern: 'togroupstatus', aliases: ['groupstatus','togcstatus'], react: '📢', category: 'group', description: 'Send text or media to group status' },
async (from, Gifted, conText) => {
  const { reply, react, isSuperUser, isGroup, q, quoted, quotedMsg, formatAudio, formatVideo, botPrefix, lang } = conText;
  const { downloadMediaMessage } = require('gifted-baileys');
  if (!isGroup) return reply(await t('general.groupOnly', {}, lang));
  if (!isSuperUser) return reply(await t('general.superUserOnly', {}, lang));
  if (!q && !quotedMsg) return reply(await t('group.togroupstatus_usage', { prefix: botPrefix }, lang));
  try {
    let payload = {};
    if (quotedMsg) {
      if (quoted?.imageMessage) { const buf=await downloadMediaMessage({message:quotedMsg},'buffer',{}); payload={image:buf,mimetype:'image/jpeg'}; if(q) payload.caption=q; }
      else if (quoted?.videoMessage) { let buf=await downloadMediaMessage({message:quotedMsg},'buffer',{}); buf=await formatVideo(buf); payload={video:buf,mimetype:'video/mp4'}; if(q) payload.caption=q; }
      else if (quoted?.audioMessage) { let buf=await downloadMediaMessage({message:quotedMsg},'buffer',{}); buf=await formatAudio(buf); payload={audio:buf,mimetype:'audio/mp4',ptt:true}; }
      else { payload.text=q||''; }
    } else { payload.text=q; }
    await Gifted.giftedStatus.sendGroupStatus(from, payload);
    await react('✅');
  } catch (e) { await react('❌'); return reply(await t('errors.generic', { error: e.message }, lang)); }
});
