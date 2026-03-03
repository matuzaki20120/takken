'use client';

import { useState } from 'react';
import type { Question } from '@/types/database';
import { getSubjectColor } from '@/lib/utils/subjects';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: string, selectedAnswer: number, isCorrect: boolean) => void;
  onNext: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
  onBookmark,
  isBookmarked,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const subjectColor = question.subject ? getSubjectColor(question.subject.name) : null;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === question.correct_answer;
    setShowResult(true);
    onAnswer(question.id, selectedAnswer, isCorrect);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    onNext();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {questionIndex + 1} / {totalQuestions}
          </span>
          {question.subject && subjectColor && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColor.bg} ${subjectColor.text}`}>
              {question.subject.name}
            </span>
          )}
          {question.topic && (
            <span className="text-xs text-gray-400">{question.topic.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {question.year}年 問{question.question_number}
          </span>
          {onBookmark && (
            <button
              onClick={onBookmark}
              className={`text-lg ${isBookmarked ? 'text-warning' : 'text-gray-300 hover:text-warning'} transition-colors`}
              title="ブックマーク"
            >
              {isBookmarked ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>

      {/* Question text */}
      <div className="px-5 py-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {question.question_text}
        </p>
      </div>

      {/* Choices */}
      <div className="px-5 pb-4 space-y-2">
        {question.choices.map((choice) => {
          const choiceNum = parseInt(choice.label);
          let choiceStyle = 'border-gray-200 hover:border-primary/40 hover:bg-primary/5';

          if (showResult) {
            if (choiceNum === question.correct_answer) {
              choiceStyle = 'border-correct bg-correct/5 ring-1 ring-correct/20';
            } else if (choiceNum === selectedAnswer && choiceNum !== question.correct_answer) {
              choiceStyle = 'border-incorrect bg-incorrect/5 ring-1 ring-incorrect/20';
            } else {
              choiceStyle = 'border-gray-200 opacity-60';
            }
          } else if (selectedAnswer === choiceNum) {
            choiceStyle = 'border-primary bg-primary/5 ring-1 ring-primary/20';
          }

          return (
            <button
              key={choice.label}
              onClick={() => !showResult && setSelectedAnswer(choiceNum)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${choiceStyle}`}
            >
              <span className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  showResult && choiceNum === question.correct_answer
                    ? 'bg-correct text-white'
                    : showResult && choiceNum === selectedAnswer
                    ? 'bg-incorrect text-white'
                    : selectedAnswer === choiceNum
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {choice.label}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed pt-0.5">
                  {choice.text}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions & Explanation */}
      <div className="px-5 pb-5">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            解答する
          </button>
        ) : (
          <>
            {/* Result badge */}
            <div className={`flex items-center gap-2 mb-3 ${
              selectedAnswer === question.correct_answer ? 'text-correct' : 'text-incorrect'
            }`}>
              <span className="text-2xl">
                {selectedAnswer === question.correct_answer ? '⭕' : '❌'}
              </span>
              <span className="font-bold">
                {selectedAnswer === question.correct_answer ? '正解！' : `不正解（正解: ${question.correct_answer}）`}
              </span>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="bg-surface rounded-lg p-4 mb-4 border border-border">
                <h4 className="text-sm font-bold text-gray-600 mb-2">解説</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {question.explanation}
                </p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              {questionIndex < totalQuestions - 1 ? '次の問題へ →' : '結果を見る'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
