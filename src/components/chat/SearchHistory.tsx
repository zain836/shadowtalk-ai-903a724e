import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const saveSearchToHistory = async (userId: string, query: string) => {
  if (!userId || !query) return;
  await supabase.from('search_history').insert({ user_id: userId, query });
};

export const SearchHistory = ({ userId }: { userId: string }) => {
  const [history, setHistory] = useState<{ id: string; query: string }[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('search_history')
        .select('id, query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      setHistory(data || []);
    };
    fetchHistory();
  }, [userId]);

  return (
    <div>
      <h3>Search History</h3>
      <ul>
        {history.map((item) => (
          <li key={item.id}>{item.query}</li>
        ))}
      </ul>
    </div>
  );
};
