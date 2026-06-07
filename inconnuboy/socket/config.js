
const pino = require('pino');
const NodeCache = require('node-cache');
const { makeCacheableSignalKeyStore, Browsers } = require('gifted-baileys');
const { cachedGroupMetadata } = require('./cache');

const _userDevicesCache = new NodeCache({ stdTTL: 1800, useClones: false });

const createSocketConfig = (version, state, logger) => {
    return {
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        cachedGroupMetadata,
        userDevicesCache: _userDevicesCache,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        fireInitQueries: true,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        generateHighQualityLinkPreview: false,
        getMessage: async () => undefined,
        emitOwnEvents: true,
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        }
    };
};

module.exports = { createSocketConfig };
