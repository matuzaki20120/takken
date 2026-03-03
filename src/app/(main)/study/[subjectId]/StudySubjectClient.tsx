'use client';

import Link from 'next/link';
import { useProgressStore } from '@/lib/stores/progress';
import { getSubjectColor } from '@/lib/utils/subjects';
import type { Subject, Topic } from '@/types/database';

interface Props {
  subject: Subject;
  topics: Topic[];
  topicQuestionCounts: Record<number, number>;
}

export default function StudySubjectClient({ subject, topics, topicQuestionCounts }: Props) {
  const studiedTopics = useProgressStore((s) => s.studiedTopics);
  const getTopicStats = useProgressStore((s) => s.getTopicStats);
  const hasHydrated = useProgressStore((s) => s._hasHydrated);
  const color = getSubjectColor(subject.name);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/study" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← 学習に戻る
      </Link>

      <h1 className={`text-2xl font-bold mb-1 ${color.text}`}>{subject.name}</h1>
      <p className="text-sm text-gray-500 mb-6">{topics.length}分野</p>

      <div className="space-y-2">
        {topics.map((topic, index) => {
          const isStudied = hasHydrated && studiedTopics.some((st) => st.topicId === topic.id);
          const stats = hasHydrated ? getTopicStats(topic.id) : { total: 0, correct: 0, rate: 0 };
          const questionCount = topicQuestionCounts[topic.id] ?? 0;

          return (
            <Link
              key={topic.id}
              href={`/study/${subject.id}/${topic.id}`}
              className="flex items-center gap-4 bg-white rounded-lg border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              {/* Status icon */}
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isStudied ? 'bg-correct/10 text-correct' : 'bg-gray-100 text-gray-400'
              }`}>
                {isStudied ? '✓' : index + 1}
              </span>

              {/* Topic info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{topic.name}</p>
                <p className="text-xs text-gray-400">
                  {questionCount}問
                  {hasHydrated && stats.total > 0 && (
                    <span className="ml-2">
                      正答率 {stats.rate}%
                    </span>
                  )}
                  {hasHydrated && stats.total === 0 && !isStudied && (
                    <span className="ml-2 text-gray-300">未学習</span>
                  )}
                </p>
              </div>

              {/* Arrow */}
              <span className="text-gray-300 flex-shrink-0">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
