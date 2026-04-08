import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { Main, Button, Flex, Box, Grid } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { styled } from 'styled-components';
import { DragLayer, isWidgetDragItem } from '../../components/DragLayer.mjs';
import { GapDropZoneManager } from '../../components/GapDropZone.mjs';
import { GuidedTourHomepageOverview } from '../../components/GuidedTour/Overview.mjs';
import { Layouts } from '../../components/Layouts/Layout.mjs';
import { Page } from '../../components/PageHelpers.mjs';
import { WidgetResizeHandle } from '../../components/ResizeIndicator.mjs';
import { Widget } from '../../components/WidgetHelpers.mjs';
import { WidgetRoot } from '../../components/WidgetRoot.mjs';
import '../../services/admin.mjs';
import { useEnterprise } from '../../hooks/useEnterprise.mjs';
import '../../../../ee/admin/src/services/ai.mjs';
import { useAuth } from '../../features/Auth.mjs';
import { useStrapiApp } from '../../features/StrapiApp.mjs';
import { useWidgets } from '../../features/Widgets.mjs';
import { useGetHomepageLayoutQuery } from '../../services/homepage.mjs';
import { applyHomepageLayout, createDefaultWidgetWidths, getWidgetWidth, isLastWidgetInRow, canResizeBetweenWidgets, WIDGET_DATA_ATTRIBUTES, getWidgetElement } from '../../utils/widgetLayout.mjs';
import { AddWidgetModal } from './components/AddWidgetModal.mjs';
import { FreeTrialEndedModal } from './components/FreeTrialEndedModal.mjs';
import { FreeTrialWelcomeModal } from './components/FreeTrialWelcomeModal.mjs';

// Styled wrapper for the drag preview
const DragPreviewWrapper = styled.div`
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
    const [loadedComponent, setLoadedComponent] = React.useState(null);
    React.useEffect(()=>{
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
        return /*#__PURE__*/ jsx(Widget.Loading, {});
    }
    return /*#__PURE__*/ jsx(Component, {
        ...{
            columnWidth
        }
    });
};
/* -------------------------------------------------------------------------------------------------
 * HomePageCE
 * -----------------------------------------------------------------------------------------------*/ const HomePageCE = ()=>{
    const { formatMessage } = useIntl();
    const user = useAuth('HomePageCE', (state)=>state.user);
    const displayName = user?.firstname ?? user?.username ?? user?.email;
    const getAllWidgets = useStrapiApp('UnstableHomepageCe', (state)=>state.widgets.getAll);
    const checkUserHasPermissions = useAuth('WidgetRoot', (state)=>state.checkUserHasPermissions);
    const { data: homepageLayout, isLoading: _isLoadingLayout } = useGetHomepageLayoutQuery();
    const [filteredWidgets, setFilteredWidgets] = React.useState([]);
    const [allAvailableWidgets, setAllAvailableWidgets] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = React.useState(false);
    // Use custom hook for widget management
    const { findWidget, deleteWidget, addWidget, moveWidget, columnWidths, setColumnWidths, handleWidgetResize, saveLayout, isDraggingWidget, draggedWidgetId, handleDragStart, handleDragEnd } = useWidgets({
        filteredWidgets,
        setFilteredWidgets
    });
    React.useEffect(()=>{
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
    React.useEffect(()=>{
        if (allAvailableWidgets.length === 0) return;
        // If user has customized the homepage layout, apply it
        if (homepageLayout && homepageLayout.widgets) {
            const { filteredWidgets, widths: homepageWidths } = applyHomepageLayout(allAvailableWidgets, homepageLayout);
            setFilteredWidgets(filteredWidgets);
            setColumnWidths(homepageWidths);
        } else {
            // Set default layout when no custom layout exists
            setFilteredWidgets(allAvailableWidgets);
            setColumnWidths(createDefaultWidgetWidths(allAvailableWidgets));
        }
    }, [
        homepageLayout,
        allAvailableWidgets,
        setColumnWidths
    ]);
    const widgetLayout = React.useMemo(()=>{
        return filteredWidgets.map((widget, index)=>{
            const rightWidgetId = filteredWidgets[index + 1]?.uid;
            const widgetWidth = getWidgetWidth(columnWidths, widget.uid);
            const rightWidgetWidth = getWidgetWidth(columnWidths, rightWidgetId);
            return {
                widget,
                index,
                isLastInRow: isLastWidgetInRow(index, filteredWidgets, columnWidths),
                rightWidgetId,
                widgetWidth,
                rightWidgetWidth,
                canResize: rightWidgetId && canResizeBetweenWidgets(widget.uid, rightWidgetId, columnWidths, filteredWidgets)
            };
        });
    }, [
        filteredWidgets,
        columnWidths
    ]);
    return /*#__PURE__*/ jsx(Layouts.Root, {
        children: /*#__PURE__*/ jsxs(Main, {
            children: [
                /*#__PURE__*/ jsx(Page.Title, {
                    children: formatMessage({
                        id: 'HomePage.head.title',
                        defaultMessage: 'Homepage'
                    })
                }),
                /*#__PURE__*/ jsx(Layouts.Header, {
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
                    primaryAction: /*#__PURE__*/ jsx(Button, {
                        variant: "tertiary",
                        size: "S",
                        startIcon: /*#__PURE__*/ jsx(Plus, {}),
                        onClick: ()=>setIsAddWidgetModalOpen(true),
                        children: formatMessage({
                            id: 'HomePage.addWidget.button',
                            defaultMessage: 'Add Widget'
                        })
                    })
                }),
                /*#__PURE__*/ jsx(FreeTrialWelcomeModal, {}),
                /*#__PURE__*/ jsx(FreeTrialEndedModal, {}),
                /*#__PURE__*/ jsx(AddWidgetModal, {
                    isOpen: isAddWidgetModalOpen,
                    onClose: ()=>setIsAddWidgetModalOpen(false),
                    onAddWidget: addWidget,
                    currentWidgets: filteredWidgets,
                    availableWidgets: allAvailableWidgets
                }),
                /*#__PURE__*/ jsx(Layouts.Content, {
                    children: /*#__PURE__*/ jsxs(Flex, {
                        direction: "column",
                        alignItems: "stretch",
                        gap: 8,
                        paddingBottom: 10,
                        children: [
                            /*#__PURE__*/ jsx(GuidedTourHomepageOverview, {}),
                            loading ? /*#__PURE__*/ jsx(Box, {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                children: /*#__PURE__*/ jsx(Page.Loading, {})
                            }) : /*#__PURE__*/ jsxs(Box, {
                                position: "relative",
                                [WIDGET_DATA_ATTRIBUTES.GRID_CONTAINER]: true,
                                children: [
                                    /*#__PURE__*/ jsx(Grid.Root, {
                                        gap: 5,
                                        children: widgetLayout.map(({ widget, isLastInRow, rightWidgetId, widgetWidth, rightWidgetWidth, canResize })=>/*#__PURE__*/ jsxs(React.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ jsx(Grid.Item, {
                                                        col: widgetWidth,
                                                        s: 12,
                                                        children: /*#__PURE__*/ jsx(WidgetRoot, {
                                                            uid: widget.uid,
                                                            title: widget.title,
                                                            icon: widget.icon,
                                                            link: widget.link,
                                                            findWidget: findWidget,
                                                            deleteWidget: deleteWidget,
                                                            onDragStart: handleDragStart,
                                                            onDragEnd: handleDragEnd,
                                                            component: widget.component,
                                                            children: /*#__PURE__*/ jsx(WidgetComponent, {
                                                                component: widget.component,
                                                                columnWidth: widgetWidth
                                                            })
                                                        })
                                                    }),
                                                    !isLastInRow && canResize && rightWidgetId && /*#__PURE__*/ jsx(WidgetResizeHandle, {
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
                                    isDraggingWidget && /*#__PURE__*/ jsx(GapDropZoneManager, {
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
                /*#__PURE__*/ jsx(DragLayer, {
                    renderItem: ({ type, item })=>{
                        if (!isWidgetDragItem(item)) {
                            return null;
                        }
                        const widgetElement = getWidgetElement(item.id);
                        const maxWidth = `${widgetElement?.clientWidth}px`;
                        return /*#__PURE__*/ jsx(DragPreviewWrapper, {
                            $maxWidth: maxWidth,
                            children: /*#__PURE__*/ jsx(WidgetRoot, {
                                uid: item.id,
                                title: item.title || {
                                    id: `${item.id}`,
                                    defaultMessage: item.id
                                },
                                icon: item.icon,
                                link: item.link,
                                children: /*#__PURE__*/ jsx(WidgetComponent, {
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
    const Page = useEnterprise(HomePageCE, // eslint-disable-next-line import/no-cycle
    async ()=>(await import('../../../../ee/admin/src/pages/HomePage.mjs')).HomePageEE);
    // block rendering until the EE component is fully loaded
    if (!Page) {
        return null;
    }
    return /*#__PURE__*/ jsx(Page, {});
};

export { HomePage, HomePageCE, WidgetComponent };
//# sourceMappingURL=HomePage.mjs.map
