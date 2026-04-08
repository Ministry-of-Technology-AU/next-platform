import { Cloud } from '@strapi/icons';
import { Initializer } from './components/Initializer.mjs';
import { pluginId } from './pluginId.mjs';
import { prefixPluginTranslations } from './utils/prefixPluginTranslations.mjs';

function __variableDynamicImportRuntime1__(path) {
  switch (path) {
    case './translations/en.json': return import('./translations/en.json.mjs');
    case './translations/es.json': return import('./translations/es.json.mjs');
    case './translations/fr.json': return import('./translations/fr.json.mjs');
    case './translations/it.json': return import('./translations/it.json.mjs');
    case './translations/ru.json': return import('./translations/ru.json.mjs');
    case './translations/uk.json': return import('./translations/uk.json.mjs');
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
                to: `plugins/${pluginId}`,
                icon: Cloud,
                intlLabel: {
                    id: `${pluginId}.Plugin.name`,
                    defaultMessage: pluginName
                },
                Component: async ()=>{
                    const { App } = await import('./pages/App.mjs');
                    return App;
                }
            });
            const plugin = {
                id: pluginId,
                initializer: Initializer,
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
                    data: prefixPluginTranslations(data, pluginId),
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

export { index as default };
//# sourceMappingURL=index.mjs.map
