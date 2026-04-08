import * as React from 'react';
import { DragLayerMonitor } from 'react-dnd';
import type { WidgetArgs } from '../core/apis/Widgets';
export interface WidgetDragItem extends Pick<WidgetArgs, 'title' | 'icon' | 'link' | 'component'> {
    type: 'widget';
    id: string;
    originalIndex: number;
}
export declare function isWidgetDragItem(item: unknown): item is WidgetDragItem;
export interface DragLayerProps {
    renderItem: (item: {
        item: unknown;
        type: ReturnType<DragLayerMonitor['getItemType']>;
    }) => React.ReactNode;
}
declare const DragLayer: ({ renderItem }: DragLayerProps) => import("react/jsx-runtime").JSX.Element | null;
export { DragLayer };
