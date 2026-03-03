'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import StudyTopicClient from './StudyTopicClient';
import type { Subject, Topic, Question, TopicStudyContent } from '@/types/database';

export default function StudyTopicPage() {
  const params = useParams();
  const subjectId = Number(params.subjectId);
  const topicId = Number(params.topicId);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState<TopicStudyContent | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subjectId, topicId]);

  const loadData = async () => {
    const supabase = createClient();

    const [subjectRes, topicRes, contentRes, questionsRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('id', subjectId).single(),
      supabase.from('topics').select('*').eq('id', topicId).single(),
      supabase.from('topic_study_content').select('*').eq('topic_id', topicId).maybeSingle(),
      supabase
        .from('questions')
        .select('*, subject:subjects(*), topic:topics(*)')
        .eq('topic_id', topicId)
        .order('year', { ascending: false }),
    ]);

    setSubject(subjectRes.data);
    setTopic(topicRes.data);
    setContent(contentRes.data as TopicStudyContent | null);
    setQuestions(questionsRes.data ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

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
