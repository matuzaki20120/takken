'use client';

import { SUBJECTS, TOPICS } from '@/lib/data/master';
import StudyHubClient from './StudyHubClient';

export default function StudyPage() {
  return <StudyHubClient subjects={SUBJECTS} topics={TOPICS} />;
}
