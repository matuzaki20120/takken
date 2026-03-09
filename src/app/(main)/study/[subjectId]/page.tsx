'use client';

import { useParams } from 'next/navigation';
import { SUBJECTS, TOPICS } from '@/lib/data/master';
import { getQuestionCountByTopic } from '@/lib/data/questions';
import StudySubjectClient from './StudySubjectClient';

export default function StudySubjectPage() {
  const params = useParams();
  const subjectId = Number(params.subjectId);
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const topics = TOPICS.filter((t) => t.subject_id === subjectId);
  const topicQuestionCounts = getQuestionCountByTopic(subjectId);

  if (!subject) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">科目が見つかりません。</p>
      </div>
    );
  }

  return (
    <StudySubjectClient
      subject={subject}
      topics={topics}
      topicQuestionCounts={topicQuestionCounts}
    />
  );
}
