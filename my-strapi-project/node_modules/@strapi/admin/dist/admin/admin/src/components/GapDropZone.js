'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var designSystem = require('@strapi/design-system');
var reactDnd = require('react-dnd');
var styled = require('styled-components');
var widgetLayout = require('../utils/widgetLayout.js');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

const DROP_ZONE_SIZE = 20;
const getRowInfo = (row)=>{
    const firstWidgetElement = widgetLayout.getWidgetElement(row.widgets[0].uid);
    const lastWidgetElement = widgetLayout.getWidgetElement(row.widgets[row.widgets.length - 1].uid);
    const containerElement = widgetLayout.getWidgetGridContainer();
    if (!firstWidgetElement || !lastWidgetElement || !containerElement) {
        return null;
    }
    const firstRect = firstWidgetElement.getBoundingClientRect();
    const lastRect = lastWidgetElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    return {
        firstWidgetElement,
        lastWidgetElement,
        containerElement,
        firstRect,
        lastRect,
        containerRect,
        rowHeight: Math.max(firstRect.height, lastRect.height),
        rowTop: firstRect.top - containerRect.top
    };
};
const addVerticalDropZones = (row, rowInfo, rowIndex)=>{
    if (!rowInfo) return [];
    const { containerRect, rowTop, rowHeight } = rowInfo;
    const widgetCount = row.widgets.length;
    // Get widget positions relative to container
    const widgetPositions = row.widgets.map((widget)=>{
        const element = widgetLayout.getWidgetElement(widget.uid);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
            left: rect.left - containerRect.left,
            width: rect.width
        };
    }).filter((pos)=>pos !== null);
    if (widgetPositions.length !== widgetCount) return [];
    const gapDropZones = [];
    // Always add drop zone before the first widget
    gapDropZones.push({
        insertIndex: row.startIndex,
        position: {
            left: widgetPositions[0].left - DROP_ZONE_SIZE,
            top: rowTop,
            height: rowHeight,
            width: DROP_ZONE_SIZE
        },
        isVisible: true,
        type: 'vertical',
        targetRowIndex: rowIndex
    });
    // Add drop zones between widgets
    widgetPositions.slice(0, -1).forEach((currentWidget, i)=>{
        gapDropZones.push({
            insertIndex: row.startIndex + i + 1,
            position: {
                left: currentWidget.left + currentWidget.width,
                top: rowTop,
                height: rowHeight,
                width: DROP_ZONE_SIZE
            },
            isVisible: true,
            type: 'vertical',
            targetRowIndex: rowIndex
        });
    });
    // Always add drop zone after the last widget
    const lastWidget = widgetPositions[widgetCount - 1];
    gapDropZones.push({
        insertIndex: row.endIndex + 1,
        position: {
            left: lastWidget.left + lastWidget.width,
            top: rowTop,
            height: rowHeight,
            width: DROP_ZONE_SIZE
        },
        isVisible: true,
        type: 'vertical',
        targetRowIndex: rowIndex
    });
    return gapDropZones;
};
const addHorizontalDropZones = (row, rowIndex, rowInfo, widgetRows, filteredWidgets)=>{
    if (!rowInfo) return [];
    // Don't show horizontal drop zones if there's only one row with one widget
    if (widgetRows.length === 1 && row.widgets.length === 1) return [];
    const { containerRect } = rowInfo;
    const containerWidth = containerRect.width;
    const horizontalDropZoneHeight = DROP_ZONE_SIZE;
    const gapDropZones = [];
    // Add horizontal drop zone above the first row
    if (rowIndex === 0) {
        const firstRowRect = rowInfo.firstRect;
        const firstRowTop = firstRowRect.top - containerRect.top;
        gapDropZones.push({
            insertIndex: 0,
            position: {
                left: 0,
                top: firstRowTop - horizontalDropZoneHeight,
                height: horizontalDropZoneHeight,
                width: containerWidth
            },
            isVisible: true,
            type: 'horizontal',
            isHorizontalDrop: true
        });
    }
    // Add horizontal drop zone below the current row (between rows or after last row)
    if (rowIndex < widgetRows.length - 1) {
        // Between rows: position above the next row
        const nextRow = widgetRows[rowIndex + 1];
        const nextRowFirstWidgetElement = widgetLayout.getWidgetElement(nextRow.widgets[0].uid);
        if (nextRowFirstWidgetElement) {
            const nextRowRect = nextRowFirstWidgetElement.getBoundingClientRect();
            const nextRowTop = nextRowRect.top - containerRect.top;
            gapDropZones.push({
                insertIndex: row.endIndex + 1,
                position: {
                    left: 0,
                    top: nextRowTop - horizontalDropZoneHeight,
                    height: horizontalDropZoneHeight,
                    width: containerWidth
                },
                isVisible: true,
                type: 'horizontal',
                isHorizontalDrop: true
            });
        }
    } else {
        // After the last row: position below the current row
        const lastRowRect = rowInfo.lastRect;
        const lastRowBottom = lastRowRect.bottom - containerRect.top;
        gapDropZones.push({
            insertIndex: filteredWidgets.length,
            position: {
                left: 0,
                top: lastRowBottom,
                height: horizontalDropZoneHeight,
                width: containerWidth
            },
            isVisible: true,
            type: 'horizontal',
            isHorizontalDrop: true
        });
    }
    return gapDropZones;
};
const GapDropZoneManager = ({ filteredWidgets, columnWidths, draggedWidgetId, moveWidget })=>{
    const [positions, setPositions] = React__namespace.useState([]);
    // Calculate widget rows
    const widgetRows = React__namespace.useMemo(()=>{
        return widgetLayout.calculateWidgetRows(filteredWidgets, columnWidths);
    }, [
        filteredWidgets,
        columnWidths
    ]);
    // Main function to calculate GapDropZone positions
    const calculateGapDropZonePositions = React__namespace.useCallback(()=>{
        const gapDropZones = [];
        // Find which row the dragged widget is from
        const draggedWidgetRow = draggedWidgetId ? widgetRows.find((row)=>row.widgets.some((widget)=>widget.uid === draggedWidgetId)) : null;
        widgetRows.forEach((row, rowIndex)=>{
            const rowInfo = getRowInfo(row);
            if (!rowInfo) return;
            const widgetCount = row.widgets.length;
            // Determine if we should show vertical drop zones for this row
            const isDraggingFromThisRow = draggedWidgetRow && draggedWidgetRow === row;
            const isDraggingFromAnotherRow = draggedWidgetRow && draggedWidgetRow !== row;
            const canAcceptMoreWidgets = widgetCount < 3;
            const shouldShowVerticalDropZones = isDraggingFromThisRow || isDraggingFromAnotherRow && canAcceptMoreWidgets;
            // Add vertical drop zones based on widget count
            if (shouldShowVerticalDropZones) {
                const verticalDropZones = addVerticalDropZones(row, rowInfo, rowIndex);
                gapDropZones.push(...verticalDropZones);
            }
            // Add horizontal drop zones
            const horizontalDropZones = addHorizontalDropZones(row, rowIndex, rowInfo, widgetRows, filteredWidgets);
            gapDropZones.push(...horizontalDropZones);
        });
        return gapDropZones;
    }, [
        widgetRows,
        draggedWidgetId,
        filteredWidgets
    ]);
    React__namespace.useLayoutEffect(()=>{
        const updatePositions = ()=>{
            const newPositions = calculateGapDropZonePositions();
            setPositions(newPositions);
        };
        updatePositions();
        // Update positions on container resize using ResizeObserver
        const containerElement = widgetLayout.getWidgetGridContainer();
        if (!containerElement) return;
        const resizeObserver = new ResizeObserver(()=>{
            updatePositions();
        });
        resizeObserver.observe(containerElement);
        return ()=>{
            resizeObserver.disconnect();
        };
    }, [
        calculateGapDropZonePositions
    ]);
    return positions.map((gapDropZone)=>/*#__PURE__*/ jsxRuntime.jsx(GapDropZone, {
            insertIndex: gapDropZone.insertIndex,
            position: gapDropZone.position,
            isVisible: gapDropZone.isVisible,
            type: gapDropZone.type,
            moveWidget: moveWidget,
            targetRowIndex: gapDropZone.targetRowIndex
        }, `gap-drop-zone-${gapDropZone.type}-${gapDropZone.insertIndex}-${gapDropZone.targetRowIndex ?? 'no-row'}`));
};
const GapDropZoneContainer = styled.styled(designSystem.Box)`
  background-color: ${({ $isOver, theme })=>$isOver ? `${theme.colors.primary100}` : 'transparent'};
  border: ${({ $isOver, theme })=>$isOver ? `2px solid ${theme.colors.primary500}` : '2px solid transparent'};
  opacity: ${({ $isOver })=>$isOver ? 1 : 0.6};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: ${({ theme })=>theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  width: ${DROP_ZONE_SIZE}px;
  z-index: 1;
`;
const GapDropZone = ({ insertIndex, position, isVisible, type, moveWidget, targetRowIndex })=>{
    const isHorizontalDrop = type === 'horizontal';
    const [{ isOver }, drop] = reactDnd.useDrop(()=>({
            accept: 'widget',
            drop: (item)=>{
                moveWidget(item.id, insertIndex, targetRowIndex, isHorizontalDrop);
            },
            collect: (monitor)=>({
                    isOver: monitor.isOver()
                })
        }), [
        insertIndex,
        isHorizontalDrop,
        moveWidget,
        targetRowIndex
    ]);
    if (!isVisible) {
        return null;
    }
    return /*#__PURE__*/ jsxRuntime.jsx(GapDropZoneContainer, {
        ref: drop,
        $isOver: isOver,
        style: {
            transform: `translate(${position.left}px, ${position.top}px)`,
            height: `${position.height}px`,
            width: `${position.width}px`
        }
    });
};

exports.DROP_ZONE_SIZE = DROP_ZONE_SIZE;
exports.GapDropZoneManager = GapDropZoneManager;
exports.addHorizontalDropZones = addHorizontalDropZones;
exports.addVerticalDropZones = addVerticalDropZones;
//# sourceMappingURL=GapDropZone.js.map
