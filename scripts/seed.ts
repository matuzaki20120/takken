/**
 * Seed script to load question data into Supabase
 * Usage: npx tsx scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QuestionSeed {
  year: number;
  question_number: number;
  subject: string;
  topic: string;
  question_text: string;
  choices: { label: string; text: string }[];
  correct_answer: number;
  explanation: string;
  difficulty: number;
}

async function seed() {
  // Get subject and topic maps
  const { data: subjects } = await supabase.from('subjects').select('*');
  const { data: topics } = await supabase.from('topics').select('*');

  if (!subjects || !topics) {
    console.error('Failed to fetch subjects/topics');
    process.exit(1);
  }

  const subjectMap = new Map(subjects.map((s) => [s.name, s.id]));
  const topicMap = new Map(topics.map((t) => [`${t.subject_id}:${t.name}`, t.id]));

  // Read all question JSON files
  const dataDir = path.join(__dirname, '..', 'data', 'questions');
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));

  let totalInserted = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const questions: QuestionSeed[] = JSON.parse(raw);

    console.log(`Processing ${file}: ${questions.length} questions`);

    const rows = questions.map((q) => {
      const subjectId = subjectMap.get(q.subject);
      if (!subjectId) {
        console.warn(`Unknown subject: ${q.subject} (question ${q.year}-${q.question_number})`);
        return null;
      }
      const topicId = topicMap.get(`${subjectId}:${q.topic}`) ?? null;
      if (!topicId) {
        console.warn(`Unknown topic: ${q.topic} for subject ${q.subject} (question ${q.year}-${q.question_number})`);
      }

      return {
        year: q.year,
        question_number: q.question_number,
        subject_id: subjectId,
        topic_id: topicId,
        question_text: q.question_text,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      };
    }).filter(Boolean);

    if (rows.length > 0) {
      const { data, error } = await supabase
        .from('questions')
        .upsert(rows as any[], { onConflict: 'year,question_number' })
        .select('id');

      if (error) {
        console.error(`Error inserting ${file}:`, error.message);
      } else {
        console.log(`Inserted/updated ${data.length} questions from ${file}`);
        totalInserted += data.length;
      }
    }
  }

  console.log(`\nDone! Total: ${totalInserted} questions`);
}

seed().catch(console.error);
