import React from 'react';
import { Package2 } from 'lucide-react';

interface EmptyBoxStateProps {
  searchQuery: string;
}

export const EmptyBoxState = ({ searchQuery }: EmptyBoxStateProps) => {
  return (
    <div className="text-center py-12">
      <Package2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {searchQuery ? 'Aucun résultat' : 'Aucune boîtes'}
      </h3>
      <p className="mt-2 text-gray-600">
        {searchQuery
          ? 'Aucune box ne correspond à votre recherche.'
          : 'Vous n\'avez pas encore créé de box.'}
      </p>
    </div>
  );
};