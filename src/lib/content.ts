import React from 'react';
import { AppData, User, ContentType } from '../types';
import { upsertUserContentInteraction, incrementContentVote, updateUser as supabaseUpdateUser } from '../services/supabaseClient';
import { generateSpecificContent } from '../services/geminiService';
import { checkAndAwardAchievements } from './achievements';

export const handleInteractionUpdate = async (
    setAppData: React.Dispatch<React.SetStateAction<AppData>>,
    appData: AppData,
    currentUser: User,
    updateUser: (user: User) => void,
    contentType: ContentType,
    contentId: string,
    update: { is_read?: boolean; is_favorite?: boolean }
) => {
    const existingIndex = appData.userContentInteractions.findIndex(
        i => i.user_id === currentUser.id && i.content_id === contentId && i.content_type === contentType
    );

    let newInteraction;
    let newInteractions = [...appData.userContentInteractions];

    if (existingIndex > -1) {
        newInteraction = { ...newInteractions[existingIndex], ...update };
        newInteractions[existingIndex] = newInteraction;
    } else {
        newInteraction = {
            id: `temp_${Date.now()}`,
            user_id: currentUser.id,
            content_id: contentId,
            content_type: contentType,
            is_read: false,
            is_favorite: false,
            hot_votes: 0,
            cold_votes: 0,
            ...update,
        };
        newInteractions.push(newInteraction);
    }
    
    setAppData(prev => ({ ...prev, userContentInteractions: newInteractions }));
    
    // XP gain on first read, but not on un-read
    if (update.is_read === true) {
        let xpGained = 0;
        if (contentType === 'summary') xpGained = 5;
        if (contentType === 'flashcard') xpGained = 1;
        if (contentType === 'mind_map') xpGained = 3;
        if (xpGained > 0) {
            const userWithNewStats = { ...currentUser, xp: currentUser.xp + xpGained };
            const finalUser = checkAndAwardAchievements(userWithNewStats, { ...appData, userContentInteractions: newInteractions });
            updateUser(finalUser);
        }
    }


    const result = await upsertUserContentInteraction(newInteraction);
    if (!result) {
        // Revert on failure
        setAppData(appData);
        console.error("Failed to update interaction in DB.");
    }
};

export const handleVoteUpdate = async (
    setAppData: React.Dispatch<React.SetStateAction<AppData>>,
    currentUser: User,
    updateUser: (user: User) => void,
    appData: AppData,
    contentType: 'summary' | 'flashcard' | 'question' | 'mind_map' | 'audio_summary' | 'case_study' | 'cronograma',
    contentId: string,
    voteType: 'hot' | 'cold',
    increment: 1 | -1
) => {
    const interaction = appData.userContentInteractions.find(i => i.user_id === currentUser.id && i.content_id === contentId && i.content_type === contentType);
    const currentVoteCount = (voteType === 'hot' ? interaction?.hot_votes : interaction?.cold_votes) || 0;
    if (increment === -1 && currentVoteCount <= 0) return;

    handleInteractionUpdate(setAppData, appData, currentUser, updateUser, contentType, contentId, { [`${voteType}_votes`]: currentVoteCount + increment });
    
    const tableMap = { summary: 'summaries', flashcard: 'flashcards', question: 'questions', mind_map: 'mind_maps', audio_summary: 'audio_summaries', case_study: 'case_studies' };
    const tableKey = contentType as keyof typeof tableMap;

    setAppData(prev => {
        const newSources = prev.sources.map(s => {
            if (s[tableKey] && s[tableKey].some((item: any) => item.id === contentId)) {
                return {
                    ...s,
                    [tableKey]: s[tableKey].map((item: any) => 
                        item.id === contentId ? { ...item, [`${voteType}_votes`]: item[`${voteType}_votes`] + increment } : item
                    )
                };
            }
            return s;
        });
        if (contentType === 'case_study' || contentType === 'cronograma') {
            const contentKey = contentType === 'case_study' ? 'caseStudies' : 'scheduleEvents';
            return {
                ...prev,
                sources: newSources,
                [contentKey]: prev[contentKey].map((item: any) => 
                    item.id === contentId ? { ...item, [`${voteType}_votes`]: item[`${voteType}_votes`] + increment } : item
                )
            };
        }
        return { ...prev, sources: newSources };
    });

    await incrementContentVote(contentType, contentId, `${voteType}_votes`, increment);
    
    const contentItem = appData.sources.flatMap(s => (s as any)[tableKey] || []).find((item: any) => item.id === contentId);
    const authorId = contentItem?.source?.user_id || contentItem?.user_id;

    if (authorId && authorId !== currentUser.id) {
        const author = appData.users.find(u => u.id === authorId);
        if (author) {
            const xpChange = (voteType === 'hot' ? 1 : -1) * increment;
            const updatedAuthor = { ...author, xp: author.xp + xpChange };
            const result = await supabaseUpdateUser(updatedAuthor);
            if (result) {
                setAppData(prev => ({ ...prev, users: prev.users.map(u => u.id === result.id ? result : u) }));
            }
        }
    }
};

export const handleGenerateNewContent = async (
    setAppData: React.Dispatch<React.SetStateAction<AppData>>,
    appData: AppData,
    setIsGenerating: (isGenerating: boolean) => void,
    onClose: () => void,
    contentType: 'summaries' | 'flashcards' | 'questions',
    sourceIds: string[],
    prompt: string
) => {
    setIsGenerating(true);
    try {
        const sourcesToUse = sourceIds.length > 0
            ? appData.sources.filter(s => sourceIds.includes(s.id))
            : appData.sources;
        
        if (sourcesToUse.length === 0) throw new Error("Nenhuma fonte selecionada ou disponível.");

        // For simplicity, we'll combine the summary of the first 5 selected sources as context
        const contextText = sourcesToUse.slice(0, 5).map(s => `Fonte: ${s.title}\n${s.summary}`).join('\n\n');
        
        const newContent = await generateSpecificContent(contentType, contextText, prompt);

        if (newContent.error) throw new Error(newContent.error);
        if (newContent.length === 0) throw new Error("A IA não conseguiu gerar novo conteúdo com o prompt fornecido.");
        
        // Logic to add the new content (this part is complex and needs backend integration)
        // For now, we just log it and close the modal
        console.log("Generated Content:", newContent);
        alert(`${newContent.length} novo(s) item(ns) de ${contentType} gerado(s) com sucesso! (Simulado)`);

        onClose();
    } catch (error: any) {
        alert(`Erro ao gerar conteúdo: ${error.message}`);
    } finally {
        setIsGenerating(false);
    }
};