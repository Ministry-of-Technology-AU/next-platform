'use strict';

var icons = require('@strapi/icons');
var Initializer = require('./components/Initializer.js');
var pluginId = require('./pluginId.js');
var prefixPluginTranslations = require('./utils/prefixPluginTranslations.js');

function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, default: e }); }

function __variableDynamicImportRuntime1__(path) {
  switch (path) {
    case './translations/en.json': return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./translations/en.json.js')); });
    case './translations/es.json': return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./translations/es.json.js')); });
    case './translations/fr.json': return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./translations/fr.json.js')); });
    case './translations/it.json': return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./translations/it.json.js')); });
    case './translations/ru.json': return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./translations/ru.json.js')); });
    case './translations/uk.json': return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./translations/uk.json.js')); });
    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
   }
 }
const pluginName = 'Deploy';
// eslint-disable-next-line import/no-default-export
var index = {
    register (app) {
        const { backendURL } = window.strapi;
        // Only add the plugin menu link and registering it if the project is on development (localhost).
        if (backendURL?.includes('localhost')) {
            app.addMenuLink({
                to: `plugins/${pluginId.pluginId}`,
                icon: icons.Cloud,
                intlLabel: {
                    id: `${pluginId.pluginId}.Plugin.name`,
                    defaultMessage: pluginName
                },
                Component: async ()=>{
                    const { App } = await Promise.resolve().then(function () { return require('./pages/App.js'); });
                    return App;
                }
            });
            const plugin = {
                id: pluginId.pluginId,
                initializer: Initializer.Initializer,
                isReady: false,
                name: pluginName
            };
            app.registerPlugin(plugin);
        }
    },
    async registerTrads (app) {
        const { locales } = app;
        const importedTrads = await Promise.all(locales.map((locale)=>{
            return __variableDynamicImportRuntime1__(`./translations/${locale}.json`).then(({ default: data })=>{
                return {
                    data: prefixPluginTranslations.prefixPluginTranslations(data, pluginId.pluginId),
                    locale
                };
            }).catch(()=>{
                return {
                    data: {},
                    locale
                };
            });
        }));
        return Promise.resolve(importedTrads);
    }
};

module.exports = index;
//# sourceMappingURL=index.js.map
