import React from 'react';
import { useNavigate } from 'react-router-dom';
import './conversationItem.css';

interface ConversationResponse {
    matchId: string;
    otherUserId: string;
    otherUsername: string;
    lastMessage: string | null;
    lastMessageTime: string | null;
    unreadCount: number;
    matchDate: string;
}

interface ConversationItemProps {
    conversation: ConversationResponse;
}

const formatLastMessageTime = (isoString: string | null, matchDate: string): string => {
    if (!isoString) {
        const matchDateTime = new Date(matchDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - matchDateTime.getTime());
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return `Il y a ${diffMinutes}min`;
        }
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
            return `Il y a ${diffHours}h`;
        }
        return matchDateTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }

    const date = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
};

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
    const navigate = useNavigate();
    const hasUnread = conversation.unreadCount > 0;
    const isNewMatch = !conversation.lastMessage;
    const displayMessage = isNewMatch
        ? "Nouveau match ! Démarrez la conversation"
        : conversation.lastMessage;

    return (
        <div
            className="conversation-item"
            onClick={() => navigate(`/chat/${conversation.matchId}`)}
        >
            <div className="conversation-avatar">
                <div className={`conversation-avatar-initials ${isNewMatch ? 'new-match' : ''}`}>
                    {conversation.otherUsername.charAt(0).toUpperCase()}
                </div>
                {(hasUnread || isNewMatch) && (
                    <div className={`conversation-unread-dot ${isNewMatch ? 'new-match-dot' : ''}`}></div>
                )}
            </div>
            <div className="conversation-content">
                <div className="conversation-username">
                    {conversation.otherUsername}
                </div>
                <div className={`conversation-last-message ${hasUnread || isNewMatch ? 'unread' : ''}`}>
                    {displayMessage}
                </div>
            </div>
            <div className="conversation-time-area">
                <div className={`conversation-last-time ${hasUnread || isNewMatch ? 'unread' : ''}`}>
                    {formatLastMessageTime(conversation.lastMessageTime, conversation.matchDate)}
                </div>
                {hasUnread && !isNewMatch && (
                    <div className="conversation-unread-badge">
                        {conversation.unreadCount}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationItem;
