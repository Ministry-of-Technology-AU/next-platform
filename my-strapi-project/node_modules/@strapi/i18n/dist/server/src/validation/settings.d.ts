import { yup } from '@strapi/utils';
declare const settingsSchema: import("yup/lib/object").OptionalObjectSchema<{
    aiLocalizations: yup.BooleanSchema<boolean, Record<string, any>, boolean>;
}, Record<string, any>, import("yup/lib/object").TypeOfShape<{
    aiLocalizations: yup.BooleanSchema<boolean, Record<string, any>, boolean>;
}>>;
declare const _default: (body: unknown, errorMessage?: string | undefined) => Promise<import("yup/lib/object").AssertsShape<{
    aiLocalizations: yup.BooleanSchema<boolean, Record<string, any>, boolean>;
}>>;
export default _default;
export type Settings = yup.InferType<typeof settingsSchema>;
//# sourceMappingURL=settings.d.ts.map