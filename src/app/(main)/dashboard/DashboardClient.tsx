'use client';

import Link from 'next/link';
import { useProgressStore } from '@/lib/stores/progress';
import { getSubjectColor } from '@/lib/utils/subjects';
import type { Subject, Topic } from '@/types/database';

interface Props {
  subjects: Subject[];
  topics: Topic[];
  totalQuestions: number;
}

export default function DashboardClient({ subjects, topics, totalQuestions }: Props) {
  const answers = useProgressStore((s) => s.answers);
  const studiedTopics = useProgressStore((s) => s.studiedTopics);
  const hasHydrated = useProgressStore((s) => s._hasHydrated);
  const getLast7Days = useProgressStore((s) => s.getLast7Days);
  const getSubjectStats = useProgressStore((s) => s.getSubjectStats);
  const getWeakTopics = useProgressStore((s) => s.getWeakTopics);

  if (!hasHydrated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const totalAnswered = answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalTopics = topics.length;
  const studiedCount = studiedTopics.length;

  // Unique study days
  const studyDays = new Set(answers.map((a) => a.answeredAt.split('T')[0])).size;

  const last7Days = getLast7Days();
  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);

  const weakTopics = getWeakTopics(60);
  const weakTopicDetails = weakTopics
    .map((wt) => {
      const topic = topics.find((t) => t.id === wt.topicId);
      const subject = topic ? subjects.find((s) => s.id === topic.subject_id) : null;
      return topic ? { ...wt, topicName: topic.name, subjectName: subject?.name ?? '', subjectId: topic.subject_id } : null;
    })
    .filter(Boolean) as { topicId: number; rate: number; total: number; topicName: string; subjectName: string; subjectId: number }[];

  // Recommendation logic
  const getRecommendation = () => {
    if (totalAnswered === 0 && studiedCount === 0) {
      return { text: '宅建業法の学習から始めましょう', href: '/study', icon: '📖' };
    }
    const unstudiedTopics = topics.filter((t) => !studiedTopics.some((st) => st.topicId === t.id));
    if (unstudiedTopics.length > 0) {
      const next = unstudiedTopics[0];
      return { text: `「${next.name}」を学習しましょう`, href: `/study/${next.subject_id}/${next.id}`, icon: '📖' };
    }
    if (weakTopicDetails.length > 0) {
      const weakest = weakTopicDetails[0];
      return { text: `「${weakest.topicName}」を復習しましょう（正答率${weakest.rate}%）`, href: `/study/${weakest.subjectId}/${weakest.topicId}`, icon: '🔄' };
    }
    return { text: '模擬試験で力試ししましょう！', href: '/exam', icon: '📝' };
  };

  const recommendation = getRecommendation();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* Overall stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="解いた問題" value={totalAnswered} unit="問" />
        <StatCard
          label="正答率"
          value={overallRate}
          unit="%"
          color={overallRate >= 70 ? 'text-correct' : overallRate >= 50 ? 'text-warning' : totalAnswered > 0 ? 'text-incorrect' : undefined}
        />
        <StatCard label="学習済み分野" value={studiedCount} unit={`/ ${totalTopics}`} />
        <StatCard label="学習日数" value={studyDays} unit="日" />
      </div>

      {/* Subject-wise stats with input/output */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-5 mb-8">
        <h2 className="font-bold text-gray-700 mb-4">科目別の進捗</h2>
        <div className="space-y-5">
          {subjects.map((subject) => {
            const color = getSubjectColor(subject.name);
            const stats = getSubjectStats(subject.id);
            const subjectTopics = topics.filter((t) => t.subject_id === subject.id);
            const studiedInSubject = subjectTopics.filter((t) =>
              studiedTopics.some((st) => st.topicId === t.id)
            ).length;
            const inputRate = subjectTopics.length > 0
              ? Math.round((studiedInSubject / subjectTopics.length) * 100)
              : 0;

            return (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${color.text}`}>{subject.name}</span>
                </div>
                {/* Input progress */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 w-20">インプット</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-blue-400 transition-all"
                      style={{ width: `${inputRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {studiedInSubject}/{subjectTopics.length}分野
                  </span>
                </div>
                {/* Output progress */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20">アウトプット</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        stats.rate >= 70 ? 'bg-correct' : stats.rate >= 50 ? 'bg-warning' : stats.total > 0 ? 'bg-incorrect' : 'bg-gray-200'
                      }`}
                      style={{ width: `${stats.total > 0 ? stats.rate : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {stats.total > 0 ? `${stats.rate}% (${stats.total}問)` : '未回答'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-day activity */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-5 mb-8">
        <h2 className="font-bold text-gray-700 mb-4">直近7日間</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {last7Days.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day.count}</span>
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  className={`w-full max-w-8 rounded-t ${day.count > 0 ? 'bg-primary' : 'bg-gray-100'}`}
                  style={{ height: `${day.count > 0 ? Math.max((day.count / maxDayCount) * 100, 10) : 10}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{day.label}</span>
              <span className="text-[10px] text-gray-400">{day.weekday}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weak topics */}
      {weakTopicDetails.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-5 mb-8">
          <h2 className="font-bold text-gray-700 mb-4">弱点分野</h2>
          <div className="space-y-2">
            {weakTopicDetails.slice(0, 5).map((wt) => {
              const color = getSubjectColor(wt.subjectName);
              return (
                <Link
                  key={wt.topicId}
                  href={`/study/${wt.subjectId}/${wt.topicId}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text} flex-shrink-0`}>
                    {wt.subjectName}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">{wt.topicName}</span>
                  <span className={`text-sm font-medium ${wt.rate < 40 ? 'text-incorrect' : 'text-warning'}`}>
                    {wt.rate}%
                  </span>
                  <span className="text-xs text-gray-400">{wt.total}問</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <Link
        href={recommendation.href}
        className="block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 mb-8 hover:border-blue-300 transition-colors"
      >
        <p className="text-xs text-blue-500 font-medium mb-1">次にやるべきこと</p>
        <p className="text-gray-800 font-medium">
          <span className="mr-2">{recommendation.icon}</span>
          {recommendation.text}
        </p>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/study"
          className="bg-white rounded-xl shadow-sm border border-border p-5 hover:border-primary/30 transition-colors group"
        >
          <span className="text-2xl">📖</span>
          <h3 className="font-bold mt-2 group-hover:text-primary transition-colors">教科書学習</h3>
          <p className="text-sm text-gray-500 mt-1">インプットから始める</p>
        </Link>
        <Link
          href="/practice"
          className="bg-white rounded-xl shadow-sm border border-border p-5 hover:border-primary/30 transition-colors group"
        >
          <span className="text-2xl">✏️</span>
          <h3 className="font-bold mt-2 group-hover:text-primary transition-colors">問題演習</h3>
          <p className="text-sm text-gray-500 mt-1">科目・年度を選んで練習</p>
        </Link>
        <Link
          href="/exam"
          className="bg-white rounded-xl shadow-sm border border-border p-5 hover:border-primary/30 transition-colors group"
        >
          <span className="text-2xl">📝</span>
          <h3 className="font-bold mt-2 group-hover:text-primary transition-colors">模擬試験</h3>
          <p className="text-sm text-gray-500 mt-1">本番形式で力試し</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? 'text-gray-800'}`}>
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}
