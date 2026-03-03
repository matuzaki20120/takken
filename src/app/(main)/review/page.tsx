'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProgressStore } from '@/lib/stores/progress';
import ReviewClient from './ReviewClient';
import type { Question } from '@/types/database';

export default function ReviewPage() {
  const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const answers = useProgressStore((s) => s.answers);
  const hasHydrated = useProgressStore((s) => s._hasHydrated);

  // Derive incorrect IDs from answers with useMemo to avoid infinite loop
  const incorrectIds = useMemo(() => {
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
  }, [answers]);

  useEffect(() => {
    if (!hasHydrated) return;
    loadIncorrectQuestions();
  }, [hasHydrated, incorrectIds.length]);

  const loadIncorrectQuestions = async () => {
    if (incorrectIds.length === 0) {
      setIncorrectQuestions([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('questions')
      .select('*, subject:subjects(*), topic:topics(*)')
      .in('id', incorrectIds);

    setIncorrectQuestions(data ?? []);
    setLoading(false);
  };

  // Build question stats from store
  const questionStats: Record<string, { total: number; correct: number }> = {};
  answers.forEach((a) => {
    if (!questionStats[a.questionId]) questionStats[a.questionId] = { total: 0, correct: 0 };
    questionStats[a.questionId].total++;
    if (a.isCorrect) questionStats[a.questionId].correct++;
  });

  if (!hasHydrated || loading) {
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
