export interface Subject {
  id: number;
  name: string;
  display_order: number;
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  display_order: number;
}

export interface Choice {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  year: number;
  question_number: number;
  subject_id: number;
  topic_id: number | null;
  question_text: string;
  choices: Choice[];
  correct_answer: number;
  explanation: string;
  difficulty: number;
  created_at: string;
  // Joined fields
  subject?: Subject;
  topic?: Topic;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  time_spent_seconds: number | null;
  answered_at: string;
  session_id: string | null;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  question_id: string;
  note: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  mode: 'practice' | 'exam' | 'review' | 'quiz';
  started_at: string;
  finished_at: string | null;
  total_questions: number;
  correct_count: number;
  score: number | null;
}

// Study content for topics
export interface KeyPoint {
  title: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
}

export interface KeyNumber {
  label: string;
  value: string;
  note: string;
}

export interface TopicStudyContent {
  id: number;
  topic_id: number;
  overview: string;
  key_points: KeyPoint[];
  key_numbers: KeyNumber[];
  exam_patterns: string;
  common_keywords: string[];
}

// For question data seeding
export interface QuestionSeed {
  year: number;
  question_number: number;
  subject: string;
  topic: string;
  question_text: string;
  choices: Choice[];
  correct_answer: number;
  explanation: string;
  difficulty: number;
}
