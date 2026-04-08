import { jsxs, jsx } from 'react/jsx-runtime';
import { useQueryParams } from '@strapi/admin/strapi-admin';
import { useCollator, Menu, Flex, Typography } from '@strapi/design-system';
import { stringify } from 'qs';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useGetLocalesQuery } from '../services/locales.mjs';
import { getTranslation } from '../utils/getTranslation.mjs';

const LocaleListCell = ({ locale: currentLocale, localizations, documentId })=>{
    const { locale: language, formatMessage } = useIntl();
    const { data: locales = [] } = useGetLocalesQuery();
    const navigate = useNavigate();
    const [{ query }] = useQueryParams();
    const formatter = useCollator(language, {
        sensitivity: 'base'
    });
    if (!Array.isArray(locales) || !localizations) {
        return null;
    }
    const availableLocales = localizations.map((loc)=>loc.locale);
    const localesForDocument = locales.reduce((acc, locale)=>{
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
            id: getTranslation('CMListView.popover.display-locales.more'),
            defaultMessage: '{locales} + {count} more'
        }, {
            locales: baseText,
            count: remainingCount
        });
    };
    const handleLocaleClick = (localeCode)=>{
        navigate({
            pathname: documentId,
            search: stringify({
                plugins: {
                    ...query.plugins,
                    i18n: {
                        locale: localeCode
                    }
                }
            })
        });
    };
    return /*#__PURE__*/ jsxs(Menu.Root, {
        children: [
            /*#__PURE__*/ jsx(Menu.Trigger, {
                children: /*#__PURE__*/ jsx(Flex, {
                    minWidth: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "regular",
                    children: /*#__PURE__*/ jsx(Typography, {
                        textColor: "neutral800",
                        ellipsis: true,
                        marginRight: 2,
                        children: getDisplayText()
                    })
                })
            }),
            /*#__PURE__*/ jsx(Menu.Content, {
                children: localesForDocument.map(({ code, name })=>/*#__PURE__*/ jsx(Menu.Item, {
                        onClick: (e)=>{
                            e.stopPropagation();
                            handleLocaleClick(code);
                        },
                        children: /*#__PURE__*/ jsx(Typography, {
                            textColor: "neutral800",
                            fontWeight: "regular",
                            children: name
                        })
                    }, code))
            })
        ]
    });
};

export { LocaleListCell };
//# sourceMappingURL=LocaleListCell.mjs.map
