import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '~/store/store';
import { MessageSquare, Loader2 } from 'lucide-react';
import ConversationItem from '~/components/conversationItem/conversationItem';
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

const ChatLobby = () => {
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
      } catch {
        setError("Impossible de charger les conversations. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  return (
    <div className="chat-page-container">
      <div className="chat-list-card">
        <h1 className="chat-title">
          <MessageSquare className="chat-title-icon" />
          Messages
        </h1>
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="loading-spinner" />
            <p className="loading-text">Chargement...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <MessageSquare className="empty-icon" />
            <p className="empty-text">Aucune conversation</p>
            <p className="empty-subtext">Faites des matchs pour commencer à discuter</p>
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