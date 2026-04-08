'use strict';

var constants = require('./services/constants.js');

var config;
var hasRequiredConfig;
function requireConfig() {
    if (hasRequiredConfig) return config;
    hasRequiredConfig = 1;
    const { DEFAULT_ACCESS_TOKEN_LIFESPAN, DEFAULT_MAX_REFRESH_TOKEN_LIFESPAN, DEFAULT_IDLE_REFRESH_TOKEN_LIFESPAN, DEFAULT_MAX_SESSION_LIFESPAN, DEFAULT_IDLE_SESSION_LIFESPAN } = constants.__require();
    config = {
        default: ({ env })=>({
                jwtSecret: env('JWT_SECRET'),
                jwt: {
                    expiresIn: '30d'
                },
                /**
	     * JWT management mode for the Content API authentication
	     * - "legacy-support": use plugin JWTs (backward compatible)
	     * - "refresh": use SessionManager (access/refresh tokens)
	     */ jwtManagement: 'legacy-support',
                sessions: {
                    accessTokenLifespan: DEFAULT_ACCESS_TOKEN_LIFESPAN,
                    maxRefreshTokenLifespan: DEFAULT_MAX_REFRESH_TOKEN_LIFESPAN,
                    idleRefreshTokenLifespan: DEFAULT_IDLE_REFRESH_TOKEN_LIFESPAN,
                    maxSessionLifespan: DEFAULT_MAX_SESSION_LIFESPAN,
                    idleSessionLifespan: DEFAULT_IDLE_SESSION_LIFESPAN,
                    httpOnly: false
                },
                ratelimit: {
                    interval: 60000,
                    max: 10
                },
                layout: {
                    user: {
                        actions: {
                            create: 'contentManagerUser.create',
                            update: 'contentManagerUser.update'
                        }
                    }
                },
                callback: {
                    validate (callback, provider) {
                        let uCallback;
                        let uProviderCallback;
                        try {
                            uCallback = new URL(callback);
                            uProviderCallback = new URL(provider.callback);
                        } catch  {
                            throw new Error('The callback is not a valid URL');
                        }
                        // Make sure the different origin matches
                        if (uCallback.origin !== uProviderCallback.origin) {
                            throw new Error(`Forbidden callback provided: origins don't match. Please verify your config.`);
                        }
                        // Make sure the different pathname matches
                        if (uCallback.pathname !== uProviderCallback.pathname) {
                            throw new Error(`Forbidden callback provided: pathname don't match. Please verify your config.`);
                        }
                    // NOTE: We're not checking the search parameters on purpose to allow passing different states
                    }
                }
            }),
        validator () {}
    };
    return config;
}

exports.__require = requireConfig;
//# sourceMappingURL=config.js.map
