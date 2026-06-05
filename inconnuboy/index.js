const { evt, gmd, commands }   = require('./core/commands');
const config                   = require('../config');

// ── store ────────────────────────────────────────────────────
const { DATABASE, syncDatabase }                                                                 = require('./store/database');
const { loadPersistedLidMappings, persistLidMapping }                                            = require('./store/lidMapping');
const { UpdateDB, setCommitHash, getCommitHash }                                                 = require('./store/autoUpdate');
const { SudoDB, getSudoNumbers, setSudo, delSudo }                                               = require('./store/sudo');
const { SettingsDB, initializeSettings, getSetting, setSetting, getAllSettings,
        resetSetting, resetAllSettings, DEFAULT_SETTINGS }                                       = require('./store/settings');
const { GroupSettingsDB, initializeGroupSettings, getGroupSetting, setGroupSetting,
        getAllGroupSettings, resetGroupSetting, GROUP_SETTING_DEFAULTS }                         = require('./store/groupSettings');
const { saveAntiDelete, findAntiDelete, removeAntiDelete, startCleanup, SQLiteStore }            = require('./store/messageStore');

// ── core ─────────────────────────────────────────────────────
const { createContext, createContext2 }                                                          = require('./core/helpers');
const { getMediaBuffer, getFileContentType, bufferToStream,
        uploadToGiftedCdn, uploadToGithubCdn, uploadToPixhost,
        uploadToImgBB, uploadToCatbox }                                                          = require('./core/media');
const { logger, emojis, GiftedAutoReact, GiftedTechApi, GiftedApiKey,
        GiftedAntiLink, GiftedAntibad, GiftedAntiGroupMention,
        GiftedAutoBio, GiftedChatBot, GiftedPresence,
        GiftedAntiDelete, GiftedAnticall, GiftedAntiViewOnce, GiftedAntiEdit }                  = require('./core/features');
const { handleGameMessage }                                                                      = require('./core/gameEngine');
const { dBinary, eBinary, dBase, eBase, runtime, sleep, gmdFancy, stickerToImage,
        toAudio, toVideo, toPtt, formatVideo, formatAudio, monospace, formatBytes,
        gmdBuffer, gmdJson, latestWaVersion, gmdRandom, isUrl, gmdStore,
        isNumber, loadSession, useSQLiteAuthState, verifyJidState,
        runFFmpeg, getVideoDuration, gmdSticker, copyFolderSync,
        gitRepoRegex, MAX_MEDIA_SIZE, getFileSize, getMimeCategory,
        getMimeFromUrl, MIME_EXTENSIONS, getExtensionFromMime, isTextContent }                   = require('./core/utils');

// ── socket ───────────────────────────────────────────────────
const { groupCache, getGroupMetadata, updateGroupCache, deleteGroupCache,
        clearGroupCache, setupGroupCacheListeners, cachedGroupMetadata,
        initializeLidStore, getLidMapping }                                                      = require('./socket/cache');
const { createSocketConfig }                                                                     = require('./socket/config');
const { safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler,
        RECONNECT_DELAY, MAX_RECONNECT_ATTEMPTS }                                                = require('./socket/reconnect');
const { standardizeJid, serializeMessage, downloadMediaMessage }                                = require('./socket/serializer');

// ── plugins ──────────────────────────────────────────────────
const { loadPlugins, findCommand, findBodyCommand, createHelpers,
        getGroupInfo, buildSuperUsers }                                                          = require('./plugins/loader');

// ── events ───────────────────────────────────────────────────
const { setupGroupEventsListeners, getProfilePic, getDisplayNumber }                            = require('./events/groupEvents');

module.exports = {
    // core command engine
    evt, gmd, config, emojis, commands,

    // store
    syncDatabase, DATABASE,
    loadPersistedLidMappings, persistLidMapping,
    UpdateDB, setCommitHash, getCommitHash,
    SudoDB, getSudoNumbers, setSudo, delSudo,
    SettingsDB, initializeSettings, getSetting, setSetting, getAllSettings,
    resetSetting, resetAllSettings, DEFAULT_SETTINGS,
    GroupSettingsDB, initializeGroupSettings, getGroupSetting, setGroupSetting,
    getAllGroupSettings, resetGroupSetting, GROUP_SETTING_DEFAULTS,
    saveAntiDelete, findAntiDelete, removeAntiDelete, startCleanup, SQLiteStore,

    // core
    createContext, createContext2,
    GiftedTechApi, GiftedApiKey,
    getMediaBuffer, getFileContentType, bufferToStream,
    uploadToPixhost, uploadToImgBB, uploadToCatbox,
    uploadToGiftedCdn, uploadToGithubCdn,
    GiftedAutoReact, GiftedChatBot, GiftedAntiLink, GiftedAntibad,
    GiftedAntiGroupMention, GiftedAntiDelete, GiftedAnticall,
    GiftedPresence, GiftedAutoBio, GiftedAntiViewOnce, GiftedAntiEdit,
    handleGameMessage, logger,
    dBinary, eBinary, dBase, eBase,
    runtime, sleep, gmdFancy, GiftedUploader: undefined, stickerToImage,
    monospace, formatBytes, toAudio, toVideo, toPtt, formatVideo, formatAudio,
    gmdBuffer, webp2mp4File: undefined, gmdJson, latestWaVersion, gmdRandom,
    isUrl, gmdStore, isNumber, loadSession, useSQLiteAuthState, verifyJidState,
    runFFmpeg, getVideoDuration, gmdSticker, copyFolderSync,
    gitRepoRegex, MAX_MEDIA_SIZE, getFileSize, getMimeCategory,
    getMimeFromUrl, MIME_EXTENSIONS, getExtensionFromMime, isTextContent,

    // socket
    groupCache, getGroupMetadata, updateGroupCache, deleteGroupCache,
    clearGroupCache, setupGroupCacheListeners, cachedGroupMetadata,
    initializeLidStore, getLidMapping, createSocketConfig,
    safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler,
    RECONNECT_DELAY, MAX_RECONNECT_ATTEMPTS,
    standardizeJid, serializeMessage, downloadMediaMessage,

    // plugins
    loadPlugins, findCommand, findBodyCommand, createHelpers,
    getGroupInfo, buildSuperUsers,

    // events
    setupGroupEventsListeners, getProfilePic, getDisplayNumber,
};
