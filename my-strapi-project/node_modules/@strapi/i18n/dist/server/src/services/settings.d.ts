import type { Core } from '@strapi/types';
import type { Settings } from '../validation/settings';
declare const createSettingsService: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    getSettings: () => Promise<import("yup/lib/object").AssertsShape<{
        aiLocalizations: import("yup").BooleanSchema<boolean, Record<string, any>, boolean>;
    }> | null>;
    setSettings: (value: Settings) => Promise<void>;
};
export { createSettingsService };
export type SettingsService = ReturnType<typeof createSettingsService>;
//# sourceMappingURL=settings.d.ts.map