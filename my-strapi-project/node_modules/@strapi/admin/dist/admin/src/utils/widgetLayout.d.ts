/**
 *
 * Comprehensive utilities for widget layout operations including sizing, positioning, and layout calculations.
 *
 * Constraints:
 * - Maximum 3 widgets per row (since minimum widget width is 4 columns)
 * - Widget widths are snapped to discrete values: 4 (1/3), 6 (1/2), 8 (2/3), 12 (3/3)
 */
import type { Homepage } from '../../../shared/contracts/homepage';
import type { WidgetWithUID } from '../core/apis/Widgets';
export declare const WIDGET_SIZING: {
    readonly TOTAL_COLUMNS: 12;
    readonly MIN_WIDGET_WIDTH: 4;
    readonly DISCRETE_SIZES: readonly [4, 6, 8, 12];
};
export declare const WIDGET_DATA_ATTRIBUTES: {
    readonly WIDGET_ID: "data-strapi-widget-id";
    readonly GRID_CONTAINER: "data-strapi-grid-container";
};
export declare const getWidgetElement: (uid: string) => HTMLElement | null;
export declare const getWidgetGridContainer: () => HTMLElement | null;
export interface WidgetRow {
    widgets: WidgetWithUID[];
    totalWidth: number;
    startIndex: number;
    endIndex: number;
}
/**
 * Validates if a widget width is valid (within constraints)
 */
export declare const isValidWidgetWidth: (width: number) => boolean;
/**
 * Validates if a resize operation is allowed between two widgets
 */
export declare const isValidResizeOperation: (leftWidth: number, rightWidth: number) => boolean;
/**
 * Gets widget width with fallback to default value
 */
export declare const getWidgetWidth: (columnWidths: Record<string, number>, widgetId: string | undefined, defaultWidth?: number) => number;
/**
 * Calculates the current row structure from widgets and their widths
 */
export declare const calculateWidgetRows: (widgets: WidgetWithUID[], columnWidths: Record<string, number>) => WidgetRow[];
/**
 * Calculates optimal layout for a specific row based on widget count
 * Only enforces constraints when necessary:
 * - 1 widget in row: must be 3/3 (12 columns)
 * - 3 widgets in row: must be 1/3+1/3+1/3 (4+4+4 columns)
 * - 2 widgets in row: preserves existing proportions or uses 1/2+1/2
 */
export declare const calculateOptimalLayoutForRow: (widgetsInRow: WidgetWithUID[], currentColumnWidths: Record<string, number>) => Record<string, number>;
export declare const moveWidgetInArray: (widgets: WidgetWithUID[], widgetId: string, insertIndex: number) => WidgetWithUID[];
export declare const findRowContainingWidget: (widgetRows: WidgetRow[], widgetId: string, widgets: WidgetWithUID[]) => WidgetRow | undefined;
export declare const resizeRowAfterRemoval: (row: WidgetRow | undefined, removedWidgetId: string, currentWidths: Record<string, number>) => Record<string, number>;
export declare const resizeRowAfterAddition: (row: WidgetRow | undefined, addedWidget: WidgetWithUID, insertIndex: number, currentWidths: Record<string, number>) => Record<string, number>;
export declare const isLastWidgetInRow: (widgetIndex: number, widgets: WidgetWithUID[], columnWidths: Record<string, number>) => boolean;
export declare const canResizeBetweenWidgets: (leftWidgetId: string, rightWidgetId: string, columnWidths: Record<string, number>, widgets: WidgetWithUID[]) => boolean;
/**
 * Filters widgets to only include those present in the homepage layout
 */
export declare const filterWidgetsByHomepageLayout: (widgets: WidgetWithUID[], homepageLayout: Homepage.Layout) => WidgetWithUID[];
/**
 * Sorts widgets according to the homepage layout order
 */
export declare const sortWidgetsByHomepageLayout: (widgets: WidgetWithUID[], homepageLayout: Homepage.Layout) => WidgetWithUID[];
/**
 * Applies homepage layout to widgets (filters, sorts, and extracts widths)
 */
export declare const applyHomepageLayout: (authorizedWidgets: WidgetWithUID[], homepageLayout: Homepage.Layout) => {
    filteredWidgets: WidgetWithUID[];
    widths: Record<string, number>;
};
/**
 * Creates default widget widths based on widget count
 * Even count: all widgets get width 6
 * Odd count: all widgets get width 6 except the last one which gets width 12
 */
export declare const createDefaultWidgetWidths: (widgets: WidgetWithUID[]) => Record<string, number>;
