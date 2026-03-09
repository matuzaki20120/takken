import type { Subject, Topic } from '@/types/database';

export const SUBJECTS: Subject[] = [
  { id: 1, name: '宅建業法', display_order: 1 },
  { id: 2, name: '権利関係', display_order: 2 },
  { id: 3, name: '法令上の制限', display_order: 3 },
  { id: 4, name: '税・その他', display_order: 4 },
];

export const TOPICS: Topic[] = [
  // 宅建業法 (subject_id: 1)
  { id: 1, subject_id: 1, name: '免許制度', display_order: 1 },
  { id: 2, subject_id: 1, name: '宅地建物取引士', display_order: 2 },
  { id: 3, subject_id: 1, name: '営業保証金', display_order: 3 },
  { id: 4, subject_id: 1, name: '保証協会', display_order: 4 },
  { id: 5, subject_id: 1, name: '媒介契約', display_order: 5 },
  { id: 6, subject_id: 1, name: '重要事項説明（35条書面）', display_order: 6 },
  { id: 7, subject_id: 1, name: '37条書面', display_order: 7 },
  { id: 8, subject_id: 1, name: '8種制限（自ら売主制限）', display_order: 8 },
  { id: 9, subject_id: 1, name: '報酬に関する制限', display_order: 9 },
  { id: 10, subject_id: 1, name: '監督処分・罰則', display_order: 10 },
  { id: 11, subject_id: 1, name: '住宅瑕疵担保履行法', display_order: 11 },
  { id: 12, subject_id: 1, name: '広告に関する規制', display_order: 12 },
  { id: 13, subject_id: 1, name: '業務上の規制', display_order: 13 },

  // 権利関係 (subject_id: 2)
  { id: 14, subject_id: 2, name: '意思表示', display_order: 1 },
  { id: 15, subject_id: 2, name: '代理', display_order: 2 },
  { id: 16, subject_id: 2, name: '時効', display_order: 3 },
  { id: 17, subject_id: 2, name: '物権変動', display_order: 4 },
  { id: 18, subject_id: 2, name: '抵当権', display_order: 5 },
  { id: 19, subject_id: 2, name: '債務不履行・解除', display_order: 6 },
  { id: 20, subject_id: 2, name: '連帯債務・保証', display_order: 7 },
  { id: 21, subject_id: 2, name: '売買', display_order: 8 },
  { id: 22, subject_id: 2, name: '賃貸借', display_order: 9 },
  { id: 23, subject_id: 2, name: '借地借家法（借地）', display_order: 10 },
  { id: 24, subject_id: 2, name: '借地借家法（借家）', display_order: 11 },
  { id: 25, subject_id: 2, name: '不法行為', display_order: 12 },
  { id: 26, subject_id: 2, name: '相続', display_order: 13 },
  { id: 27, subject_id: 2, name: '区分所有法', display_order: 14 },

  // 法令上の制限 (subject_id: 3)
  { id: 28, subject_id: 3, name: '都市計画法', display_order: 1 },
  { id: 29, subject_id: 3, name: '建築基準法', display_order: 2 },
  { id: 30, subject_id: 3, name: '国土利用計画法', display_order: 3 },
  { id: 31, subject_id: 3, name: '農地法', display_order: 4 },
  { id: 32, subject_id: 3, name: '土地区画整理法', display_order: 5 },
  { id: 33, subject_id: 3, name: '宅地造成等規制法', display_order: 6 },

  // 税・その他 (subject_id: 4)
  { id: 34, subject_id: 4, name: '不動産取得税', display_order: 1 },
  { id: 35, subject_id: 4, name: '固定資産税', display_order: 2 },
  { id: 36, subject_id: 4, name: '所得税（譲渡所得）', display_order: 3 },
  { id: 37, subject_id: 4, name: '住宅金融支援機構', display_order: 4 },
  { id: 38, subject_id: 4, name: '景品表示法（不当表示）', display_order: 5 },
  { id: 39, subject_id: 4, name: '土地・建物の知識', display_order: 6 },
  { id: 40, subject_id: 4, name: '統計', display_order: 7 },
];

export function getSubjectById(id: number): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopicsBySubjectId(subjectId: number): Topic[] {
  return TOPICS.filter((t) => t.subject_id === subjectId);
}

export function getTopicById(id: number): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
