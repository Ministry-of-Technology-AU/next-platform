'use strict';

var jsxRuntime = require('react/jsx-runtime');
var designSystem = require('@strapi/design-system');
var icons = require('@strapi/icons');
var reactIntl = require('react-intl');
var CLIDeployTabs = require('./CLIDeployTabs.js');
var getTrad = require('../utils/getTrad.js');

const CloudDeploy = ()=>{
    const { formatMessage } = reactIntl.useIntl();
    const documentationLink = formatMessage({
        id: getTrad.getTrad('Homepage.deploy.documentation'),
        defaultMessage: 'Having trouble? Check our documentation'
    });
    return /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Box, {
        paddingBottom: 5,
        children: [
            /*#__PURE__*/ jsxRuntime.jsx(designSystem.Flex, {
                direction: "column",
                children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                    variant: "delta",
                    paddingBottom: 5,
                    paddingTop: 2,
                    children: formatMessage({
                        id: getTrad.getTrad('Homepage.deploy.title'),
                        defaultMessage: 'Choose your preferred deployment method'
                    })
                })
            }),
            /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Tabs.Root, {
                defaultValue: "cloud",
                variant: "simple",
                children: [
                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Flex, {
                        direction: "column",
                        children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Tabs.List, {
                            "aria-label": formatMessage({
                                id: getTrad.getTrad('Homepage.deploy.ariaLabel'),
                                defaultMessage: 'Deployment options'
                            }),
                            children: [
                                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Trigger, {
                                    value: "cloud",
                                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                        minWidth: {
                                            initial: '10em',
                                            medium: '20em'
                                        },
                                        children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                                            direction: "row",
                                            gap: 2,
                                            justifyContent: "center",
                                            children: [
                                                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                                    variant: "omega",
                                                    children: "Cloud"
                                                }),
                                                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Badge, {
                                                    active: true,
                                                    children: formatMessage({
                                                        id: getTrad.getTrad('Homepage.deploy.git.badge'),
                                                        defaultMessage: 'Recommended'
                                                    })
                                                })
                                            ]
                                        })
                                    })
                                }),
                                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Trigger, {
                                    value: "cli",
                                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                        minWidth: {
                                            initial: '10em',
                                            medium: '20em'
                                        },
                                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Flex, {
                                            justifyContent: "center",
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                                variant: "omega",
                                                children: "CLI"
                                            })
                                        })
                                    })
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Box, {
                        children: [
                            /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Content, {
                                value: "cloud",
                                children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                                    direction: "column",
                                    paddingTop: 6,
                                    children: [
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.BaseLink, {
                                                isExternal: true,
                                                href: "https://cloud.strapi.io/login?utm_campaign=Strapi%20Cloud%20Plugin&utm_source=In-Product&utm_medium=CTA",
                                                children: /*#__PURE__*/ jsxRuntime.jsx(icons.CloudUpload, {
                                                    height: 40,
                                                    width: 40,
                                                    fill: "buttonPrimary600"
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                            paddingBottom: 2,
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                                variant: "delta",
                                                textColor: "neutral1000",
                                                children: formatMessage({
                                                    id: getTrad.getTrad('Homepage.deploy.git.title'),
                                                    defaultMessage: 'Deploy to Strapi Cloud'
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                            variant: "omega",
                                            textColor: "neutral600",
                                            children: formatMessage({
                                                id: getTrad.getTrad('Homepage.deploy.git.subTitle'),
                                                defaultMessage: 'Deploy a GitHub or GitLab project directly within Strapi Cloud'
                                            })
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                            paddingTop: 8,
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.LinkButton, {
                                                variant: "default",
                                                endIcon: /*#__PURE__*/ jsxRuntime.jsx(icons.ExternalLink, {
                                                    fill: "neutral0"
                                                }),
                                                href: "https://cloud.strapi.io/login?utm_campaign=Strapi%20Cloud%20Plugin&utm_source=In-Product&utm_medium=CTA",
                                                isExternal: true,
                                                size: "M",
                                                children: formatMessage({
                                                    id: getTrad.getTrad('Homepage.deploy.git.button'),
                                                    defaultMessage: 'Deploy to Strapi Cloud'
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Link, {
                                                isExternal: true,
                                                href: "https://docs.strapi.io/cloud/getting-started/deployment",
                                                children: documentationLink
                                            })
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ jsxRuntime.jsx(designSystem.Tabs.Content, {
                                value: "cli",
                                children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                                    direction: "column",
                                    paddingTop: 6,
                                    children: [
                                        /*#__PURE__*/ jsxRuntime.jsx(icons.Code, {
                                            height: 40,
                                            width: 40,
                                            fill: "buttonPrimary600"
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                            paddingBottom: 2,
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                                variant: "delta",
                                                textColor: "neutral1000",
                                                children: formatMessage({
                                                    id: getTrad.getTrad('Homepage.deploy.cli.title'),
                                                    defaultMessage: 'Deploy via CLI'
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                            variant: "omega",
                                            textColor: "neutral600",
                                            children: formatMessage({
                                                id: getTrad.getTrad('Homepage.deploy.cli.subTitle'),
                                                defaultMessage: 'Use the command line to deploy your Strapi project directly'
                                            })
                                        }),
                                        /*#__PURE__*/ jsxRuntime.jsx(CLIDeployTabs.CLIDeployTabs, {}),
                                        /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Link, {
                                                isExternal: true,
                                                href: "https://docs.strapi.io/cloud/getting-started/deployment-cli",
                                                children: documentationLink
                                            })
                                        })
                                    ]
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

exports.CloudDeploy = CloudDeploy;
//# sourceMappingURL=CloudDeploy.js.map
