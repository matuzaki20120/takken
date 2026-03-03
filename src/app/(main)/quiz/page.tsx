'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProgressStore } from '@/lib/stores/progress';
import { getSubjectColor } from '@/lib/utils/subjects';
import type { Question } from '@/types/database';

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const addAnswer = useProgressStore((s) => s.addAnswer);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*, subject:subjects(*), topic:topics(*)')
      .order('question_number');

    if (data) {
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setCurrentChoiceIndex(0);
      setStats({ correct: 0, total: 0 });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-gray-500">問題がありません。</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const choice = question.choices[currentChoiceIndex];
  const isCorrectChoice = parseInt(choice.label) === question.correct_answer;
  const subjectColor = question.subject ? getSubjectColor(question.subject.name) : null;

  const handleAnswer = (userSaidCorrect: boolean) => {
    const isActuallyCorrect = (userSaidCorrect && isCorrectChoice) || (!userSaidCorrect && !isCorrectChoice);
    setStats((prev) => ({
      correct: prev.correct + (isActuallyCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    setShowAnswer(true);

    // Save to progress store (record per-question on last choice)
    if (currentChoiceIndex === question.choices.length - 1) {
      addAnswer({
        questionId: question.id,
        selectedAnswer: question.correct_answer, // quiz mode doesn't have traditional selection
        isCorrect: isActuallyCorrect,
        mode: 'quiz',
        topicId: question.topic_id,
        subjectId: question.subject_id,
      });
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (currentChoiceIndex < question.choices.length - 1) {
      setCurrentChoiceIndex((prev) => prev + 1);
    } else if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentChoiceIndex(0);
    } else {
      loadQuestions();
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">一問一答</h1>
        <span className="text-sm text-gray-500 tabular-nums">
          {stats.correct}/{stats.total} 正解
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Question header */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          {question.subject && subjectColor && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColor.bg} ${subjectColor.text}`}>
              {question.subject.name}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {question.year}年 問{question.question_number}
          </span>
        </div>

        {/* Question text (abbreviated) */}
        <div className="px-5 py-3 bg-surface border-b border-border">
          <p className="text-sm text-gray-600 line-clamp-3">
            {question.question_text}
          </p>
        </div>

        {/* Choice to evaluate */}
        <div className="px-5 py-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {choice.label}
            </span>
            <p className="text-gray-800 leading-relaxed pt-1">
              {choice.text}
            </p>
          </div>

          {!showAnswer ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-3 rounded-lg border-2 border-correct/30 text-correct font-bold hover:bg-correct/5 transition-colors text-lg"
              >
                正しい
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-3 rounded-lg border-2 border-incorrect/30 text-incorrect font-bold hover:bg-incorrect/5 transition-colors text-lg"
              >
                誤り
              </button>
            </div>
          ) : (
            <div>
              <div className={`flex items-center gap-2 mb-3 ${isCorrectChoice ? 'text-correct' : 'text-incorrect'}`}>
                <span className="text-xl">{isCorrectChoice ? '⭕' : '❌'}</span>
                <span className="font-bold">
                  この肢は{isCorrectChoice ? '正しい' : '誤り'}（正解: {question.correct_answer}）
                </span>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                次へ →
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        問{currentIndex + 1}/{questions.length} ・ 肢{currentChoiceIndex + 1}/{question.choices.length}
      </p>
    </div>
  );
}
