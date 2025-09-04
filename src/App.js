import React, { useState, useEffect, useCallback } from 'react';
import LeftPanel from './components/LeftPanel';
import CanvasContainer from './components/CanvasContainer';
import RightPanel from './components/RightPanel';
import './index.css';

function App() {
    // Tool state
    const [currentTool, setCurrentTool] = useState('select');
    
    // Brush settings
    const [brushSettings, setBrushSettings] = useState({
        size: 5,
        color: '#000000',
        opacity: 100
    });

    // Layer management
    const [layers, setLayers] = useState([
        { name: '배경', visible: true },
        { name: '캐릭터', visible: true },
        { name: '대사', visible: true }
    ]);
    const [currentLayer, setCurrentLayer] = useState(0);

    // Canvas state
    const [zoomLevel, setZoomLevel] = useState(1);
    const [selectedArea, setSelectedArea] = useState(null);
    const [drawingObjects, setDrawingObjects] = useState([]);
    const [selectedObject, setSelectedObject] = useState(null);

    // Character reference system
    const [characterReferences, setCharacterReferences] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            // Redo functionality would go here
                            console.log('Redo');
                        } else {
                            // Undo functionality would go here
                            console.log('Undo');
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        // Export handled by CanvasContainer
                        break;
                    case 'a':
                        e.preventDefault();
                        selectAllArea();
                        break;
                }
            }
            
            // Object manipulation shortcuts
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedObject) {
                    deleteSelectedObjects();
                    e.preventDefault();
                }
            }
            
            // ESC to deselect
            if (e.key === 'Escape') {
                setSelectedObject(null);
                setSelectedArea(null);
            }
            
            // Tool shortcuts
            switch(e.key.toLowerCase()) {
                case 'v':
                    setCurrentTool('select');
                    break;
                case 'b':
                    setCurrentTool('brush');
                    break;
                case 'e':
                    setCurrentTool('eraser');
                    break;
                case 't':
                    setCurrentTool('text');
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedObject]);

    const selectAllArea = () => {
        setSelectedArea({
            x: 0,
            y: 0,
            width: 800,  // Canvas width
            height: 600  // Canvas height
        });
    };

    const deleteSelectedObjects = () => {
        if (selectedObject) {
            const filteredObjects = drawingObjects.filter(obj => obj.id !== selectedObject.id);
            setDrawingObjects(filteredObjects);
            setSelectedObject(null);
        }
    };

    // Tool selection
    const handleToolSelect = (tool) => {
        setCurrentTool(tool);
        console.log(`${tool} 도구가 선택되었습니다.`);
    };

    // Brush settings
    const handleBrushSettingsChange = (setting, value) => {
        setBrushSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    // Layer management
    const handleLayerSelect = (layerIndex) => {
        setCurrentLayer(layerIndex);
        console.log(`레이어 '${layers[layerIndex].name}' 선택됨`);
    };

    const handleLayerVisibilityToggle = (layerIndex, visible) => {
        const updatedLayers = [...layers];
        updatedLayers[layerIndex].visible = visible;
        setLayers(updatedLayers);
    };

    const handleAddLayer = () => {
        const layerName = prompt('새 레이어 이름:', `레이어 ${layers.length + 1}`);
        if (layerName) {
            setLayers(prev => [...prev, {
                name: layerName,
                visible: true
            }]);
        }
    };

    // Character management
    const handleCharacterAdd = (characterData) => {
        setCharacterReferences(prev => [...prev, characterData]);
        console.log(`캐릭터 '${characterData.name}' 추가됨`);
    };

    const handleCharacterSelect = (characterId) => {
        const character = characterReferences.find(char => char.id === characterId);
        setSelectedCharacter(character);
        console.log(`캐릭터 '${character?.name}' 선택됨`);
    };

    const handleCharacterDelete = (characterId) => {
        if (window.confirm('이 캐릭터를 삭제하시겠습니까?')) {
            setCharacterReferences(prev => prev.filter(char => char.id !== characterId));
            if (selectedCharacter && selectedCharacter.id === characterId) {
                setSelectedCharacter(null);
            }
            console.log('캐릭터가 삭제되었습니다.');
        }
    };

    const handleGenerateWithReference = () => {
        if (!selectedCharacter) {
            console.log('먼저 캐릭터를 선택해주세요.');
            return;
        }
        
        if (!selectedArea) {
            console.log('편집할 영역을 먼저 선택해주세요.');
            return;
        }
        
        console.log(`'${selectedCharacter.name}' 캐릭터로 레퍼런스 생성 시작`);
        simulateCharacterEdit();
    };

    const handleExtractCharacter = () => {
        if (!selectedArea) {
            console.log('추출할 영역을 먼저 선택해주세요.');
            return;
        }
        
        if (window.confirm('선택된 영역을 새 캐릭터 레퍼런스로 추가하시겠습니까?')) {
            const characterName = prompt('캐릭터 이름을 입력하세요:', '추출된 캐릭터');
            if (characterName) {
                // In a real implementation, this would extract the canvas area
                const character = {
                    id: Date.now(),
                    name: characterName,
                    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
                    timestamp: new Date().toISOString()
                };
                
                handleCharacterAdd(character);
                console.log(`캐릭터 '${characterName}' 추출 완료!`);
            }
        }
    };

    const simulateCharacterEdit = useCallback(() => {
        if (!selectedArea) return;

        // Create a simulated result image object
        const resultImg = new Image();
        resultImg.onload = () => {
            const scale = Math.min(selectedArea.width / resultImg.width, selectedArea.height / resultImg.height);
            const width = resultImg.width * scale;
            const height = resultImg.height * scale;
            const x = selectedArea.x + (selectedArea.width - width) / 2;
            const y = selectedArea.y + (selectedArea.height - height) / 2;

            const imageObject = {
                id: Date.now(),
                type: 'image',
                layer: currentLayer,
                x: x,
                y: y,
                width: width,
                height: height,
                image: resultImg,
                bounds: { minX: x, maxX: x + width, minY: y, maxY: y + height }
            };

            setDrawingObjects(prev => [...prev, imageObject]);
            console.log('Nano Banana AI 편집 완료!');
        };

        resultImg.onerror = () => {
            console.log('결과 이미지를 로드할 수 없어 기본 효과를 적용했습니다.');
            // Apply a simple colored rectangle as fallback
            const fallbackObject = {
                id: Date.now(),
                type: 'brush',
                layer: currentLayer,
                points: [
                    { x: selectedArea.x, y: selectedArea.y },
                    { x: selectedArea.x + selectedArea.width, y: selectedArea.y + selectedArea.height }
                ],
                style: {
                    color: '#ff6b6b',
                    size: selectedArea.width,
                    opacity: 0.3,
                    lineCap: 'round',
                    lineJoin: 'round'
                },
                bounds: {
                    minX: selectedArea.x,
                    maxX: selectedArea.x + selectedArea.width,
                    minY: selectedArea.y,
                    maxY: selectedArea.y + selectedArea.height
                }
            };
            setDrawingObjects(prev => [...prev, fallbackObject]);
        };

        resultImg.crossOrigin = 'anonymous';
        // Try to load the character_result.png, fallback to error handler if not found
        resultImg.src = './character_result.png?t=' + Date.now();
    }, [selectedArea, currentLayer]);

    const handleSimulateEdit = useCallback(() => {
        if (!selectedArea) return;
        
        // Simple edit simulation - add a colored overlay
        const editObject = {
            id: Date.now(),
            type: 'brush',
            layer: currentLayer,
            points: [
                { x: selectedArea.x, y: selectedArea.y },
                { x: selectedArea.x + selectedArea.width, y: selectedArea.y + selectedArea.height }
            ],
            style: {
                color: '#ff6b6b',
                size: Math.min(selectedArea.width, selectedArea.height),
                opacity: 0.3,
                lineCap: 'round',
                lineJoin: 'round'
            },
            bounds: {
                minX: selectedArea.x,
                maxX: selectedArea.x + selectedArea.width,
                minY: selectedArea.y,
                maxY: selectedArea.y + selectedArea.height
            }
        };

        setDrawingObjects(prev => [...prev, editObject]);
        console.log('AI 편집이 적용되었습니다!');
    }, [selectedArea, currentLayer]);

    return (
        <div className="app-container">
            <LeftPanel
                currentTool={currentTool}
                onToolSelect={handleToolSelect}
                brushSettings={brushSettings}
                onBrushSettingsChange={handleBrushSettingsChange}
                layers={layers}
                currentLayer={currentLayer}
                onLayerSelect={handleLayerSelect}
                onLayerVisibilityToggle={handleLayerVisibilityToggle}
                onAddLayer={handleAddLayer}
                characterReferences={characterReferences}
                selectedCharacter={selectedCharacter}
                onCharacterSelect={handleCharacterSelect}
                onCharacterAdd={handleCharacterAdd}
                onCharacterDelete={handleCharacterDelete}
                onGenerateWithReference={handleGenerateWithReference}
                onExtractCharacter={handleExtractCharacter}
            />
            
            <CanvasContainer
                currentTool={currentTool}
                brushSettings={brushSettings}
                layers={layers}
                currentLayer={currentLayer}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                selectedArea={selectedArea}
                onSelectedAreaChange={setSelectedArea}
                drawingObjects={drawingObjects}
                onDrawingObjectsChange={setDrawingObjects}
                selectedObject={selectedObject}
                onSelectedObjectChange={setSelectedObject}
            />
            
            <RightPanel
                selectedArea={selectedArea}
                selectedCharacter={selectedCharacter}
                onSimulateEdit={handleSimulateEdit}
            />
        </div>
    );
}

export default App;