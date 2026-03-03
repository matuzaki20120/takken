'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProgressStore } from '@/lib/stores/progress';
import QuestionCard from '@/components/question/QuestionCard';
import { getSubjectColor } from '@/lib/utils/subjects';
import type { Subject, Topic, Question } from '@/types/database';

interface Props {
  subjects: Subject[];
  topics: Topic[];
  years: number[];
}

type FilterState = {
  subjectId: number | null;
  topicId: number | null;
  year: number | null;
};

export default function PracticeClient({ subjects, topics, years }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    subjectId: null,
    topicId: null,
    year: null,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const supabase = createClient();
  const addAnswer = useProgressStore((s) => s.addAnswer);

  const filteredTopics = filters.subjectId
    ? topics.filter((t) => t.subject_id === filters.subjectId)
    : [];

  const startPractice = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('questions')
      .select('*, subject:subjects(*), topic:topics(*)')
      .order('question_number');

    if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
    if (filters.topicId) query = query.eq('topic_id', filters.topicId);
    if (filters.year) query = query.eq('year', filters.year);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setQuestions(data ?? []);
    setCurrentIndex(0);
    setResults({ correct: 0, total: 0 });
    setStarted(true);
    setLoading(false);
  }, [filters, supabase]);

  const handleAnswer = (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    setResults((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    const q = questions[currentIndex];
    addAnswer({
      questionId,
      selectedAnswer,
      isCorrect,
      mode: 'practice',
      topicId: q.topic_id,
      subjectId: q.subject_id,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Finished state
  const isFinished = started && results.total === questions.length && questions.length > 0;

  if (isFinished) {
    const percentage = Math.round((results.correct / results.total) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
          <div className="text-5xl mb-4">{percentage >= 70 ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold mb-2">演習完了！</h2>
          <p className="text-4xl font-bold text-primary mb-2">
            {results.correct} / {results.total}
          </p>
          <p className="text-gray-500 mb-6">正答率 {percentage}%</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStarted(false); setResults({ correct: 0, total: 0 }); }}
              className="px-6 py-2.5 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              条件を変えて再挑戦
            </button>
            <button
              onClick={() => { setCurrentIndex(0); setResults({ correct: 0, total: 0 }); }}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              もう一度
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (started && questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => { setStarted(false); setResults({ correct: 0, total: 0 }); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 tabular-nums">
            {results.correct}正解 / {results.total}問
          </span>
        </div>

        <QuestionCard
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  // Filter selection view
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">問題演習</h1>

      {/* Subject filter */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">科目で絞り込み</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setFilters({ subjectId: null, topicId: null, year: filters.year })}
            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              filters.subjectId === null
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            すべて
          </button>
          {subjects.map((s) => {
            const color = getSubjectColor(s.name);
            const isActive = filters.subjectId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFilters({ subjectId: s.id, topicId: null, year: filters.year })}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  isActive
                    ? `${color.border} ${color.bg} ${color.text}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic filter */}
      {filteredTopics.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">分野で絞り込み</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ ...filters, topicId: null })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.topicId === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {filteredTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilters({ ...filters, topicId: t.id })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.topicId === t.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Year filter */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-3">年度で絞り込み</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ ...filters, year: null })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.year === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setFilters({ ...filters, year: y })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.year === y
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {y}年
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={startPractice}
        disabled={loading}
        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? '読み込み中...' : '演習を開始する'}
      </button>
    </div>
  );
}
