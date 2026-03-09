'use client';

import { useMemo } from 'react';
import { useProgressStore } from '@/lib/stores/progress';
import { getQuestionById } from '@/lib/data/questions';
import ReviewClient from './ReviewClient';
import type { Question } from '@/types/database';

export default function ReviewPage() {
  const answers = useProgressStore((s) => s.answers);
  const hasHydrated = useProgressStore((s) => s._hasHydrated);

  const { incorrectQuestions, questionStats } = useMemo(() => {
    const statsMap: Record<string, { total: number; correct: number }> = {};
    answers.forEach((a) => {
      if (!statsMap[a.questionId]) statsMap[a.questionId] = { total: 0, correct: 0 };
      statsMap[a.questionId].total++;
      if (a.isCorrect) statsMap[a.questionId].correct++;
    });

    const incorrectIds = Object.entries(statsMap)
      .filter(([, s]) => s.correct < s.total)
      .map(([id]) => id);

    const questions = incorrectIds
      .map((id) => getQuestionById(id))
      .filter((q): q is Question => q !== undefined);

    return { incorrectQuestions: questions, questionStats: statsMap };
  }, [answers]);

  if (!hasHydrated) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <ReviewClient
      incorrectQuestions={incorrectQuestions}
      questionStats={questionStats}
    />
  );
}
