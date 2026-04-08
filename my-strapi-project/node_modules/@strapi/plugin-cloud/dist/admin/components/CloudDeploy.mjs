import { jsxs, jsx } from 'react/jsx-runtime';
import { Box, Flex, Typography, Tabs, Badge, BaseLink, LinkButton, Link } from '@strapi/design-system';
import { CloudUpload, ExternalLink, Code } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { CLIDeployTabs } from './CLIDeployTabs.mjs';
import { getTrad } from '../utils/getTrad.mjs';

const CloudDeploy = ()=>{
    const { formatMessage } = useIntl();
    const documentationLink = formatMessage({
        id: getTrad('Homepage.deploy.documentation'),
        defaultMessage: 'Having trouble? Check our documentation'
    });
    return /*#__PURE__*/ jsxs(Box, {
        paddingBottom: 5,
        children: [
            /*#__PURE__*/ jsx(Flex, {
                direction: "column",
                children: /*#__PURE__*/ jsx(Typography, {
                    variant: "delta",
                    paddingBottom: 5,
                    paddingTop: 2,
                    children: formatMessage({
                        id: getTrad('Homepage.deploy.title'),
                        defaultMessage: 'Choose your preferred deployment method'
                    })
                })
            }),
            /*#__PURE__*/ jsxs(Tabs.Root, {
                defaultValue: "cloud",
                variant: "simple",
                children: [
                    /*#__PURE__*/ jsx(Flex, {
                        direction: "column",
                        children: /*#__PURE__*/ jsxs(Tabs.List, {
                            "aria-label": formatMessage({
                                id: getTrad('Homepage.deploy.ariaLabel'),
                                defaultMessage: 'Deployment options'
                            }),
                            children: [
                                /*#__PURE__*/ jsx(Tabs.Trigger, {
                                    value: "cloud",
                                    children: /*#__PURE__*/ jsx(Box, {
                                        minWidth: {
                                            initial: '10em',
                                            medium: '20em'
                                        },
                                        children: /*#__PURE__*/ jsxs(Flex, {
                                            direction: "row",
                                            gap: 2,
                                            justifyContent: "center",
                                            children: [
                                                /*#__PURE__*/ jsx(Typography, {
                                                    variant: "omega",
                                                    children: "Cloud"
                                                }),
                                                /*#__PURE__*/ jsx(Badge, {
                                                    active: true,
                                                    children: formatMessage({
                                                        id: getTrad('Homepage.deploy.git.badge'),
                                                        defaultMessage: 'Recommended'
                                                    })
                                                })
                                            ]
                                        })
                                    })
                                }),
                                /*#__PURE__*/ jsx(Tabs.Trigger, {
                                    value: "cli",
                                    children: /*#__PURE__*/ jsx(Box, {
                                        minWidth: {
                                            initial: '10em',
                                            medium: '20em'
                                        },
                                        children: /*#__PURE__*/ jsx(Flex, {
                                            justifyContent: "center",
                                            children: /*#__PURE__*/ jsx(Typography, {
                                                variant: "omega",
                                                children: "CLI"
                                            })
                                        })
                                    })
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ jsxs(Box, {
                        children: [
                            /*#__PURE__*/ jsx(Tabs.Content, {
                                value: "cloud",
                                children: /*#__PURE__*/ jsxs(Flex, {
                                    direction: "column",
                                    paddingTop: 6,
                                    children: [
                                        /*#__PURE__*/ jsx(Box, {
                                            children: /*#__PURE__*/ jsx(BaseLink, {
                                                isExternal: true,
                                                href: "https://cloud.strapi.io/login?utm_campaign=Strapi%20Cloud%20Plugin&utm_source=In-Product&utm_medium=CTA",
                                                children: /*#__PURE__*/ jsx(CloudUpload, {
                                                    height: 40,
                                                    width: 40,
                                                    fill: "buttonPrimary600"
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsx(Box, {
                                            paddingBottom: 2,
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsx(Typography, {
                                                variant: "delta",
                                                textColor: "neutral1000",
                                                children: formatMessage({
                                                    id: getTrad('Homepage.deploy.git.title'),
                                                    defaultMessage: 'Deploy to Strapi Cloud'
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsx(Typography, {
                                            variant: "omega",
                                            textColor: "neutral600",
                                            children: formatMessage({
                                                id: getTrad('Homepage.deploy.git.subTitle'),
                                                defaultMessage: 'Deploy a GitHub or GitLab project directly within Strapi Cloud'
                                            })
                                        }),
                                        /*#__PURE__*/ jsx(Box, {
                                            paddingTop: 8,
                                            children: /*#__PURE__*/ jsx(LinkButton, {
                                                variant: "default",
                                                endIcon: /*#__PURE__*/ jsx(ExternalLink, {
                                                    fill: "neutral0"
                                                }),
                                                href: "https://cloud.strapi.io/login?utm_campaign=Strapi%20Cloud%20Plugin&utm_source=In-Product&utm_medium=CTA",
                                                isExternal: true,
                                                size: "M",
                                                children: formatMessage({
                                                    id: getTrad('Homepage.deploy.git.button'),
                                                    defaultMessage: 'Deploy to Strapi Cloud'
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsx(Box, {
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsx(Link, {
                                                isExternal: true,
                                                href: "https://docs.strapi.io/cloud/getting-started/deployment",
                                                children: documentationLink
                                            })
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ jsx(Tabs.Content, {
                                value: "cli",
                                children: /*#__PURE__*/ jsxs(Flex, {
                                    direction: "column",
                                    paddingTop: 6,
                                    children: [
                                        /*#__PURE__*/ jsx(Code, {
                                            height: 40,
                                            width: 40,
                                            fill: "buttonPrimary600"
                                        }),
                                        /*#__PURE__*/ jsx(Box, {
                                            paddingBottom: 2,
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsx(Typography, {
                                                variant: "delta",
                                                textColor: "neutral1000",
                                                children: formatMessage({
                                                    id: getTrad('Homepage.deploy.cli.title'),
                                                    defaultMessage: 'Deploy via CLI'
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsx(Typography, {
                                            variant: "omega",
                                            textColor: "neutral600",
                                            children: formatMessage({
                                                id: getTrad('Homepage.deploy.cli.subTitle'),
                                                defaultMessage: 'Use the command line to deploy your Strapi project directly'
                                            })
                                        }),
                                        /*#__PURE__*/ jsx(CLIDeployTabs, {}),
                                        /*#__PURE__*/ jsx(Box, {
                                            paddingTop: 5,
                                            children: /*#__PURE__*/ jsx(Link, {
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

export { CloudDeploy };
//# sourceMappingURL=CloudDeploy.mjs.map
