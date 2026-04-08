import * as React from 'react';
export declare const WidgetComponent: ({ component, columnWidth, }: {
    component: () => Promise<React.ComponentType>;
    columnWidth: number;
}) => import("react/jsx-runtime").JSX.Element;
declare const HomePageCE: () => import("react/jsx-runtime").JSX.Element;
declare const HomePage: () => import("react/jsx-runtime").JSX.Element | null;
export { HomePage, HomePageCE };
