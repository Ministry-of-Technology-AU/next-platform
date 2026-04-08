import { yup, validateYupSchema } from '@strapi/utils';

const settingsSchema = yup.object({
    aiLocalizations: yup.boolean().default(false)
});
var validateSettings = validateYupSchema(settingsSchema);

export { validateSettings as default };
//# sourceMappingURL=settings.mjs.map
