import * as React from 'react';
import type { FindWidgetFunction, WidgetIdFunction, DragEndFunction } from '../features/Widgets';
import type { WidgetType } from '@strapi/admin/strapi-admin';
export interface BaseWidgetProps extends Pick<WidgetType, 'title' | 'icon' | 'permissions' | 'link' | 'uid'> {
    findWidget?: FindWidgetFunction;
    deleteWidget?: WidgetIdFunction;
    onDragStart?: WidgetIdFunction;
    onDragEnd?: DragEndFunction;
}
export interface WidgetRootProps extends BaseWidgetProps {
    children: React.ReactNode;
    component?: () => Promise<React.ComponentType>;
}
export declare const WidgetRoot: ({ title, icon, children, link, uid, findWidget, deleteWidget, onDragStart, onDragEnd, component, }: WidgetRootProps) => import("react/jsx-runtime").JSX.Element;
