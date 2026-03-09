'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useProgressStore } from '@/lib/stores/progress';
import { ALL_QUESTIONS } from '@/lib/data/questions';
import QuestionCard from '@/components/question/QuestionCard';
import type { Question } from '@/types/database';

const EXAM_DURATION = 2 * 60 * 60; // 2 hours in seconds
const EXAM_QUESTIONS = 50;

export default function ExamPage() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, { selected: number; correct: boolean }>>(new Map());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const addAnswer = useProgressStore((s) => s.addAnswer);

  const finishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
  }, []);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [started, finished, finishExam]);

  const startExam = () => {
    const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, EXAM_QUESTIONS);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers(new Map());
    setTimeLeft(EXAM_DURATION);
    setFinished(false);
    setStarted(true);
  };

  const handleAnswer = (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    setAnswers((prev) => new Map(prev).set(questionId, { selected: selectedAnswer, correct: isCorrect }));

    const q = questions[currentIndex];
    addAnswer({
      questionId,
      selectedAnswer,
      isCorrect,
      mode: 'exam',
      topicId: q.topic_id,
      subjectId: q.subject_id,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishExam();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Results screen
  if (finished) {
    const correctCount = Array.from(answers.values()).filter((a) => a.correct).length;
    const totalAnswered = answers.size;
    const score = correctCount;
    const passing = score >= 35;
    const elapsed = EXAM_DURATION - timeLeft;

    const subjectResults: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      const name = q.subject?.name ?? '不明';
      if (!subjectResults[name]) subjectResults[name] = { correct: 0, total: 0 };
      subjectResults[name].total++;
      const answer = answers.get(q.id);
      if (answer?.correct) subjectResults[name].correct++;
    });

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
          <div className="text-5xl mb-4">{passing ? '🎊' : '📚'}</div>
          <h2 className="text-2xl font-bold mb-1">模擬試験結果</h2>
          <p className={`text-5xl font-bold mb-2 ${passing ? 'text-correct' : 'text-incorrect'}`}>
            {score} / {questions.length}
          </p>
          <p className={`text-lg font-medium mb-4 ${passing ? 'text-correct' : 'text-incorrect'}`}>
            {passing ? '合格ライン達成！' : '合格ラインまであと少し'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            回答: {totalAnswered}問 / 所要時間: {formatTime(elapsed)}
          </p>

          <div className="text-left bg-surface rounded-lg p-4 mb-6">
            <h3 className="font-bold text-sm text-gray-600 mb-3">科目別内訳</h3>
            {Object.entries(subjectResults).map(([name, stats]) => (
              <div key={name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm">{name}</span>
                <span className="text-sm font-medium">
                  {stats.correct}/{stats.total}
                  <span className="text-gray-400 ml-1">
                    ({stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStarted(false); setFinished(false); }}
              className="px-6 py-2.5 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              トップに戻る
            </button>
            <button
              onClick={startExam}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              もう一度受験
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam in progress
  if (started && questions.length > 0) {
    const isLowTime = timeLeft < 600;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-14 z-40 bg-surface py-2 mb-4">
          <div className="flex items-center justify-between bg-white rounded-lg border border-border px-4 py-2">
            <span className="text-sm text-gray-500">
              問{currentIndex + 1} / {questions.length}
            </span>
            <span className={`font-mono font-bold tabular-nums ${isLowTime ? 'text-incorrect animate-pulse' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={finishExam}
              className="text-sm text-incorrect hover:underline"
            >
              試験を終了
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-6 h-6 rounded text-[10px] font-medium ${
                  answers.has(q.id)
                    ? 'bg-primary text-white'
                    : i === currentIndex
                    ? 'bg-primary/20 text-primary border border-primary'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
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

  // Start screen
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-bold mb-2">模擬試験</h1>
        <p className="text-gray-500 mb-6">
          本番と同じ形式で力試し
        </p>

        <div className="bg-surface rounded-lg p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">問題数</span>
            <span className="font-medium">{EXAM_QUESTIONS}問</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">制限時間</span>
            <span className="font-medium">2時間</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">合格ライン</span>
            <span className="font-medium">35点（目安）</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">出題方式</span>
            <span className="font-medium">ランダム</span>
          </div>
        </div>

        <button
          onClick={startExam}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          試験を開始する
        </button>
      </div>
    </div>
  );
}
