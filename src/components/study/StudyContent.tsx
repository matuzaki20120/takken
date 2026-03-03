'use client';

import KeyPointCard from './KeyPointCard';
import KeyNumbersTable from './KeyNumbersTable';
import type { TopicStudyContent } from '@/types/database';

interface Props {
  content: TopicStudyContent;
}

export default function StudyContent({ content }: Props) {
  const hasOverview = content.overview && content.overview.trim().length > 0;
  const hasKeyPoints = content.key_points && content.key_points.length > 0;
  const hasKeyNumbers = content.key_numbers && content.key_numbers.length > 0;
  const hasExamPatterns = content.exam_patterns && content.exam_patterns.trim().length > 0;
  const hasKeywords = content.common_keywords && content.common_keywords.length > 0;

  if (!hasOverview && !hasKeyPoints && !hasKeyNumbers && !hasExamPatterns && !hasKeywords) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center mb-8">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-500">教科書コンテンツは準備中です。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Overview */}
      {hasOverview && (
        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-blue-500">━━</span> 概要
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content.overview}
          </p>
        </section>
      )}

      {/* Key Points */}
      {hasKeyPoints && (
        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-blue-500">━━</span> 重要ポイント
          </h2>
          <div className="space-y-3">
            {content.key_points.map((point, i) => (
              <KeyPointCard key={i} point={point} />
            ))}
          </div>
        </section>
      )}

      {/* Key Numbers */}
      {hasKeyNumbers && (
        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-blue-500">━━</span> 暗記数字
          </h2>
          <KeyNumbersTable numbers={content.key_numbers} />
        </section>
      )}

      {/* Exam Patterns */}
      {hasExamPatterns && (
        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-blue-500">━━</span> 出題パターン
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content.exam_patterns}
          </p>
        </section>
      )}

      {/* Common Keywords */}
      {hasKeywords && (
        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-blue-500">━━</span> 頻出キーワード
          </h2>
          <div className="flex flex-wrap gap-2">
            {content.common_keywords.map((keyword, i) => (
              <span
                key={i}
                className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
