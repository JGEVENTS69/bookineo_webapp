import React from 'react';
import { Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  subscription?: string;
}

export const SubscriptionBadge = ({ subscription }: SubscriptionBadgeProps) => {
  const isFreemium = subscription === 'Freemium';

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
        ${isFreemium
          ? 'bg-gray-100 text-gray-700'
          : 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900'
        }
      `}
    >
      <Crown className={`w-4 h-4 ${isFreemium ? 'text-gray-500' : 'text-amber-700'}`} />
      <span>{isFreemium ? 'Freemium' : 'Premium'}</span>
    </div>
  );
};