import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { Box, Modal, Flex, Typography, Button } from '@strapi/design-system';
import { PuzzlePiece } from '@strapi/icons';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { WidgetComponent } from '../HomePage.mjs';

// Hide scrollbars in widget previews
const WidgetWrapper = styled(Box)`
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  *::-webkit-scrollbar {
    display: none;
  }
`;
// Interactive widget preview container
const WidgetPreviewContainer = styled(Box)`
  &:hover {
    background-color: ${({ theme })=>theme.colors.primary100};
    border-color: ${({ theme })=>theme.colors.primary200};
  }

  &:focus-visible {
    background-color: ${({ theme })=>theme.colors.primary100};
    border-color: ${({ theme })=>theme.colors.primary200};
    outline-offset: 0;
  }
`;
const WidgetPreview = ({ widget, onSelect })=>{
    const { formatMessage } = useIntl();
    const Icon = widget.icon || PuzzlePiece;
    const handleKeyDown = (event)=>{
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
        }
    };
    return /*#__PURE__*/ jsx(WidgetPreviewContainer, {
        padding: 4,
        background: "neutral0",
        borderColor: "neutral200",
        hasRadius: true,
        shadow: "tableShadow",
        onClick: onSelect,
        onKeyDown: handleKeyDown,
        width: '100%',
        cursor: "pointer",
        tabIndex: 0,
        role: "button",
        "aria-label": formatMessage({
            id: 'HomePage.addWidget.selectWidget',
            defaultMessage: 'Select {widgetName} widget'
        }, {
            widgetName: formatMessage(widget.title)
        }),
        children: /*#__PURE__*/ jsxs(Flex, {
            direction: "column",
            alignItems: "center",
            gap: 3,
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
                            children: formatMessage(widget.title)
                        })
                    ]
                }),
                /*#__PURE__*/ jsx(WidgetWrapper, {
                    width: '100%',
                    style: {
                        pointerEvents: 'none'
                    },
                    children: /*#__PURE__*/ jsx(WidgetComponent, {
                        component: widget.component,
                        columnWidth: 4
                    })
                })
            ]
        })
    });
};
const AddWidgetModal = ({ isOpen, onClose, onAddWidget, currentWidgets, availableWidgets })=>{
    const { formatMessage } = useIntl();
    const currentWidgetUids = React.useMemo(()=>new Set(currentWidgets.map((widget)=>widget.uid)), [
        currentWidgets
    ]);
    const handleWidgetSelect = (widget)=>{
        if (!currentWidgetUids.has(widget.uid)) {
            onAddWidget(widget);
            onClose();
        }
    };
    const addableWidgets = availableWidgets.filter((widget)=>!currentWidgetUids.has(widget.uid));
    return /*#__PURE__*/ jsx(Modal.Root, {
        open: isOpen,
        onOpenChange: onClose,
        children: /*#__PURE__*/ jsxs(Modal.Content, {
            children: [
                /*#__PURE__*/ jsx(Modal.Header, {
                    children: /*#__PURE__*/ jsx(Modal.Title, {
                        children: formatMessage({
                            id: 'HomePage.addWidget.title',
                            defaultMessage: 'Add Widget'
                        })
                    })
                }),
                /*#__PURE__*/ jsx(Modal.Body, {
                    children: /*#__PURE__*/ jsx(Box, {
                        children: addableWidgets.length === 0 ? /*#__PURE__*/ jsxs(Flex, {
                            direction: "column",
                            alignItems: "center",
                            gap: 4,
                            children: [
                                /*#__PURE__*/ jsx(PuzzlePiece, {
                                    width: "4rem",
                                    height: "4rem",
                                    fill: "neutral300"
                                }),
                                /*#__PURE__*/ jsx(Typography, {
                                    textColor: "neutral500",
                                    textAlign: "center",
                                    children: formatMessage({
                                        id: 'HomePage.addWidget.noWidgetsAvailable',
                                        defaultMessage: 'No widgets available to add'
                                    })
                                })
                            ]
                        }) : /*#__PURE__*/ jsx(Flex, {
                            direction: "column",
                            gap: 3,
                            justifyContent: "center",
                            children: addableWidgets.map((widget)=>/*#__PURE__*/ jsx(WidgetPreview, {
                                    widget: widget,
                                    onSelect: ()=>handleWidgetSelect(widget)
                                }, widget.uid))
                        })
                    })
                }),
                /*#__PURE__*/ jsx(Modal.Footer, {
                    children: /*#__PURE__*/ jsx(Button, {
                        onClick: onClose,
                        variant: "tertiary",
                        children: formatMessage({
                            id: 'app.components.Button.cancel',
                            defaultMessage: 'Cancel'
                        })
                    })
                })
            ]
        })
    });
};

export { AddWidgetModal };
//# sourceMappingURL=AddWidgetModal.mjs.map
