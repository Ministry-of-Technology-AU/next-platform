var constants;
var hasRequiredConstants;
function requireConstants() {
    if (hasRequiredConstants) return constants;
    hasRequiredConstants = 1;
    constants = {
        DEFAULT_ACCESS_TOKEN_LIFESPAN: 10 * 60,
        DEFAULT_MAX_REFRESH_TOKEN_LIFESPAN: 30 * 24 * 60 * 60,
        DEFAULT_IDLE_REFRESH_TOKEN_LIFESPAN: 14 * 24 * 60 * 60,
        DEFAULT_MAX_SESSION_LIFESPAN: 1 * 24 * 60 * 60,
        DEFAULT_IDLE_SESSION_LIFESPAN: 2 * 60 * 60
    };
    return constants;
}

export { requireConstants as __require };
//# sourceMappingURL=constants.mjs.map
