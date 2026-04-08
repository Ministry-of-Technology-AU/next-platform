'use strict';

var React = require('react');
var reactIntl = require('react-intl');
var useAPIErrorHandler = require('../hooks/useAPIErrorHandler.js');
var homepage = require('../services/homepage.js');
var widgetLayout = require('../utils/widgetLayout.js');
var Notifications = require('./Notifications.js');

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

/* -------------------------------------------------------------------------------------------------
 * Widget Management
 * -----------------------------------------------------------------------------------------------*/ const findWidget = (filteredWidgets, widgetId)=>{
    const widget = filteredWidgets.find((c)=>`${c.uid}` === widgetId);
    if (!widget) {
        return {
            widget: undefined,
            index: -1
        };
    }
    return {
        widget,
        index: filteredWidgets.indexOf(widget)
    };
};
const saveLayout = async ({ widgets, widths, updateHomepageLayout, toggleNotification, formatAPIError, formatMessage })=>{
    try {
        const layoutData = {
            widgets: widgets.map((widget)=>({
                    uid: widget.uid,
                    width: widths[widget.uid] || widgetLayout.WIDGET_SIZING.TOTAL_COLUMNS
                }))
        };
        const res = await updateHomepageLayout(layoutData);
        if ('error' in res) {
            toggleNotification({
                type: 'danger',
                message: formatAPIError(res.error)
            });
        }
    } catch  {
        toggleNotification({
            type: 'danger',
            message: formatMessage({
                id: 'notification.error',
                defaultMessage: 'An error occured'
            })
        });
    }
};
const moveWidget = ({ filteredWidgets, columnWidths, widgetId, insertIndex, targetRowIndex, isHorizontalDrop })=>{
    const widget = filteredWidgets.find((w)=>w.uid === widgetId);
    if (!widget) return {
        newWidgets: filteredWidgets,
        newWidths: columnWidths
    };
    const widgetRows = widgetLayout.calculateWidgetRows(filteredWidgets, columnWidths);
    // Move widget in the array
    const newWidgets = widgetLayout.moveWidgetInArray(filteredWidgets, widgetId, insertIndex);
    // Calculate optimal widths for both source and target rows
    const newWidths = {
        ...columnWidths
    };
    // Find the source row (where the widget was removed from)
    const sourceRow = widgetLayout.findRowContainingWidget(widgetRows, widgetId, filteredWidgets);
    if (isHorizontalDrop) {
        // This is a horizontal drop zone - widget gets full width in its own row
        newWidths[widgetId] = widgetLayout.WIDGET_SIZING.TOTAL_COLUMNS;
        // Resize source row (after widget removal)
        const sourceRowResize = widgetLayout.resizeRowAfterRemoval(sourceRow, widgetId, newWidths);
        Object.assign(newWidths, sourceRowResize);
    } else {
        // This is a vertical drop zone within a row
        const targetRow = widgetRows[targetRowIndex];
        // Check if we're reordering within the same row
        const isSameRowReorder = sourceRow && targetRow && sourceRow.startIndex === targetRow.startIndex;
        if (isSameRowReorder) {
            // For same-row reordering, just preserve the existing widths
            return {
                newWidgets,
                newWidths
            };
        }
        // Different rows - resize both source and target rows
        // Resize source row (after widget removal)
        const sourceRowResize = widgetLayout.resizeRowAfterRemoval(sourceRow, widgetId, newWidths);
        Object.assign(newWidths, sourceRowResize);
        // Resize target row (after widget addition)
        const targetRowResize = widgetLayout.resizeRowAfterAddition(targetRow, widget, insertIndex, newWidths);
        Object.assign(newWidths, targetRowResize);
    }
    return {
        newWidgets,
        newWidths
    };
};
const deleteWidget = (filteredWidgets, columnWidths)=>{
    const widgetRows = widgetLayout.calculateWidgetRows(filteredWidgets, columnWidths);
    return (widgetId)=>{
        const { [widgetId]: _removed, ...newWidths } = columnWidths;
        // Find the row containing the deleted widget
        const deletedWidgetIndex = filteredWidgets.findIndex((w)=>w.uid === widgetId);
        if (deletedWidgetIndex === -1) return {
            newWidgets: filteredWidgets,
            newWidths
        };
        const affectedRow = widgetRows.find((row)=>deletedWidgetIndex >= row.startIndex && deletedWidgetIndex <= row.endIndex);
        // Use resizeRowAfterRemoval to resize the affected row
        const finalWidths = widgetLayout.resizeRowAfterRemoval(affectedRow, widgetId, newWidths);
        const newWidgets = filteredWidgets.filter((w)=>w.uid !== widgetId);
        return {
            newWidgets,
            newWidths: finalWidths
        };
    };
};
const addWidget = (filteredWidgets, columnWidths)=>{
    return (widget)=>{
        // Check if widget is already added
        const index = filteredWidgets.findIndex((w)=>w.uid === widget.uid);
        if (index !== -1) return {
            newWidgets: filteredWidgets,
            newWidths: columnWidths
        };
        const newWidgets = [
            ...filteredWidgets,
            widget
        ];
        const newWidths = {
            ...columnWidths
        };
        // New widget always takes full width in its own row
        newWidths[widget.uid] = widgetLayout.WIDGET_SIZING.TOTAL_COLUMNS;
        return {
            newWidgets,
            newWidths
        };
    };
};
const handleWidgetResize = ({ filteredWidgets, columnWidths, leftWidgetId, rightWidgetId, newLeftWidth, newRightWidth })=>{
    // Check if widgets can be resized (adjacent, same row, valid sizes)
    if (!widgetLayout.canResizeBetweenWidgets(leftWidgetId, rightWidgetId, columnWidths, filteredWidgets)) {
        return columnWidths;
    }
    if (!widgetLayout.isValidResizeOperation(newLeftWidth, newRightWidth)) {
        // Resize would violate constraints, don't allow it
        return columnWidths;
    }
    return {
        ...columnWidths,
        [leftWidgetId]: newLeftWidth,
        [rightWidgetId]: newRightWidth
    };
};
const useWidgets = ({ filteredWidgets, setFilteredWidgets })=>{
    const [columnWidths, setColumnWidths] = React__namespace.useState({});
    const [isDraggingWidget, setIsDraggingWidget] = React__namespace.useState(false);
    const [draggedWidgetId, setDraggedWidgetId] = React__namespace.useState();
    const [updateHomepageLayout] = homepage.useUpdateHomepageLayoutMutation();
    const { toggleNotification } = Notifications.useNotification();
    const { _unstableFormatAPIError: formatAPIError } = useAPIErrorHandler.useAPIErrorHandler();
    const { formatMessage } = reactIntl.useIntl();
    const findWidgetFn = (widgetId)=>findWidget(filteredWidgets, widgetId);
    const moveWidgetFn = (widgetId, insertIndex, targetRowIndex, isHorizontalDrop)=>{
        const result = moveWidget({
            filteredWidgets,
            columnWidths,
            widgetId,
            insertIndex,
            targetRowIndex,
            isHorizontalDrop
        });
        setFilteredWidgets(result.newWidgets);
        setColumnWidths(result.newWidths);
        saveLayout({
            widgets: result.newWidgets,
            widths: result.newWidths,
            updateHomepageLayout,
            toggleNotification,
            formatAPIError,
            formatMessage
        });
    };
    const deleteWidgetFn = (widgetId)=>{
        const deleteWidgetOperation = deleteWidget(filteredWidgets, columnWidths);
        const result = deleteWidgetOperation(widgetId);
        setFilteredWidgets(result.newWidgets);
        setColumnWidths(result.newWidths);
        saveLayout({
            widgets: result.newWidgets,
            widths: result.newWidths,
            updateHomepageLayout,
            toggleNotification,
            formatAPIError,
            formatMessage
        });
    };
    const addWidgetFn = (widget)=>{
        const addWidgetOperation = addWidget(filteredWidgets, columnWidths);
        const result = addWidgetOperation(widget);
        setFilteredWidgets(result.newWidgets);
        setColumnWidths(result.newWidths);
        saveLayout({
            widgets: result.newWidgets,
            widths: result.newWidths,
            updateHomepageLayout,
            toggleNotification,
            formatAPIError,
            formatMessage
        });
    };
    const handleWidgetResizeFn = (leftWidgetId, rightWidgetId, newLeftWidth, newRightWidth)=>{
        const newWidths = handleWidgetResize({
            filteredWidgets,
            columnWidths,
            leftWidgetId,
            rightWidgetId,
            newLeftWidth,
            newRightWidth
        });
        setColumnWidths(newWidths);
    };
    const handleDragStart = React__namespace.useCallback((widgetId)=>{
        setIsDraggingWidget(true);
        setDraggedWidgetId(widgetId);
    }, []);
    const handleDragEnd = React__namespace.useCallback(()=>{
        setIsDraggingWidget(false);
        setDraggedWidgetId(undefined);
    }, []);
    const saveLayoutFn = ()=>{
        saveLayout({
            widgets: filteredWidgets,
            widths: columnWidths,
            updateHomepageLayout,
            toggleNotification,
            formatAPIError,
            formatMessage
        });
    };
    return {
        findWidget: findWidgetFn,
        deleteWidget: deleteWidgetFn,
        addWidget: addWidgetFn,
        moveWidget: moveWidgetFn,
        columnWidths,
        setColumnWidths,
        handleWidgetResize: handleWidgetResizeFn,
        saveLayout: saveLayoutFn,
        isDraggingWidget,
        draggedWidgetId,
        handleDragStart,
        handleDragEnd
    };
};

exports.useWidgets = useWidgets;
//# sourceMappingURL=Widgets.js.map
