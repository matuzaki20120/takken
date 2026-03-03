'use client';

import { useState } from 'react';
import { useProgressStore } from '@/lib/stores/progress';
import QuestionCard from '@/components/question/QuestionCard';
import { getSubjectColor } from '@/lib/utils/subjects';
import type { Question } from '@/types/database';

type Tab = 'incorrect' | 'bookmarks';

interface Props {
  incorrectQuestions: Question[];
  questionStats: Record<string, { total: number; correct: number }>;
}

export default function ReviewClient({ incorrectQuestions, questionStats }: Props) {
  const [tab, setTab] = useState<Tab>('incorrect');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ correct: 0, total: 0 });
  const addAnswer = useProgressStore((s) => s.addAnswer);
  const bookmarks = useProgressStore((s) => s.bookmarks);

  // For bookmarks tab, we don't have question data loaded yet
  // Just show the incorrect questions tab for now
  const questions = incorrectQuestions;

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
      mode: 'review',
      topicId: q.topic_id,
      subjectId: q.subject_id,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPracticeMode(false);
    }
  };

  if (practiceMode && questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setPracticeMode(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(results.total / questions.length) * 100}%` }}
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">復習</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab('incorrect')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'incorrect' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
          }`}
        >
          間違えた問題 ({incorrectQuestions.length})
        </button>
        <button
          onClick={() => setTab('bookmarks')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'bookmarks' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
          }`}
        >
          ブックマーク ({bookmarks.length})
        </button>
      </div>

      {tab === 'incorrect' ? (
        incorrectQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-gray-500">
              まだ間違えた問題はありません。問題演習を始めましょう！
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={() => { setPracticeMode(true); setCurrentIndex(0); setResults({ correct: 0, total: 0 }); }}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors mb-6"
            >
              間違えた問題を練習 ({incorrectQuestions.length}問)
            </button>

            <div className="space-y-2">
              {incorrectQuestions.map((q) => {
                const color = q.subject ? getSubjectColor(q.subject.name) : null;
                const stats = questionStats[q.id];
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-lg border border-border p-4 flex items-center gap-3"
                  >
                    {color && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text} flex-shrink-0`}>
                        {q.subject?.name}
                      </span>
                    )}
                    <p className="text-sm text-gray-700 flex-1 line-clamp-1">
                      {q.year}年 問{q.question_number}: {q.question_text}
                    </p>
                    {stats && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {stats.correct}/{stats.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : (
        bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="text-4xl mb-3">☆</div>
            <p className="text-gray-500">
              ブックマークした問題はありません。
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => (
              <div
                key={b.questionId}
                className="bg-white rounded-lg border border-border p-4 flex items-center gap-3"
              >
                <span className="text-warning">★</span>
                <p className="text-sm text-gray-700 flex-1">
                  {b.questionId}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(b.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
