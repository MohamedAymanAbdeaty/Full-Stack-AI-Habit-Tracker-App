import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const toDateKey = (date) => format(date, 'yyyy-MM-dd');

export const todayKey = () => toDateKey(new Date());

export const last90Days = () => {
  const end = new Date();
  const start = subDays(end, 89);
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

export const currentWeekKeys = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // 1 = Monday
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

export const lastNDays = (n) => {
  const end = new Date();
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

const dayNumberFromKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / (1000 * 60 * 60 * 24));
};

export const calcStreak = (dates) => {
  if (!dates || dates.length === 0) return { current: 0, longest: 0 };

  const dateSet = new Set(dates);
  const today = todayKey();
  const yesterday = toDateKey(subDays(new Date(), 1));

  let current = 0;


  if (!dateSet.has(today) && !dateSet.has(yesterday)) {
    current = 0;
  } else {
    
    let checkDate = dateSet.has(today) ? new Date() : subDays(new Date(), 1);
    
    while (dateSet.has(toDateKey(checkDate))) {
      current++;
      checkDate = subDays(checkDate, 1);
    }
  }

  const sorted = [...dateSet].sort();
  let longest = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = dayNumberFromKey(sorted[i - 1]);
    const curr = dayNumberFromKey(sorted[i]);
    const diff = curr - prev;
    
    if (diff === 1) {
      run++;
    } else {
      run = 1;
    }
    
    if (run > longest) longest = run;
  }

  return { current, longest };
};