import React from 'react';
import { User, ContentType, UserContentInteraction, UserNotebookInteraction } from '../../types';
import { FireIcon, StarIcon, CheckCircleIcon, ChatBubbleLeftRightIcon } from '../Icons';

type Item = { id: string, comments?: any[], hot_votes: number, cold_votes: number };
type Interaction = UserContentInteraction | UserNotebookInteraction;

interface ContentActionsProps {
    item: Item;
    contentType: ContentType | 'question_notebook';
    currentUser: User;
    interactions: Interaction[];
    onVote: (itemId: string, voteType: 'hot' | 'cold', increment: 1 | -1) => void;
    onToggleFavorite: (itemId: string, currentState: boolean) => void;
    onToggleRead: (itemId: string, currentState: boolean) => void;
    onComment: () => void;
    extraActions?: React.ReactNode;
}

export const ContentActions: React.FC<ContentActionsProps> = ({
    item, contentType, currentUser, interactions,
    onVote, onToggleFavorite, onToggleRead, onComment, extraActions
}) => {
    const interaction = interactions.find(i => 
      ('content_id' in i && i.content_id === item.id && i.content_type === contentType) ||
      ('notebook_id' in i && i.notebook_id === item.id)
    );
    
    const isFavorite = interaction?.is_favorite || false;
    const isRead = interaction?.is_read || false;
    
    return (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light dark:border-border-dark text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
                <button onClick={() => onVote(item.id, 'hot', 1)} className="flex items-center gap-1 hover:text-red-500" title="Votar quente">
                    <span className="text-lg">🔥</span> {item.hot_votes || 0}
                </button>
                <button onClick={() => onVote(item.id, 'cold', 1)} className="flex items-center gap-1 hover:text-blue-500" title="Votar frio">
                    <span className="text-lg">❄️</span> {item.cold_votes || 0}
                </button>
            </div>
            <div className="flex-grow" />
            <div className="flex items-center gap-4">
                {extraActions}
                <button onClick={() => onToggleFavorite(item.id, isFavorite)} title="Favoritar">
                    <StarIcon className={`w-6 h-6 ${isFavorite ? 'text-yellow-500' : 'hover:text-yellow-400'}`} filled={isFavorite} />
                </button>
                <button onClick={() => onToggleRead(item.id, isRead)} title="Marcar como lido">
                    <CheckCircleIcon className={`w-6 h-6 ${isRead ? 'text-green-500' : 'hover:text-green-400'}`} />
                </button>
                <button onClick={onComment} className="flex items-center gap-1 hover:text-primary-light" title="Comentários">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" /> ({item.comments?.length || 0})
                </button>
            </div>
        </div>
    );
};