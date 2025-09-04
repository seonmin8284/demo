import React, { useState } from 'react';
import ToolsTab from './ToolsTab';
import CharactersTab from './CharactersTab';

const LeftPanel = ({ 
    currentTool, 
    onToolSelect, 
    brushSettings, 
    onBrushSettingsChange,
    layers,
    currentLayer,
    onLayerSelect,
    onLayerVisibilityToggle,
    onAddLayer,
    characterReferences,
    selectedCharacter,
    onCharacterSelect,
    onCharacterAdd,
    onCharacterDelete,
    onGenerateWithReference,
    onExtractCharacter
}) => {
    const [activeTab, setActiveTab] = useState('tools');

    return (
        <div className="left-panel">
            {/* 탭 헤더 */}
            <div className="tab-header">
                <button 
                    className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tools')}
                >
                    🛠️ 도구
                </button>
                <button 
                    className={`tab-button ${activeTab === 'characters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('characters')}
                >
                    🎭 캐릭터
                </button>
            </div>

            {/* 도구 탭 */}
            {activeTab === 'tools' && (
                <ToolsTab
                    currentTool={currentTool}
                    onToolSelect={onToolSelect}
                    brushSettings={brushSettings}
                    onBrushSettingsChange={onBrushSettingsChange}
                    layers={layers}
                    currentLayer={currentLayer}
                    onLayerSelect={onLayerSelect}
                    onLayerVisibilityToggle={onLayerVisibilityToggle}
                    onAddLayer={onAddLayer}
                />
            )}

            {/* 캐릭터 탭 */}
            {activeTab === 'characters' && (
                <CharactersTab
                    characterReferences={characterReferences}
                    selectedCharacter={selectedCharacter}
                    onCharacterSelect={onCharacterSelect}
                    onCharacterAdd={onCharacterAdd}
                    onCharacterDelete={onCharacterDelete}
                    onGenerateWithReference={onGenerateWithReference}
                    onExtractCharacter={onExtractCharacter}
                />
            )}
        </div>
    );
};

export default LeftPanel;