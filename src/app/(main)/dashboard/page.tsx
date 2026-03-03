'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardClient from './DashboardClient';
import type { Subject, Topic } from '@/types/database';

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();

    const [subjectsRes, topicsRes, countRes] = await Promise.all([
      supabase.from('subjects').select('*').order('display_order'),
      supabase.from('topics').select('*').order('display_order'),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
    ]);

    setSubjects(subjectsRes.data ?? []);
    setTopics(topicsRes.data ?? []);
    setTotalQuestions(countRes.count ?? 0);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <DashboardClient
      subjects={subjects}
      topics={topics}
      totalQuestions={totalQuestions}
    />
  );
}
