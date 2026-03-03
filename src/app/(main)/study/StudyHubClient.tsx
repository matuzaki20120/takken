'use client';

import Link from 'next/link';
import { useProgressStore } from '@/lib/stores/progress';
import { getSubjectColor, SUBJECT_QUESTION_COUNTS } from '@/lib/utils/subjects';
import type { Subject, Topic } from '@/types/database';

interface Props {
  subjects: Subject[];
  topics: Topic[];
}

export default function StudyHubClient({ subjects, topics }: Props) {
  const studiedTopics = useProgressStore((s) => s.studiedTopics);
  const hasHydrated = useProgressStore((s) => s._hasHydrated);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">学習</h1>
      <p className="text-gray-500 text-sm mb-8">
        教科書を読んでから確認テストで定着させましょう。
      </p>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const color = getSubjectColor(subject.name);
          const subjectTopics = topics.filter((t) => t.subject_id === subject.id);
          const studiedCount = hasHydrated
            ? subjectTopics.filter((t) => studiedTopics.some((st) => st.topicId === t.id)).length
            : 0;
          const totalTopics = subjectTopics.length;
          const progressRate = totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;
          const questionCount = SUBJECT_QUESTION_COUNTS[subject.name] ?? 0;

          return (
            <Link
              key={subject.id}
              href={`/study/${subject.id}`}
              className={`block bg-white rounded-xl shadow-sm border-2 p-5 hover:shadow-md transition-all ${color.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-lg font-bold ${color.text}`}>
                  {subject.name}
                </h2>
                <span className="text-xs text-gray-400">
                  {questionCount}問 | {totalTopics}分野
                </span>
              </div>

              {hasHydrated && (
                <>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">
                      学習済み {studiedCount}/{totalTopics}
                    </span>
                    <span className="text-gray-400">{progressRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        progressRate === 100 ? 'bg-correct' : progressRate > 0 ? 'bg-blue-400' : 'bg-gray-200'
                      }`}
                      style={{ width: `${progressRate}%` }}
                    />
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
