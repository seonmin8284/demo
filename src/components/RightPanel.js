import React, { useState, useRef, useEffect } from 'react';

const RightPanel = ({ selectedArea, selectedCharacter, onSimulateEdit }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            content: `안녕하세요! 웹툰 제작을 도와드릴게요. 🎨

다음과 같은 기능을 사용할 수 있습니다:
• 선택된 영역의 이미지 편집
• 텍스트와 이미지 조합 편집
• 웹툰 스타일 변환
• 캐릭터 일관성 유지

영역을 선택하고 편집 요청을 해주세요!`
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [showQuestionResult, setShowQuestionResult] = useState(false);
    const [questionResult, setQuestionResult] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (content, sender) => {
        const newMessage = {
            id: Date.now(),
            sender,
            content
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSendMessage = () => {
        const message = inputMessage.trim();
        if (!message) return;

        addMessage(message, 'user');
        setInputMessage('');

        // Handle question request
        if (message.includes('?') || message.includes('질문') || message.includes('뭐') || message.includes('어떻게')) {
            handleQuestionRequest(message);
            return;
        }

        // Handle background request
        if (message.includes('배경')) {
            addMessage('배경 이미지를 추가하겠습니다.', 'ai');
            setTimeout(() => {
                // Add background processing logic here
                addMessage('배경 이미지 처리가 완료되었습니다!', 'ai');
            }, 1000);
            return;
        }

        if (!selectedArea) {
            addMessage('먼저 편집할 영역을 선택해주세요.', 'ai');
            return;
        }

        // AI response simulation
        setTimeout(() => {
            processAIRequest(message);
        }, 1000);
    };

    const handleQuestionRequest = (question) => {
        addMessage('질문을 분석하고 있습니다...', 'ai');
        
        setTimeout(() => {
            // 질문 결과 시뮬레이션
            const result = {
                question: question,
                answer: '선택된 영역에 대한 질문에 답변드리겠습니다.',
                image: './test2.jpg',
                confidence: 0.85
            };
            
            setQuestionResult(result);
            setShowQuestionResult(true);
            addMessage('질문 분석이 완료되었습니다. 결과를 확인해주세요.', 'ai');
        }, 2000);
    };

    const processAIRequest = (request) => {
        let responses = [];
        
        if (selectedCharacter) {
            responses = [
                `'${selectedCharacter.name}' 캐릭터 레퍼런스를 기반으로 편집을 시작합니다...`,
                '일관된 캐릭터 스타일을 유지하며 이미지를 생성 중입니다...',
                'Nano Banana 스타일의 웹툰 변환을 적용하고 있습니다...',
                `${selectedCharacter.name}의 특징을 살린 편집이 완료되었습니다!`
            ];
        } else {
            responses = [
                '선택된 영역의 이미지 편집을 시작합니다...',
                '웹툰 스타일로 변환 중입니다...',
                '편집이 완료되었습니다! 캐릭터 레퍼런스를 추가하시면 더 일관된 결과를 얻을 수 있습니다.'
            ];
        }
        
        responses.forEach((response, index) => {
            setTimeout(() => {
                addMessage(response, 'ai');
                if (index === responses.length - 1) {
                    // Trigger edit simulation
                    onSimulateEdit && onSimulateEdit();
                }
            }, (index + 1) * 1000);
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleConfirmQuestion = () => {
        setShowQuestionResult(false);
        setIsVideoEnabled(true);
        addMessage('질문 결과가 확인되었습니다. 이제 영상을 만들 수 있습니다!', 'ai');
    };

    const handleCancelQuestion = () => {
        setShowQuestionResult(false);
        setQuestionResult(null);
        addMessage('질문 결과를 취소했습니다.', 'ai');
    };

    const handleCreateVideo = () => {
        addMessage('영상 생성을 시작합니다...', 'ai');
        setTimeout(() => {
            addMessage('영상이 성공적으로 생성되었습니다! 🎬', 'ai');
        }, 3000);
    };

    return (
        <div className="right-panel">
            <div className="chat-header">
                <h2>🤖 AI 어시스턴트</h2>
            </div>
            
            <div className="chat-messages">
                {messages.map(message => (
                    <div key={message.id} className={`message ${message.sender}`}>
                        {message.content.split('\n').map((line, index) => (
                            <div key={index}>
                                {line}
                                {index < message.content.split('\n').length - 1 && <br />}
                            </div>
                        ))}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 질문 결과 섹션 */}
            {showQuestionResult && questionResult && (
                <div className="question-result">
                    <h3>📋 질문 결과</h3>
                    <div className="question-content">
                        <p><strong>질문:</strong> {questionResult.question}</p>
                        <p><strong>답변:</strong> {questionResult.answer}</p>
                        <div className="result-image">
                            <img src={questionResult.image} alt="질문 결과" />
                        </div>
                        <div className="confidence">
                            신뢰도: {Math.round(questionResult.confidence * 100)}%
                        </div>
                    </div>
                    <div className="question-actions">
                        <button className="confirm-button" onClick={handleConfirmQuestion}>
                            ✅ 확인
                        </button>
                        <button className="cancel-button" onClick={handleCancelQuestion}>
                            ❌ 취소
                        </button>
                    </div>
                </div>
            )}

            {/* 영상 만들기 버튼 */}
            {isVideoEnabled && (
                <div className="video-section">
                    <button className="video-button" onClick={handleCreateVideo}>
                        🎬 영상으로 만들기
                    </button>
                </div>
            )}

            <div className="chat-input-area">
                <textarea 
                    className="chat-input" 
                    placeholder="여기에 편집 요청이나 질문을 입력하세요... 예: '이 캐릭터의 표정을 화난 표정으로 바꿔주세요' 또는 '이 캐릭터는 누구인가요?'"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button 
                    className="send-button" 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                >
                    요청 보내기
                </button>
            </div>
        </div>
    );
};

export default RightPanel;