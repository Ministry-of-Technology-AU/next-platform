/**
 * These functions handle DOM element positioning, bounding rect calculations, and resize-specific logic.
 */
/**
 * Snaps a width value to the nearest discrete size
 */
export declare const snapToDiscreteSize: (width: number) => number;
/**
 * Ensures two widths sum to exactly 12 columns by adjusting the right width
 */
export declare const adjustToTotalColumns: (leftWidth: number, rightWidth: number) => {
    leftWidth: number;
    rightWidth: number;
};
/**
 * Validates if two widget widths together are valid (sum to 12 columns)
 */
export declare const isValidResize: (leftWidth: number, rightWidth: number) => boolean;
/**
 * Get bounding rects for all elements
 */
export declare const getElementRects: (leftElement: Element | null, rightElement: Element | null, containerElement: Element | null) => {
    leftRect: DOMRect;
    rightRect: DOMRect;
    containerRect: DOMRect;
} | null;
/**
 * Calculate resize handle position from DOM elements
 */
export declare const calculateResizeHandlePosition: (leftElement: Element | null, rightElement: Element | null, containerElement: Element | null) => {
    left: number;
    top: number;
    height: number;
};
/**
 * Calculate row bounds for resize indicator from DOM elements
 */
export declare const calculateRowBounds: (leftElement: Element | null, rightElement: Element | null, containerElement: Element | null) => {
    left: number;
    top: number;
    width: number;
    height: number;
} | null;
/**
 * Calculates target widths for a resize operation based on delta movement
 */
export declare const calculateTargetWidths: (deltaColumns: number, startLeftWidth: number, startRightWidth: number) => {
    targetLeftWidth: number;
    targetRightWidth: number;
};
/**
 * Determines if a resize operation should trigger based on value changes
 * Used for performance optimization to prevent unnecessary updates
 */
export declare const shouldTriggerResize: (leftWidth: number, rightWidth: number, lastResizeValues: {
    leftWidth: number;
    rightWidth: number;
}) => boolean;
