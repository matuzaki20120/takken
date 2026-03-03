'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProgressStore } from '@/lib/stores/progress';
import { getSubjectColor } from '@/lib/utils/subjects';
import StudyContent from '@/components/study/StudyContent';
import QuestionCard from '@/components/question/QuestionCard';
import type { Subject, Topic, Question, TopicStudyContent } from '@/types/database';

interface Props {
  subject: Subject;
  topic: Topic;
  content: TopicStudyContent | null;
  questions: Question[];
}

export default function StudyTopicClient({ subject, topic, content, questions }: Props) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ correct: 0, total: 0 });
  const markTopicStudied = useProgressStore((s) => s.markTopicStudied);
  const studiedTopics = useProgressStore((s) => s.studiedTopics);
  const addAnswer = useProgressStore((s) => s.addAnswer);
  const hasHydrated = useProgressStore((s) => s._hasHydrated);

  const studied = hasHydrated && studiedTopics.some((t) => t.topicId === topic.id);
  const color = getSubjectColor(subject.name);

  const handleMarkStudied = () => {
    markTopicStudied(topic.id);
  };

  const handleAnswer = (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    setResults((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    addAnswer({
      questionId,
      selectedAnswer,
      isCorrect,
      mode: 'study',
      topicId: topic.id,
      subjectId: subject.id,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question answered and user clicked "next" -> show results
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentIndex(0);
    setResults({ correct: 0, total: 0 });
  };

  // Quiz results screen
  if (quizFinished) {
    const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
          <div className="text-5xl mb-4">{percentage >= 70 ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold mb-2">確認テスト完了！</h2>
          <p className="text-4xl font-bold text-primary mb-2">
            {results.correct} / {results.total}
          </p>
          <p className="text-gray-500 mb-6">正答率 {percentage}%</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="px-6 py-2.5 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              教科書に戻る
            </button>
            <button
              onClick={() => { setQuizFinished(false); setCurrentIndex(0); setResults({ correct: 0, total: 0 }); }}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              もう一度
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  if (quizStarted && questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={resetQuiz}
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

  // Main study view
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/study/${subject.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← {subject.name}に戻る
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{topic.name}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
          {subject.name}
        </span>
      </div>

      {/* Study content (textbook) */}
      {content ? (
        <StudyContent content={content} />
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 text-center mb-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500">
            この分野の教科書コンテンツは準備中です。
          </p>
          <p className="text-gray-400 text-sm mt-1">
            下の確認テストで問題を解くことはできます。
          </p>
        </div>
      )}

      {/* Mark as studied button */}
      <div className="mb-8">
        {studied ? (
          <div className="flex items-center gap-2 text-correct bg-correct/5 border border-correct/20 rounded-lg px-4 py-3">
            <span className="text-xl">✓</span>
            <span className="font-medium">学習完了済み</span>
          </div>
        ) : (
          <button
            onClick={handleMarkStudied}
            className="w-full bg-correct text-white py-3 rounded-lg font-medium hover:bg-correct/90 transition-colors"
          >
            ✓ 学習完了にする
          </button>
        )}
      </div>

      {/* Confirmation quiz section */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-gray-700 mb-2">確認テスト</h2>
        <p className="text-sm text-gray-500 mb-4">
          この分野の問題で理解度を確認しましょう（{questions.length}問）
        </p>

        {questions.length > 0 ? (
          <button
            onClick={() => { setQuizStarted(true); setQuizFinished(false); setCurrentIndex(0); setResults({ correct: 0, total: 0 }); }}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            確認テストを始める
          </button>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            この分野にはまだ問題が登録されていません。
          </p>
        )}
      </div>
    </div>
  );
}
