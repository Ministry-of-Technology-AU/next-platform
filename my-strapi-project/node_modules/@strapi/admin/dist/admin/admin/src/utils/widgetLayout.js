'use strict';

/**
 *
 * Comprehensive utilities for widget layout operations including sizing, positioning, and layout calculations.
 *
 * Constraints:
 * - Maximum 3 widgets per row (since minimum widget width is 4 columns)
 * - Widget widths are snapped to discrete values: 4 (1/3), 6 (1/2), 8 (2/3), 12 (3/3)
 */ const WIDGET_SIZING = {
    TOTAL_COLUMNS: 12,
    MIN_WIDGET_WIDTH: 4,
    DISCRETE_SIZES: [
        4,
        6,
        8,
        12
    ]
};
const WIDGET_DATA_ATTRIBUTES = {
    WIDGET_ID: 'data-strapi-widget-id',
    GRID_CONTAINER: 'data-strapi-grid-container'
};
const getWidgetElement = (uid)=>{
    return document.querySelector(`[${WIDGET_DATA_ATTRIBUTES.WIDGET_ID}="${uid}"]`);
};
const getWidgetGridContainer = ()=>{
    return document.querySelector(`[${WIDGET_DATA_ATTRIBUTES.GRID_CONTAINER}]`);
};
/**
 * Validates if a widget width is valid (within constraints)
 */ const isValidWidgetWidth = (width)=>{
    return width >= WIDGET_SIZING.MIN_WIDGET_WIDTH && width <= WIDGET_SIZING.TOTAL_COLUMNS;
};
/**
 * Validates if a resize operation is allowed between two widgets
 */ const isValidResizeOperation = (leftWidth, rightWidth)=>{
    // Check minimum size constraints
    if (!isValidWidgetWidth(leftWidth) || !isValidWidgetWidth(rightWidth)) {
        return false;
    }
    // Check if the total doesn't exceed row capacity
    if (leftWidth + rightWidth > WIDGET_SIZING.TOTAL_COLUMNS) {
        return false;
    }
    return true;
};
/**
 * Gets widget width with fallback to default value
 */ const getWidgetWidth = (columnWidths, widgetId, defaultWidth = 6)=>{
    return widgetId ? columnWidths[widgetId] || defaultWidth : defaultWidth;
};
/**
 * Calculates the current row structure from widgets and their widths
 */ const calculateWidgetRows = (widgets, columnWidths)=>{
    const rows = [];
    let currentRow = [];
    let currentRowWidth = 0;
    let startIndex = 0;
    widgets.forEach((widget, index)=>{
        const widgetWidth = getWidgetWidth(columnWidths, widget.uid);
        // If adding this widget would exceed 12 columns, start a new row
        if (currentRowWidth + widgetWidth > WIDGET_SIZING.TOTAL_COLUMNS) {
            if (currentRow.length > 0) {
                rows.push({
                    widgets: currentRow,
                    totalWidth: currentRowWidth,
                    startIndex,
                    endIndex: startIndex + currentRow.length - 1
                });
            }
            currentRow = [
                widget
            ];
            currentRowWidth = widgetWidth;
            startIndex = index;
        } else {
            currentRow.push(widget);
            currentRowWidth += widgetWidth;
        }
    });
    // Add the last row if it has widgets
    if (currentRow.length > 0) {
        rows.push({
            widgets: currentRow,
            totalWidth: currentRowWidth,
            startIndex,
            endIndex: startIndex + currentRow.length - 1
        });
    }
    return rows;
};
/**
 * Calculates optimal layout for a specific row based on widget count
 * Only enforces constraints when necessary:
 * - 1 widget in row: must be 3/3 (12 columns)
 * - 3 widgets in row: must be 1/3+1/3+1/3 (4+4+4 columns)
 * - 2 widgets in row: preserves existing proportions or uses 1/2+1/2
 */ const calculateOptimalLayoutForRow = (widgetsInRow, currentColumnWidths)=>{
    const newWidths = {
        ...currentColumnWidths
    };
    const widgetCount = widgetsInRow.length;
    if (widgetCount === 1) {
        // Single widget must take full width (12)
        newWidths[widgetsInRow[0].uid] = 12;
    } else if (widgetCount === 3) {
        // Three widgets must be equal (4 + 4 + 4)
        widgetsInRow.forEach((widget)=>{
            newWidths[widget.uid] = 4;
        });
    } else if (widgetCount === 2) {
        // Two widgets can be flexible - preserve existing proportions or use 6 + 6
        const currentWidths = widgetsInRow.map((widget)=>getWidgetWidth(currentColumnWidths, widget.uid));
        const totalWidth = currentWidths.reduce((sum, width)=>sum + width, 0);
        if (totalWidth === 12) {
            // Row is already properly sized, preserve proportions
            widgetsInRow.forEach((widget, index)=>{
                newWidths[widget.uid] = currentWidths[index];
            });
        } else {
            // Row needs adjustment, use equal split
            widgetsInRow.forEach((widget)=>{
                newWidths[widget.uid] = 6;
            });
        }
    }
    return newWidths;
};
const moveWidgetInArray = (widgets, widgetId, insertIndex)=>{
    const currentIndex = widgets.findIndex((w)=>w.uid === widgetId);
    if (currentIndex === -1) return widgets;
    // Remove widget from current position
    const widgetsWithoutMoved = widgets.filter((w)=>w.uid !== widgetId);
    // Insert at new position (adjust index if moving forward)
    const adjustedInsertIndex = insertIndex > currentIndex ? insertIndex - 1 : insertIndex;
    const newWidgets = [
        ...widgetsWithoutMoved
    ];
    newWidgets.splice(adjustedInsertIndex, 0, widgets[currentIndex]);
    return newWidgets;
};
const findRowContainingWidget = (widgetRows, widgetId, widgets)=>{
    const widgetIndex = widgets.findIndex((w)=>w.uid === widgetId);
    if (widgetIndex === -1) return undefined;
    return widgetRows.find((row)=>widgetIndex >= row.startIndex && widgetIndex <= row.endIndex);
};
const resizeRowAfterRemoval = (row, removedWidgetId, currentWidths)=>{
    if (!row) return currentWidths;
    const remainingWidgets = row.widgets.filter((w)=>w.uid !== removedWidgetId);
    return calculateOptimalLayoutForRow(remainingWidgets, currentWidths);
};
const resizeRowAfterAddition = (row, addedWidget, insertIndex, currentWidths)=>{
    if (!row) return currentWidths;
    // Calculate the new widget arrangement for the target row
    const targetRowWidgets = [
        ...row.widgets
    ];
    const existingIndex = targetRowWidgets.findIndex((w)=>w.uid === addedWidget.uid);
    if (existingIndex !== -1) {
        // Widget was already in this row, just reorder
        targetRowWidgets.splice(existingIndex, 1);
    }
    // Insert at the new position within the row
    let insertPosition = insertIndex - row.startIndex;
    // If insertIndex is at the end of the row (row.endIndex + 1),
    // insert at the end of the row instead of beyond it
    if (insertIndex === row.endIndex + 1) {
        insertPosition = row.widgets.length;
    }
    targetRowWidgets.splice(insertPosition, 0, addedWidget);
    return calculateOptimalLayoutForRow(targetRowWidgets, currentWidths);
};
const isLastWidgetInRow = (widgetIndex, widgets, columnWidths)=>{
    if (widgetIndex >= widgets.length - 1) {
        return true; // Last widget overall
    }
    let currentRowWidth = 0;
    // Calculate the current row width by going through widgets from the start
    for(let i = 0; i <= widgetIndex; i++){
        const widgetWidth = getWidgetWidth(columnWidths, widgets[i]?.uid);
        if (currentRowWidth + widgetWidth > WIDGET_SIZING.TOTAL_COLUMNS) {
            // This widget starts a new row, so the previous widget was the last in its row
            currentRowWidth = widgetWidth;
        } else {
            currentRowWidth += widgetWidth;
        }
    }
    // Check if the next widget would fit in the current row
    const nextWidgetWidth = getWidgetWidth(columnWidths, widgets[widgetIndex + 1]?.uid);
    return currentRowWidth + nextWidgetWidth > WIDGET_SIZING.TOTAL_COLUMNS;
};
const canResizeBetweenWidgets = (leftWidgetId, rightWidgetId, columnWidths, widgets)=>{
    const leftWidth = getWidgetWidth(columnWidths, leftWidgetId);
    const rightWidth = getWidgetWidth(columnWidths, rightWidgetId);
    // First check if the widgets are actually adjacent in the same row
    const leftIndex = widgets.findIndex((w)=>w.uid === leftWidgetId);
    const rightIndex = widgets.findIndex((w)=>w.uid === rightWidgetId);
    // Widgets must be consecutive in the array and in the same row
    if (rightIndex !== leftIndex + 1) {
        return false;
    }
    // Check if they're in the same row by verifying the right widget isn't the first in a new row
    if (isLastWidgetInRow(leftIndex, widgets, columnWidths)) {
        return false; // Left widget is last in its row, so right widget starts a new row
    }
    // Check if either widget can be made smaller (must be > 4 columns)
    // or if either widget can be made bigger (must be < 12 columns)
    const canLeftShrink = leftWidth > WIDGET_SIZING.MIN_WIDGET_WIDTH;
    const canRightShrink = rightWidth > WIDGET_SIZING.MIN_WIDGET_WIDTH;
    const canLeftGrow = leftWidth < WIDGET_SIZING.TOTAL_COLUMNS;
    const canRightGrow = rightWidth < WIDGET_SIZING.TOTAL_COLUMNS;
    // Resizing is possible if either widget can shrink AND the other can grow
    return canLeftShrink && canRightGrow || canRightShrink && canLeftGrow;
};
/**
 * Filters widgets to only include those present in the homepage layout
 */ const filterWidgetsByHomepageLayout = (widgets, homepageLayout)=>{
    const createHomepageWidgetUidsSet = (homepageLayout)=>new Set(homepageLayout.widgets.map((w)=>w.uid));
    const homepageWidgetUids = createHomepageWidgetUidsSet(homepageLayout);
    return widgets.filter((widget)=>homepageWidgetUids.has(widget.uid));
};
/**
 * Sorts widgets according to the homepage layout order
 */ const sortWidgetsByHomepageLayout = (widgets, homepageLayout)=>{
    const widgetOrderMap = new Map(homepageLayout.widgets.map((widget, index)=>[
            widget.uid,
            index
        ]));
    return [
        ...widgets
    ].sort((a, b)=>{
        const aIndex = widgetOrderMap.get(a.uid) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = widgetOrderMap.get(b.uid) ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
    });
};
/**
 * Applies homepage layout to widgets (filters, sorts, and extracts widths)
 */ const applyHomepageLayout = (authorizedWidgets, homepageLayout)=>{
    const layoutWidgets = filterWidgetsByHomepageLayout(authorizedWidgets, homepageLayout);
    const sortedWidgets = sortWidgetsByHomepageLayout(layoutWidgets, homepageLayout);
    // Extract widths from homepage layout
    const widths = {};
    homepageLayout.widgets.forEach(({ uid, width })=>{
        widths[uid] = width;
    });
    return {
        filteredWidgets: sortedWidgets,
        widths
    };
};
/**
 * Creates default widget widths based on widget count
 * Even count: all widgets get width 6
 * Odd count: all widgets get width 6 except the last one which gets width 12
 */ const createDefaultWidgetWidths = (widgets)=>{
    const defaultWidths = {};
    const widgetCount = widgets.length;
    if (widgetCount > 0) {
        if (widgetCount % 2 === 0) {
            widgets.forEach((widget)=>{
                defaultWidths[widget.uid] = 6;
            });
        } else {
            widgets.forEach((widget, index)=>{
                defaultWidths[widget.uid] = index === widgetCount - 1 ? 12 : 6;
            });
        }
    }
    return defaultWidths;
};

exports.WIDGET_DATA_ATTRIBUTES = WIDGET_DATA_ATTRIBUTES;
exports.WIDGET_SIZING = WIDGET_SIZING;
exports.applyHomepageLayout = applyHomepageLayout;
exports.calculateOptimalLayoutForRow = calculateOptimalLayoutForRow;
exports.calculateWidgetRows = calculateWidgetRows;
exports.canResizeBetweenWidgets = canResizeBetweenWidgets;
exports.createDefaultWidgetWidths = createDefaultWidgetWidths;
exports.filterWidgetsByHomepageLayout = filterWidgetsByHomepageLayout;
exports.findRowContainingWidget = findRowContainingWidget;
exports.getWidgetElement = getWidgetElement;
exports.getWidgetGridContainer = getWidgetGridContainer;
exports.getWidgetWidth = getWidgetWidth;
exports.isLastWidgetInRow = isLastWidgetInRow;
exports.isValidResizeOperation = isValidResizeOperation;
exports.isValidWidgetWidth = isValidWidgetWidth;
exports.moveWidgetInArray = moveWidgetInArray;
exports.resizeRowAfterAddition = resizeRowAfterAddition;
exports.resizeRowAfterRemoval = resizeRowAfterRemoval;
exports.sortWidgetsByHomepageLayout = sortWidgetsByHomepageLayout;
//# sourceMappingURL=widgetLayout.js.map
