'use strict';

var widgetLayout = require('./widgetLayout.js');

/**
 * Snaps a width value to the nearest discrete size
 */ const snapToDiscreteSize = (width)=>{
    return widgetLayout.WIDGET_SIZING.DISCRETE_SIZES.reduce((prev, curr)=>Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev);
};
/**
 * Ensures two widths sum to exactly 12 columns by adjusting the right width
 */ const adjustToTotalColumns = (leftWidth, rightWidth)=>{
    const totalWidth = leftWidth + rightWidth;
    if (totalWidth !== widgetLayout.WIDGET_SIZING.TOTAL_COLUMNS) {
        const difference = widgetLayout.WIDGET_SIZING.TOTAL_COLUMNS - totalWidth;
        rightWidth += difference;
    }
    return {
        leftWidth,
        rightWidth
    };
};
/**
 * Validates if two widget widths together are valid (sum to 12 columns)
 */ const isValidResize = (leftWidth, rightWidth)=>{
    return leftWidth >= widgetLayout.WIDGET_SIZING.MIN_WIDGET_WIDTH && rightWidth >= widgetLayout.WIDGET_SIZING.MIN_WIDGET_WIDTH && leftWidth + rightWidth === widgetLayout.WIDGET_SIZING.TOTAL_COLUMNS;
};
/**
 * Get bounding rects for all elements
 */ const getElementRects = (leftElement, rightElement, containerElement)=>{
    if (!leftElement || !rightElement || !containerElement) {
        return null;
    }
    return {
        leftRect: leftElement.getBoundingClientRect(),
        rightRect: rightElement.getBoundingClientRect(),
        containerRect: containerElement.getBoundingClientRect()
    };
};
/**
 * Calculate resize handle position from DOM elements
 */ const calculateResizeHandlePosition = (leftElement, rightElement, containerElement)=>{
    const rects = getElementRects(leftElement, rightElement, containerElement);
    if (!rects) {
        return {
            left: 0,
            top: 0,
            height: 0
        };
    }
    const { leftRect, rightRect, containerRect } = rects;
    const left = leftRect.right - containerRect.left;
    const top = leftRect.top - containerRect.top;
    const height = Math.max(leftRect.height, rightRect.height);
    return {
        left,
        top,
        height
    };
};
/**
 * Calculate row bounds for resize indicator from DOM elements
 */ const calculateRowBounds = (leftElement, rightElement, containerElement)=>{
    const rects = getElementRects(leftElement, rightElement, containerElement);
    if (!rects) {
        return null;
    }
    const { leftRect, rightRect, containerRect } = rects;
    const rowLeft = Math.min(leftRect.left, rightRect.left) - containerRect.left;
    const rowTop = leftRect.top - containerRect.top;
    const rowWidth = Math.max(leftRect.right, rightRect.right) - Math.min(leftRect.left, rightRect.left);
    const rowHeight = Math.max(leftRect.height, rightRect.height);
    return {
        left: rowLeft,
        top: rowTop,
        width: rowWidth,
        height: rowHeight
    };
};
/**
 * Calculates target widths for a resize operation based on delta movement
 */ const calculateTargetWidths = (deltaColumns, startLeftWidth, startRightWidth)=>{
    let targetLeftWidth = startLeftWidth + deltaColumns;
    let targetRightWidth = startRightWidth - deltaColumns;
    targetLeftWidth = snapToDiscreteSize(targetLeftWidth);
    targetRightWidth = snapToDiscreteSize(targetRightWidth);
    // Adjust to maintain total columns constraint
    const adjusted = adjustToTotalColumns(targetLeftWidth, targetRightWidth);
    return {
        targetLeftWidth: adjusted.leftWidth,
        targetRightWidth: adjusted.rightWidth
    };
};
/**
 * Determines if a resize operation should trigger based on value changes
 * Used for performance optimization to prevent unnecessary updates
 */ const shouldTriggerResize = (leftWidth, rightWidth, lastResizeValues)=>{
    return leftWidth !== lastResizeValues.leftWidth || rightWidth !== lastResizeValues.rightWidth;
};

exports.adjustToTotalColumns = adjustToTotalColumns;
exports.calculateResizeHandlePosition = calculateResizeHandlePosition;
exports.calculateRowBounds = calculateRowBounds;
exports.calculateTargetWidths = calculateTargetWidths;
exports.getElementRects = getElementRects;
exports.isValidResize = isValidResize;
exports.shouldTriggerResize = shouldTriggerResize;
exports.snapToDiscreteSize = snapToDiscreteSize;
//# sourceMappingURL=resizeHandlers.js.map
