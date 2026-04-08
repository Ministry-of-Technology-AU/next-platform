'use strict';

var require$$0 = require('crypto');
var require$$1 = require('bcryptjs');
var require$$2 = require('url-join');
var require$$1$1 = require('@strapi/utils');
var require$$0$1 = require('lodash/fp');
var index = require('../utils/index.js');

var user;
var hasRequiredUser;
function requireUser() {
    if (hasRequiredUser) return user;
    hasRequiredUser = 1;
    /**
	 * User.js service
	 *
	 * @description: A set of functions similar to controller's actions to avoid code duplication.
	 */ const crypto = require$$0;
    const bcrypt = require$$1;
    const urlJoin = require$$2;
    const { sanitize } = require$$1$1;
    const { toNumber, getOr } = require$$0$1;
    const { getService } = index.__require();
    const USER_MODEL_UID = 'plugin::users-permissions.user';
    const getSessionManager = ()=>{
        const manager = strapi.sessionManager;
        return manager ?? null;
    };
    user = ({ strapi: strapi1 })=>({
            /**
	   * Promise to count users
	   *
	   * @return {Promise}
	   */ count (params) {
                return strapi1.db.query(USER_MODEL_UID).count({
                    where: params
                });
            },
            /**
	   * Hashes password fields in the provided values object if they are present.
	   * It checks each key in the values object against the model's attributes and
	   * hashes it if the attribute type is 'password',
	   *
	   * @param {object} values - The object containing the fields to be hashed.
	   * @return {object} The values object with hashed password fields if they were present.
	   */ async ensureHashedPasswords (values) {
                const attributes = strapi1.getModel(USER_MODEL_UID).attributes;
                for(const key in values){
                    if (attributes[key] && attributes[key].type === 'password') {
                        // Check if a custom encryption.rounds has been set on the password attribute
                        const rounds = toNumber(getOr(10, 'encryption.rounds', attributes[key]));
                        values[key] = await bcrypt.hash(values[key], rounds);
                    }
                }
                return values;
            },
            /**
	   * Promise to add a/an user.
	   * @return {Promise}
	   */ async add (values) {
                return strapi1.db.query(USER_MODEL_UID).create({
                    data: await this.ensureHashedPasswords(values),
                    populate: [
                        'role'
                    ]
                });
            },
            /**
	   * Promise to edit a/an user.
	   * @param {string} userId
	   * @param {object} params
	   * @return {Promise}
	   */ async edit (userId, params = {}) {
                return strapi1.db.query(USER_MODEL_UID).update({
                    where: {
                        id: userId
                    },
                    data: await this.ensureHashedPasswords(params),
                    populate: [
                        'role'
                    ]
                });
            },
            /**
	   * Promise to fetch a/an user.
	   * @return {Promise}
	   */ fetch (id, params) {
                const query = strapi1.get('query-params').transform(USER_MODEL_UID, params ?? {});
                return strapi1.db.query(USER_MODEL_UID).findOne({
                    ...query,
                    where: {
                        $and: [
                            {
                                id
                            },
                            query.where || {}
                        ]
                    }
                });
            },
            /**
	   * Promise to fetch authenticated user.
	   * @return {Promise}
	   */ fetchAuthenticatedUser (id) {
                return strapi1.db.query(USER_MODEL_UID).findOne({
                    where: {
                        id
                    },
                    populate: [
                        'role'
                    ]
                });
            },
            /**
	   * Promise to fetch all users.
	   * @return {Promise}
	   */ fetchAll (params) {
                const query = strapi1.get('query-params').transform(USER_MODEL_UID, params ?? {});
                return strapi1.db.query(USER_MODEL_UID).findMany(query);
            },
            /**
	   * Promise to remove a/an user.
	   * @return {Promise}
	   */ async remove (params) {
                // Invalidate sessions for all affected users
                const sessionManager = getSessionManager();
                if (sessionManager && sessionManager.hasOrigin('users-permissions') && params.id) {
                    await sessionManager('users-permissions').invalidateRefreshToken(String(params.id));
                }
                return strapi1.db.query(USER_MODEL_UID).delete({
                    where: params
                });
            },
            validatePassword (password, hash) {
                return bcrypt.compare(password, hash);
            },
            async sendConfirmationEmail (user) {
                const userPermissionService = getService('users-permissions');
                const pluginStore = await strapi1.store({
                    type: 'plugin',
                    name: 'users-permissions'
                });
                const userSchema = strapi1.getModel(USER_MODEL_UID);
                const settings = await pluginStore.get({
                    key: 'email'
                }).then((storeEmail)=>storeEmail.email_confirmation.options);
                // Sanitize the template's user information
                const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput({
                    schema: userSchema,
                    getModel: strapi1.getModel.bind(strapi1)
                }, user);
                const confirmationToken = crypto.randomBytes(20).toString('hex');
                await this.edit(user.id, {
                    confirmationToken
                });
                const apiPrefix = strapi1.config.get('api.rest.prefix');
                try {
                    settings.message = await userPermissionService.template(settings.message, {
                        URL: urlJoin(strapi1.config.get('server.absoluteUrl'), apiPrefix, '/auth/email-confirmation'),
                        SERVER_URL: strapi1.config.get('server.absoluteUrl'),
                        ADMIN_URL: strapi1.config.get('admin.absoluteUrl'),
                        USER: sanitizedUserInfo,
                        CODE: confirmationToken
                    });
                    settings.object = await userPermissionService.template(settings.object, {
                        USER: sanitizedUserInfo
                    });
                } catch  {
                    strapi1.log.error('[plugin::users-permissions.sendConfirmationEmail]: Failed to generate a template for "user confirmation email". Please make sure your email template is valid and does not contain invalid characters or patterns');
                    return;
                }
                // Send an email to the user.
                await strapi1.plugin('email').service('email').send({
                    to: user.email,
                    from: settings.from.email && settings.from.name ? `${settings.from.name} <${settings.from.email}>` : undefined,
                    replyTo: settings.response_email,
                    subject: settings.object,
                    text: settings.message,
                    html: settings.message
                });
            }
        });
    return user;
}

exports.__require = requireUser;
//# sourceMappingURL=user.js.map
