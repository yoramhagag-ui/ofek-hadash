# CLAUDE.md – אופק חדש

## מה האפליקציה הזו

אפליקציית שיקום אישית מבוססת AI בעברית RTL. משתמש יחיד. טלפון \+ טאבלט. PWA.

**מחסנית:**

- Frontend: React \+ Vite \+ Tailwind CSS  
- Backend: FastAPI (Python)  
- DB: Supabase (PostgreSQL)  
- AI מוח: Claude API (Anthropic)  
- AI קול: edge-tts – קול he-IL-HilaNeural (חינמי, ללא API key)

---

## כללי ברזל – לפני כל פעולה

1. **RTL תמיד** – כל טקסט, כל layout, dir="rtl", text-align: right  
2. **עברית בלבד** – כל טקסט למשתמש בעברית. שמות משתנים/קבצים באנגלית  
3. **Mobile first** – בנה קודם לטלפון, אחר כך טאבלט  
4. **לא לבנות הכל בבת אחת** – שלב אחד בכל פעם לפי הסדר למטה  
5. **אחרי כל שלב – בדוק שעובד** לפני שממשיכים

---

## מבנה הפרויקט

commander-app/

├── frontend/

│   ├── src/

│   │   ├── screens/

│   │   │   ├── HomeScreen.jsx

│   │   │   ├── ScheduleScreen.jsx

│   │   │   ├── CommanderScreen.jsx

│   │   │   ├── ProgressScreen.jsx

│   │   │   ├── SettingsScreen.jsx

│   │   │   └── TasksScreen.jsx

│   │   ├── components/

│   │   │   ├── BottomNav.jsx

│   │   │   ├── BlockCard.jsx

│   │   │   ├── ChecklistItem.jsx

│   │   │   ├── AddTaskModal.jsx

│   │   │   └── VoiceButton.jsx

│   │   ├── hooks/

│   │   │   ├── useSchedule.js

│   │   │   ├── useCommander.js

│   │   │   └── useProgress.js

│   │   ├── api/

│   │   │   ├── claude.js

│   │   │   ├── tts.js

│   │   │   └── supabase.js

│   │   ├── App.jsx

│   │   └── main.jsx

├── backend/

│   ├── routers/

│   │   ├── schedule.py

│   │   ├── commander.py

│   │   ├── progress.py

│   │   └── tasks.py

│   ├── services/

│   │   ├── claude\_service.py

│   │   ├── tts\_service.py

│   │   └── supabase\_service.py

│   ├── models/

│   │   └── schemas.py

│   └── main.py

├── CLAUDE.md

└── .env

---

## משתני סביבה – .env

ANTHROPIC\_API\_KEY=

SUPABASE\_URL=

SUPABASE\_ANON\_KEY=

---

## Supabase – טבלאות

### daily\_schedule

create table daily\_schedule (

  id uuid primary key default gen\_random\_uuid(),

  block\_name text not null,

  offset\_mins integer not null,

  duration\_mins integer not null,

  category text,

  is\_active boolean default true,

  created\_at timestamp default now()

);

### daily\_log

create table daily\_log (

  id uuid primary key default gen\_random\_uuid(),

  date date not null,

  block\_id uuid references daily\_schedule(id),

  completed boolean default false,

  score integer,

  notes text,

  created\_at timestamp default now()

);

### cigarette\_log

create table cigarette\_log (

  id uuid primary key default gen\_random\_uuid(),

  timestamp timestamptz default now(),

  count\_today integer default 0

);

### exercise\_log

create table exercise\_log (

  id uuid primary key default gen\_random\_uuid(),

  date date not null,

  type text,

  duration\_mins integer,

  pain\_level integer check (pain\_level between 0 and 10),

  created\_at timestamp default now()

);

### tasks

create table tasks (

  id uuid primary key default gen\_random\_uuid(),

  title text not null,

  due\_date date,

  due\_time time,

  recurrence text default 'once',

  completed boolean default false,

  created\_at timestamp default now()

);

### chat\_history

create table chat\_history (

  id uuid primary key default gen\_random\_uuid(),

  timestamp timestamptz default now(),

  role text check (role in ('user', 'assistant')),

  content text not null

);

### settings

create table settings (

  id uuid primary key default gen\_random\_uuid(),

  key text unique not null,

  value text not null

);

\-- ערכי ברירת מחדל

insert into settings (key, value) values

  ('wake\_hour', '5'),

  ('wake\_minute', '0'),

  ('voice\_enabled', 'true'),

  ('voice\_volume', '0.8'),

  ('target\_cigarettes', '20');

---

## Claude API – System Prompt של אופק חדש

COMMANDER\_SYSTEM\_PROMPT \= """

את אופק חדש – סוכנת AI אישית בעברית.

תפקידך: לנהל את תוכנית השיקום של המשתמש ביד קשוחה אך חומלת.

אישיות:

\- קול נשי, ישראלי, חם אבל ישיר

\- משפטים קצרים – מקסימום 2 משפטים בתגובה

\- לא מתנצלת, לא מחמיאה לשווא

\- מכירה בקושי, לא מאשרת ויתור

\- תמיד מסיימת עם פעולה ברורה אחת

הקשר יומי:

\- שעת קימה: {wake\_time}

\- בלוק נוכחי: {current\_block}

\- ציון יומי עד כה: {daily\_score}

\- סיגריות היום: {cigarettes\_today}

\- האם הושלמה הפעילות: {exercise\_done}

כללים:

\- תמיד בעברית

\- לא מעל 2 משפטים

\- תמיד מסיימת עם פעולה ברורה

"""

---

## edge-tts – הגדרות

\# חינמי, ללא API key, משתמש ב-Microsoft Edge TTS דרך הרשת

\# קול: he-IL-HilaNeural

VOICE \= "he-IL-HilaNeural"

\# התקנה: pip install edge-tts

---

## לוגיקת זמנים – חשוב

כל הזמנים הם **יחסיים לשעת הקימה** – לא מוחלטים.

// חישוב זמן בלוק

const getBlockTime \= (wakeHour, wakeMin, offsetMins) \=\> {

  const total \= wakeHour \* 60 \+ wakeMin \+ offsetMins;

  return { h: Math.floor(total / 60\) % 24, m: total % 60 };

};

// שעת הקימה נשמרת ב-settings

// הבלוק הנוכחי מחושב בזמן אמת

---

## סדר בניית השלבים

### שלב 1 – בסיס (שבוע 1\)

1. `npm create vite@latest frontend -- --template react`  
2. התקן Tailwind CSS  
3. צור מבנה תיקיות  
4. בנה `BottomNav.jsx` עם 6 tabs  
5. בנה `HomeScreen.jsx` – לו"ז בסיסי, ללא API  
6. בנה `ScheduleScreen.jsx` – רשימת בלוקים  
7. חבר ל-Supabase – טען בלוקים מהטבלה  
8. **בדוק: מסכים עוברים, בלוקים נטענים**

### שלב 2 – קול (שבוע 2\)

1. צור FastAPI backend עם endpoint `/tts`  
2. חבר edge-tts – קול he-IL-HilaNeural (pip install edge-tts)  
3. בנה `VoiceButton.jsx`  
4. הוסף התראות קוליות בתחילת כל בלוק  
5. **בדוק: קול עובד בעברית**

### שלב 3 – Claude (שבוע 2-3)

1. צור endpoint `/commander/chat`  
2. חבר Claude API עם System Prompt  
3. בנה `CommanderScreen.jsx` – צ'אט  
4. הוסף יוזמת בוקר אוטומטית  
5. **בדוק: שיחה עובדת, קול \+ טקסט**

### שלב 4 – מעקב (שבוע 3\)

1. בנה `ProgressScreen.jsx`  
2. גרף סיגריות \+ הליכון (Recharts)  
3. ציון יומי אוטומטי  
4. **בדוק: גרפים מציגים נתוני אמת**

### שלב 5 – משימות (שבוע 4\)

1. בנה `TasksScreen.jsx`  
2. `AddTaskModal.jsx` עם חזרה  
3. משימות נכנסות ללו"ז  
4. **בדוק: משימה מתווספת ומופיעה ביום**

### שלב 6 – Polish (שבוע 5-6)

1. עיצוב סופי – צבעים, גופנים, אנימציות  
2. PWA manifest \+ service worker  
3. בדיקות על טלפון אמיתי  
4. **בדוק: עובד offline חלקית**

---

## צבעי העיצוב

:root {

  \--bg-primary: \#0D0D0F;

  \--bg-card: \#1A1A22;

  \--accent-gold: \#C8853A;

  \--accent-green: \#276749;

  \--accent-blue: \#2B6CB0;

  \--accent-purple: \#553C9A;

  \--text-primary: \#E8E6E0;

  \--text-secondary: \#8BA3C7;

  \--success: \#276749;

  \--danger: \#ef4444;

}

---

## כללי קוד

- TypeScript אופציונלי – JS מספיק לשלב זה  
- State management: React hooks (useState, useEffect, useContext)  
- לא Redux – פשוט יותר  
- Fetch ישיר ל-FastAPI – לא Axios בהתחלה  
- Error boundaries על כל מסך  
- Loading states על כל קריאת API

---

## בדיקות לפני Deploy

- [ ] RTL תקין בכל המסכים  
- [ ] קול עובד על Android Chrome  
- [ ] לוגיקת זמנים יחסיים נכונה  
- [ ] Supabase מחזיר נתונים  
- [ ] Claude מגיב בעברית  
- [ ] TTS מגיב תוך שנייה  
- [ ] PWA ניתן להתקנה

