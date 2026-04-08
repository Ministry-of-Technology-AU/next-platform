import type { WidgetWithUID } from '../../../core/apis/Widgets';
interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddWidget: (widget: WidgetWithUID) => void;
    currentWidgets: WidgetWithUID[];
    availableWidgets: WidgetWithUID[];
}
export declare const AddWidgetModal: ({ isOpen, onClose, onAddWidget, currentWidgets, availableWidgets, }: AddWidgetModalProps) => import("react/jsx-runtime").JSX.Element;
export {};
