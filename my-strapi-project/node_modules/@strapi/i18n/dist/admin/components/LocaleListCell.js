'use strict';

var jsxRuntime = require('react/jsx-runtime');
var strapiAdmin = require('@strapi/admin/strapi-admin');
var designSystem = require('@strapi/design-system');
var qs = require('qs');
var reactIntl = require('react-intl');
var reactRouterDom = require('react-router-dom');
var locales = require('../services/locales.js');
var getTranslation = require('../utils/getTranslation.js');

const LocaleListCell = ({ locale: currentLocale, localizations, documentId })=>{
    const { locale: language, formatMessage } = reactIntl.useIntl();
    const { data: locales$1 = [] } = locales.useGetLocalesQuery();
    const navigate = reactRouterDom.useNavigate();
    const [{ query }] = strapiAdmin.useQueryParams();
    const formatter = designSystem.useCollator(language, {
        sensitivity: 'base'
    });
    if (!Array.isArray(locales$1) || !localizations) {
        return null;
    }
    const availableLocales = localizations.map((loc)=>loc.locale);
    const localesForDocument = locales$1.reduce((acc, locale)=>{
        const createdLocale = [
            currentLocale,
            ...availableLocales
        ].find((loc)=>{
            return loc === locale.code;
        });
        if (createdLocale) {
            const name = locale.isDefault ? `${locale.name} (default)` : locale.name;
            acc.push({
                code: locale.code,
                name
            });
        }
        return acc;
    }, []).toSorted((a, b)=>formatter.compare(a.name, b.name));
    const getDisplayText = ()=>{
        const displayedLocales = localesForDocument.slice(0, 2);
        const remainingCount = localesForDocument.length - 2;
        const baseText = displayedLocales.map(({ name })=>name).join(', ');
        if (remainingCount <= 0) {
            return baseText;
        }
        return formatMessage({
            id: getTranslation.getTranslation('CMListView.popover.display-locales.more'),
            defaultMessage: '{locales} + {count} more'
        }, {
            locales: baseText,
            count: remainingCount
        });
    };
    const handleLocaleClick = (localeCode)=>{
        navigate({
            pathname: documentId,
            search: qs.stringify({
                plugins: {
                    ...query.plugins,
                    i18n: {
                        locale: localeCode
                    }
                }
            })
        });
    };
    return /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Menu.Root, {
        children: [
            /*#__PURE__*/ jsxRuntime.jsx(designSystem.Menu.Trigger, {
                children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Flex, {
                    minWidth: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "regular",
                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                        textColor: "neutral800",
                        ellipsis: true,
                        marginRight: 2,
                        children: getDisplayText()
                    })
                })
            }),
            /*#__PURE__*/ jsxRuntime.jsx(designSystem.Menu.Content, {
                children: localesForDocument.map(({ code, name })=>/*#__PURE__*/ jsxRuntime.jsx(designSystem.Menu.Item, {
                        onClick: (e)=>{
                            e.stopPropagation();
                            handleLocaleClick(code);
                        },
                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                            textColor: "neutral800",
                            fontWeight: "regular",
                            children: name
                        })
                    }, code))
            })
        ]
    });
};

exports.LocaleListCell = LocaleListCell;
//# sourceMappingURL=LocaleListCell.js.map
