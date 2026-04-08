'use strict';

var index = require('../utils/index.js');
var settings$1 = require('../validation/settings.js');

var settings = {
    async updateSettings (ctx) {
        const { request: { body } } = ctx;
        const data = await settings$1(body);
        await index.getService('settings').setSettings(data);
        ctx.body = {
            data
        };
    },
    async getSettings (ctx) {
        const data = await index.getService('settings').getSettings();
        ctx.body = {
            data
        };
    }
};

module.exports = settings;
//# sourceMappingURL=settings.js.map
