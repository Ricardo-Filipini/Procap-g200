import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Comment } from '../../types';
import { PaperAirplaneIcon } from '../Icons';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string) => void;
  onVoteComment: (commentId: string, voteType: 'hot' | 'cold') => void;
  contentTitle: string;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  comments,
  onAddComment,
  onVoteComment,
  contentTitle,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };
  
  const sortedComments = [...comments].sort((a, b) => (b.hot_votes - b.cold_votes) - (a.hot_votes - a.cold_votes));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comentários em "${contentTitle}"`}>
      <div className="space-y-4">
        <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
            {sortedComments.length > 0 ? sortedComments.map(comment => (
                <div key={comment.id} className="p-3 bg-background-light dark:bg-background-dark rounded-lg">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-semibold">{comment.authorPseudonym}</span>
                        <span>{new Date(comment.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                        <button onClick={() => onVoteComment(comment.id, 'hot')} className="flex items-center gap-1 text-sm">
                           <span className="text-lg">🔥</span> {comment.hot_votes || 0}
                        </button>
                         <button onClick={() => onVoteComment(comment.id, 'cold')} className="flex items-center gap-1 text-sm">
                           <span className="text-lg">❄️</span> {comment.cold_votes || 0}
                        </button>
                    </div>
                </div>
            )) : <p className="text-sm text-center text-gray-500 py-4">Nenhum comentário ainda. Seja o primeiro!</p>}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-border-light dark:border-border-dark">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddComment()}
            placeholder="Adicione um comentário..."
            className="flex-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <button onClick={handleAddComment} className="bg-primary-light text-white p-3 rounded-r-md">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};