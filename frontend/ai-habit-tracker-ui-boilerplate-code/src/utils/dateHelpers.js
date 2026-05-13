import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

export const toKey = (d) => format(d, "yyyy-MM-dd");
export const todayKey = () => toKey(new Date());

export const last7Days = () => {
  const end = new Date();
  const start = subDays(end, 6);
  return eachDayOfInterval({ start, end }).map((d) => ({
    key: toKey(d),
    label: format(d, "EEE"),
    short: format(d, "d"),
    date: d,
  }));
};

export const last90Days = () => {
  const end = new Date();
  const start = subDays(end, 89);
  return eachDayOfInterval({ start, end }).map((d) => toKey(d));
};

export const weekKeys = () => weekKeysFor(new Date());

export const weekKeysFor = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((d) => ({
    key: toKey(d),
    label: format(d, "EEE"),
    short: format(d, "d"),
    date: d,
  }));
};

export const prettyDate = (d) => format(d instanceof Date ? d : new Date(d), "MMM d, yyyy");

const dayNumberFromKey = (key) => {
  const [y, m, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, day) / (1000 * 60 * 60 * 24));
};

export const streakFromKeys = (keys) => {
  if (!keys?.length) return { current: 0, longest: 0 };
  const set = new Set(keys);
  const today = todayKey();
  const yKey = toKey(subDays(new Date(), 1));
  let current = 0;
  let cursor = new Date();
  if (!set.has(today) && !set.has(yKey)) {
    current = 0;
  } else {
    if (!set.has(today)) cursor = subDays(cursor, 1);
    while (set.has(toKey(cursor))) {
      current += 1;
      cursor = subDays(cursor, 1);
    }
  }
  const sorted = [...keys].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const k of sorted) {
    if (prev) {
      const diff = dayNumberFromKey(k) - dayNumberFromKey(prev);
      run = diff === 1 ? run + 1 : 1;
    } else run = 1;
    if (run > longest) longest = run;
    prev = k;
  }
  return { current, longest };
};
