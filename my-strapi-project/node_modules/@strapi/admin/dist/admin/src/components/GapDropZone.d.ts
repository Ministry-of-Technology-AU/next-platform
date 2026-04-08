import { type WidgetRow } from '../utils/widgetLayout';
import type { WidgetWithUID } from '../core/apis/Widgets';
export declare const DROP_ZONE_SIZE = 20;
export interface GapDropZonePosition {
    insertIndex: number;
    position: {
        left: number;
        top: number;
        height: number;
        width: number;
    };
    isVisible: boolean;
    type: 'vertical' | 'horizontal';
    isHorizontalDrop?: boolean;
    targetRowIndex?: number;
}
interface GapDropZoneManagerProps {
    filteredWidgets: WidgetWithUID[];
    columnWidths: Record<string, number>;
    draggedWidgetId?: string;
    moveWidget: (id: string, to: number, targetRowIndex?: number, isHorizontalDrop?: boolean) => void;
}
declare const getRowInfo: (row: WidgetRow) => {
    firstWidgetElement: HTMLElement;
    lastWidgetElement: HTMLElement;
    containerElement: HTMLElement;
    firstRect: DOMRect;
    lastRect: DOMRect;
    containerRect: DOMRect;
    rowHeight: number;
    rowTop: number;
} | null;
export declare const addVerticalDropZones: (row: WidgetRow, rowInfo: ReturnType<typeof getRowInfo>, rowIndex: number) => GapDropZonePosition[];
export declare const addHorizontalDropZones: (row: WidgetRow, rowIndex: number, rowInfo: ReturnType<typeof getRowInfo>, widgetRows: WidgetRow[], filteredWidgets: WidgetWithUID[]) => GapDropZonePosition[];
export declare const GapDropZoneManager: ({ filteredWidgets, columnWidths, draggedWidgetId, moveWidget, }: GapDropZoneManagerProps) => import("react/jsx-runtime").JSX.Element[];
export {};
