import { useState, useEffect } from 'react';
import { api } from '../api/client';

const MOCK = [
  { day: 'א׳', score: 55, cigarettes: 18, exercise_mins: 30 },
  { day: 'ב׳', score: 70, cigarettes: 15, exercise_mins: 40 },
  { day: 'ג׳', score: 45, cigarettes: 20, exercise_mins: 0  },
  { day: 'ד׳', score: 80, cigarettes: 12, exercise_mins: 45 },
  { day: 'ה׳', score: 75, cigarettes: 14, exercise_mins: 35 },
  { day: 'ו׳', score: 90, cigarettes: 10, exercise_mins: 50 },
  { day: 'ש׳', score: 60, cigarettes: 16, exercise_mins: 20 },
];

export function useProgress() {
  const [data, setData]       = useState(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWeekly()
      .then(d => { if (d?.length) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
