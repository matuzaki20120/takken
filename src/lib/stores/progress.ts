import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  answeredAt: string;
  mode: 'practice' | 'exam' | 'review' | 'quiz' | 'study';
  topicId: number | null;
  subjectId: number;
}

export interface LocalBookmark {
  questionId: string;
  note: string;
  createdAt: string;
}

export interface StudiedTopic {
  topicId: number;
  completedAt: string;
}

interface SubjectStats {
  total: number;
  correct: number;
  rate: number;
}

interface ProgressState {
  answers: LocalAnswer[];
  bookmarks: LocalBookmark[];
  studiedTopics: StudiedTopic[];
  _hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  addAnswer: (answer: Omit<LocalAnswer, 'answeredAt'>) => void;
  addBookmark: (questionId: string, note?: string) => void;
  removeBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  markTopicStudied: (topicId: number) => void;
  isTopicStudied: (topicId: number) => boolean;

  getSubjectStats: (subjectId: number) => SubjectStats;
  getTopicStats: (topicId: number) => SubjectStats;
  getIncorrectQuestionIds: () => string[];
  getTodayCount: () => number;
  getLast7Days: () => { date: string; label: string; count: number; weekday: string }[];
  getStudiedTopicCount: () => number;
  getWeakTopics: (threshold?: number) => { topicId: number; rate: number; total: number }[];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      answers: [],
      bookmarks: [],
      studiedTopics: [],
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addAnswer: (answer) =>
        set((state) => ({
          answers: [
            ...state.answers,
            { ...answer, answeredAt: new Date().toISOString() },
          ],
        })),

      addBookmark: (questionId, note = '') =>
        set((state) => {
          if (state.bookmarks.some((b) => b.questionId === questionId)) return state;
          return {
            bookmarks: [
              ...state.bookmarks,
              { questionId, note, createdAt: new Date().toISOString() },
            ],
          };
        }),

      removeBookmark: (questionId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.questionId !== questionId),
        })),

      isBookmarked: (questionId) =>
        get().bookmarks.some((b) => b.questionId === questionId),

      markTopicStudied: (topicId) =>
        set((state) => {
          if (state.studiedTopics.some((t) => t.topicId === topicId)) return state;
          return {
            studiedTopics: [
              ...state.studiedTopics,
              { topicId, completedAt: new Date().toISOString() },
            ],
          };
        }),

      isTopicStudied: (topicId) =>
        get().studiedTopics.some((t) => t.topicId === topicId),

      getSubjectStats: (subjectId) => {
        const subjectAnswers = get().answers.filter((a) => a.subjectId === subjectId);
        const total = subjectAnswers.length;
        const correct = subjectAnswers.filter((a) => a.isCorrect).length;
        return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 };
      },

      getTopicStats: (topicId) => {
        const topicAnswers = get().answers.filter((a) => a.topicId === topicId);
        const total = topicAnswers.length;
        const correct = topicAnswers.filter((a) => a.isCorrect).length;
        return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 };
      },

      getIncorrectQuestionIds: () => {
        const answers = get().answers;
        const statsMap = new Map<string, { total: number; correct: number }>();
        answers.forEach((a) => {
          const s = statsMap.get(a.questionId) ?? { total: 0, correct: 0 };
          s.total++;
          if (a.isCorrect) s.correct++;
          statsMap.set(a.questionId, s);
        });
        return Array.from(statsMap.entries())
          .filter(([, s]) => s.correct < s.total)
          .map(([id]) => id);
      },

      getTodayCount: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().answers.filter((a) => a.answeredAt.split('T')[0] === todayStr).length;
      },

      getLast7Days: () => {
        const answers = get().answers;
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const count = answers.filter((a) => a.answeredAt.split('T')[0] === dateStr).length;
          return {
            date: dateStr,
            label: `${date.getMonth() + 1}/${date.getDate()}`,
            count,
            weekday: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
          };
        });
      },

      getStudiedTopicCount: () => get().studiedTopics.length,

      getWeakTopics: (threshold = 60) => {
        const answers = get().answers;
        const topicMap = new Map<number, { total: number; correct: number }>();
        answers.forEach((a) => {
          if (a.topicId === null) return;
          const s = topicMap.get(a.topicId) ?? { total: 0, correct: 0 };
          s.total++;
          if (a.isCorrect) s.correct++;
          topicMap.set(a.topicId, s);
        });
        return Array.from(topicMap.entries())
          .map(([topicId, s]) => ({
            topicId,
            rate: Math.round((s.correct / s.total) * 100),
            total: s.total,
          }))
          .filter((t) => t.rate < threshold)
          .sort((a, b) => a.rate - b.rate);
      },
    }),
    {
      name: 'takken-progress',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
