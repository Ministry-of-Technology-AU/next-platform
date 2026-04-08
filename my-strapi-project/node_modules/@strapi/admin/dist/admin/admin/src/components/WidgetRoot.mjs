import { jsxs, jsx } from 'react/jsx-runtime';
import * as React from 'react';
import { Flex, IconButton, Typography, ScrollArea, Box } from '@strapi/design-system';
import { Trash, Drag, PuzzlePiece } from '@strapi/icons';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTracking } from '../features/Tracking.mjs';
import { WIDGET_DATA_ATTRIBUTES } from '../utils/widgetLayout.mjs';

const WidgetActions = styled(Flex)`
  display: flex;

  @media (hover: hover) and (pointer: fine) {
    display: none;
  }
`;
const DragIconButton = styled(IconButton)`
  display: none;

  @media (hover: hover) and (pointer: fine) {
    display: flex;
  }
`;
const WidgetContainer = styled(Flex)`
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
const WidgetRoot = ({ title, icon = PuzzlePiece, children, link, uid, findWidget, deleteWidget, onDragStart, onDragEnd, component })=>{
    const { trackUsage } = useTracking();
    const { formatMessage } = useIntl();
    const Icon = icon;
    const handleClickOnLink = ()=>{
        trackUsage('didOpenHomeWidgetLink', {
            widgetUID: uid
        });
    };
    const handleDeleteWidget = ()=>{
        deleteWidget?.(uid);
    };
    const [, drag, preview] = useDrag(()=>({
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
    React.useEffect(()=>{
        preview(getEmptyImage(), {
            captureDraggingState: true
        });
    }, [
        preview
    ]);
    return /*#__PURE__*/ jsxs(WidgetContainer, {
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
        [WIDGET_DATA_ATTRIBUTES.WIDGET_ID]: uid,
        style: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        children: [
            /*#__PURE__*/ jsxs(Flex, {
                direction: "row",
                gap: 2,
                width: "100%",
                tag: "header",
                alignItems: "center",
                minHeight: "2.25rem",
                children: [
                    /*#__PURE__*/ jsxs(Flex, {
                        gap: 2,
                        marginRight: "auto",
                        children: [
                            /*#__PURE__*/ jsx(Icon, {
                                fill: "neutral500",
                                "aria-hidden": true
                            }),
                            /*#__PURE__*/ jsx(Typography, {
                                textColor: "neutral500",
                                variant: "sigma",
                                tag: "h2",
                                id: uid,
                                children: formatMessage(title)
                            })
                        ]
                    }),
                    link && /*#__PURE__*/ jsx(Typography, {
                        tag: Link,
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
                    /*#__PURE__*/ jsxs(WidgetActions, {
                        gap: 2,
                        children: [
                            /*#__PURE__*/ jsx(IconButton, {
                                variant: "danger-light",
                                size: "XS",
                                onClick: handleDeleteWidget,
                                label: formatMessage({
                                    id: 'HomePage.widget.delete',
                                    defaultMessage: 'Delete'
                                }),
                                cursor: "pointer",
                                children: /*#__PURE__*/ jsx(Trash, {})
                            }),
                            /*#__PURE__*/ jsx(DragIconButton, {
                                variant: "tertiary",
                                size: "XS",
                                ref: drag,
                                tabIndex: -1,
                                label: formatMessage({
                                    id: 'HomePage.widget.drag',
                                    defaultMessage: 'Drag to move'
                                }),
                                cursor: "grab",
                                children: /*#__PURE__*/ jsx(Drag, {})
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsx(ScrollArea, {
                children: /*#__PURE__*/ jsx(Box, {
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

export { WidgetRoot };
//# sourceMappingURL=WidgetRoot.mjs.map
