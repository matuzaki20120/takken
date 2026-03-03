import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">🏠 宅建合格ドリル</h1>
          <Link
            href="/dashboard"
            className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            進捗を確認
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-blue-200 text-sm font-medium mb-3">2026年10月 宅建試験対策</p>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            このサイトだけで<br className="sm:hidden" />宅建合格
          </h2>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
            教科書で学んで、問題で定着。<br />
            インプットからアウトプットまで、効率的に合格を目指す。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/study"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              学習を始める
            </Link>
            <Link
              href="/practice"
              className="bg-white/10 text-white font-medium px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              今すぐ問題を解く
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center mb-12">合格への4つの武器</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon="📖"
            title="教科書学習"
            description="分野ごとの要点整理と暗記数字で、効率的にインプット。"
          />
          <FeatureCard
            icon="✏️"
            title="確認テスト"
            description="教科書を読んだ直後に確認テストで理解度をチェック。"
          />
          <FeatureCard
            icon="📊"
            title="弱点の可視化"
            description="回答履歴から科目別・分野別の正答率を分析。苦手を重点対策。"
          />
          <FeatureCard
            icon="📝"
            title="本番形式の模擬試験"
            description="50問・2時間のタイマー付き模擬試験で、本番さながらの練習。"
          />
        </div>
      </section>

      {/* Exam info */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-center mb-8">宅建試験の概要</h3>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <InfoCard label="試験形式" value="4肢択一 × 50問（2時間）" />
            <InfoCard label="合格ライン" value="例年35〜37点" />
            <InfoCard label="宅建業法" value="20問（最重要・最も得点しやすい）" accent="blue" />
            <InfoCard label="権利関係" value="14問（民法等・最難関）" accent="purple" />
            <InfoCard label="法令上の制限" value="8問" accent="emerald" />
            <InfoCard label="税・その他" value="8問（5問免除対象含む）" accent="amber" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h3 className="text-2xl font-bold mb-4">今日から始めよう</h3>
        <p className="text-gray-500 mb-8">登録不要。学習履歴はブラウザに自動保存されます。</p>
        <Link
          href="/study"
          className="inline-block bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          学習を始める →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>宅建合格ドリル — 宅建試験の過去問をベースにした学習サイト</p>
          <p className="mt-1">問題・正解は国家試験のため公開情報です。解説はAI生成含む。</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
  };
  return (
    <div className={`bg-white rounded-lg p-4 border border-border ${accent ? `border-l-4 ${colorMap[accent]}` : ''}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}
