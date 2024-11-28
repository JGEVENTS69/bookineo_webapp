import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Box } from '../../../types/box';
import { BoxCard } from './BoxCard';
import { EmptyBoxState } from './EmptyBoxState';
import toast from 'react-hot-toast';

export const BoxesTab = () => {
  const { user } = useAuthStore();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBoxesAndVisits = async () => {
      if (!user?.id) {
        console.log('No user ID found');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching boxes for user:', user.id);

        // Fetch boxes
        const { data: boxesData, error: boxesError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('creator_id', user.id);

        if (boxesError) {
          console.error('Error fetching boxes:', boxesError);
          throw boxesError;
        }

        if (!boxesData || boxesData.length === 0) {
          console.log('No boxes found for user');
          setBoxes([]);
          setVisitCounts({});
          return;
        }

        // Get visit counts for each box using count aggregation
        const boxIds = boxesData.map(box => box.id);
        const { data: visitsData, error: visitsError } = await supabase
          .from('box_visits')
          .select('box_id, count')
          .in('box_id', boxIds)
          .select('box_id');

        if (visitsError) {
          console.error('Error fetching visits:', visitsError);
          throw visitsError;
        }

        // Process boxes
        const processedBoxes = boxesData.map(box => ({
          id: box.id,
          title: box.title,
          description: box.description,
          created_at: box.created_at,
          image_url: box.image_url
        }));

        // Count total visits per box
        const visitsMap = boxIds.reduce((acc: Record<string, number>, boxId) => {
          acc[boxId] = visitsData?.filter(visit => visit.box_id === boxId).length || 0;
          return acc;
        }, {});

        console.log('Processed boxes:', processedBoxes);
        console.log('Visit counts:', visitsMap);

        setBoxes(processedBoxes);
        setVisitCounts(visitsMap);
      } catch (error: any) {
        console.error('Error in fetchBoxesAndVisits:', error);
        toast.error('Impossible de charger vos boxes');
      } finally {
        setLoading(false);
      }
    };

    fetchBoxesAndVisits();
  }, [user?.id]);

  const filteredBoxes = boxes.filter(box =>
    box.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    box.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une box..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 
                     focus:border-blue-500 focus:ring focus:ring-blue-300 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      {filteredBoxes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoxes.map((box) => (
            <BoxCard
              key={box.id}
              box={box}
              visitCount={visitCounts[box.id] || 0}
            />
          ))}
        </div>
      ) : (
        <EmptyBoxState searchQuery={searchQuery} />
      )}
    </div>
  );
};