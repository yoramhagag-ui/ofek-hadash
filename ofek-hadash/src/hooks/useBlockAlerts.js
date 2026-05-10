import { useEffect, useRef } from 'react';
import { speakText } from '../api/tts';
import { getCurrentBlock } from '../utils/timeUtils';

export function useBlockAlerts(blocks, wakeHour, wakeMin, voiceEnabled = true) {
  const lastBlockIdRef = useRef(null);

  useEffect(() => {
    if (!voiceEnabled || !blocks.length) return;

    const check = () => {
      const current = getCurrentBlock(blocks, wakeHour, wakeMin);
      if (!current) return;
      if (current.id === lastBlockIdRef.current) return;

      lastBlockIdRef.current = current.id;
      speakText(`הגיע הזמן ל${current.name}. בואו נתחיל.`).catch(() => {});
    };

    // check immediately on mount, then every 60s
    check();
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, [blocks, wakeHour, wakeMin, voiceEnabled]);
}
