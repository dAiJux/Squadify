import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { MessageSquare, User, Loader2 } from 'lucide-react';
import './lobby.css';

interface ConversationResponse {
  matchId: string;
  otherUserId: string;
  otherUsername: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  matchDate: string;
}

const ChatLobby: React.FC = () => {
  const navigate = useNavigate();
  const userId = useSelector((s: RootState) => s.user.data?.userId);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/chat/conversations', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des conversations.');
        }
        const data: ConversationResponse[] = await response.json();
        setConversations(data);
      } catch (err) {
        setError("Impossible de charger les conversations. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

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

  const ConversationItem: React.FC<{ conversation: ConversationResponse }> = ({ conversation }) => {
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
        <div className="chat-avatar">
          <div className={`chat-avatar-initials ${isNewMatch ? 'new-match' : ''}`}>
            {conversation.otherUsername.charAt(0).toUpperCase()}
          </div>
          {(hasUnread || isNewMatch) && (
            <div className={`chat-unread-dot ${isNewMatch ? 'new-match-dot' : ''}`}></div>
          )}
        </div>
        <div className="content-area">
          <div className="username">
            {conversation.otherUsername}
          </div>
          <div className={`last-message ${hasUnread || isNewMatch ? 'unread' : ''}`}>
            {displayMessage}
          </div>
        </div>
        <div className="time-area">
          <div className={`last-time ${hasUnread || isNewMatch ? 'unread' : ''}`}>
            {formatLastMessageTime(conversation.lastMessageTime, conversation.matchDate)}
          </div>
          {hasUnread && !isNewMatch && (
            <div className="unread-count-badge">
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-page-container">
      <div className="chat-list-card">
        <h1 className="chat-title">
          <MessageSquare className="chat-title-icon" />
          Discussions
        </h1>
        <div className="chat-separator"></div>
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="loading-spinner" />
            <p className="loading-text">Chargement des discussions...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <User className="empty-icon" />
            <p className="empty-text">Aucune discussion en cours.</p>
            <p className="empty-subtext">Faites des matchs pour démarrer le chat !</p>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map(conv => (
              <ConversationItem key={conv.matchId} conversation={conv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLobby;