'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import StudySubjectClient from './StudySubjectClient';
import type { Subject, Topic } from '@/types/database';

export default function StudySubjectPage() {
  const params = useParams();
  const subjectId = Number(params.subjectId);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicQuestionCounts, setTopicQuestionCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    const supabase = createClient();

    const [subjectRes, topicsRes, questionsRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('id', subjectId).single(),
      supabase.from('topics').select('*').eq('subject_id', subjectId).order('display_order'),
      supabase.from('questions').select('topic_id').eq('subject_id', subjectId),
    ]);

    setSubject(subjectRes.data);
    setTopics(topicsRes.data ?? []);

    // Count questions per topic
    const counts: Record<number, number> = {};
    questionsRes.data?.forEach((q) => {
      if (q.topic_id) {
        counts[q.topic_id] = (counts[q.topic_id] ?? 0) + 1;
      }
    });
    setTopicQuestionCounts(counts);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

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
