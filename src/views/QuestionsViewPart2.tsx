import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MainContentProps } from '../components/MainContent';
import { Question, Comment, QuestionNotebook, UserNotebookInteraction, UserQuestionAnswer } from '../types';
import { CommentsModal } from '../components/shared/CommentsModal';
import { Modal } from '../components/Modal';
import { PlusIcon, LightBulbIcon, ChartBarSquareIcon, MagnifyingGlassIcon, TrashIcon } from '../components/Icons';
import { ContentActions } from '../components/shared/ContentActions';
import { FontSizeControl, FONT_SIZE_CLASSES } from '../components/shared/FontSizeControl';
import { checkAndAwardAchievements } from '../lib/achievements';
import { handleInteractionUpdate, handleVoteUpdate } from '../lib/content';
import { filterItemsByPrompt, generateNotebookName } from '../services/geminiService';
import { addQuestionNotebook, upsertUserVote, incrementVoteCount, updateContentComments, updateUser as supabaseUpdateUser, upsertUserQuestionAnswer, clearNotebookAnswers } from '../services/supabaseClient';

const CreateNotebookModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    appData: MainContentProps['appData'];
    setAppData: MainContentProps['setAppData'];
    currentUser: MainContentProps['currentUser'];
}> = ({ isOpen, onClose, appData, setAppData, currentUser }) => {
    const [name, setName] = useState("");
    const [questionCount, setQuestionCount] = useState(40);
    const [prompt, setPrompt] = useState("");
    const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
    const [excludeAnswered, setExcludeAnswered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const handleToggleSource = (id: string) => {
        setSelectedSourceIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleCreate = async () => {
        setIsLoading(true);
        setStatusMessage("Coletando questões...");
        try {
            const allAvailableSources = appData.sources.filter(s => s.questions && s.questions.length > 0);
            
            const sourcesToUse = selectedSourceIds.size > 0
                ? allAvailableSources.filter(s => selectedSourceIds.has(s.id))
                : allAvailableSources;
            
            let questionsPool = sourcesToUse.flatMap(s => s.questions);

            if (excludeAnswered) {
                const answeredQuestionIds = new Set(appData.userQuestionAnswers.filter(a => a.user_id === currentUser.id).map(a => a.question_id));
                questionsPool = questionsPool.filter(q => !answeredQuestionIds.has(q.id));
            }

            if (questionsPool.length === 0) {
                throw new Error("Nenhuma questão disponível com os filtros aplicados.");
            }

            let finalQuestionIds: string[];
            if (prompt.trim()) {
                setStatusMessage("Filtrando questões com IA...");
                const itemsToFilter = questionsPool.map(q => ({ id: q.id, text: q.questionText }));
                const relevantIds = await filterItemsByPrompt(prompt, itemsToFilter);
                finalQuestionIds = relevantIds.length > 0 ? relevantIds : questionsPool.map(q => q.id); // Fallback to all if AI returns none
            } else {
                finalQuestionIds = questionsPool.map(q => q.id);
            }

            const shuffled = finalQuestionIds.sort(() => 0.5 - Math.random());
            const sliced = shuffled.slice(0, questionCount);

            let finalName = name.trim();
            if (!finalName) {
                setStatusMessage("Gerando nome com IA...");
                const selectedQuestions = appData.sources.flatMap(s => s.questions).filter(q => sliced.includes(q.id));
                finalName = await generateNotebookName(selectedQuestions);
            }

            setStatusMessage("Salvando caderno...");
            const payload: Partial<QuestionNotebook> = {
                user_id: currentUser.id, name: finalName, question_ids: sliced, comments: [], hot_votes: 0, cold_votes: 0,
            };
            const newNotebook = await addQuestionNotebook(payload);
            if (newNotebook) {
                setAppData(prev => ({ ...prev, questionNotebooks: [newNotebook, ...prev.questionNotebooks] }));
                onClose();
            } else {
                throw new Error("Falha ao salvar o caderno no banco de dados.");
            }
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setIsLoading(false);
            setStatusMessage("");
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setName("");
            setQuestionCount(40);
            setPrompt("");
            setSelectedSourceIds(new Set());
            setExcludeAnswered(false);
            setIsLoading(false);
            setStatusMessage("");
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Caderno de Questões">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nome (opcional)</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="A IA gera um se deixado em branco"
                        className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Quantidade de Questões</label>
                    <input type="number" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Prompt para IA (opcional)</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ex: 'Foco em política monetária e COPOM'"
                        className="w-full h-20 p-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Fontes (opcional, todas por padrão)</label>
                    <div className="max-h-40 overflow-y-auto border border-border-light dark:border-border-dark rounded-md p-2 space-y-1">
                       {appData.sources.filter(s => s.questions && s.questions.length > 0).map(source => (
                            <div key={source.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                <input type="checkbox" id={`source-select-${source.id}`} checked={selectedSourceIds.has(source.id)} onChange={() => handleToggleSource(source.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light" />
                                <label htmlFor={`source-select-${source.id}`} className="text-sm cursor-pointer flex-grow truncate flex justify-between items-center">
                                    <span>{source.title}</span>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">Questões: {source.questions.length}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="exclude-answered" checked={excludeAnswered} onChange={e => setExcludeAnswered(e.target.checked)} 
                        className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light" />
                    <label htmlFor="exclude-answered" className="text-sm cursor-pointer">Não incluir questões já respondidas</label>
                </div>
                <button onClick={handleCreate} disabled={isLoading} className="mt-4 w-full bg-primary-light text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-10">
                    {isLoading ? (
                         <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>{statusMessage}</span>
                        </div>
                    ) : 'Criar Caderno'}
                </button>
            </div>
        </Modal>
    );
};

const QuestionStatsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    question: Question;
    appData: MainContentProps['appData'];
}> = ({ isOpen, onClose, question, appData }) => {
    const stats = useMemo(() => {
        if (!question) return null;

        const allAnswersForThisQuestion = appData.userQuestionAnswers.filter(
            ans => ans.question_id === question.id
        );

        const firstTryAnswers = allAnswersForThisQuestion.map(ans => ans.attempts[0]);
        const totalFirstTries = firstTryAnswers.length;
        if (totalFirstTries === 0) {
            return { total: 0, correct: 0, incorrect: 0, distribution: question.options.map(o => ({ option: o, count: 0, percentage: 0})) };
        }

        const correctFirstTries = allAnswersForThisQuestion.filter(ans => ans.is_correct_first_try).length;
        const incorrectFirstTries = totalFirstTries - correctFirstTries;

        const distribution = question.options.map(option => {
            const count = firstTryAnswers.filter(ans => ans === option).length;
            return { option, count, percentage: (count / totalFirstTries) * 100 };
        });

        return {
            total: totalFirstTries,
            correct: correctFirstTries,
            incorrect: incorrectFirstTries,
            distribution: distribution.sort((a,b) => b.count - a.count)
        };
    }, [question, appData.userQuestionAnswers]);

    if (!stats) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Estatísticas da Questão`}>
            <div className="space-y-4">
                <p className="text-sm font-semibold truncate">{question.questionText}</p>
                 {stats.total > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
                                <p className="font-semibold text-gray-500">Respostas</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                             <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                                <p className="font-semibold text-green-700 dark:text-green-300">Acertos</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.correct}</p>
                            </div>
                             <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
                                <p className="font-semibold text-red-700 dark:text-red-300">Erros</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.incorrect}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Distribuição das Respostas (1ª Tentativa)</h4>
                            <div className="space-y-2">
                                {stats.distribution.map(({ option, count, percentage }) => (
                                    <div key={option}>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className={`truncate ${option === question.correctAnswer ? 'font-bold' : ''}`} title={option}>{option}</span>
                                            <span>{count} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className={`h-2.5 rounded-full ${option === question.correctAnswer ? 'bg-green-500' : 'bg-primary-light'}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-4">Nenhum usuário respondeu a esta questão ainda.</p>
                )}
            </div>
        </Modal>
    );
};

const NotebookStatsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    notebook: QuestionNotebook | 'all';
    appData: MainContentProps['appData'];
    currentUser: MainContentProps['currentUser'];
    onClearAnswers: () => void;
}> = ({ isOpen, onClose, notebook, appData, currentUser, onClearAnswers }) => {
    const notebookId = notebook === 'all' ? 'all_questions' : notebook.id;
    const notebookName = notebook === 'all' ? "Todas as Questões" : notebook.name;
    const questionIds = useMemo(() => {
        if (notebook === 'all') {
            return new Set(appData.sources.flatMap(s => s.questions.map(q => q.id)));
        }
        return new Set(notebook.question_ids);
    }, [notebook, appData.sources]);

    const relevantAnswers = useMemo(() => {
        return appData.userQuestionAnswers.filter(
            ans => ans.user_id === currentUser.id && ans.notebook_id === notebookId
        );
    }, [appData.userQuestionAnswers, currentUser.id, notebookId]);

    const leaderboardData = useMemo(() => {
        const userScores: { [userId: string]: { correct: number, total: number } } = {};

        appData.userQuestionAnswers
            .filter(ans => ans.notebook_id === notebookId)
            .forEach(ans => {
                if (!userScores[ans.user_id]) {
                    userScores[ans.user_id] = { correct: 0, total: 0 };
                }
                userScores[ans.user_id].total++;
                if (ans.is_correct_first_try) {
                    userScores[ans.user_id].correct++;
                }
            });

        return Object.entries(userScores)
            .map(([userId, scores]) => {
                const user = appData.users.find(u => u.id === userId);
                return {
                    userId,
                    pseudonym: user?.pseudonym || 'Desconhecido',
                    score: scores.correct,
                };
            })
            .sort((a, b) => b.score - a.score);
    }, [appData.userQuestionAnswers, appData.users, notebookId]);

    const totalQuestions = questionIds.size;
    const questionsAnswered = relevantAnswers.length;
    const correctFirstTry = relevantAnswers.filter(a => a.is_correct_first_try).length;
    const accuracy = questionsAnswered > 0 ? (correctFirstTry / questionsAnswered) * 100 : 0;
    const progress = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Estatísticas: ${notebookName}`}>
            <div className="space-y-4 p-2">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Seu Progresso</h3>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-primary-light h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${progress}%` }}>
                            {progress.toFixed(0)}%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 text-right mt-1">{questionsAnswered} de {totalQuestions} questões respondidas</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg text-center">
                        <p className="text-lg font-semibold">Acertos na 1ª Tentativa</p>
                        <p className="text-3xl font-bold text-green-500">{correctFirstTry}</p>
                    </div>
                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg text-center">
                        <p className="text-lg font-semibold">Aproveitamento</p>
                        <p className="text-3xl font-bold text-secondary-light dark:text-secondary-dark">{accuracy.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                     <h3 className="text-lg font-semibold mb-2">Leaderboard do Caderno</h3>
                     <div className="max-h-40 overflow-y-auto space-y-2">
                        {leaderboardData.length > 0 ? leaderboardData.map((entry, index) => (
                            <div key={entry.userId} className={`flex items-center justify-between p-2 rounded-md ${entry.userId === currentUser.id ? 'bg-primary-light/10' : 'bg-background-light dark:bg-background-dark'}`}>
                                <p><span className="font-bold w-6 inline-block">{index + 1}.</span> {entry.pseudonym}</p>
                                <p className="font-bold">{entry.score} acertos</p>
                            </div>
                        )) : <p className="text-sm text-gray-500">Ninguém respondeu a este caderno ainda.</p>}
                     </div>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <button 
                        onClick={onClearAnswers}
                        className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                       <TrashIcon className="w-5 h-5"/> Limpar Respostas e Recomeçar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export const NotebookGridView: React.FC<{
    notebooks: QuestionNotebook[];
    appData: MainContentProps['appData'];
    setAppData: MainContentProps['setAppData'];
    currentUser: MainContentProps['currentUser'];
    updateUser: MainContentProps['updateUser'];
    onSelectNotebook: (notebook: QuestionNotebook | 'all') => void;
    handleNotebookInteractionUpdate: (notebookId: string, update: Partial<UserNotebookInteraction>) => void;
    handleNotebookVote: (notebookId: string, type: 'hot' | 'cold', increment: 1 | -1) => void;
    setCommentingOnNotebook: (notebook: QuestionNotebook) => void;
}> = ({ notebooks, appData, setAppData, currentUser, updateUser, onSelectNotebook, handleNotebookInteractionUpdate, handleNotebookVote, setCommentingOnNotebook }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const favoritedQuestionIds = useMemo(() => {
        return appData.userContentInteractions
            .filter(i => i.user_id === currentUser.id && i.content_type === 'question' && i.is_favorite)
            .map(i => i.content_id);
    }, [appData.userContentInteractions, currentUser.id]);
    
    const renderNotebook = (notebook: QuestionNotebook | 'all' | 'new' | 'favorites') => {
        if (notebook === 'new') {
            return (
                 <div 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex flex-col items-center justify-center text-center p-6 rounded-lg shadow-sm border-2 border-dashed border-border-light dark:border-border-dark cursor-pointer hover:shadow-md hover:border-primary-light dark:hover:border-primary-dark transition-all min-h-[220px]"
                >
                    <PlusIcon className="w-10 h-10 text-primary-light dark:text-primary-dark mb-2"/>
                    <h3 className="text-lg font-bold">Novo Caderno</h3>
                </div>
            );
        }
        
        let id, name, questionCount, item, contentType, interactions, onSelect, resolvedCount;
        
        if (notebook === 'all') {
            id = 'all_notebooks';
            name = "Todas as Questões";
            questionCount = appData.sources.flatMap(s => s.questions).length;
            resolvedCount = appData.userQuestionAnswers.filter(ans => ans.user_id === currentUser.id && ans.notebook_id === 'all_questions').length;
            onSelect = () => onSelectNotebook('all');
        } else if (notebook === 'favorites') {
             if (favoritedQuestionIds.length === 0) return null;
             id = 'favorites_notebook';
             name = "⭐ Questões Favoritas";
             questionCount = favoritedQuestionIds.length;
             resolvedCount = appData.userQuestionAnswers.filter(ans => ans.user_id === currentUser.id && ans.notebook_id === 'favorites_notebook').length;
             onSelect = () => {
                 const favoriteNotebook: QuestionNotebook = {
                    id: 'favorites_notebook', user_id: currentUser.id, name: '⭐ Questões Favoritas', question_ids: favoritedQuestionIds,
                    created_at: new Date().toISOString(), hot_votes: 0, cold_votes: 0, comments: []
                 };
                 onSelectNotebook(favoriteNotebook);
             };
        } else {
            id = notebook.id;
            name = notebook.name;
            questionCount = notebook.question_ids.length;
            resolvedCount = appData.userQuestionAnswers.filter(ans => ans.user_id === currentUser.id && ans.notebook_id === notebook.id).length;
            item = notebook;
            contentType = 'question_notebook';
            interactions = appData.userNotebookInteractions.filter(i => i.user_id === currentUser.id);
            onSelect = () => onSelectNotebook(notebook);
        }

        return (
            <div key={id} className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark flex flex-col">
                <div onClick={onSelect} className="p-4 flex-grow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg transition-colors">
                    <h4 className="font-bold">{name}</h4>
                    {notebook !== 'all' && notebook !== 'favorites' && (
                        <p className="text-xs text-gray-400 mt-1">por: {appData.users.find(u => u.id === notebook.user_id)?.pseudonym || 'Desconhecido'}</p>
                    )}
                    <div className="text-right mt-4">
                        <p className="font-bold text-primary-light dark:text-primary-dark">{questionCount} Questões</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">({resolvedCount}/{questionCount} resolvidas)</p>
                    </div>
                </div>
                {item && contentType && interactions && (
                    <div className="p-2 border-t border-border-light dark:border-border-dark">
                        <ContentActions
                            item={item}
                            contentType={contentType as 'question_notebook'}
                            currentUser={currentUser}
                            interactions={interactions}
                            onVote={handleNotebookVote}
                            onToggleRead={(id, state) => handleNotebookInteractionUpdate(id, { is_read: !state })}
                            onToggleFavorite={(id, state) => handleNotebookInteractionUpdate(id, { is_favorite: !state })}
                            onComment={() => setCommentingOnNotebook(item)}
                        />
                    </div>
                )}
            </div>
        )
    };

    return (
        <>
            <CreateNotebookModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                appData={appData}
                setAppData={setAppData}
                currentUser={currentUser}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderNotebook('new')}
                {renderNotebook('all')}
                {renderNotebook('favorites')}
                {notebooks.map(notebook => renderNotebook(notebook))}
            </div>
        </>
    );
};

export const NotebookDetailView: React.FC<{
    notebook: QuestionNotebook | 'all';
    allQuestions: (Question & { user_id: string, created_at: string})[];
    appData: MainContentProps['appData'];
    setAppData: MainContentProps['setAppData'];
    currentUser: MainContentProps['currentUser'];
    updateUser: MainContentProps['updateUser'];
    onBack: () => void;
}> = ({ notebook, allQuestions, appData, setAppData, currentUser, updateUser, onBack }) => {
    
    const [userAnswers, setUserAnswers] = useState<Map<string, UserQuestionAnswer>>(new Map());
    const notebookId = notebook === 'all' ? 'all_questions' : notebook.id;
    
    useEffect(() => {
        const answersForNotebook = appData.userQuestionAnswers.filter(
            ans => ans.user_id === currentUser.id && ans.notebook_id === notebookId
        );
        const answerMap = new Map(answersForNotebook.map(ans => [ans.question_id, ans]));
        setUserAnswers(answerMap);
    }, [appData.userQuestionAnswers, currentUser.id, notebookId]);

    const questions = useMemo(() => {
        if (notebook === 'all') return allQuestions;
        // FIX: Use a double cast because Supabase's type inference can be weak, resulting in `unknown[]` instead of `string[]`.
        const idSet = new Set((notebook.question_ids || []) as unknown as string[]);
        return allQuestions.filter(q => idSet.has(q.id));
    }, [notebook, allQuestions]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
    const [isCompleted, setIsCompleted] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isQuestionStatsModalOpen, setIsQuestionStatsModalOpen] = useState(false);
    const [commentingOnQuestion, setCommentingOnQuestion] = useState<Question | null>(null);
    const [fontSize, setFontSize] = useState(1);

    const currentQuestion = questions[currentQuestionIndex];
    
    useEffect(() => {
        if (!currentQuestion) return;
        const savedAnswer = userAnswers.get(currentQuestion.id);
        if (savedAnswer) {
            const correct = savedAnswer.attempts.includes(currentQuestion.correctAnswer);
            setIsCompleted(true);
            setSelectedOption(correct ? currentQuestion.correctAnswer : savedAnswer.attempts[savedAnswer.attempts.length - 1]);
            setWrongAnswers(new Set(savedAnswer.attempts.filter(a => a !== currentQuestion.correctAnswer)));
        } else {
            setSelectedOption(null);
            setWrongAnswers(new Set());
            setIsCompleted(false);
        }
    }, [currentQuestionIndex, currentQuestion, userAnswers]);

    const handleCommentAction = async (action: 'add' | 'vote', payload: any) => {
        if (!commentingOnQuestion) return;
        let updatedComments = [...commentingOnQuestion.comments];
        if (action === 'add') {
            const newComment: Comment = { id: `c_${Date.now()}`, authorId: currentUser.id, authorPseudonym: currentUser.pseudonym, text: payload.text, timestamp: new Date().toISOString(), hot_votes: 0, cold_votes: 0 };
            updatedComments.push(newComment);
        } else if (action === 'vote') {
             const commentIndex = updatedComments.findIndex(c => c.id === payload.commentId);
            if (commentIndex > -1) {
                updatedComments[commentIndex][`${payload.voteType}_votes`] += 1;
            }
        }
        
        const success = await updateContentComments('questions', commentingOnQuestion.id, updatedComments);
        if (success) {
            const updatedItem = {...commentingOnQuestion, comments: updatedComments };
            setAppData(prev => ({ ...prev, sources: prev.sources.map(s => s.id === updatedItem.source_id ? { ...s, questions: s.questions.map(q => q.id === updatedItem.id ? updatedItem : q) } : s) }));
            setCommentingOnQuestion(updatedItem);
        }
    };


    const handleSelectOption = async (option: string) => {
        if (isCompleted || wrongAnswers.has(option)) return;

        setSelectedOption(option);
        const isCorrect = option === currentQuestion.correctAnswer;
        const newWrongAnswers = new Set(wrongAnswers);
        
        if (isCorrect) {
            setIsCompleted(true);
        } else {
            newWrongAnswers.add(option);
            setWrongAnswers(newWrongAnswers);
            if (newWrongAnswers.size >= 3) {
                setIsCompleted(true);
            }
        }

        const wasAnsweredBefore = userAnswers.has(currentQuestion.id);
        if ((isCorrect || newWrongAnswers.size >= 3) && !wasAnsweredBefore) {
            const attempts = [...newWrongAnswers, option];
            const isCorrectFirstTry = attempts.length === 1 && isCorrect;
            const xpMap = [10, 5, 2, 0];
            const xpGained = isCorrect ? (xpMap[wrongAnswers.size] || 0) : 0;

            const answerPayload: Partial<UserQuestionAnswer> = {
                user_id: currentUser.id, notebook_id: notebookId, question_id: currentQuestion.id,
                attempts: attempts, is_correct_first_try: isCorrectFirstTry, xp_awarded: xpGained
            };
            const savedAnswer = await upsertUserQuestionAnswer(answerPayload);
            if (savedAnswer) {
                setAppData(prev => ({...prev, userQuestionAnswers: [...prev.userQuestionAnswers.filter(a => a.id !== savedAnswer.id), savedAnswer]}));
            }
            
            const newStats = { ...currentUser.stats };
            newStats.questionsAnswered = (newStats.questionsAnswered || 0) + 1;
            
            const currentStreak = currentUser.stats.streak || 0;
            newStats.streak = isCorrectFirstTry ? currentStreak + 1 : 0;

            if (isCorrectFirstTry) {
                newStats.correctAnswers = (newStats.correctAnswers || 0) + 1;
            }
            
            const topic = currentQuestion.source?.topic || 'Geral';
            if (!newStats.topicPerformance[topic]) newStats.topicPerformance[topic] = { correct: 0, total: 0 };
            newStats.topicPerformance[topic].total += 1;
            if (isCorrectFirstTry) newStats.topicPerformance[topic].correct += 1;
            
            const userWithNewStats = { ...currentUser, stats: newStats, xp: currentUser.xp + xpGained };
            const finalUser = checkAndAwardAchievements(userWithNewStats, appData);
            updateUser(finalUser);
        }
    };
    
    const navigateQuestion = (direction: 1 | -1) => {
        const newIndex = currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < questions.length) {
            setCurrentQuestionIndex(newIndex);
        }
    };
    
    const handleNextUnanswered = () => {
        let nextIndex = -1;
        for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
            if (!userAnswers.has(questions[i].id)) {
                nextIndex = i;
                break;
            }
        }
        
        if (nextIndex === -1) {
            for (let i = 0; i < currentQuestionIndex; i++) {
                if (!userAnswers.has(questions[i].id)) {
                    nextIndex = i;
                    break;
                }
            }
        }

        if (nextIndex !== -1) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            alert("Parabéns! Você respondeu todas as questões deste caderno.");
        }
    };
    
    if (!currentQuestion) {
        return (
            <div>
                <button onClick={onBack} className="mb-4 text-primary-light dark:text-primary-dark hover:underline">&larr; Voltar</button>
                <p>Nenhuma questão encontrada neste caderno ou as questões estão sendo carregadas.</p>
            </div>
        );
    }
    
    const revealedHints = currentQuestion.hints.slice(0, wrongAnswers.size);
    const showAllHints = isCompleted && selectedOption === currentQuestion.correctAnswer;
    
    return (
      <>
        <CommentsModal 
            isOpen={!!commentingOnQuestion} 
            onClose={() => setCommentingOnQuestion(null)} 
            comments={commentingOnQuestion?.comments || []} 
            onAddComment={(text) => handleCommentAction('add', {text})} 
            onVoteComment={(commentId, voteType) => handleCommentAction('vote', {commentId, voteType})} 
            contentTitle={commentingOnQuestion?.questionText?.substring(0, 50) + '...' || ''}
        />

        {isStatsModalOpen && (
            <NotebookStatsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                notebook={notebook}
                appData={appData}
                currentUser={currentUser}
                onClearAnswers={async () => {
                    if(window.confirm("Tem certeza que deseja limpar suas respostas para este caderno? Seu progresso será zerado.")) {
                        const success = await clearNotebookAnswers(currentUser.id, notebookId);
                        if (success) {
                            setAppData(prev => ({...prev, userQuestionAnswers: prev.userQuestionAnswers.filter(a => !(a.user_id === currentUser.id && a.notebook_id === notebookId)) }));
                            setIsStatsModalOpen(false);
                            setCurrentQuestionIndex(0);
                        } else {
                            alert("Não foi possível limpar as respostas.");
                        }
                    }
                }}
            />
        )}
        {isQuestionStatsModalOpen && (
             <QuestionStatsModal
                isOpen={isQuestionStatsModalOpen}
                onClose={() => setIsQuestionStatsModalOpen(false)}
                question={currentQuestion}
                appData={appData}
            />
        )}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-primary-light dark:text-primary-dark hover:underline">&larr; Voltar</button>
                    <button onClick={() => setIsStatsModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary-light text-white text-sm font-semibold rounded-md hover:bg-emerald-600 transition-colors shadow-sm">
                        <ChartBarSquareIcon className="w-5 h-5" />
                        Estatísticas do Caderno
                    </button>
                </div>
                <span className="font-semibold">{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            
            <FontSizeControl fontSize={fontSize} setFontSize={setFontSize} className="mb-4" />
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-primary-light h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <h2 className={`text-xl font-semibold mb-4 ${FONT_SIZE_CLASSES[fontSize]}`}>{currentQuestion?.questionText || 'Carregando enunciado...'}</h2>

            <div className={`space-y-3 ${FONT_SIZE_CLASSES[fontSize]}`}>
                {(currentQuestion?.options || []).map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isWrong = wrongAnswers.has(option);
                    const isCorrect = option === currentQuestion.correctAnswer;

                    let optionClass = "bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark";
                    let cursorClass = "cursor-pointer";

                    if (isCompleted) {
                        cursorClass = "cursor-default";
                        if (isCorrect) optionClass = "bg-green-100 dark:bg-green-900/50 border-green-500";
                        else if (isWrong && isSelected) optionClass = "bg-red-100 dark:bg-red-900/50 border-red-500";
                        else optionClass = "bg-background-light dark:bg-background-dark opacity-60";
                    } else {
                        if (isWrong) {
                             optionClass = "bg-red-100 dark:bg-red-900/50 border-red-500 opacity-60";
                             cursorClass = "cursor-not-allowed";
                        }
                        else if (isSelected) optionClass = "bg-primary-light/10 dark:bg-primary-dark/20 border-primary-light dark:border-primary-dark";
                    }

                    return (
                        <div key={index} onClick={() => handleSelectOption(option)}
                             className={`p-4 border rounded-lg transition-colors ${optionClass} ${cursorClass}`}>
                             <span>{option}</span>
                        </div>
                    );
                })}
            </div>

            {isCompleted && (
                <div className="mt-6 p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                    <h3 className={`text-lg font-bold ${selectedOption === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedOption === currentQuestion.correctAnswer ? "Resposta Correta!" : "Você errou 3 vezes!"}
                    </h3>
                    <p className="mt-2">{currentQuestion.explanation}</p>
                </div>
            )}
            
             <ContentActions
                item={currentQuestion} contentType='question' currentUser={currentUser} interactions={appData.userContentInteractions}
                onVote={(id, type, inc) => handleVoteUpdate(setAppData, currentUser, updateUser, appData, 'question', id, type, inc)}
                onToggleRead={(id, state) => handleInteractionUpdate(setAppData, appData, currentUser, updateUser, 'question', id, { is_read: !state })}
                onToggleFavorite={(id, state) => handleInteractionUpdate(setAppData, appData, currentUser, updateUser, 'question', id, { is_favorite: !state })}
                onComment={() => setCommentingOnQuestion(currentQuestion)}
                extraActions={
                    <button onClick={() => setIsQuestionStatsModalOpen(true)} className="text-gray-500 hover:text-primary-light flex items-center gap-1" title="Ver estatísticas da questão">
                        <MagnifyingGlassIcon className="w-5 h-5"/>
                    </button>
                }
            />

            <div className="mt-6 flex justify-between items-center">
                 <div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigateQuestion(-1)} disabled={currentQuestionIndex === 0} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Anterior</button>
                        <button onClick={() => navigateQuestion(1)} disabled={currentQuestionIndex === questions.length - 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Próxima</button>
                    </div>
                    <div className="mt-2">
                        <button onClick={handleNextUnanswered} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                            Próxima não respondida
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <LightBulbIcon className="w-5 h-5" /> Dicas ({showAllHints ? currentQuestion.hints.length : revealedHints.length}/{currentQuestion.hints.length})
                    </span>
                </div>

                {isCompleted ? (
                    <button onClick={() => navigateQuestion(1)} className="px-6 py-2 bg-primary-light text-white font-bold rounded-md hover:bg-indigo-700 disabled:opacity-50" disabled={currentQuestionIndex === questions.length - 1}>
                        Próxima Questão
                    </button>
                ) : (
                    <button disabled={!selectedOption || wrongAnswers.has(selectedOption)} onClick={() => handleSelectOption(selectedOption!)} className="px-6 py-2 bg-secondary-light text-white font-bold rounded-md hover:bg-emerald-600 disabled:opacity-50">
                        Confirmar
                    </button>
                )}
            </div>

            {(revealedHints.length > 0 || showAllHints) && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                        {(showAllHints ? currentQuestion.hints : revealedHints).map((hint, i) => <li key={i}>{hint}</li>)}
                    </ul>
                </div>
            )}
        </div>
      </>
    );
};