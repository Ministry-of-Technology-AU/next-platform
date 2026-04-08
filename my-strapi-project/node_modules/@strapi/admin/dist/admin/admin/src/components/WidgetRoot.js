'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var designSystem = require('@strapi/design-system');
var icons = require('@strapi/icons');
var reactDnd = require('react-dnd');
var reactDndHtml5Backend = require('react-dnd-html5-backend');
var reactIntl = require('react-intl');
var reactRouterDom = require('react-router-dom');
var styled = require('styled-components');
var Tracking = require('../features/Tracking.js');
var widgetLayout = require('../utils/widgetLayout.js');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

const WidgetActions = styled(designSystem.Flex)`
  display: flex;

  @media (hover: hover) and (pointer: fine) {
    display: none;
  }
`;
const DragIconButton = styled(designSystem.IconButton)`
  display: none;

  @media (hover: hover) and (pointer: fine) {
    display: flex;
  }
`;
const WidgetContainer = styled(designSystem.Flex)`
  @media (hover: hover) and (pointer: fine) {
    &:hover ${WidgetActions} {
      display: flex;
    }
  }

  &:focus-within ${WidgetActions} {
    display: flex;
  }

  &:focus-within ${DragIconButton} {
    pointer-events: none;

    ${({ theme })=>theme.breakpoints.medium} {
      pointer-events: auto;
    }
  }
`;
const WidgetRoot = ({ title, icon = icons.PuzzlePiece, children, link, uid, findWidget, deleteWidget, onDragStart, onDragEnd, component })=>{
    const { trackUsage } = Tracking.useTracking();
    const { formatMessage } = reactIntl.useIntl();
    const Icon = icon;
    const handleClickOnLink = ()=>{
        trackUsage('didOpenHomeWidgetLink', {
            widgetUID: uid
        });
    };
    const handleDeleteWidget = ()=>{
        deleteWidget?.(uid);
    };
    const [, drag, preview] = reactDnd.useDrag(()=>({
            type: 'widget',
            item: ()=>{
                onDragStart?.(uid);
                return {
                    id: uid,
                    originalIndex: findWidget?.(uid)?.index ?? 0,
                    title,
                    icon,
                    link,
                    component
                };
            },
            collect: (monitor)=>({
                    isDragging: monitor.isDragging()
                }),
            end: ()=>{
                onDragEnd?.();
            }
        }), [
        uid,
        findWidget,
        onDragStart,
        onDragEnd,
        title,
        icon,
        link,
        component
    ]);
    // Suppress default drag preview
    React__namespace.useEffect(()=>{
        preview(reactDndHtml5Backend.getEmptyImage(), {
            captureDraggingState: true
        });
    }, [
        preview
    ]);
    return /*#__PURE__*/ jsxRuntime.jsxs(WidgetContainer, {
        width: "100%",
        hasRadius: true,
        direction: "column",
        alignItems: "flex-start",
        background: 'neutral0',
        borderColor: 'neutral150',
        shadow: "tableShadow",
        tag: "section",
        gap: 4,
        padding: 6,
        position: "relative",
        "aria-labelledby": uid,
        tabIndex: 0,
        [widgetLayout.WIDGET_DATA_ATTRIBUTES.WIDGET_ID]: uid,
        style: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        children: [
            /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                direction: "row",
                gap: 2,
                width: "100%",
                tag: "header",
                alignItems: "center",
                minHeight: "2.25rem",
                children: [
                    /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                        gap: 2,
                        marginRight: "auto",
                        children: [
                            /*#__PURE__*/ jsxRuntime.jsx(Icon, {
                                fill: "neutral500",
                                "aria-hidden": true
                            }),
                            /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                textColor: "neutral500",
                                variant: "sigma",
                                tag: "h2",
                                id: uid,
                                children: formatMessage(title)
                            })
                        ]
                    }),
                    link && /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                        tag: reactRouterDom.Link,
                        variant: "omega",
                        textColor: "primary600",
                        style: {
                            textDecoration: 'none'
                        },
                        textAlign: "right",
                        to: link.href,
                        onClick: handleClickOnLink,
                        children: formatMessage(link.label)
                    }),
                    /*#__PURE__*/ jsxRuntime.jsxs(WidgetActions, {
                        gap: 2,
                        children: [
                            /*#__PURE__*/ jsxRuntime.jsx(designSystem.IconButton, {
                                variant: "danger-light",
                                size: "XS",
                                onClick: handleDeleteWidget,
                                label: formatMessage({
                                    id: 'HomePage.widget.delete',
                                    defaultMessage: 'Delete'
                                }),
                                cursor: "pointer",
                                children: /*#__PURE__*/ jsxRuntime.jsx(icons.Trash, {})
                            }),
                            /*#__PURE__*/ jsxRuntime.jsx(DragIconButton, {
                                variant: "tertiary",
                                size: "XS",
                                ref: drag,
                                tabIndex: -1,
                                label: formatMessage({
                                    id: 'HomePage.widget.drag',
                                    defaultMessage: 'Drag to move'
                                }),
                                cursor: "grab",
                                children: /*#__PURE__*/ jsxRuntime.jsx(icons.Drag, {})
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsxRuntime.jsx(designSystem.ScrollArea, {
                children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                    width: "100%",
                    height: "261px",
                    overflow: "auto",
                    tag: "main",
                    children: children
                })
            })
        ]
    });
};

exports.WidgetRoot = WidgetRoot;
//# sourceMappingURL=WidgetRoot.js.map
