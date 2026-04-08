import { jsx, jsxs } from 'react/jsx-runtime';
import { useClipboard } from '@strapi/admin/strapi-admin';
import { Box, Tabs, Typography, Flex, Tooltip, IconButton } from '@strapi/design-system';
import { Duplicate } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { getTrad } from '../utils/getTrad.mjs';

const CopyCommandButton = ({ command })=>{
    const { formatMessage } = useIntl();
    const { copy } = useClipboard();
    const copyLabel = formatMessage({
        id: getTrad('Homepage.deploy.cli.copy'),
        defaultMessage: 'Copy'
    });
    const handleCopy = async ()=>await copy(command);
    return /*#__PURE__*/ jsx(Tooltip, {
        label: copyLabel,
        children: /*#__PURE__*/ jsx(IconButton, {
            size: "XS",
            variant: "ghost",
            label: copyLabel,
            onClick: handleCopy,
            children: /*#__PURE__*/ jsx(Duplicate, {})
        })
    });
};
const CLIDeployTabs = ()=>{
    const { formatMessage } = useIntl();
    return /*#__PURE__*/ jsx(Box, {
        minWidth: "28em",
        maxWidth: "28em",
        paddingTop: 8,
        children: /*#__PURE__*/ jsxs(Tabs.Root, {
            defaultValue: "yarn",
            children: [
                /*#__PURE__*/ jsxs(Tabs.List, {
                    "aria-label": formatMessage({
                        id: getTrad('Homepage.deploy.cli.ariaLabel'),
                        defaultMessage: 'Package manager'
                    }),
                    children: [
                        /*#__PURE__*/ jsx(Tabs.Trigger, {
                            value: "yarn",
                            children: /*#__PURE__*/ jsx(Typography, {
                                variant: "omega",
                                children: "Yarn"
                            })
                        }),
                        /*#__PURE__*/ jsx(Tabs.Trigger, {
                            value: "npm",
                            children: /*#__PURE__*/ jsx(Typography, {
                                variant: "omega",
                                children: "NPM"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ jsx(Tabs.Content, {
                    value: "yarn",
                    children: /*#__PURE__*/ jsx(Box, {
                        background: "neutral100",
                        children: /*#__PURE__*/ jsx(Box, {
                            padding: 4,
                            children: /*#__PURE__*/ jsxs(Flex, {
                                direction: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                children: [
                                    /*#__PURE__*/ jsx(Typography, {
                                        tag: "code",
                                        textColor: "neutral800",
                                        children: "yarn strapi deploy"
                                    }),
                                    /*#__PURE__*/ jsx(CopyCommandButton, {
                                        command: "yarn strapi deploy"
                                    })
                                ]
                            })
                        })
                    })
                }),
                /*#__PURE__*/ jsx(Tabs.Content, {
                    value: "npm",
                    children: /*#__PURE__*/ jsx(Box, {
                        background: "neutral100",
                        children: /*#__PURE__*/ jsx(Box, {
                            padding: 4,
                            children: /*#__PURE__*/ jsxs(Flex, {
                                direction: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                children: [
                                    /*#__PURE__*/ jsx(Typography, {
                                        tag: "code",
                                        textColor: "neutral800",
                                        children: "npm run deploy"
                                    }),
                                    /*#__PURE__*/ jsx(CopyCommandButton, {
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

export { CLIDeployTabs };
//# sourceMappingURL=CLIDeployTabs.mjs.map
