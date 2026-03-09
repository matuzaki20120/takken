'use client';

import { SUBJECTS, TOPICS } from '@/lib/data/master';
import { ALL_QUESTIONS } from '@/lib/data/questions';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <DashboardClient
      subjects={SUBJECTS}
      topics={TOPICS}
      totalQuestions={ALL_QUESTIONS.length}
    />
  );
}
