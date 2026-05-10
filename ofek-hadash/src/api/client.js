const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // schedule
  getSchedule: ()                                   => request('/schedule/'),
  getTodayLog: ()                                   => request('/schedule/today'),
  logBlock: (block_id, date, completed, score)      => request('/schedule/log', {
    method: 'POST', body: JSON.stringify({ block_id, date, completed, score }),
  }),
  createBlock: (data)                               => request('/schedule/', { method: 'POST', body: JSON.stringify(data) }),
  updateBlock: (id, data)                           => request(`/schedule/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBlock: (id)                                 => request(`/schedule/${id}`, { method: 'DELETE' }),

  // tasks
  getTasks: ()                                      => request('/tasks/'),
  createTask: (task)                                => request('/tasks/', { method: 'POST', body: JSON.stringify(task) }),
  toggleTask: (id, completed)                       => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
  deleteTask: (id)                                  => request(`/tasks/${id}`, { method: 'DELETE' }),

  // progress
  getWeekly: ()                                     => request('/progress/weekly'),
  getToday: ()                                      => request('/progress/today'),
  logCigarettes: (count_today)                      => request('/progress/cigarettes', { method: 'POST', body: JSON.stringify({ count_today }) }),
  getCigarettesToday: ()                            => request('/progress/cigarettes/today'),
  logExercise: (type, duration_mins, pain_level)    => request('/progress/exercise', { method: 'POST', body: JSON.stringify({ type, duration_mins, pain_level }) }),
  getExerciseToday: ()                              => request('/progress/exercise/today'),

  // settings
  getSettings: ()                                   => request('/settings/'),
  updateSetting: (key, value)                       => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),

  // commander
  morningBrief: ()                                  => request('/commander/morning-brief'),
  chat: (messages)                                  => request('/commander/chat', { method: 'POST', body: JSON.stringify({ messages }) }),
  getChatHistory: (limit = 50)                      => request(`/commander/history?limit=${limit}`),

  // health
  health: ()                                        => request('/health'),
};
