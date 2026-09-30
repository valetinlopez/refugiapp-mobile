import { capabilitiesForRoles } from '@/application/authorization';
import { filterQuickActions, QUICK_ACTIONS } from './quickActions';

describe('filterQuickActions', () => {
  it('offers alta, nueva tarea, gasto and gestión to admin', () => {
    const actions = filterQuickActions(QUICK_ACTIONS, capabilitiesForRoles(['admin']));
    expect(actions.map((action) => action.id)).toEqual([
      'new-animal',
      'new-task',
      'new-expense',
      'manage-users',
    ]);
  });

  it('keeps the canonical action order declared by the registry', () => {
    expect(QUICK_ACTIONS.map((action) => action.id)).toEqual([
      'new-animal',
      'new-task',
      'new-expense',
      'manage-users',
    ]);
  });

  it('never exposes the audit destination from home', () => {
    expect(QUICK_ACTIONS.every((action) => action.requiredCapability !== 'canReadAudit')).toBe(
      true
    );
  });

  it('offers the same writer actions to shelter managers', () => {
    const actions = filterQuickActions(QUICK_ACTIONS, capabilitiesForRoles(['shelter_manager']));
    expect(actions.map((action) => action.id)).toEqual(['new-animal', 'new-task', 'new-expense']);
  });

  it('hides every writer action for veterinarians', () => {
    const actions = filterQuickActions(QUICK_ACTIONS, capabilitiesForRoles(['veterinarian']));
    expect(actions).toEqual([]);
  });

  it('keeps only the actions allowed by a merged set of roles', () => {
    const actions = filterQuickActions(QUICK_ACTIONS, capabilitiesForRoles(['veterinarian']));
    expect(actions.some((action) => action.id === 'new-expense')).toBe(false);
  });
});
