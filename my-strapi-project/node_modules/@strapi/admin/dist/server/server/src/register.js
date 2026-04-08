'use strict';

var serveAdminPanel = require('./routes/serve-admin-panel.js');
var admin = require('./strategies/admin.js');
var apiToken = require('./strategies/api-token.js');

var register = (({ strapi })=>{
    const passportMiddleware = strapi.service('admin::passport').init();
    strapi.server.api('admin').use(passportMiddleware);
    strapi.get('auth').register('admin', admin.default);
    strapi.get('auth').register('content-api', apiToken.default);
    const shouldServeAdminPanel = strapi.config.get('admin.serveAdminPanel');
    if (shouldServeAdminPanel) {
        serveAdminPanel({
            strapi
        });
    }
});

module.exports = register;
//# sourceMappingURL=register.js.map
