import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { defaultBlocks } from '../data/defaultSchedule';

export function useSchedule() {
  const [blocks, setBlocks]       = useState(defaultBlocks);
  const [completed, setCompleted] = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSchedule();
      if (data && data.length > 0) {
        // map backend snake_case → camelCase
        setBlocks(data.map(b => ({
          id:           b.id,
          name:         b.block_name,
          icon:         b.icon,
          offsetMins:   b.offset_mins,
          durationMins: b.duration_mins,
          category:     b.category,
          color:        b.color,
        })));
      }
      // load today's completions
      const today = await api.getTodayLog();
      const map = {};
      today.forEach(row => { map[row.block_id] = row.completed; });
      setCompleted(map);
      setError(null);
    } catch (e) {
      // fallback to default data silently
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (blockId) => {
    const next = !completed[blockId];
    setCompleted(prev => ({ ...prev, [blockId]: next }));
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.logBlock(blockId, today, next, null);
    } catch {
      // revert on failure
      setCompleted(prev => ({ ...prev, [blockId]: !next }));
    }
  }, [completed]);

  return { blocks, completed, toggle, loading, error };
}
