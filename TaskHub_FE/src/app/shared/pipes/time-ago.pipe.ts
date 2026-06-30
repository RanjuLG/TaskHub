import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(deadline?: string | null): string {
    if (!deadline) {
      return '';
    }

    const dueDate = new Date(deadline);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isPastDue = diffMs < 0;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    const formatUnit = (value: number, unit: 'minute' | 'hour' | 'day' | 'week') => {
      const label = value === 1 ? unit : `${unit}s`;
      return isPastDue ? `Due ${value} ${label} ago` : `Due in ${value} ${label}`;
    };

    if (absDiffMs < hour) {
      return formatUnit(Math.max(1, Math.round(absDiffMs / minute)), 'minute');
    }

    if (absDiffMs < day) {
      return formatUnit(Math.max(1, Math.round(absDiffMs / hour)), 'hour');
    }

    if (absDiffMs < week) {
      return formatUnit(Math.max(1, Math.round(absDiffMs / day)), 'day');
    }

    return formatUnit(Math.max(1, Math.round(absDiffMs / week)), 'week');
  }
}