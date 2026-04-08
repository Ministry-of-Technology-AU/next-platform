import * as React from 'react';
import type { WidgetWithUID } from '../core/apis/Widgets';
import type { WidgetType } from '@strapi/admin/strapi-admin';
export interface WidgetInfo {
    widget: WidgetType | undefined;
    index: number;
}
export type FindWidgetFunction = (id: string) => WidgetInfo;
export type WidgetIdFunction = (id: string) => void;
export type DragEndFunction = () => void;
interface UseWidgetsOptions {
    filteredWidgets: WidgetWithUID[];
    setFilteredWidgets: (widgets: WidgetWithUID[] | ((prev: WidgetWithUID[]) => WidgetWithUID[])) => void;
}
export declare const useWidgets: ({ filteredWidgets, setFilteredWidgets }: UseWidgetsOptions) => {
    findWidget: FindWidgetFunction;
    deleteWidget: WidgetIdFunction;
    addWidget: (widget: WidgetWithUID) => void;
    moveWidget: (widgetId: string, insertIndex: number, targetRowIndex?: number, isHorizontalDrop?: boolean) => void;
    columnWidths: Record<string, number>;
    setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    handleWidgetResize: (leftWidgetId: string, rightWidgetId: string, newLeftWidth: number, newRightWidth: number) => void;
    saveLayout: () => void;
    isDraggingWidget: boolean;
    draggedWidgetId: string | undefined;
    handleDragStart: WidgetIdFunction;
    handleDragEnd: DragEndFunction;
};
export {};
