interface ProfileStatsProps {
  boxCount: number;
  favoriteCount: number;
  boxLimit: number;
  favoriteLimit: number;
}

export const ProfileStats = ({ boxCount, favoriteCount, boxLimit, favoriteLimit }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      <StatCard
        title="Boîtes Créées"
        current={boxCount}
        limit={boxLimit}
        color="[#266CDD]"
        icon="📚"
      />
      <StatCard
        title="Favoris"
        current={favoriteCount}
        limit={favoriteLimit}
        color="[#266CDD]"
        icon="⭐"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  current: number;
  limit: number;
  color: string;
  icon: string;
}

const StatCard = ({ title, current, limit, color, icon }: StatCardProps) => {
  const percentage = Math.min((current / limit) * 100, 100);
  
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900">{current}</span>
        <span className="text-sm text-gray-400">/ {limit === Infinity ? '∞' : limit}</span>
      </div>

      <div className="mt-4">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-${color} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};