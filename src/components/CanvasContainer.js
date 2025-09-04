import React, { useRef, useEffect, useState } from 'react';

const CanvasContainer = ({
    currentTool,
    brushSettings,
    layers,
    currentLayer,
    zoomLevel,
    onZoomChange,
    selectedArea,
    onSelectedAreaChange,
    onClearCanvas,
    onExportImage,
    drawingObjects,
    onDrawingObjectsChange,
    selectedObject,
    onSelectedObjectChange
}) => {
    const canvasRef = useRef(null);
    const canvasAreaRef = useRef(null);
    const textInputRef = useRef(null);
    const selectionBoxRef = useRef(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [currentStroke, setCurrentStroke] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [showStatus, setShowStatus] = useState(false);
    const [objectId, setObjectId] = useState(0);

    // Canvas context
    const [ctx, setCtx] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            setCtx(context);
            
            // Initialize canvas
            canvas.width = 800;
            canvas.height = 600;
        }
    }, []);

    // Redraw canvas when objects change
    useEffect(() => {
        if (ctx) {
            redrawCanvas();
        }
    }, [ctx, drawingObjects, layers, selectedObject]);

    // Update zoom
    useEffect(() => {
        if (canvasAreaRef.current) {
            canvasAreaRef.current.style.transform = `scale(${zoomLevel})`;
        }
    }, [zoomLevel]);

    const showStatusMessage = (message) => {
        setStatusMessage(message);
        setShowStatus(true);
        setTimeout(() => {
            setShowStatus(false);
        }, 3000);
    };

    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / zoomLevel,
            y: (e.clientY - rect.top) / zoomLevel
        };
    };

    const handleMouseDown = (e) => {
        const pos = getMousePos(e);
        setStartPos(pos);

        switch (currentTool) {
            case 'select':
                handleSelectMouseDown(pos);
                break;
            case 'brush':
                setIsDrawing(true);
                startBrushStroke(pos);
                break;
            case 'eraser':
                setIsDrawing(true);
                eraseAt(pos);
                break;
            case 'text':
                addTextInput(pos);
                break;
        }
    };

    const handleMouseMove = (e) => {
        const pos = getMousePos(e);

        if (isSelecting && currentTool === 'select') {
            updateSelectionBox(startPos, pos);
        } else if (isDragging && selectedObject) {
            moveSelectedObject(pos.x - dragStartPos.x, pos.y - dragStartPos.y);
            setDragStartPos(pos);
        } else if (isDrawing && currentTool === 'brush') {
            continueStroke(pos);
        } else if (isDrawing && currentTool === 'eraser') {
            eraseAt(pos);
        }
    };

    const handleMouseUp = (e) => {
        const pos = getMousePos(e);

        if (isSelecting) {
            finalizeSelection(startPos, pos);
            setIsSelecting(false);
        }

        if (isDragging) {
            setIsDragging(false);
        }

        if (isDrawing) {
            setIsDrawing(false);
            setCurrentStroke(null);
        }
    };

    const handleSelectMouseDown = (pos) => {
        const clickedObject = getObjectAt(pos);
        if (clickedObject) {
            onSelectedObjectChange(clickedObject);
            setIsDragging(true);
            setDragStartPos(pos);
        } else {
            onSelectedObjectChange(null);
            setIsSelecting(true);
            hideSelectionBox();
        }
    };

    const startBrushStroke = (pos) => {
        const stroke = {
            id: objectId,
            type: 'brush',
            layer: currentLayer,
            points: [pos],
            style: {
                color: brushSettings.color,
                size: brushSettings.size,
                opacity: brushSettings.opacity / 100,
                lineCap: 'round',
                lineJoin: 'round'
            },
            bounds: {
                minX: pos.x, maxX: pos.x,
                minY: pos.y, maxY: pos.y
            }
        };
        
        setCurrentStroke(stroke);
        setObjectId(prev => prev + 1);
        onDrawingObjectsChange([...drawingObjects, stroke]);
    };

    const continueStroke = (pos) => {
        if (!currentStroke) return;

        const updatedStroke = {
            ...currentStroke,
            points: [...currentStroke.points, pos],
            bounds: {
                minX: Math.min(currentStroke.bounds.minX, pos.x),
                maxX: Math.max(currentStroke.bounds.maxX, pos.x),
                minY: Math.min(currentStroke.bounds.minY, pos.y),
                maxY: Math.max(currentStroke.bounds.maxY, pos.y)
            }
        };

        setCurrentStroke(updatedStroke);
        
        const updatedObjects = [...drawingObjects];
        updatedObjects[updatedObjects.length - 1] = updatedStroke;
        onDrawingObjectsChange(updatedObjects);
    };

    const eraseAt = (pos) => {
        const eraseRadius = brushSettings.size / 2;
        const objectsToRemove = drawingObjects.filter(obj => 
            obj.layer === currentLayer && isObjectInEraseArea(obj, pos, eraseRadius)
        );

        if (objectsToRemove.length > 0) {
            const filteredObjects = drawingObjects.filter(obj => !objectsToRemove.includes(obj));
            onDrawingObjectsChange(filteredObjects);
            if (selectedObject && objectsToRemove.includes(selectedObject)) {
                onSelectedObjectChange(null);
            }
            showStatusMessage(`${objectsToRemove.length}개 객체 지움`);
        }
    };

    const addTextInput = (pos) => {
        const textInput = textInputRef.current;
        if (textInput) {
            textInput.style.left = (pos.x * zoomLevel) + 'px';
            textInput.style.top = (pos.y * zoomLevel) + 'px';
            textInput.style.display = 'block';
            textInput.value = '';
            
            setTimeout(() => {
                textInput.focus();
            }, 10);

            const finishTextInput = () => {
                const text = textInput.value.trim();
                if (text) {
                    addTextToCanvas(pos, text);
                }
                textInput.style.display = 'none';
                textInput.value = '';
            };

            textInput.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    finishTextInput();
                } else if (e.key === 'Escape') {
                    textInput.style.display = 'none';
                    textInput.value = '';
                }
            };

            textInput.onblur = finishTextInput;
        }
    };

    const addTextToCanvas = (pos, text) => {
        const fontSize = 20;
        const textObject = {
            id: objectId,
            type: 'text',
            layer: currentLayer,
            x: pos.x,
            y: pos.y,
            text: text,
            style: {
                color: brushSettings.color,
                font: `${fontSize}px Arial`,
                fontSize: fontSize
            },
            bounds: {
                minX: pos.x,
                maxX: pos.x + text.length * fontSize * 0.6,
                minY: pos.y - fontSize,
                maxY: pos.y
            }
        };

        setObjectId(prev => prev + 1);
        onDrawingObjectsChange([...drawingObjects, textObject]);
    };

    const updateSelectionBox = (start, current) => {
        const selectionBox = selectionBoxRef.current;
        if (selectionBox) {
            const left = Math.min(start.x, current.x) * zoomLevel;
            const top = Math.min(start.y, current.y) * zoomLevel;
            const width = Math.abs(current.x - start.x) * zoomLevel;
            const height = Math.abs(current.y - start.y) * zoomLevel;

            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
            selectionBox.style.display = 'block';
        }
    };

    const hideSelectionBox = () => {
        const selectionBox = selectionBoxRef.current;
        if (selectionBox) {
            selectionBox.style.display = 'none';
        }
    };

    const finalizeSelection = (start, end) => {
        const selectionRect = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y)
        };

        onSelectedAreaChange(selectionRect);
        showStatusMessage(`영역 선택됨: ${Math.round(selectionRect.width)}x${Math.round(selectionRect.height)}`);
    };

    const getObjectAt = (pos) => {
        for (let i = drawingObjects.length - 1; i >= 0; i--) {
            const obj = drawingObjects[i];
            if (obj.layer === currentLayer && layers[obj.layer]?.visible && isPointInObject(pos, obj)) {
                return obj;
            }
        }
        return null;
    };

    const isPointInObject = (pos, obj) => {
        if (obj.type === 'brush') {
            const padding = obj.style.size / 2 + 2;
            if (pos.x < obj.bounds.minX - padding || pos.x > obj.bounds.maxX + padding ||
                pos.y < obj.bounds.minY - padding || pos.y > obj.bounds.maxY + padding) {
                return false;
            }

            const threshold = obj.style.size / 2 + 3;
            for (let i = 0; i < obj.points.length - 1; i++) {
                const p1 = obj.points[i];
                const p2 = obj.points[i + 1];
                if (distanceToLineSegment(pos.x, pos.y, p1.x, p1.y, p2.x, p2.y) <= threshold) {
                    return true;
                }
            }

            if (obj.points.length === 1) {
                const p = obj.points[0];
                return Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2) <= threshold;
            }
        } else if (obj.type === 'text') {
            return pos.x >= obj.bounds.minX && pos.x <= obj.bounds.maxX &&
                   pos.y >= obj.bounds.minY && pos.y <= obj.bounds.maxY;
        }
        return false;
    };

    const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        }
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
    };

    const isObjectInEraseArea = (obj, erasePos, eraseRadius) => {
        if (obj.type === 'brush') {
            for (let i = 0; i < obj.points.length; i++) {
                const point = obj.points[i];
                const distance = Math.sqrt((point.x - erasePos.x) ** 2 + (point.y - erasePos.y) ** 2);
                if (distance <= eraseRadius + obj.style.size / 2) {
                    return true;
                }
            }
        }
        return false;
    };

    const moveSelectedObject = (deltaX, deltaY) => {
        if (!selectedObject) return;

        const updatedObject = { ...selectedObject };

        if (updatedObject.type === 'brush') {
            updatedObject.points = updatedObject.points.map(point => ({
                x: point.x + deltaX,
                y: point.y + deltaY
            }));
            updatedObject.bounds = {
                minX: updatedObject.bounds.minX + deltaX,
                maxX: updatedObject.bounds.maxX + deltaX,
                minY: updatedObject.bounds.minY + deltaY,
                maxY: updatedObject.bounds.maxY + deltaY
            };
        } else if (updatedObject.type === 'text') {
            updatedObject.x += deltaX;
            updatedObject.y += deltaY;
            updatedObject.bounds = {
                minX: updatedObject.bounds.minX + deltaX,
                maxX: updatedObject.bounds.maxX + deltaX,
                minY: updatedObject.bounds.minY + deltaY,
                maxY: updatedObject.bounds.maxY + deltaY
            };
        }

        const updatedObjects = drawingObjects.map(obj => 
            obj.id === selectedObject.id ? updatedObject : obj
        );
        
        onDrawingObjectsChange(updatedObjects);
        onSelectedObjectChange(updatedObject);
    };

    const redrawCanvas = () => {
        if (!ctx) return;

        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw objects by layer
        layers.forEach((layer, layerIndex) => {
            if (layer.visible) {
                const layerObjects = drawingObjects.filter(obj => obj.layer === layerIndex);
                layerObjects.forEach(obj => {
                    drawObject(ctx, obj);
                });
            }
        });

        // Highlight selected object
        if (selectedObject) {
            drawObjectHighlight(ctx, selectedObject);
        }
    };

    const drawObject = (context, obj) => {
        if (obj.type === 'brush' && obj.points.length > 0) {
            context.save();
            context.globalAlpha = obj.style.opacity;
            context.strokeStyle = obj.style.color;
            context.lineWidth = obj.style.size;
            context.lineCap = obj.style.lineCap;
            context.lineJoin = obj.style.lineJoin;
            
            context.beginPath();
            context.moveTo(obj.points[0].x, obj.points[0].y);
            
            for (let i = 1; i < obj.points.length; i++) {
                context.lineTo(obj.points[i].x, obj.points[i].y);
            }
            
            context.stroke();
            context.restore();
        } else if (obj.type === 'text') {
            context.save();
            context.fillStyle = obj.style.color;
            context.font = obj.style.font;
            context.fillText(obj.text, obj.x, obj.y);
            context.restore();
        } else if (obj.type === 'image' && obj.image) {
            context.save();
            context.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
            context.restore();
        }
    };

    const drawObjectHighlight = (context, obj) => {
        context.save();
        context.strokeStyle = '#0066cc';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        
        const padding = 5;
        const rect = {
            x: obj.bounds.minX - padding,
            y: obj.bounds.minY - padding,
            width: obj.bounds.maxX - obj.bounds.minX + padding * 2,
            height: obj.bounds.maxY - obj.bounds.minY + padding * 2
        };
        
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.restore();
    };

    const handleZoomIn = () => {
        onZoomChange(Math.min(zoomLevel * 1.2, 5));
    };

    const handleZoomOut = () => {
        onZoomChange(Math.max(zoomLevel / 1.2, 0.1));
    };

    const handleClearCanvas = () => {
        if (window.confirm('현재 레이어의 모든 객체를 지우시겠습니까?')) {
            const filteredObjects = drawingObjects.filter(obj => obj.layer !== currentLayer);
            onDrawingObjectsChange(filteredObjects);
            onSelectedObjectChange(null);
            showStatusMessage(`레이어의 객체들이 지워졌습니다.`);
        }
    };

    const handleExportImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'webtoon.png';
        link.href = canvas.toDataURL();
        link.click();
        showStatusMessage('이미지가 다운로드되었습니다.');
    };

    return (
        <div className="canvas-container">
            <div className="canvas-toolbar">
                <div className="zoom-control">
                    <button className="zoom-btn" onClick={handleZoomOut}>-</button>
                    <span className="zoom-display">{Math.round(zoomLevel * 100)}%</span>
                    <button className="zoom-btn" onClick={handleZoomIn}>+</button>
                </div>
                <button className="tool-button" onClick={handleClearCanvas}>
                    🗑️ 전체 지우기
                </button>
                <button className="tool-button" onClick={handleExportImage}>
                    💾 내보내기 <span className="shortcut">Ctrl+S</span>
                </button>
            </div>

            <div className="canvas-wrapper">
                <div className="canvas-area" ref={canvasAreaRef}>
                    <canvas 
                        ref={canvasRef}
                        id="main-canvas"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                    />
                    <div 
                        className="selection-box" 
                        ref={selectionBoxRef}
                    />
                    <textarea 
                        className="text-input" 
                        ref={textInputRef}
                    />
                </div>
            </div>
            
            {showStatus && (
                <div className="status-bar" style={{ display: 'block' }}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
};

export default CanvasContainer;