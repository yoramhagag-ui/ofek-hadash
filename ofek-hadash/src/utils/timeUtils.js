export const getBlockTime = (wakeHour, wakeMin, offsetMins) => {
  const total = wakeHour * 60 + wakeMin + offsetMins;
  return {
    h: Math.floor(total / 60) % 24,
    m: total % 60,
  };
};

export const formatTime = (h, m) =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

export const getMinutesSinceWake = (wakeHour, wakeMin) => {
  const now = new Date();
  const wakeTotal = wakeHour * 60 + wakeMin;
  const nowTotal = now.getHours() * 60 + now.getMinutes();
  return nowTotal - wakeTotal;
};

export const getCurrentBlock = (blocks, wakeHour, wakeMin) => {
  const elapsed = getMinutesSinceWake(wakeHour, wakeMin);
  return blocks.find((block, i) => {
    const next = blocks[i + 1];
    return elapsed >= block.offsetMins && (!next || elapsed < next.offsetMins);
  });
};
