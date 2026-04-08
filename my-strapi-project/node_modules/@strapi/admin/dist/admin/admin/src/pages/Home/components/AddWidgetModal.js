'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var designSystem = require('@strapi/design-system');
var icons = require('@strapi/icons');
var reactIntl = require('react-intl');
var styled = require('styled-components');
var HomePage = require('../HomePage.js');

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

// Hide scrollbars in widget previews
const WidgetWrapper = styled(designSystem.Box)`
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  *::-webkit-scrollbar {
    display: none;
  }
`;
// Interactive widget preview container
const WidgetPreviewContainer = styled(designSystem.Box)`
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
    const { formatMessage } = reactIntl.useIntl();
    const Icon = widget.icon || icons.PuzzlePiece;
    const handleKeyDown = (event)=>{
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
        }
    };
    return /*#__PURE__*/ jsxRuntime.jsx(WidgetPreviewContainer, {
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
        children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
            direction: "column",
            alignItems: "center",
            gap: 3,
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
                            children: formatMessage(widget.title)
                        })
                    ]
                }),
                /*#__PURE__*/ jsxRuntime.jsx(WidgetWrapper, {
                    width: '100%',
                    style: {
                        pointerEvents: 'none'
                    },
                    children: /*#__PURE__*/ jsxRuntime.jsx(HomePage.WidgetComponent, {
                        component: widget.component,
                        columnWidth: 4
                    })
                })
            ]
        })
    });
};
const AddWidgetModal = ({ isOpen, onClose, onAddWidget, currentWidgets, availableWidgets })=>{
    const { formatMessage } = reactIntl.useIntl();
    const currentWidgetUids = React__namespace.useMemo(()=>new Set(currentWidgets.map((widget)=>widget.uid)), [
        currentWidgets
    ]);
    const handleWidgetSelect = (widget)=>{
        if (!currentWidgetUids.has(widget.uid)) {
            onAddWidget(widget);
            onClose();
        }
    };
    const addableWidgets = availableWidgets.filter((widget)=>!currentWidgetUids.has(widget.uid));
    return /*#__PURE__*/ jsxRuntime.jsx(designSystem.Modal.Root, {
        open: isOpen,
        onOpenChange: onClose,
        children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Modal.Content, {
            children: [
                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Modal.Header, {
                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Modal.Title, {
                        children: formatMessage({
                            id: 'HomePage.addWidget.title',
                            defaultMessage: 'Add Widget'
                        })
                    })
                }),
                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Modal.Body, {
                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                        children: addableWidgets.length === 0 ? /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                            direction: "column",
                            alignItems: "center",
                            gap: 4,
                            children: [
                                /*#__PURE__*/ jsxRuntime.jsx(icons.PuzzlePiece, {
                                    width: "4rem",
                                    height: "4rem",
                                    fill: "neutral300"
                                }),
                                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Typography, {
                                    textColor: "neutral500",
                                    textAlign: "center",
                                    children: formatMessage({
                                        id: 'HomePage.addWidget.noWidgetsAvailable',
                                        defaultMessage: 'No widgets available to add'
                                    })
                                })
                            ]
                        }) : /*#__PURE__*/ jsxRuntime.jsx(designSystem.Flex, {
                            direction: "column",
                            gap: 3,
                            justifyContent: "center",
                            children: addableWidgets.map((widget)=>/*#__PURE__*/ jsxRuntime.jsx(WidgetPreview, {
                                    widget: widget,
                                    onSelect: ()=>handleWidgetSelect(widget)
                                }, widget.uid))
                        })
                    })
                }),
                /*#__PURE__*/ jsxRuntime.jsx(designSystem.Modal.Footer, {
                    children: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Button, {
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

exports.AddWidgetModal = AddWidgetModal;
//# sourceMappingURL=AddWidgetModal.js.map
