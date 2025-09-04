import React, { useState } from 'react';
import CharacterModal from './CharacterModal';

const CharactersTab = ({ 
    characterReferences, 
    selectedCharacter, 
    onCharacterSelect, 
    onCharacterAdd, 
    onCharacterDelete,
    onGenerateWithReference,
    onExtractCharacter
}) => {
    const [showModal, setShowModal] = useState(false);

    const handleAddCharacter = () => {
        setShowModal(true);
    };

    const handleSaveCharacter = (characterData) => {
        onCharacterAdd(characterData);
        setShowModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="tab-content active">
            <div className="tool-section">
                <h3>캐릭터 레퍼런스</h3>
                <div id="character-gallery">
                    {characterReferences.map(character => (
                        <div 
                            key={character.id}
                            className={`character-slot ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
                            style={{ backgroundImage: `url(${character.image})` }}
                            onClick={() => onCharacterSelect(character.id)}
                        >
                            <div className="character-controls">
                                <button 
                                    className="delete-character" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCharacterDelete(character.id);
                                    }}
                                    title="삭제"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="character-info">
                                <div>{character.name}</div>
                            </div>
                        </div>
                    ))}
                    
                    {characterReferences.length < 6 && (
                        <div className="character-slot empty" onClick={handleAddCharacter}>
                            <div className="add-character">
                                <span>+</span>
                                <p>캐릭터 추가</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="tool-section">
                <h3>액션</h3>
                <div className="reference-controls">
                    <button className="tool-button" onClick={onGenerateWithReference}>
                        🎭 레퍼런스로 생성
                    </button>
                    <button className="tool-button" onClick={onExtractCharacter}>
                        ✂️ 캐릭터 추출
                    </button>
                </div>
            </div>

            <div className="tool-section">
                <h3>사용법</h3>
                <div className="usage-guide" style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>
                    <p style={{ marginBottom: '8px' }}>1. 캐릭터 이미지를 업로드합니다</p>
                    <p style={{ marginBottom: '8px' }}>2. 캐릭터를 클릭하여 선택합니다</p>
                    <p style={{ marginBottom: '8px' }}>3. 캔버스에서 영역을 선택합니다</p>
                    <p style={{ marginBottom: '8px' }}>4. '레퍼런스로 생성' 클릭합니다</p>
                </div>
            </div>

            {showModal && (
                <CharacterModal
                    onSave={handleSaveCharacter}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default CharactersTab;