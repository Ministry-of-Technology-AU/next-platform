'use strict';

var jsxRuntime = require('react/jsx-runtime');
var designSystem = require('@strapi/design-system');
var reactIntl = require('react-intl');
var CloudDeploy = require('../components/CloudDeploy.js');
var CloudFree = require('../components/CloudFree.js');
var getTrad = require('../utils/getTrad.js');

const HomePage = ()=>{
    const { formatMessage } = reactIntl.useIntl();
    return /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Box, {
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 5,
        paddingBottom: 3,
        background: "neutral100",
        children: [
            /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                direction: "column",
                gap: 2,
                children: [
                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                        variant: "alpha",
                        children: formatMessage({
                            id: getTrad.getTrad('Homepage.title'),
                            defaultMessage: 'Deploy with Strapi Cloud for Free!'
                        })
                    }),
                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Flex, {
                        direction: {
                            initial: 'row',
                            medium: 'column'
                        },
                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                            variant: "epsilon",
                            textColor: "neutral600",
                            children: formatMessage({
                                id: getTrad.getTrad('Homepage.subTitle'),
                                defaultMessage: 'Start with our completely free plan - no credit card required, no time limits.'
                            })
                        })
                    })
                ]
            }),
            /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Box, {
                padding: 8,
                children: [
                    /*#__PURE__*/ jsxRuntime.jsx(CloudFree.CloudFree, {}),
                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                        paddingTop: 8,
                        children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                            padding: 6,
                            background: "neutral0",
                            shadow: "tableShadow",
                            children: /*#__PURE__*/ jsxRuntime.jsx(CloudDeploy.CloudDeploy, {})
                        })
                    })
                ]
            })
        ]
    });
};

exports.HomePage = HomePage;
//# sourceMappingURL=HomePage.js.map
