'use strict';

var jsxRuntime = require('react/jsx-runtime');
var strapiAdmin = require('@strapi/admin/strapi-admin');
var designSystem = require('@strapi/design-system');
var icons = require('@strapi/icons');
var reactIntl = require('react-intl');
var getTrad = require('../utils/getTrad.js');

const CopyCommandButton = ({ command })=>{
    const { formatMessage } = reactIntl.useIntl();
    const { copy } = strapiAdmin.useClipboard();
    const copyLabel = formatMessage({
        id: getTrad.getTrad('Homepage.deploy.cli.copy'),
        defaultMessage: 'Copy'
    });
    const handleCopy = async ()=>await copy(command);
    return /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tooltip, {
        label: copyLabel,
        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.IconButton, {
            size: "XS",
            variant: "ghost",
            label: copyLabel,
            onClick: handleCopy,
            children: /*#__PURE__*/ jsxRuntime.jsx(icons.Duplicate, {})
        })
    });
};
const CLIDeployTabs = ()=>{
    const { formatMessage } = reactIntl.useIntl();
    return /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
        minWidth: "28em",
        maxWidth: "28em",
        paddingTop: 8,
        children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Tabs.Root, {
            defaultValue: "yarn",
            children: [
                /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Tabs.List, {
                    "aria-label": formatMessage({
                        id: getTrad.getTrad('Homepage.deploy.cli.ariaLabel'),
                        defaultMessage: 'Package manager'
                    }),
                    children: [
                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Trigger, {
                            value: "yarn",
                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                variant: "omega",
                                children: "Yarn"
                            })
                        }),
                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Trigger, {
                            value: "npm",
                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                variant: "omega",
                                children: "NPM"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Content, {
                    value: "yarn",
                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                        background: "neutral100",
                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                            padding: 4,
                            children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                                direction: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                children: [
                                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                        tag: "code",
                                        textColor: "neutral800",
                                        children: "yarn strapi deploy"
                                    }),
                                    /*#__PURE__*/ jsxRuntime.jsx(CopyCommandButton, {
                                        command: "yarn strapi deploy"
                                    })
                                ]
                            })
                        })
                    })
                }),
                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Content, {
                    value: "npm",
                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                        background: "neutral100",
                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                            padding: 4,
                            children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                                direction: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                children: [
                                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                        tag: "code",
                                        textColor: "neutral800",
                                        children: "npm run deploy"
                                    }),
                                    /*#__PURE__*/ jsxRuntime.jsx(CopyCommandButton, {
                                        command: "npm run deploy"
                                    })
                                ]
                            })
                        })
                    })
                })
            ]
        })
    });
};

exports.CLIDeployTabs = CLIDeployTabs;
//# sourceMappingURL=CLIDeployTabs.js.map
