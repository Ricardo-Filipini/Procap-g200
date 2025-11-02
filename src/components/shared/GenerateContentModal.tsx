import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Source } from '../../types';
import { SparklesIcon } from '../Icons';

interface GenerateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  prompt: string;
  contentType: 'summaries' | 'flashcards' | 'questions';
  isLoading: boolean;
  onGenerate: (selectedSourceIds: string[], prompt: string) => void;
}

export const GenerateContentModal: React.FC<GenerateContentModalProps> = ({
  isOpen, onClose, sources, prompt, contentType, isLoading, onGenerate
}) => {
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setCurrentPrompt(prompt);
      setSelectedSources(new Set());
    }
  }, [isOpen, prompt]);
  
  const handleToggleSource = (id: string) => {
    setSelectedSources(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  };

  const contentTypeMap = {
      summaries: "Resumos",
      flashcards: "Flashcards",
      questions: "Questões"
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gerar ${contentTypeMap[contentType]} com IA`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
            A IA usará o prompt e as fontes selecionadas como contexto para gerar novos {contentTypeMap[contentType].toLowerCase()}. 
            Se nenhuma fonte for selecionada, todas serão consideradas.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">Prompt</label>
          <textarea
            value={currentPrompt}
            onChange={e => setCurrentPrompt(e.target.value)}
            rows={3}
            className="w-full p-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fontes de Contexto</label>
          <div className="max-h-40 overflow-y-auto border border-border-light dark:border-border-dark rounded-md p-2 space-y-1">
            {sources.map(source => (
              <div key={source.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  id={`source-${source.id}`}
                  checked={selectedSources.has(source.id)}
                  onChange={() => handleToggleSource(source.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
                />
                <label htmlFor={`source-${source.id}`} className="text-sm cursor-pointer flex-grow">{source.title}</label>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onGenerate(Array.from(selectedSources), currentPrompt)}
          disabled={isLoading}
          className="mt-4 w-full bg-primary-light text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-5 h-5"/>
          {isLoading ? 'Gerando...' : `Gerar ${contentTypeMap[contentType]}`}
        </button>
      </div>
    </Modal>
  );
};