'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import StudyHubClient from './StudyHubClient';
import type { Subject, Topic } from '@/types/database';

export default function StudyPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const [subjectsRes, topicsRes] = await Promise.all([
      supabase.from('subjects').select('*').order('display_order'),
      supabase.from('topics').select('*').order('display_order'),
    ]);
    setSubjects(subjectsRes.data ?? []);
    setTopics(topicsRes.data ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return <StudyHubClient subjects={subjects} topics={topics} />;
}
