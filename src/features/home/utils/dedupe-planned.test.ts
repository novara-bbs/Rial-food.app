import { describe, it, expect } from 'vitest';
import { filterUnloggedPlanned, findNextPlanned } from './dedupe-planned';
import type { Recipe } from '../../../types';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

const recipe = (id: string, title: string): Recipe => ({
  id,
  title,
  description: '',
  image: '',
  prepTime: '',
  cookTime: '',
  difficulty: 'Fácil',
  macros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
  tags: [],
});

const logEntry = (title: string): DailyLogEntry => ({
  id: Math.floor(Math.random() * 1e9),
  title,
  portionDescription: '',
  mealSlot: 'lunch',
  time: '13:00',
  macros: { cal: 0, pro: 0, carbs: 0, fats: 0 },
});

describe('filterUnloggedPlanned', () => {
  it('returns the same list when no log entries match', () => {
    const planned = [recipe('1', 'Pollo'), recipe('2', 'Ensalada')];
    expect(filterUnloggedPlanned(planned, [logEntry('Tortilla')])).toEqual(planned);
  });

  it('filters out planned meals already logged (case-insensitive)', () => {
    const planned = [recipe('1', 'Pollo al limón'), recipe('2', 'Ensalada')];
    const log = [logEntry('POLLO AL LIMÓN')];
    expect(filterUnloggedPlanned(planned, log)).toEqual([planned[1]]);
  });

  it('matches with surrounding whitespace trimmed', () => {
    const planned = [recipe('1', 'Pollo')];
    const log = [logEntry('  pollo  ')];
    expect(filterUnloggedPlanned(planned, log)).toEqual([]);
  });

  it('handles empty planned list', () => {
    expect(filterUnloggedPlanned([], [logEntry('x')])).toEqual([]);
  });

  it('handles empty log list', () => {
    const planned = [recipe('1', 'Pollo')];
    expect(filterUnloggedPlanned(planned, [])).toEqual(planned);
  });

  it('removes all planned when every title is logged', () => {
    const planned = [recipe('1', 'A'), recipe('2', 'B')];
    expect(filterUnloggedPlanned(planned, [logEntry('a'), logEntry('b')])).toEqual([]);
  });
});

describe('findNextPlanned', () => {
  it('returns the first unlogged planned meal in render order', () => {
    const planned = [recipe('1', 'A'), recipe('2', 'B'), recipe('3', 'C')];
    const log = [logEntry('A')];
    expect(findNextPlanned(planned, log)?.id).toBe('2');
  });

  it('returns null when all planned are logged', () => {
    const planned = [recipe('1', 'A')];
    expect(findNextPlanned(planned, [logEntry('a')])).toBeNull();
  });

  it('returns null when planned list is empty', () => {
    expect(findNextPlanned([], [])).toBeNull();
  });
});
