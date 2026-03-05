import { 
  addDays, subDays, addMonths, addYears,
  isSaturday, isSunday, 
  nextMonday, nextWednesday, nextTuesday, nextThursday, nextFriday, nextSaturday, nextSunday,
  isBefore, format, parse, startOfDay, isPast, isToday as dateFnsIsToday
} from "date-fns";
import { ru } from "date-fns/locale";

export function getNextWorkingDay(date: Date): Date {
  if (isSaturday(date)) return addDays(date, 2);
  if (isSunday(date)) return addDays(date, 1);
  return date;
}

export function getPrevWorkingDay(date: Date): Date {
  if (isSaturday(date)) return subDays(date, 1);
  if (isSunday(date)) return subDays(date, 2);
  return date;
}

export function calculateDate(action: string, baseDate: Date = new Date()): Date {
  switch (action) {
    case 'Завтра':
      return getNextWorkingDay(addDays(baseDate, 1));
    case 'Через день':
      return getNextWorkingDay(addDays(baseDate, 2));
    case 'Через неделю':
      return getNextWorkingDay(addDays(baseDate, 7));
    case 'Через месяц':
      return getPrevWorkingDay(addMonths(baseDate, 1));
    case 'Через год':
      return getPrevWorkingDay(addYears(baseDate, 1));
    case 'Пн/Ср': {
      const m = nextMonday(baseDate);
      const w = nextWednesday(baseDate);
      return isBefore(m, w) ? m : w;
    }
    case 'Вт/Чт': {
      const t = nextTuesday(baseDate);
      const th = nextThursday(baseDate);
      const f = nextFriday(baseDate);
      const closest = [t, th, f].reduce((a, b) => isBefore(a, b) ? a : b);
      return closest;
    }
    case 'Вых': {
      const s1 = nextSaturday(baseDate);
      const s2 = nextSunday(baseDate);
      return isBefore(s1, s2) ? s1 : s2;
    }
    case 'Custom':
    default:
      return baseDate;
  }
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateKey(key: string): Date {
  return parse(key, 'yyyy-MM-dd', new Date());
}

export function formatFriendlyDate(date: Date): string {
  const formatted = format(date, 'EEEE, d MMMM yyyy', { locale: ru });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function isPastDay(key: string): boolean {
  if (['goals', 'everyday', 'done'].includes(key)) return false;
  const date = parseDateKey(key);
  return isPast(date) && !dateFnsIsToday(date);
}

export function isToday(key: string): boolean {
  if (['goals', 'everyday', 'done'].includes(key)) return false;
  return dateFnsIsToday(parseDateKey(key));
}
