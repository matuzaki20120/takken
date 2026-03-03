export const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '宅建業法': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '権利関係': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  '法令上の制限': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '税・その他': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const SUBJECT_QUESTION_COUNTS: Record<string, number> = {
  '宅建業法': 20,
  '権利関係': 14,
  '法令上の制限': 8,
  '税・その他': 8,
};

export function getSubjectColor(name: string) {
  return SUBJECT_COLORS[name] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}
