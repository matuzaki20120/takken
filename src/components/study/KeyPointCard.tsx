import type { KeyPoint } from '@/types/database';

interface Props {
  point: KeyPoint;
}

const importanceConfig = {
  high: { label: '高', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  medium: { label: '中', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  low: { label: '低', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
};

export default function KeyPointCard({ point }: Props) {
  const config = importanceConfig[point.importance] ?? importanceConfig.medium;

  return (
    <div className={`rounded-lg border p-4 ${config.border} ${config.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">📌</span>
        <h3 className="font-bold text-sm text-gray-800">{point.title}</h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${config.text} ${config.bg} border ${config.border}`}>
          重要度:{config.label}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-6">
        {point.content}
      </p>
    </div>
  );
}
