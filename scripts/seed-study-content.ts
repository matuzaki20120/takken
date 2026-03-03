/**
 * Seed script for topic_study_content table.
 * Run: npx tsx scripts/seed-study-content.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const filePath = resolve(__dirname, '../data/study-content/takkengyoho.json');
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  console.log(`Seeding ${data.length} topic study content records...`);

  for (const item of data) {
    const { error } = await supabase
      .from('topic_study_content')
      .upsert({
        topic_id: item.topic_id,
        overview: item.overview,
        key_points: item.key_points,
        key_numbers: item.key_numbers,
        exam_patterns: item.exam_patterns,
        common_keywords: item.common_keywords,
      }, { onConflict: 'topic_id' });

    if (error) {
      console.error(`Error seeding topic ${item.topic_id}:`, error.message);
    } else {
      console.log(`✓ Topic ${item.topic_id} seeded`);
    }
  }

  console.log('Done!');
}

seed();
