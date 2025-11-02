import React from 'react';
import { AppData, View, ScheduleEvent } from './types';
import { BookOpenIcon, SparklesIcon, QuestionMarkCircleIcon, ShareIcon, UserCircleIcon, ShieldCheckIcon, CloudArrowUpIcon, UsersIcon, SpeakerWaveIcon, DocumentTextIcon, CalendarDaysIcon } from './components/Icons';

export const VIEWS: View[] = [
    { name: 'Comunidade', icon: UsersIcon},
    { name: 'Fontes', icon: CloudArrowUpIcon },
    { name: 'Resumos', icon: BookOpenIcon },
    { name: 'Flashcards', icon: SparklesIcon },
    { name: 'Questões', icon: QuestionMarkCircleIcon },
    { name: 'Estudo de Caso', icon: DocumentTextIcon },
    { name: 'Cronograma', icon: CalendarDaysIcon },
    { name: 'Mapas Mentais', icon: ShareIcon },
    { name: 'Mídia', icon: SpeakerWaveIcon },
    { name: 'Perfil', icon: UserCircleIcon },
    { name: 'Admin', icon: ShieldCheckIcon, adminOnly: true },
];

export const PROCAP_SCHEDULE_DATA: ScheduleEvent[] = [
  // Semana 1: 03/11/2025 a 08/11/2025 (Baseado na Semana 1 da imagem)
  { id: '1a', date: '2025-11-03', startTime: '08:00', endTime: '12:00', title: 'Orientações e Integração On-line com a comissão', type: 'orientacao', color: 'bg-yellow-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '1b', date: '2025-11-03', startTime: '14:00', endTime: '18:00', title: 'Gestão, Organização e Pessoas no Banco Central do Brasil', professor: 'Profa: Barbara Lis Silveira', type: 'aula', color: 'bg-cyan-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '2a', date: '2025-11-04', startTime: '08:00', endTime: '12:00', title: 'Gestão, Organização e Pessoas no Banco Central do Brasil', professor: 'Profa: Barbara Lis Silveira', type: 'aula', color: 'bg-cyan-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '2b', date: '2025-11-04', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '3a', date: '2025-11-05', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '3b', date: '2025-11-05', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '4a', date: '2025-11-06', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '4b', date: '2025-11-06', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '5a', date: '2025-11-07', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '5b', date: '2025-11-07', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '6a', date: '2025-11-08', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Francisco Fernando Viana Ferreira', details: '*Aula Assíncrona', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '6b', date: '2025-11-08', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Francisco Fernando Viana Ferreira', details: '*Aula Assíncrona', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  
  // Semana 2: 10/11/2025 a 15/11/2025 (Baseado na Semana 2 da imagem)
  { id: '7a', date: '2025-11-10', startTime: '08:00', endTime: '12:00', title: 'Segurança Cibernética', professor: 'Prof: Carlos Eduardo Gomes Marins, Prof: Marcos José Candido Euzebio', type: 'aula', color: 'bg-lime-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '7b', date: '2025-11-10', startTime: '14:00', endTime: '18:00', title: 'Segurança Cibernética', professor: 'Prof: Carlos Eduardo Gomes Marins, Prof: Marcos José Candido Euzebio', type: 'aula', color: 'bg-lime-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '8a', date: '2025-11-11', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '8b', date: '2025-11-11', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '9a', date: '2025-11-12', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '9b', date: '2025-11-12', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '10a', date: '2025-11-13', startTime: '08:00', endTime: '12:00', title: 'Segurança da Informação no Banco Central', professor: 'Prof: Fabio dos Santos Fonseca', type: 'aula', color: 'bg-green-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '10b', date: '2025-11-13', startTime: '14:00', endTime: '18:00', title: 'Segurança Institucional', professor: 'Prof: Fabio dos Santos Fonseca', type: 'aula', color: 'bg-teal-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '11a', date: '2025-11-14', startTime: '08:00', endTime: '12:00', title: 'Educação Financeira', professor: 'Prof: Fábio de Almeida Lopes Araujo', type: 'aula', color: 'bg-pink-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '11b', date: '2025-11-14', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Cesar de Oliveira Frade', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '12a', date: '2025-11-15', startTime: '08:00', endTime: '12:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Francisco Fernando Viana Ferreira', details: '*Aula Assíncrona', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '12b', date: '2025-11-15', startTime: '14:00', endTime: '18:00', title: 'Sistema Financeiro Nacional, Banco Central do Brasil e Bancos Centrais', professor: 'Prof: Francisco Fernando Viana Ferreira', details: '*Aula Assíncrona', type: 'aula', color: 'bg-rose-400', hot_votes: 0, cold_votes: 0, comments: [] },

  // Semana 3: 17/11/2025 a 22/11/2025 (Baseado na Semana 3 da imagem + Prova)
  { id: '13a', date: '2025-11-17', startTime: '08:00', endTime: '12:00', title: 'Educação Financeira', professor: 'Prof: Fábio de Almeida Lopes Araujo', type: 'aula', color: 'bg-pink-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '13b', date: '2025-11-17', startTime: '14:00', endTime: '18:00', title: 'Educação Financeira', professor: 'Prof: Fábio de Almeida Lopes Araujo', type: 'aula', color: 'bg-pink-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '14a', date: '2025-11-18', startTime: '08:00', endTime: '12:00', title: 'Educação Financeira', professor: 'Prof: Fábio de Almeida Lopes Araujo', type: 'aula', color: 'bg-pink-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '14b', date: '2025-11-18', startTime: '14:00', endTime: '18:00', title: 'Educação Financeira', professor: 'Prof: Fábio de Almeida Lopes Araujo', type: 'aula', color: 'bg-pink-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '15a', date: '2025-11-19', startTime: '08:00', endTime: '12:00', title: 'Educação Financeira', professor: 'Prof: Fábio de Almeida Lopes Araujo', type: 'aula', color: 'bg-pink-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '15b', date: '2025-11-19', startTime: '14:00', endTime: '18:00', title: 'VAGO - Deslocamento dos candidatos/alunos', type: 'seminario', color: 'bg-gray-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '16a', date: '2025-11-20', startTime: '08:00', endTime: '12:00', title: 'VAGO - Deslocamento dos candidatos/alunos', type: 'seminario', color: 'bg-gray-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '16b', date: '2025-11-20', startTime: '14:00', endTime: '18:00', title: 'VAGO - Deslocamento dos candidatos/alunos', type: 'seminario', color: 'bg-gray-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '17a', date: '2025-11-21', startTime: '08:00', endTime: '12:00', title: 'VAGO - Deslocamento dos candidatos/alunos', type: 'seminario', color: 'bg-gray-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '17b', date: '2025-11-21', startTime: '14:00', endTime: '18:00', title: 'VAGO - Deslocamento dos candidatos/alunos', type: 'seminario', color: 'bg-gray-400', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '18a', date: '2025-11-22', startTime: '08:00', endTime: '12:00', title: 'PROVA OBJETIVA DO PROCAP', type: 'prova', color: 'bg-green-600', hot_votes: 0, cold_votes: 0, comments: [] },
  { id: '18b', date: '2025-11-22', startTime: '14:00', endTime: '18:00', title: 'PROVA OBJETIVA DO PROCAP', type: 'prova', color: 'bg-green-600', hot_votes: 0, cold_votes: 0, comments: [] },
];


export const INITIAL_APP_DATA: AppData = {
  users: [],
  sources: [],
  chatMessages: [],
  questionNotebooks: [],
  caseStudies: [],
  scheduleEvents: [],
  userMessageVotes: [],
  userSourceVotes: [],
  userContentInteractions: [],
  userNotebookInteractions: [],
  userQuestionAnswers: [],
  userCaseStudyInteractions: [],
};

export const ACHIEVEMENTS = {
  FLASHCARDS_FLIPPED: [
    { count: 10, title: "Aprendiz de Flashcards" },
    { count: 25, title: "Praticante de Flashcards" },
    { count: 50, title: "Adepto de Flashcards" },
    { count: 100, title: "Mestre de Flashcards" },
    { count: 150, title: "Sábio de Flashcards" },
    { count: 200, title: "Lenda dos Flashcards" },
  ],
  QUESTIONS_CORRECT: [
    { count: 10, title: "Primeiros Passos" },
    { count: 25, title: "Estudante Dedicado" },
    { count: 50, title: "Conhecedor" },
    { count: 100, title: "Especialista" },
    { count: 200, title: "Mestre das Questões" },
    { count: 300, title: "Doutrinador" },
    { count: 400, title: "Sábio das Questões" },
    { count: 500, title: "Oráculo" },
  ],
  STREAK: [
    { count: 5, title: "Embalado!" },
    { count: 10, title: "Imparável!" },
    { count: 15, title: "Invencível!" },
    { count: 20, title: "Dominante!" },
    { count: 25, title: "Lendário!" },
    { count: 50, title: "Divino!" },
  ],
  SUMMARIES_READ: [
    { count: 3, title: "Leitor Iniciante" },
    { count: 5, title: "Leitor Atento" },
    { count: 7, title: "Leitor Voraz" },
    { count: 10, title: "Devorador de Livros" },
    { count: 20, title: "Bibliotecário" },
    { count: 30, title: "Arquivista" },
    { count: 50, title: "Historiador" },
  ],
  MIND_MAPS_READ: [
    { count: 3, title: "Visualizador Curioso" },
    { count: 5, title: "Explorador Visual" },
    { count: 7, title: "Cartógrafo do Saber" },
    { count: 10, title: "Mapeador de Ideias" },
    { count: 20, title: "Estrategista Visual" },
    { count: 30, title: "Mestre dos Mapas" },
    { count: 50, title: "Iluminado" },
  ],
};