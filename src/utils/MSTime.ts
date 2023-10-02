export interface MSTimerEntry {
  timestamp: number;
  start: number;
  end?: number;
  diff: number;
  avg?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { [key: string]: any };
}

export interface MSTimer {
  name: string;
  diff: number;
  last: number;
  sum: number;
  avg: number;
  count: number;
  entries: MSTimerEntry[];
}

const format = (floatNum: number): number => {
  return parseFloat(floatNum.toFixed(2));
};

const present = (): number => {
  const time = process.hrtime();

  return time[0] * 1e3 + time[1] / 1e6;
};

const msTrimMean = (timerData: MSTimer): { totalEntries: number; sum: number; mean: number } => {
  const sortedArr = timerData.entries.slice().sort((a, b) => a.diff - b.diff);
  const l = sortedArr.length;
  const low = Math.round(l * 0.2);
  const high = l - low;
  const finalArr = sortedArr.slice(low, high);
  let sum = 0;

  finalArr.map((e) => {
    sum += e.diff;
    return e;
  });

  return {
    totalEntries: finalArr.length,
    sum: format(sum),
    mean: format(sum / finalArr.length),
  };
};

const timers: { [timerName: string]: MSTimer } = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const start = (timerName: string, data?: { [key: string]: any }): MSTimer => {
  const startTime = present(); // should be the very first operation!

  timers[timerName] = timers[timerName] || {
    entries: [],
  };

  const entry: MSTimerEntry = {
    timestamp: Date.now(),
    start: startTime,
    diff: 0,
  };

  if (data) {
    entry.data = data;
  }

  timers[timerName].entries.push(entry);

  return timers[timerName];
};

const end = (timerName: string): MSTimer | null => {
  const endTime = present(); // should be the very first operation!
  const timer = timers[timerName];

  if (!timer) {
    return null; // missing data (user called "end" without calling "start" first).
  }

  const { entries } = timer;
  const lastEntry = entries[entries.length - 1];

  lastEntry.diff = endTime - lastEntry.start;
  // calculate for more useful values
  timer.last = lastEntry.diff;
  timer.sum = (timer.sum || 0) + lastEntry.diff;
  timer.avg = timer.sum / entries.length;
  // --- stop calculating from this point => format data: (formatting will affect any calculation)
  timer.name = timerName;
  lastEntry.avg = timer.avg; // keep current avg in each entry
  timer.last = format(timer.last);
  lastEntry.start = format(lastEntry.start);
  lastEntry.end = format(endTime);
  lastEntry.diff = format(lastEntry.diff);
  timer.sum = format(timer.sum);
  timer.avg = format(timer.avg);
  timer.count = entries.length;

  return {
    ...timer,
    ...msTrimMean(timer),
  };
};

export default {
  timers,
  start,
  end,
};
