'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var designSystem = require('@strapi/design-system');
var icons = require('@strapi/icons');
var reactIntl = require('react-intl');
var styled = require('styled-components');
var DragLayer = require('../../components/DragLayer.js');
var GapDropZone = require('../../components/GapDropZone.js');
var Overview = require('../../components/GuidedTour/Overview.js');
var Layout = require('../../components/Layouts/Layout.js');
var PageHelpers = require('../../components/PageHelpers.js');
var ResizeIndicator = require('../../components/ResizeIndicator.js');
var WidgetHelpers = require('../../components/WidgetHelpers.js');
var WidgetRoot = require('../../components/WidgetRoot.js');
require('../../services/admin.js');
var useEnterprise = require('../../hooks/useEnterprise.js');
require('../../../../ee/admin/src/services/ai.js');
var Auth = require('../../features/Auth.js');
var StrapiApp = require('../../features/StrapiApp.js');
var Widgets = require('../../features/Widgets.js');
var homepage = require('../../services/homepage.js');
var widgetLayout = require('../../utils/widgetLayout.js');
var AddWidgetModal = require('./components/AddWidgetModal.js');
var FreeTrialEndedModal = require('./components/FreeTrialEndedModal.js');
var FreeTrialWelcomeModal = require('./components/FreeTrialWelcomeModal.js');

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

// Styled wrapper for the drag preview
const DragPreviewWrapper = styled.styled.div`
  max-width: ${(props)=>props.$maxWidth};
  overflow: hidden;
  opacity: 0.9;
  border: 2px solid ${({ theme })=>theme.colors.primary500};
  border-radius: ${({ theme })=>theme.borderRadius};
  pointer-events: none;
`;
/* -------------------------------------------------------------------------------------------------
 * UnstableHomePageCe
 * -----------------------------------------------------------------------------------------------*/ const WidgetComponent = ({ component, columnWidth })=>{
    const [loadedComponent, setLoadedComponent] = React__namespace.useState(null);
    React__namespace.useEffect(()=>{
        const loadComponent = async ()=>{
            const resolvedComponent = await component();
            setLoadedComponent(()=>resolvedComponent);
        };
        loadComponent();
    }, [
        component
    ]);
    const Component = loadedComponent;
    if (!Component) {
        return /*#__PURE__*/ jsxRuntime.jsx(WidgetHelpers.Widget.Loading, {});
    }
    return /*#__PURE__*/ jsxRuntime.jsx(Component, {
        ...{
            columnWidth
        }
    });
};
/* -------------------------------------------------------------------------------------------------
 * HomePageCE
 * -----------------------------------------------------------------------------------------------*/ const HomePageCE = ()=>{
    const { formatMessage } = reactIntl.useIntl();
    const user = Auth.useAuth('HomePageCE', (state)=>state.user);
    const displayName = user?.firstname ?? user?.username ?? user?.email;
    const getAllWidgets = StrapiApp.useStrapiApp('UnstableHomepageCe', (state)=>state.widgets.getAll);
    const checkUserHasPermissions = Auth.useAuth('WidgetRoot', (state)=>state.checkUserHasPermissions);
    const { data: homepageLayout, isLoading: _isLoadingLayout } = homepage.useGetHomepageLayoutQuery();
    const [filteredWidgets, setFilteredWidgets] = React__namespace.useState([]);
    const [allAvailableWidgets, setAllAvailableWidgets] = React__namespace.useState([]);
    const [loading, setLoading] = React__namespace.useState(true);
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = React__namespace.useState(false);
    // Use custom hook for widget management
    const { findWidget, deleteWidget, addWidget, moveWidget, columnWidths, setColumnWidths, handleWidgetResize, saveLayout, isDraggingWidget, draggedWidgetId, handleDragStart, handleDragEnd } = Widgets.useWidgets({
        filteredWidgets,
        setFilteredWidgets
    });
    React__namespace.useEffect(()=>{
        const checkWidgetsPermissions = async ()=>{
            const allWidgets = getAllWidgets();
            const authorizedWidgets = await Promise.all(allWidgets.map(async (widget)=>{
                if (!widget.permissions || widget.permissions.length === 0) return true;
                const matchingPermissions = await checkUserHasPermissions(widget.permissions);
                return matchingPermissions.length >= widget.permissions.length;
            }));
            const authorizedWidgetsList = allWidgets.filter((_, i)=>authorizedWidgets[i]);
            setAllAvailableWidgets(authorizedWidgetsList);
            setLoading(false);
        };
        checkWidgetsPermissions();
    }, [
        checkUserHasPermissions,
        getAllWidgets
    ]);
    React__namespace.useEffect(()=>{
        if (allAvailableWidgets.length === 0) return;
        // If user has customized the homepage layout, apply it
        if (homepageLayout && homepageLayout.widgets) {
            const { filteredWidgets, widths: homepageWidths } = widgetLayout.applyHomepageLayout(allAvailableWidgets, homepageLayout);
            setFilteredWidgets(filteredWidgets);
            setColumnWidths(homepageWidths);
        } else {
            // Set default layout when no custom layout exists
            setFilteredWidgets(allAvailableWidgets);
            setColumnWidths(widgetLayout.createDefaultWidgetWidths(allAvailableWidgets));
        }
    }, [
        homepageLayout,
        allAvailableWidgets,
        setColumnWidths
    ]);
    const widgetLayout$1 = React__namespace.useMemo(()=>{
        return filteredWidgets.map((widget, index)=>{
            const rightWidgetId = filteredWidgets[index + 1]?.uid;
            const widgetWidth = widgetLayout.getWidgetWidth(columnWidths, widget.uid);
            const rightWidgetWidth = widgetLayout.getWidgetWidth(columnWidths, rightWidgetId);
            return {
                widget,
                index,
                isLastInRow: widgetLayout.isLastWidgetInRow(index, filteredWidgets, columnWidths),
                rightWidgetId,
                widgetWidth,
                rightWidgetWidth,
                canResize: rightWidgetId && widgetLayout.canResizeBetweenWidgets(widget.uid, rightWidgetId, columnWidths, filteredWidgets)
            };
        });
    }, [
        filteredWidgets,
        columnWidths
    ]);
    return /*#__PURE__*/ jsxRuntime.jsx(Layout.Layouts.Root, {
        children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Main, {
            children: [
                /*#__PURE__*/ jsxRuntime.jsx(PageHelpers.Page.Title, {
                    children: formatMessage({
                        id: 'HomePage.head.title',
                        defaultMessage: 'Homepage'
                    })
                }),
                /*#__PURE__*/ jsxRuntime.jsx(Layout.Layouts.Header, {
                    title: formatMessage({
                        id: 'HomePage.header.title',
                        defaultMessage: 'Hello {name}'
                    }, {
                        name: displayName
                    }),
                    subtitle: formatMessage({
                        id: 'HomePage.header.subtitle',
                        defaultMessage: 'Welcome to your administration panel'
                    }),
                    primaryAction: /*#__PURE__*/ jsxRuntime.jsx(designSystem.Button, {
                        variant: "tertiary",
                        size: "S",
                        startIcon: /*#__PURE__*/ jsxRuntime.jsx(icons.Plus, {}),
                        onClick: ()=>setIsAddWidgetModalOpen(true),
                        children: formatMessage({
                            id: 'HomePage.addWidget.button',
                            defaultMessage: 'Add Widget'
                        })
                    })
                }),
                /*#__PURE__*/ jsxRuntime.jsx(FreeTrialWelcomeModal.FreeTrialWelcomeModal, {}),
                /*#__PURE__*/ jsxRuntime.jsx(FreeTrialEndedModal.FreeTrialEndedModal, {}),
                /*#__PURE__*/ jsxRuntime.jsx(AddWidgetModal.AddWidgetModal, {
                    isOpen: isAddWidgetModalOpen,
                    onClose: ()=>setIsAddWidgetModalOpen(false),
                    onAddWidget: addWidget,
                    currentWidgets: filteredWidgets,
                    availableWidgets: allAvailableWidgets
                }),
                /*#__PURE__*/ jsxRuntime.jsx(Layout.Layouts.Content, {
                    children: /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Flex, {
                        direction: "column",
                        alignItems: "stretch",
                        gap: 8,
                        paddingBottom: 10,
                        children: [
                            /*#__PURE__*/ jsxRuntime.jsx(Overview.GuidedTourHomepageOverview, {}),
                            loading ? /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                children: /*#__PURE__*/ jsxRuntime.jsx(PageHelpers.Page.Loading, {})
                            }) : /*#__PURE__*/ jsxRuntime.jsxs(designSystem.Box, {
                                position: "relative",
                                [widgetLayout.WIDGET_DATA_ATTRIBUTES.GRID_CONTAINER]: true,
                                children: [
                                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Grid.Root, {
                                        gap: 5,
                                        children: widgetLayout$1.map(({ widget, isLastInRow, rightWidgetId, widgetWidth, rightWidgetWidth, canResize })=>/*#__PURE__*/ jsxRuntime.jsxs(React__namespace.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ jsxRuntime.jsx(designSystem.Grid.Item, {
                                                        col: widgetWidth,
                                                        s: 12,
                                                        children: /*#__PURE__*/ jsxRuntime.jsx(WidgetRoot.WidgetRoot, {
                                                            uid: widget.uid,
                                                            title: widget.title,
                                                            icon: widget.icon,
                                                            link: widget.link,
                                                            findWidget: findWidget,
                                                            deleteWidget: deleteWidget,
                                                            onDragStart: handleDragStart,
                                                            onDragEnd: handleDragEnd,
                                                            component: widget.component,
                                                            children: /*#__PURE__*/ jsxRuntime.jsx(WidgetComponent, {
                                                                component: widget.component,
                                                                columnWidth: widgetWidth
                                                            })
                                                        })
                                                    }),
                                                    !isLastInRow && canResize && rightWidgetId && /*#__PURE__*/ jsxRuntime.jsx(ResizeIndicator.WidgetResizeHandle, {
                                                        leftWidgetId: widget.uid,
                                                        rightWidgetId: rightWidgetId,
                                                        leftWidgetWidth: widgetWidth,
                                                        rightWidgetWidth: rightWidgetWidth,
                                                        onResize: handleWidgetResize,
                                                        saveLayout: saveLayout,
                                                        filteredWidgets: filteredWidgets
                                                    }, `resize-${widget.uid}`)
                                                ]
                                            }, widget.uid))
                                    }),
                                    isDraggingWidget && /*#__PURE__*/ jsxRuntime.jsx(GapDropZone.GapDropZoneManager, {
                                        filteredWidgets: filteredWidgets,
                                        columnWidths: columnWidths,
                                        draggedWidgetId: draggedWidgetId,
                                        moveWidget: moveWidget
                                    })
                                ]
                            })
                        ]
                    })
                }),
                /*#__PURE__*/ jsxRuntime.jsx(DragLayer.DragLayer, {
                    renderItem: ({ type, item })=>{
                        if (!DragLayer.isWidgetDragItem(item)) {
                            return null;
                        }
                        const widgetElement = widgetLayout.getWidgetElement(item.id);
                        const maxWidth = `${widgetElement?.clientWidth}px`;
                        return /*#__PURE__*/ jsxRuntime.jsx(DragPreviewWrapper, {
                            $maxWidth: maxWidth,
                            children: /*#__PURE__*/ jsxRuntime.jsx(WidgetRoot.WidgetRoot, {
                                uid: item.id,
                                title: item.title || {
                                    id: `${item.id}`,
                                    defaultMessage: item.id
                                },
                                icon: item.icon,
                                link: item.link,
                                children: /*#__PURE__*/ jsxRuntime.jsx(WidgetComponent, {
                                    component: item.component,
                                    columnWidth: 4
                                })
                            })
                        });
                    }
                })
            ]
        })
    });
};
/* -------------------------------------------------------------------------------------------------
 * HomePage
 * -----------------------------------------------------------------------------------------------*/ const HomePage = ()=>{
    const Page = useEnterprise.useEnterprise(HomePageCE, // eslint-disable-next-line import/no-cycle
    async ()=>(await Promise.resolve().then(function () { return require('../../../../ee/admin/src/pages/HomePage.js'); })).HomePageEE);
    // block rendering until the EE component is fully loaded
    if (!Page) {
        return null;
    }
    return /*#__PURE__*/ jsxRuntime.jsx(Page, {});
};

exports.HomePage = HomePage;
exports.HomePageCE = HomePageCE;
exports.WidgetComponent = WidgetComponent;
//# sourceMappingURL=HomePage.js.map
