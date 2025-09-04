import React from 'react';

const ToolsTab = ({ 
    currentTool, 
    onToolSelect, 
    brushSettings, 
    onBrushSettingsChange,
    layers,
    currentLayer,
    onLayerSelect,
    onLayerVisibilityToggle,
    onAddLayer
}) => {
    const tools = [
        { id: 'select', name: '📍 선택 도구', shortcut: 'V' },
        { id: 'brush', name: '🖌️ 브러시', shortcut: 'B' },
        { id: 'eraser', name: '🧹 지우개', shortcut: 'E' },
        { id: 'text', name: '📝 텍스트', shortcut: 'T' },
        { id: 'shape', name: '⭕ 도형', shortcut: '' }
    ];

    const shortcuts = [
        { key: 'Del', action: '선택된 객체 삭제' },
        { key: 'Esc', action: '선택 해제' },
        { key: 'Ctrl+Z', action: '실행 취소' },
        { key: 'Ctrl+Shift+Z', action: '다시 실행' },
        { key: 'Ctrl+A', action: '전체 선택' }
    ];

    return (
        <div className="tab-content active">
            <div className="tool-section">
                <h3>도구</h3>
                {tools.map(tool => (
                    <button 
                        key={tool.id}
                        className={`tool-button ${currentTool === tool.id ? 'active' : ''}`}
                        onClick={() => onToolSelect(tool.id)}
                    >
                        {tool.name} 
                        {tool.shortcut && <span className="shortcut">{tool.shortcut}</span>}
                    </button>
                ))}
            </div>

            <div className="tool-section">
                <h3>브러시 설정</h3>
                <div className="brush-settings">
                    <div className="setting-row">
                        <label>크기:</label>
                        <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={brushSettings.size}
                            onChange={(e) => onBrushSettingsChange('size', parseInt(e.target.value))}
                        />
                        <span>{brushSettings.size}</span>
                    </div>
                    <div className="setting-row">
                        <label>색상:</label>
                        <input 
                            type="color" 
                            className="color-picker" 
                            value={brushSettings.color}
                            onChange={(e) => onBrushSettingsChange('color', e.target.value)}
                        />
                    </div>
                    <div className="setting-row">
                        <label>투명도:</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={brushSettings.opacity}
                            onChange={(e) => onBrushSettingsChange('opacity', parseInt(e.target.value))}
                        />
                        <span>{brushSettings.opacity}%</span>
                    </div>
                </div>
            </div>

            <div className="tool-section">
                <h3>레이어</h3>
                <div id="layers-list">
                    {layers.map((layer, index) => (
                        <div 
                            key={index}
                            className={`layer-item ${currentLayer === index ? 'selected' : ''}`}
                            onClick={() => onLayerSelect(index)}
                        >
                            <input 
                                type="checkbox" 
                                className="layer-visibility" 
                                checked={layer.visible}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onLayerVisibilityToggle(index, e.target.checked);
                                }}
                            />
                            <span className="layer-name">{layer.name}</span>
                        </div>
                    ))}
                </div>
                <div className="add-layer-btn" onClick={onAddLayer}>
                    + 새 레이어 추가
                </div>
            </div>

            <div className="tool-section">
                <h3>단축키</h3>
                <div className="shortcut-guide">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="shortcut-item">
                            <span className="key">{shortcut.key}</span>
                            <span className="action">{shortcut.action}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToolsTab;