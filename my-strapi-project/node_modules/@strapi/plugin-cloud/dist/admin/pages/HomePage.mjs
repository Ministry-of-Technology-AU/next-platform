import { jsxs, jsx } from 'react/jsx-runtime';
import { Box, Flex, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { CloudDeploy } from '../components/CloudDeploy.mjs';
import { CloudFree } from '../components/CloudFree.mjs';
import { getTrad } from '../utils/getTrad.mjs';

const HomePage = ()=>{
    const { formatMessage } = useIntl();
    return /*#__PURE__*/ jsxs(Box, {
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 5,
        paddingBottom: 3,
        background: "neutral100",
        children: [
            /*#__PURE__*/ jsxs(Flex, {
                direction: "column",
                gap: 2,
                children: [
                    /*#__PURE__*/ jsx(Typography, {
                        variant: "alpha",
                        children: formatMessage({
                            id: getTrad('Homepage.title'),
                            defaultMessage: 'Deploy with Strapi Cloud for Free!'
                        })
                    }),
                    /*#__PURE__*/ jsx(Flex, {
                        direction: {
                            initial: 'row',
                            medium: 'column'
                        },
                        children: /*#__PURE__*/ jsx(Typography, {
                            variant: "epsilon",
                            textColor: "neutral600",
                            children: formatMessage({
                                id: getTrad('Homepage.subTitle'),
                                defaultMessage: 'Start with our completely free plan - no credit card required, no time limits.'
                            })
                        })
                    })
                ]
            }),
            /*#__PURE__*/ jsxs(Box, {
                padding: 8,
                children: [
                    /*#__PURE__*/ jsx(CloudFree, {}),
                    /*#__PURE__*/ jsx(Box, {
                        paddingTop: 8,
                        children: /*#__PURE__*/ jsx(Box, {
                            padding: 6,
                            background: "neutral0",
                            shadow: "tableShadow",
                            children: /*#__PURE__*/ jsx(CloudDeploy, {})
                        })
                    })
                ]
            })
        ]
    });
};

export { HomePage };
//# sourceMappingURL=HomePage.mjs.map
