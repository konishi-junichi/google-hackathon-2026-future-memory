import React, { useState, useRef, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';
import { GeminiService } from '../services/gemini';

interface AIChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateItinerary: (newItinerary: any) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose, onUpdateItinerary }) => {
    const { itinerary, selectedProposal, language } = useTravel();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'こんにちは！AIトラベルコンシェルジュです。プランの調整はお任せください。何でもご相談くださいね！' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelWidth, setPanelWidth] = useState(500);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartX = useRef(0);
    const resizeStartWidth = useRef(500);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle resize
    const handleResizeStart = (e: React.MouseEvent) => {
        setIsResizing(true);
        resizeStartX.current = e.clientX;
        resizeStartWidth.current = panelWidth;
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const diff = resizeStartX.current - e.clientX;
            const newWidth = Math.max(400, Math.min(800, resizeStartWidth.current + diff));
            setPanelWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, panelWidth]);

    const handleSend = async () => {
        if (!input.trim() || !itinerary || !selectedProposal) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Extract history (last 5 messages for context)
            const history = messages.slice(-5).map(m => `${m.role}: ${m.content}`);

            const newItinerary = await GeminiService.brushUpPlan(
                selectedProposal.id,
                selectedProposal.title,
                language,
                itinerary,
                userMsg,
                history
            );

            onUpdateItinerary(newItinerary);
            setMessages(prev => [...prev, { role: 'assistant', content: 'プランを更新しました！他にも変更したい点はありますか？' }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: '申し訳ありません。プランの更新中にエラーが発生しました。もう一度お試しください。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                ref={panelRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: `${panelWidth}px`,
                    height: '100vh',
                    background: 'var(--color-bg-dark)',
                    color: 'var(--color-text-main)',
                    backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid var(--color-glass-border)',
                    boxShadow: '-5px 0 20px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: isResizing ? 'none' : 'transform 0.3s ease-in-out',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
                }}
            >
                {/* Resize Handle */}
                <div
                    onMouseDown={handleResizeStart}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '8px',
                        cursor: 'ew-resize',
                        background: isResizing ? 'rgba(236, 72, 153, 0.3)' : 'transparent',
                        transition: 'background 0.2s',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        if (!isResizing) {
                            e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isResizing) {
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                >
                    <div style={{
                        width: '2px',
                        height: '40px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px'
                    }} />
                </div>
                {/* Header */}
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--color-glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid var(--color-accent)'
                        }}>
                            <img src="/icon.png" alt="AIコンシェルジュ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: 'bold' }}>AIコンシェルジュ</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            gap: '0.5rem',
                            alignItems: 'flex-end'
                        }}>
                            {msg.role === 'assistant' && (
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '1px solid var(--color-glass-border)',
                                    flexShrink: 0
                                }}>
                                    <img src="/icon.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '70%',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
                                fontSize: '0.95rem',
                                borderBottomRightRadius: msg.role === 'user' ? '2px' : '15px',
                                borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '15px',
                                border: msg.role === 'assistant' ? '1px solid var(--color-glass-border)' : 'none'
                            }}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '1px solid var(--color-glass-border)',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    👤
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{
                                padding: '10px 15px',
                                borderRadius: '15px',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.9rem',
                                fontStyle: 'italic'
                            }}>
                                Thinking... 💭
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--color-glass-border)',
                    background: 'var(--color-glass-bg)'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="例: ランチを和食に変えて（Ctrl+Enterで送信）"
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid var(--color-glass-border)',
                                borderRadius: '15px',
                                padding: '10px 15px',
                                color: 'var(--color-text-main)',
                                outline: 'none',
                                resize: 'vertical',
                                minHeight: '45px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                fontFamily: 'inherit',
                                fontSize: '0.95rem',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}
                            disabled={isLoading}
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            style={{
                                background: 'var(--color-accent)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                                color: 'white',
                                opacity: (isLoading || !input.trim()) ? 0.5 : 1
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChatPanel;
