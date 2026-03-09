'use client';

import { SUBJECTS, TOPICS } from '@/lib/data/master';
import { getAvailableYears } from '@/lib/data/questions';
import PracticeClient from './PracticeClient';

export default function PracticePage() {
  return (
    <PracticeClient
      subjects={SUBJECTS}
      topics={TOPICS}
      years={getAvailableYears()}
    />
  );
}
