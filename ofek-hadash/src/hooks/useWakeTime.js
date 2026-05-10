import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useWakeTime() {
  const [wakeHour, setWakeHour] = useState(5);
  const [wakeMin,  setWakeMin]  = useState(0);

  useEffect(() => {
    api.getSettings().then(s => {
      if (s.wake_hour)   setWakeHour(Number(s.wake_hour));
      if (s.wake_minute) setWakeMin(Number(s.wake_minute));
    }).catch(() => {});
  }, []);

  return { wakeHour, wakeMin };
}
