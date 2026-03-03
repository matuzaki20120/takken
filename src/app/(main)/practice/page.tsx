import { createClient } from '@/lib/supabase/server';
import PracticeClient from './PracticeClient';

export default async function PracticePage() {
  const supabase = await createClient();

  const [{ data: subjects }, { data: topics }, { data: years }] = await Promise.all([
    supabase.from('subjects').select('*').order('display_order'),
    supabase.from('topics').select('*').order('display_order'),
    supabase.from('questions').select('year').order('year', { ascending: false }),
  ]);

  const uniqueYears = [...new Set(years?.map((q) => q.year) ?? [])];

  return (
    <PracticeClient
      subjects={subjects ?? []}
      topics={topics ?? []}
      years={uniqueYears}
    />
  );
}
