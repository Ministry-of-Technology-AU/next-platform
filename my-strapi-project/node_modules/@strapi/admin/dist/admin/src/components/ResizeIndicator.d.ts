import type { WidgetWithUID } from '../core/apis/Widgets';
interface WidgetResizeHandleProps {
    leftWidgetId: string;
    rightWidgetId: string;
    leftWidgetWidth: number;
    rightWidgetWidth: number;
    onResize: (leftWidgetId: string, rightWidgetId: string, newLeftWidth: number, newRightWidth: number) => void;
    saveLayout: () => void;
    filteredWidgets?: WidgetWithUID[];
}
export declare const WidgetResizeHandle: ({ leftWidgetId, rightWidgetId, leftWidgetWidth, rightWidgetWidth, onResize, saveLayout, }: WidgetResizeHandleProps) => import("react/jsx-runtime").JSX.Element;
export {};
