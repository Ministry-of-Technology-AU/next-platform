import { getService } from '../utils/index.mjs';
import validateSettings from '../validation/settings.mjs';

var settings = {
    async updateSettings (ctx) {
        const { request: { body } } = ctx;
        const data = await validateSettings(body);
        await getService('settings').setSettings(data);
        ctx.body = {
            data
        };
    },
    async getSettings (ctx) {
        const data = await getService('settings').getSettings();
        ctx.body = {
            data
        };
    }
};

export { settings as default };
//# sourceMappingURL=settings.mjs.map
