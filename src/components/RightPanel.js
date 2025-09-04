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

            <div className="chat-input-area">
                <textarea 
                    className="chat-input" 
                    placeholder="여기에 편집 요청을 입력하세요... 예: '이 캐릭터의 표정을 화난 표정으로 바꿔주세요'"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button 
                    className="send-button" 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                >
                    편집 요청 보내기
                </button>
            </div>
        </div>
    );
};

export default RightPanel;