import React from 'react';
import { Package2, Eye } from 'lucide-react';
import { Box } from '../../../types/box';

interface BoxCardProps {
  box: Box;
  visitCount: number;
}

export const BoxCard = ({ box, visitCount }: BoxCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-xl transition-transform">
      <div className="relative w-full h-48 bg-gray-100">
        {box.image_url ? (
          <img
            src={box.image_url}
            alt={box.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '';
              target.onerror = null;
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Package2 className="h-10 w-10 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{box.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{box.description}</p>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            {new Date(box.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <div className="flex items-center gap-1">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>{visitCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};