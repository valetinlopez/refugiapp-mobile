import {
  REFERENCE_CASES,
  REFERENCE_GROUPS,
  getReferenceCase,
  referenceCasesByGroup,
} from './referenceCases';
import { DIVERGENCE_KINDS, REFERENCE_STATES } from './types';

const EXPECTED_REFERENCE_FILES = [
  '01-login.jpeg',
  '02-more-section.jpeg',
  '03-my-profile.jpeg',
  '04-user-create.jpeg',
  '05-animal-detail-history.jpeg',
  '06-animal-status-change.jpeg',
  '07-animal-edit.jpeg',
  '08-animal-event-new.jpeg',
  '09-animal-files-upload.jpeg',
  '10-care-tasks-overview.jpeg',
  '11-care-task-new.jpeg',
  '12-care-task-detail.jpeg',
  '13-expenses-overview.jpeg',
  '14-expense-new.jpeg',
  '15-expense-detail.jpeg',
  '16-clinical-history-overview.jpeg',
  '17-medical-record-new.jpeg',
  '18-medical-record-detail.jpeg',
  '19-veterinarians-list.jpeg',
  '20-veterinarian-new.jpeg',
  '21-veterinarian-profile.jpeg',
  '22-audit-list.jpeg',
  '23-audit-detail.jpeg',
  '24-dashboard-home.jpeg',
  '25-animals-list.jpeg',
] as const;

describe('reference cases (D06 / RFG-139)', () => {
  it('covers exactly the 25 references of D01, in order', () => {
    expect(REFERENCE_CASES).toHaveLength(25);
    expect(REFERENCE_CASES.map((referenceCase) => referenceCase.referenceFile)).toEqual(
      EXPECTED_REFERENCE_FILES
    );
  });

  it('assigns a stable D06 id and position to every case', () => {
    REFERENCE_CASES.forEach((referenceCase, position) => {
      const expectedId = `D06-${String(position + 1).padStart(2, '0')}`;
      expect(referenceCase.id).toBe(expectedId);
      expect(referenceCase.index).toBe(position + 1);
    });
    expect(new Set(REFERENCE_CASES.map((referenceCase) => referenceCase.id)).size).toBe(25);
  });

  it('keeps every reference file with the D01 kebab-case naming', () => {
    REFERENCE_CASES.forEach((referenceCase) => {
      expect(referenceCase.referenceFile).toMatch(/^\d{2}-[a-z0-9-]+\.jpeg$/);
      expect(referenceCase.route.length).toBeGreaterThan(0);
      expect(referenceCase.audience.length).toBeGreaterThan(0);
    });
  });

  it('uses only known states and divergence kinds', () => {
    const knownStates = new Set<string>(REFERENCE_STATES);
    const knownKinds = new Set<string>(DIVERGENCE_KINDS);
    REFERENCE_CASES.forEach((referenceCase) => {
      expect(referenceCase.states.length).toBeGreaterThan(0);
      referenceCase.states.forEach((state) => expect(knownStates.has(state)).toBe(true));
      expect(referenceCase.divergences.length).toBeGreaterThan(0);
      referenceCase.divergences.forEach((divergence) => {
        expect(knownKinds.has(divergence.kind)).toBe(true);
        expect(divergence.note.length).toBeGreaterThan(0);
      });
    });
  });

  it('assigns every case to a declared group', () => {
    const groupIds = new Set(REFERENCE_GROUPS.map((group) => group.id));
    expect(groupIds.size).toBe(REFERENCE_GROUPS.length);
    REFERENCE_CASES.forEach((referenceCase) =>
      expect(groupIds.has(referenceCase.group)).toBe(true)
    );

    const grouped = REFERENCE_GROUPS.flatMap((group) => referenceCasesByGroup(group.id));
    expect(grouped).toHaveLength(25);
    expect(new Set(grouped.map((referenceCase) => referenceCase.id)).size).toBe(25);
  });

  it('resolves cases by id and returns undefined for unknown ids', () => {
    expect(getReferenceCase('D06-01')?.referenceFile).toBe('01-login.jpeg');
    expect(getReferenceCase('D06-23')?.referenceFile).toBe('23-audit-detail.jpeg');
    expect(getReferenceCase('D06-99')).toBeUndefined();
  });
});
