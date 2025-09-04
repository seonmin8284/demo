import React, { useState, useRef } from 'react';

const CharacterModal = ({ onSave, onClose }) => {
    const [characterName, setCharacterName] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [showUploadContent, setShowUploadContent] = useState(true);
    const fileInputRef = useRef(null);

    const handleImageUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
                setShowUploadContent(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageUpload(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current?.click();
    };

    const handleSave = () => {
        if (!imagePreview) {
            alert('캐릭터 이미지를 선택해주세요.');
            return;
        }
        
        if (!characterName.trim()) {
            alert('캐릭터 이름을 입력해주세요.');
            return;
        }

        const character = {
            id: Date.now(),
            name: characterName.trim(),
            image: imagePreview,
            timestamp: new Date().toISOString()
        };

        onSave(character);
    };

    const resetModal = () => {
        setImagePreview(null);
        setShowUploadContent(true);
        setCharacterName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">캐릭터 추가</h2>
                    <button className="close-modal" onClick={handleClose}>
                        ×
                    </button>
                </div>
                
                <div 
                    className="upload-area"
                    onClick={handleUploadAreaClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {showUploadContent && (
                        <div className="upload-content">
                            <div className="upload-icon">📁</div>
                            <p>이미지를 드래그하거나 클릭하여 업로드</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>PNG, JPG 지원</p>
                        </div>
                    )}
                    {imagePreview && (
                        <img 
                            src={imagePreview} 
                            alt="미리보기"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px'
                            }}
                        />
                    )}
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />
                
                <input 
                    type="text" 
                    className="character-name-input" 
                    placeholder="캐릭터 이름을 입력하세요"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                />
                
                <div className="modal-buttons">
                    <button className="modal-button secondary" onClick={handleClose}>
                        취소
                    </button>
                    <button className="modal-button primary" onClick={handleSave}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterModal;