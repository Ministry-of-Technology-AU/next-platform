'use strict';

var utils = require('@strapi/utils');

const settingsSchema = utils.yup.object({
    aiLocalizations: utils.yup.boolean().default(false)
});
var validateSettings = utils.validateYupSchema(settingsSchema);

module.exports = validateSettings;
//# sourceMappingURL=settings.js.map
