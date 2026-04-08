import { jsx } from 'react/jsx-runtime';
import 'react';
import { Box } from '@strapi/design-system';
import { useDragLayer } from 'react-dnd';
import { getWidgetElement } from '../utils/widgetLayout.mjs';

function isWidgetDragItem(item) {
    return typeof item === 'object' && item !== null && 'id' in item && typeof item.id === 'string' && 'originalIndex' in item && typeof item.originalIndex === 'number' && 'title' in item && 'component' in item;
}
function getStyle(initialOffset, currentOffset, mouseOffset, item) {
    if (!initialOffset || !currentOffset || !mouseOffset) {
        return {
            display: 'none'
        };
    }
    const { x, y } = mouseOffset;
    // Only apply custom offset for widget drags
    if (isWidgetDragItem(item)) {
        // Calculate dynamic offset based on widget position and width
        const widgetElement = getWidgetElement(item.id);
        const previewWidth = widgetElement?.clientWidth;
        const offsetX = previewWidth ? -previewWidth + 20 : 0;
        const offsetY = 20;
        return {
            transform: `translate(${x + offsetX}px, ${y + offsetY}px)`
        };
    }
    // Default positioning for non-widget drags
    return {
        transform: `translate(${x}px, ${y}px)`
    };
}
const DragLayer = ({ renderItem })=>{
    const { itemType, isDragging, item, initialOffset, currentOffset, mouseOffset } = useDragLayer((monitor)=>({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
            mouseOffset: monitor.getClientOffset()
        }));
    if (!isDragging) {
        return null;
    }
    return /*#__PURE__*/ jsx(Box, {
        height: "100%",
        left: 0,
        position: "fixed",
        pointerEvents: "none",
        top: 0,
        zIndex: 100,
        width: "100%",
        children: /*#__PURE__*/ jsx(Box, {
            style: getStyle(initialOffset, currentOffset, mouseOffset, item),
            children: renderItem({
                type: itemType,
                item
            })
        })
    });
};

export { DragLayer, isWidgetDragItem };
//# sourceMappingURL=DragLayer.mjs.map
