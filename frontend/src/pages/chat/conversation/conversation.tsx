import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Send, ArrowLeft, Loader2, Check, CheckCheck } from 'lucide-react';
import './conversation.css';

interface ChatMessageResponse {
  id: string;
  matchId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessageEvent {
    id?: string;
    matchId: string;
    senderId: string;
    receiverId: string;
    content: string | null;
    timestamp: string;
    type: 'TEXT' | 'TYPING' | 'READ_RECEIPT';
}

interface ConversationResponse {
    matchId: string;
    otherUserId: string;
    otherUsername: string;
}

const Conversation: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const user = useSelector((s: RootState) => s.user.data);
    const userId = user?.userId;
    const username = user?.username;

    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [conversationInfo, setConversationInfo] = useState<ConversationResponse | null>(null);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isInitialRender, setIsInitialRender] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const isTypingRef = useRef(false);

    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const sortMessagesAsc = (msgs: ChatMessageResponse[]) => {
        return [...msgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    };

    const markAsReadAPI = useCallback(async () => {
        if (!matchId) return;
        try {
            await fetch(`/api/chat/${matchId}/read`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error(error);
        }
    }, [matchId]);

    const sendTypingEvent = useCallback(async (isStart: boolean) => {
        if (!matchId || !userId || !conversationInfo) return;
        if (isStart === isTypingRef.current) return;
        isTypingRef.current = isStart;

        try {
            await fetch(`/api/chat/${matchId}/send`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: conversationInfo.otherUserId,
                    content: isStart ? 'start' : 'stop',
                    type: 'TYPING'
                }),
            });
        } catch (error) {
            console.error(error);
        }
    }, [matchId, userId, conversationInfo]);

    const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (!e.target.value.trim()) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            sendTypingEvent(false);
            return;
        }
        if (!isTypingRef.current) sendTypingEvent(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => sendTypingEvent(false), 1500) as unknown as number;
    };

    useEffect(() => {
        if (!matchId || !userId) return;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const infoRes = await fetch(`/api/chat/${matchId}/info`, { credentials: 'include' });
                const info = await infoRes.json();
                setConversationInfo(info);

                const msgRes = await fetch(`/api/chat/${matchId}/messages`, { credentials: 'include' });
                const history: ChatMessageResponse[] = await msgRes.json();
                setMessages(sortMessagesAsc(history));

                if (history.some((m) => m.senderId !== userId && !m.read)) {
                    markAsReadAPI();
                }
            } catch (err) {
                navigate('/chat');
            } finally {
                setIsLoading(false);
                requestAnimationFrame(() => {
                    scrollToBottom('auto');
                    setIsInitialRender(false);
                });
            }
        };
        loadData();
    }, [matchId, userId, markAsReadAPI, navigate]);

    useEffect(() => {
        if (!userId || !matchId || !conversationInfo) return;
        const eventSource = new EventSource(`/api/chat/stream`, { withCredentials: true });

        eventSource.onmessage = (event) => {
            const data: MessageEvent = JSON.parse(event.data);
            if (data.matchId !== matchId) return;

            if (data.type === 'TEXT') {
                setMessages(prev => {
                    const cleanedPrev = prev.filter(m =>
                        !(m.id.startsWith('temp-') &&
                          m.senderId === data.senderId &&
                          m.content === data.content)
                    );

                    if (cleanedPrev.some(m => m.id === data.id)) {
                        return cleanedPrev;
                    }

                    const newMsg: ChatMessageResponse = {
                        id: data.id || `msg-${Date.now()}`,
                        matchId: data.matchId,
                        senderId: data.senderId,
                        senderUsername: data.senderId === userId ? (username || 'Moi') : conversationInfo.otherUsername,
                        content: data.content || '',
                        timestamp: data.timestamp,
                        read: false
                    };
                    return sortMessagesAsc([...cleanedPrev, newMsg]);
                });

                if (data.senderId !== userId) markAsReadAPI();
                setTimeout(() => scrollToBottom('smooth'), 50);
            } else if (data.type === 'READ_RECEIPT') {
                setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
            } else if (data.type === 'TYPING') {
                if (data.senderId !== userId) {
                    setIsOtherTyping(data.content === 'start');
                    setTimeout(() => scrollToBottom('smooth'), 50);
                }
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => eventSource.close();
    }, [userId, matchId, conversationInfo, username, markAsReadAPI]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !matchId || !userId || !conversationInfo) return;
        const content = newMessage.trim();
        setIsSending(true);
        setNewMessage('');
        sendTypingEvent(false);

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: ChatMessageResponse = {
            id: tempId,
            matchId,
            senderId: userId,
            senderUsername: username || 'Moi',
            content,
            timestamp: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => sortMessagesAsc([...prev, optimisticMessage]));
        setTimeout(() => scrollToBottom('smooth'), 50);

        try {
            await fetch(`/api/chat/${matchId}/send`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: conversationInfo.otherUserId, content, type: 'TEXT' }),
            });
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setNewMessage(content);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="chat-page-container">
                <div className="conversation-card loading">
                    <Loader2 className="loading-spinner" />
                    <p className="loading-text">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="conversation-page-container">
            <div className="conversation-card">
                <div className="conversation-header">
                    <button onClick={() => navigate('/chat')} className="back-button">
                        <ArrowLeft className="header-icon" />
                    </button>
                    <div className="header-title-area">
                        <h2 className="header-username">{conversationInfo?.otherUsername}</h2>
                    </div>
                </div>
                <div className="message-area" style={{ opacity: isInitialRender ? 0 : 1 }}>
                    <div className="messages-wrapper">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === userId;
                            const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div
                                    key={msg.id}
                                    className={`message-bubble-container ${isMe ? 'me' : 'other'} ${isInitialRender ? 'no-anim' : ''}`}
                                >
                                    <div className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                                        <p className="message-content">{msg.content}</p>
                                        <div className={`message-time-status ${isMe ? 'me' : 'other'}`}>
                                            <span className="time-text">{time}</span>
                                            {isMe && (
                                                <span className="status-icon-wrapper">
                                                    {msg.read ? <CheckCheck className="read-icon checked" /> : <Check className="read-icon sent" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="typing-area-container">
                    {isOtherTyping && (
                        <p className="typing-indicator">
                            {conversationInfo?.otherUsername} est en train d'écrire...
                        </p>
                    )}
                </div>
                <form onSubmit={handleSend} className="message-input-form">
                    <div className="input-container">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTypingChange}
                            placeholder="Écrire un message..."
                            disabled={isSending}
                            className="message-input"
                        />
                        <button type="submit" disabled={isSending || !newMessage.trim()} className="send-button">
                            {isSending ? <Loader2 className="send-icon-spinner" /> : <Send className="send-icon" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Conversation;