import { SUBJECTS, TOPICS } from './master';
import type { Question, TopicStudyContent } from '@/types/database';
import questionsRaw from '@/../data/questions/2025.json';
import studyContentRaw from '@/../data/study-content/takkengyoho.json';

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

const subjectMap = new Map(SUBJECTS.map((s) => [s.name, s]));
const topicMap = new Map(TOPICS.map((t) => [`${t.subject_id}:${t.name}`, t]));

function resolveQuestions(seeds: QuestionSeed[]): Question[] {
  return seeds.map((q) => {
    const subject = subjectMap.get(q.subject);
    const subjectId = subject?.id ?? 0;
    const topic = topicMap.get(`${subjectId}:${q.topic}`);
    const topicId = topic?.id ?? null;

    return {
      id: `${q.year}-${q.question_number}`,
      year: q.year,
      question_number: q.question_number,
      subject_id: subjectId,
      topic_id: topicId,
      question_text: q.question_text,
      choices: q.choices,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      created_at: '',
      subject,
      topic,
    };
  });
}

export const ALL_QUESTIONS: Question[] = resolveQuestions(questionsRaw as QuestionSeed[]);

export const STUDY_CONTENT: TopicStudyContent[] = (studyContentRaw as any[]).map((item) => ({
  id: item.topic_id,
  topic_id: item.topic_id,
  overview: item.overview,
  key_points: item.key_points,
  key_numbers: item.key_numbers,
  exam_patterns: item.exam_patterns,
  common_keywords: item.common_keywords,
}));

export function getQuestionsBySubject(subjectId: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.subject_id === subjectId);
}

export function getQuestionsByTopic(topicId: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topic_id === topicId);
}

export function getQuestionsByFilters(filters: {
  subjectId?: number | null;
  topicId?: number | null;
  year?: number | null;
}): Question[] {
  return ALL_QUESTIONS.filter((q) => {
    if (filters.subjectId && q.subject_id !== filters.subjectId) return false;
    if (filters.topicId && q.topic_id !== filters.topicId) return false;
    if (filters.year && q.year !== filters.year) return false;
    return true;
  });
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getStudyContentByTopicId(topicId: number): TopicStudyContent | null {
  return STUDY_CONTENT.find((c) => c.topic_id === topicId) ?? null;
}

export function getAvailableYears(): number[] {
  return [...new Set(ALL_QUESTIONS.map((q) => q.year))].sort((a, b) => b - a);
}

export function getQuestionCountByTopic(subjectId: number): Record<number, number> {
  const counts: Record<number, number> = {};
  ALL_QUESTIONS.filter((q) => q.subject_id === subjectId).forEach((q) => {
    if (q.topic_id) {
      counts[q.topic_id] = (counts[q.topic_id] ?? 0) + 1;
    }
  });
  return counts;
}
