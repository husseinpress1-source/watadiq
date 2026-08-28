import { chunk as lodashChunk } from 'lodash';
import moment from 'moment';
import cn from 'classnames';

export { cn };

export function formatDate(date: string): string {
  return moment(date).format('MMMM D, YYYY');
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return lodashChunk(arr, size);
}
