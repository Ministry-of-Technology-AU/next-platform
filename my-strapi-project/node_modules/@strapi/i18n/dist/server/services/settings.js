'use strict';

const createSettingsService = ({ strapi })=>{
    const settings = strapi.store({
        type: 'plugin',
        name: 'i18n',
        key: 'settings'
    });
    async function getSettings() {
        const res = await settings.get({});
        return res;
    }
    function setSettings(value) {
        return settings.set({
            value
        });
    }
    return {
        getSettings,
        setSettings
    };
};

exports.createSettingsService = createSettingsService;
//# sourceMappingURL=settings.js.map
