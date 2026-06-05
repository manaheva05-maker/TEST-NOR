/**
 * INCONNU XD V3 — i18n (multi-language helper)
 *
 * Supported languages:
 *   en  → English
 *   fr  → French
 *   cr  → Créole       (JSON à créer: inconnu/cr.json)
 *   es  → Espagnol     (JSON à créer: inconnu/es.json)
 *   pt  → Portugais    (JSON à créer: inconnu/pt.json)
 *   hi  → Hindi        (JSON à créer: inconnu/hi.json)
 *   si  → Sinhala      (JSON à créer: inconnu/si.json)
 *
 * Usage: const { t, ts, LANGS } = require('../Lib/i18n');
 */
const path = require('path');

/** All supported language codes */
const LANGS = ['en', 'fr', 'cr', 'es', 'pt', 'hi', 'si'];

/** Human-readable language names */
const LANG_NAMES = {
    en: 'English 🇬🇧',
    fr: 'Français 🇫🇷',
    cr: 'Créole 🌴',
    es: 'Español 🇪🇸',
    pt: 'Português 🇧🇷',
    hi: 'हिन्दी 🇮🇳',
    si: 'සිංහල 🇱🇰',
};

const _cache = {};

/**
 * Load language file. Falls back to 'en' if the file doesn't exist yet.
 * This lets you add a new language JSON without breaking the bot.
 */
const _load = (lang) => {
    if (_cache[lang]) return _cache[lang];
    try {
        _cache[lang] = require(path.join(__dirname, `../inconnu/${lang}.json`));
    } catch {
        // File not created yet — silently fall back to English
        if (lang !== 'en') {
            _cache[lang] = _load('en');
        } else {
            _cache[lang] = {};
        }
    }
    return _cache[lang];
};

/** Resolve a dot-path key inside a strings object */
const _resolve = (strings, key) => {
    const parts = key.split('.');
    let v = strings;
    for (const p of parts) {
        v = v?.[p];
        if (v === undefined) break;
    }
    return typeof v === 'string' ? v : null;
};

/** Replace {variable} placeholders */
const _fill = (str, vars) =>
    str.replace(/\{(\w+)\}/g, (_, k) =>
        vars[k] !== undefined ? vars[k] : `{${k}}`
    );

/**
 * Async version — reads LANGUAGE from DB automatically.
 * Use this inside async command handlers.
 */
const t = async (key, vars = {}, forceLang = null) => {
    let lang = forceLang;
    if (!lang) {
        try {
            const { getSetting } = require('../inconnuboy/store/settings');
            const s = await getSetting('LANGUAGE');
            lang = s && LANGS.includes(s) ? s : 'en';
        } catch {
            lang = 'en';
        }
    }
    // Try requested lang → fallback to 'en'
    const str =
        _resolve(_load(lang), key) ??
        _resolve(_load('en'), key) ??
        key;
    return _fill(str, vars);
};

/**
 * Sync version — pass lang explicitly.
 * Use this for menu builders and sync contexts.
 */
const ts = (key, vars = {}, lang = 'en') => {
    const str =
        _resolve(_load(lang), key) ??
        _resolve(_load('en'), key) ??
        key;
    return _fill(str, vars);
};

/** Get the full strings object for a language */
const getStrings = (lang = 'en') => _load(lang);

/** Clear the lang cache (useful after hot-reloading a JSON file) */
const clearCache = (lang = null) => {
    if (lang) delete _cache[lang];
    else Object.keys(_cache).forEach(k => delete _cache[k]);
};

module.exports = { t, ts, getStrings, clearCache, LANGS, LANG_NAMES };
