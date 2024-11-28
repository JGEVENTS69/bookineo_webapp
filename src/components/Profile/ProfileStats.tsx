import React from 'react';
import { Box, Heart } from 'lucide-react';

interface ProfileStatsProps {
  boxCount: number;
  favoriteCount: number;
  boxLimit: number;
  favoriteLimit: number;
}

export const ProfileStats = ({
  boxCount,
  favoriteCount,
  boxLimit,
  favoriteLimit
}: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8">
          <div className="w-full h-full bg-blue-100 rounded-full opacity-50" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <Box className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Boxes</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {boxCount}
            <span className="text-sm font-normal text-blue-600 ml-1">
              / {boxLimit === Infinity ? '∞' : boxLimit}
            </span>
          </p>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-6">
        <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8">
          <div className="w-full h-full bg-rose-100 rounded-full opacity-50" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-6 h-6 text-rose-600" />
            <span className="text-sm font-medium text-rose-900">Favoris</span>
          </div>
          <p className="text-3xl font-bold text-rose-900">
            {favoriteCount}
            <span className="text-sm font-normal text-rose-600 ml-1">
              / {favoriteLimit === Infinity ? '∞' : favoriteLimit}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};