'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var designSystem = require('@strapi/design-system');
var styled = require('styled-components');
var resizeHandlers = require('../utils/resizeHandlers.js');
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

const INDICATOR_SIZE = 20;
const IndicatorContainer = styled.styled(designSystem.Box)`
  position: absolute;
  z-index: 1;
  pointer-events: none;
  opacity: ${({ $isVisible })=>$isVisible ? 1 : 0};
  transition: opacity 0.2s ease-in-out;
  background: transparent;
  height: ${INDICATOR_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const DotContainer = styled.styled(designSystem.Box)`
  position: absolute;
  top: 50%;
  left: ${({ $position })=>$position}%;
  transform: translate(-50%, -50%);
`;
const Dot = styled.styled(designSystem.Box)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $isActive, $isCurrent, theme })=>{
    if ($isCurrent) return theme.colors.primary600;
    if ($isActive) return theme.colors.primary500;
    return theme.colors.neutral300;
}};
  transition: all 0.2s ease-in-out;
  box-shadow: ${({ $isCurrent, theme })=>$isCurrent ? `0 0 0 3px ${theme.colors.primary100}` : 'none'};
  transform: ${({ $isCurrent })=>$isCurrent ? 'scale(1.2)' : 'scale(1)'};
`;
const calculateGapAdjustment = (rowWidth, leftColumns)=>{
    const dotWidth = 6;
    const gapAdjustmentPixels = dotWidth / 2; // Half dot width to center on boundary
    const gapAdjustmentPercent = gapAdjustmentPixels / rowWidth * 100;
    // Different adjustments for different positions
    switch(leftColumns){
        case 4:
            return -gapAdjustmentPercent; // Left dot
        case 8:
            return gapAdjustmentPercent; // Right dot
        default:
            return 0;
    }
};
const ResizeIndicator = ({ isVisible, position, currentLeftWidth, currentRightWidth, totalColumns = 12, rowPosition })=>{
    // Calculate available resize positions accounting for grid gaps
    const availablePositions = React__namespace.useMemo(()=>{
        const rowWidth = rowPosition?.width || 800;
        return [
            4,
            6,
            8
        ].map((left)=>{
            const right = totalColumns - left;
            const basePosition = left / totalColumns * 100;
            const gapAdjustment = calculateGapAdjustment(rowWidth, left);
            const positionPercent = basePosition + gapAdjustment;
            return {
                left,
                right,
                positionPercent
            };
        });
    }, [
        totalColumns,
        rowPosition?.width
    ]);
    // Find the current position index
    const currentPositionIndex = React__namespace.useMemo(()=>{
        return availablePositions.findIndex((pos)=>pos.left === currentLeftWidth && pos.right === currentRightWidth);
    }, [
        availablePositions,
        currentLeftWidth,
        currentRightWidth
    ]);
    if (!isVisible) {
        return null;
    }
    // Calculate positioning - indicator always spans the full row width
    const indicatorTop = rowPosition ? rowPosition.top - INDICATOR_SIZE : Math.max(10, position.top + position.height / 2 - 40);
    const isCurrent = (index)=>index === currentPositionIndex;
    const isActive = (index)=>Math.abs(index - currentPositionIndex) <= 1;
    return /*#__PURE__*/ jsxRuntime.jsx(IndicatorContainer, {
        $isVisible: isVisible,
        style: {
            left: rowPosition ? `${rowPosition.left}px` : `${position.left + 10}px`,
            top: `${indicatorTop}px`,
            width: rowPosition ? `${rowPosition.width}px` : 'auto'
        },
        children: availablePositions.map((pos, index)=>{
            return /*#__PURE__*/ jsxRuntime.jsx(DotContainer, {
                $position: pos.positionPercent,
                children: /*#__PURE__*/ jsxRuntime.jsx(Dot, {
                    $isActive: isActive(index),
                    $isCurrent: isCurrent(index)
                })
            }, `${pos.left}-${pos.right}`);
        })
    });
};
const ResizeHandleContainer = styled.styled(designSystem.Box)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: ${INDICATOR_SIZE}px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  cursor: col-resize;
  background-color: ${({ $isDragging })=>$isDragging ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
`;
const ResizeHandleBar = styled.styled(designSystem.Box)`
  width: 2px;
  height: 100%;
  background-color: ${({ theme })=>theme.colors.primary500};
  border-radius: 1px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  ${ResizeHandleContainer}:hover & {
    opacity: 0.8;
  }

  ${({ $isDragging })=>$isDragging && `opacity: 0.8;`}
`;
const WidgetResizeHandle = ({ leftWidgetId, rightWidgetId, leftWidgetWidth, rightWidgetWidth, onResize, saveLayout })=>{
    const [state, setState] = React__namespace.useState({
        isDragging: false,
        startX: 0,
        startLeftWidth: 0,
        startRightWidth: 0,
        position: {
            left: 0,
            top: 0,
            height: 0
        },
        lastResizeValues: {
            leftWidth: 0,
            rightWidth: 0
        },
        currentResizeValues: {
            leftWidth: leftWidgetWidth,
            rightWidth: rightWidgetWidth
        },
        rowPosition: null
    });
    const throttleRef = React__namespace.useRef(null);
    const handleResize = React__namespace.useCallback((deltaColumns)=>{
        // Only resize if there's significant movement (dead zone)
        if (Math.abs(deltaColumns) < 0.25) {
            return;
        }
        // Calculate target widths
        const { targetLeftWidth, targetRightWidth } = resizeHandlers.calculateTargetWidths(deltaColumns, state.startLeftWidth, state.startRightWidth);
        // Validate the resize
        if (!resizeHandlers.isValidResize(targetLeftWidth, targetRightWidth)) {
            return;
        }
        // Update current resize values for the indicator
        setState((prev)=>({
                ...prev,
                currentResizeValues: {
                    leftWidth: targetLeftWidth,
                    rightWidth: targetRightWidth
                }
            }));
        // Only trigger resize if values have changed
        if (resizeHandlers.shouldTriggerResize(targetLeftWidth, targetRightWidth, state.lastResizeValues)) {
            setState((prev)=>({
                    ...prev,
                    lastResizeValues: {
                        leftWidth: targetLeftWidth,
                        rightWidth: targetRightWidth
                    }
                }));
            onResize(leftWidgetId, rightWidgetId, targetLeftWidth, targetRightWidth);
        }
    }, [
        leftWidgetId,
        rightWidgetId,
        onResize,
        state.startLeftWidth,
        state.startRightWidth,
        state.lastResizeValues
    ]);
    const handlePointerMove = React__namespace.useCallback((e)=>{
        if (!state.isDragging) return;
        // Clear any existing throttle timeout
        if (throttleRef.current) {
            clearTimeout(throttleRef.current);
        }
        // Throttle the resize calls to prevent excessive updates
        throttleRef.current = setTimeout(()=>{
            const deltaX = e.clientX - state.startX;
            const threshold = 120; // Pixels per column unit
            const deltaColumns = Math.round(deltaX / threshold);
            handleResize(deltaColumns);
        }, 0);
    }, [
        state.isDragging,
        state.startX,
        handleResize
    ]);
    // Handle pointer up to end drag
    const handlePointerUp = React__namespace.useCallback(()=>{
        // Clear any pending throttle timeout
        if (throttleRef.current) {
            clearTimeout(throttleRef.current);
            throttleRef.current = null;
        }
        // Save the layout
        saveLayout();
        // Reset last resize values and stop dragging
        setState((prev)=>({
                ...prev,
                lastResizeValues: {
                    leftWidth: 0,
                    rightWidth: 0
                },
                currentResizeValues: {
                    leftWidth: leftWidgetWidth,
                    rightWidth: rightWidgetWidth
                },
                isDragging: false
            }));
    }, [
        leftWidgetWidth,
        rightWidgetWidth,
        saveLayout
    ]);
    // Handle pointer down to start drag
    const handlePointerDown = React__namespace.useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        setState((prev)=>({
                ...prev,
                isDragging: true,
                startX: e.clientX,
                startLeftWidth: leftWidgetWidth,
                startRightWidth: rightWidgetWidth
            }));
    }, [
        leftWidgetWidth,
        rightWidgetWidth
    ]);
    // Set up drag event listeners
    React__namespace.useEffect(()=>{
        if (state.isDragging) {
            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
            return ()=>{
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
            };
        }
    }, [
        state.isDragging,
        handlePointerMove,
        handlePointerUp
    ]);
    // Set up resize observer for position updates - watching widgets and grid container
    React__namespace.useLayoutEffect(()=>{
        const leftElement = widgetLayout.getWidgetElement(leftWidgetId);
        const rightElement = widgetLayout.getWidgetElement(rightWidgetId);
        const containerElement = widgetLayout.getWidgetGridContainer();
        const updatePosition = ()=>{
            const position = resizeHandlers.calculateResizeHandlePosition(leftElement, rightElement, containerElement);
            const rowPosition = resizeHandlers.calculateRowBounds(leftElement, rightElement, containerElement);
            setState((prev)=>({
                    ...prev,
                    position,
                    rowPosition
                }));
        };
        // Create ResizeObserver to watch widgets and grid container
        const resizeObserver = new ResizeObserver(updatePosition);
        // Observe all relevant elements
        if (leftElement) resizeObserver.observe(leftElement);
        if (rightElement) resizeObserver.observe(rightElement);
        if (containerElement) resizeObserver.observe(containerElement);
        return ()=>{
            resizeObserver.disconnect();
        };
    }, [
        leftWidgetId,
        rightWidgetId
    ]);
    // Cleanup throttle timeout on unmount
    React__namespace.useEffect(()=>{
        return ()=>{
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }
        };
    }, []);
    return /*#__PURE__*/ jsxRuntime.jsxs(jsxRuntime.Fragment, {
        children: [
            /*#__PURE__*/ jsxRuntime.jsx(ResizeHandleContainer, {
                onPointerDown: handlePointerDown,
                style: {
                    transform: `translate(${state.position.left}px, ${state.position.top}px)`,
                    height: `${state.position.height}px`
                },
                children: /*#__PURE__*/ jsxRuntime.jsx(ResizeHandleBar, {
                    $isDragging: state.isDragging
                })
            }),
            /*#__PURE__*/ jsxRuntime.jsx(ResizeIndicator, {
                isVisible: state.isDragging,
                position: state.position,
                currentLeftWidth: state.currentResizeValues.leftWidth,
                currentRightWidth: state.currentResizeValues.rightWidth,
                rowPosition: state.rowPosition
            })
        ]
    });
};

exports.WidgetResizeHandle = WidgetResizeHandle;
//# sourceMappingURL=ResizeIndicator.js.map
