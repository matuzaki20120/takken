import type { KeyNumber } from '@/types/database';

interface Props {
  numbers: KeyNumber[];
}

export default function KeyNumbersTable({ numbers }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-gray-500 font-medium">項目</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium">数字</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium">備考</th>
          </tr>
        </thead>
        <tbody>
          {numbers.map((num, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-2.5 px-3 text-gray-700">{num.label}</td>
              <td className="py-2.5 px-3 font-bold text-primary">{num.value}</td>
              <td className="py-2.5 px-3 text-gray-500 text-xs">{num.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
