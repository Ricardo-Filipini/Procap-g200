import React, { useState } from 'react';
import { FunnelIcon, SparklesIcon, XMarkIcon } from '../Icons';

type SortOption = 'temp' | 'time' | 'subject' | 'user' | 'source';
type FilterStatus = 'all' | 'read' | 'unread';

interface ContentToolbarProps {
    sort: SortOption;
    setSort: (s: SortOption) => void;
    filter?: FilterStatus;
    setFilter?: (f: FilterStatus) => void;
    favoritesOnly?: boolean;
    setFavoritesOnly?: (fav: boolean) => void;
    onAiFilter?: (prompt: string) => void;
    onGenerate?: (prompt: string) => void;
    isFiltering?: boolean;
    onClearFilter?: () => void;
    supportedSorts?: SortOption[];
}

export const ContentToolbar: React.FC<ContentToolbarProps> = ({
    sort, setSort, filter, setFilter, favoritesOnly, setFavoritesOnly,
    onAiFilter, onGenerate, isFiltering, onClearFilter, supportedSorts
}) => {
    const [aiPrompt, setAiPrompt] = useState('');
    
    const allSorts: Record<SortOption, { title: string, icon: string }> = {
        temp: { title: "Temperatura", icon: "🌡️" },
        time: { title: "Data", icon: "🕐" },
        subject: { title: "Matéria", icon: "📚" },
        user: { title: "Usuário", icon: "👤" },
        source: { title: "Fonte", icon: "📄" },
    };

    const availableSorts = supportedSorts 
        ? supportedSorts.map(s => ({ key: s, ...allSorts[s] })) 
        : Object.entries(allSorts).map(([key, value]) => ({ key: key as SortOption, ...value }));

    const handleAiPromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onAiFilter) {
            onAiFilter(aiPrompt);
        }
    };
        
    return (
        <div className="mb-6 bg-card-light dark:bg-card-dark p-3 rounded-lg shadow-sm border border-border-light dark:border-border-dark flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Ordenar:</span>
                 {availableSorts.map(s => (
                    <button key={s.key} onClick={() => setSort(s.key)} title={s.title} className={`p-1.5 rounded-full transition-colors ${sort === s.key ? 'bg-primary-light/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        <span className="text-xl">{s.icon}</span>
                    </button>
                ))}
            </div>
            
            {setFilter && 
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Mostrar:</span>
                    <select value={filter} onChange={e => setFilter(e.target.value as FilterStatus)} className="p-1.5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                        <option value="all">Todos</option>
                        <option value="read">Lidos</option>
                        <option value="unread">Não lidos</option>
                    </select>
                </div>
            }

            {setFavoritesOnly &&
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="fav-only" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)} className="h-4 w-4 rounded text-primary-light focus:ring-primary-light border-gray-300"/>
                    <label htmlFor="fav-only" className="cursor-pointer font-semibold">Apenas Favoritos</label>
                </div>
            }

            {(onAiFilter || onGenerate) && (
                <div className="flex items-center gap-2 flex-grow min-w-[250px]">
                    <SparklesIcon className="w-5 h-5 text-primary-light" />
                    <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={handleAiPromptKeyDown} placeholder="Filtrar ou gerar com IA..." className="flex-grow p-1.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md"/>
                    {onAiFilter && (
                         <button onClick={() => onAiFilter(aiPrompt)} className="p-2 bg-primary-light/10 text-primary-light rounded-md hover:bg-primary-light/20"><FunnelIcon className="w-4 h-4"/></button>
                    )}
                    {onGenerate && (
                        <button onClick={() => onGenerate(aiPrompt)} className="p-2 bg-secondary-light/10 text-secondary-light rounded-md hover:bg-secondary-light/20"><SparklesIcon className="w-4 h-4"/></button>
                    )}
                    {isFiltering && onClearFilter && (
                         <button onClick={onClearFilter} className="p-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20"><XMarkIcon className="w-4 h-4"/></button>
                    )}
                </div>
            )}
        </div>
    );
};