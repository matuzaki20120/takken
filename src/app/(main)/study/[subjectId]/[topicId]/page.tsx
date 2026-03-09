'use client';

import { useParams } from 'next/navigation';
import { getSubjectById, getTopicById } from '@/lib/data/master';
import { getQuestionsByTopic, getStudyContentByTopicId } from '@/lib/data/questions';
import StudyTopicClient from './StudyTopicClient';

export default function StudyTopicPage() {
  const params = useParams();
  const subjectId = Number(params.subjectId);
  const topicId = Number(params.topicId);
  const subject = getSubjectById(subjectId);
  const topic = getTopicById(topicId);
  const content = getStudyContentByTopicId(topicId);
  const questions = getQuestionsByTopic(topicId);

  if (!subject || !topic) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">分野が見つかりません。</p>
      </div>
    );
  }

  return (
    <StudyTopicClient
      subject={subject}
      topic={topic}
      content={content}
      questions={questions}
    />
  );
}
