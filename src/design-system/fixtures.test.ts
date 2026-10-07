import { formatDateMedium } from '@/components/patterns';
import { isUuid } from '@/core/validation';

import {
  ANIMAL_EVENT_FIXTURES,
  ANIMAL_FIXTURES,
  ATTACHMENT_FIXTURES,
  AUDIT_LOG_FIXTURES,
  CARE_TASK_FIXTURES,
  DESIGN_SYSTEM_NOW,
  EXPENSE_FIXTURES,
  FIXTURE_UUIDS,
  MEDICAL_RECORD_FIXTURES,
  USER_FIXTURES,
  VETERINARIAN_FIXTURES,
} from './fixtures';
import { formatAmountCents } from './format';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ANIMAL_STATUSES = new Set([
  'admitted',
  'under_treatment',
  'available_for_adoption',
  'adopted',
  'deceased',
]);
const CARE_TASK_STATUSES = new Set(['pending', 'completed', 'cancelled']);
const ATTACHMENT_STATUSES = new Set(['ready', 'uploading', 'error']);

describe('deterministic fixtures (D06 / RFG-139)', () => {
  it('anchors relative task states to a frozen instant', () => {
    expect(DESIGN_SYSTEM_NOW.getTime()).toBe(new Date('2026-09-20T12:00:00-03:00').getTime());
  });

  it('uses fixed, valid UUIDs for every synthetic id', () => {
    Object.values(FIXTURE_UUIDS).forEach((id) => expect(isUuid(id)).toBe(true));
  });

  it('keeps animals within the contract enum and normalized dates', () => {
    ANIMAL_FIXTURES.forEach((animal) => {
      expect(isUuid(animal.id)).toBe(true);
      expect(ANIMAL_STATUSES.has(animal.status)).toBe(true);
      expect(animal.intakeDate).toMatch(DATE_ONLY);
      expect(animal.birthDate).toMatch(DATE_ONLY);
      expect(formatDateMedium(animal.intakeDate).length).toBeGreaterThan(0);
    });
  });

  it('keeps care tasks within the persisted states', () => {
    CARE_TASK_FIXTURES.forEach((task) => {
      expect(isUuid(task.id)).toBe(true);
      expect(CARE_TASK_STATUSES.has(task.status)).toBe(true);
      expect(Number.isNaN(new Date(task.dueAt).getTime())).toBe(false);
    });
  });

  it('stores money as non-negative integer cents in ARS', () => {
    EXPENSE_FIXTURES.forEach((expense) => {
      expect(Number.isInteger(expense.amountCents)).toBe(true);
      expect(expense.amountCents).toBeGreaterThanOrEqual(0);
      expect(expense.incurredAt).toMatch(DATE_ONLY);
      expect(formatAmountCents(expense.amountCents)).toContain('$');
    });
  });

  it('keeps clinical records on valid instants', () => {
    MEDICAL_RECORD_FIXTURES.forEach((record) => {
      expect(Number.isNaN(new Date(record.occurredAt).getTime())).toBe(false);
    });
  });

  it('uses reserved synthetic identities, never real personal data', () => {
    VETERINARIAN_FIXTURES.forEach((vet) =>
      expect(vet.email.endsWith('@refugiapp.test')).toBe(true)
    );
    AUDIT_LOG_FIXTURES.forEach((log) =>
      expect(log.actorEmail.endsWith('@refugiapp.test')).toBe(true)
    );
    USER_FIXTURES.forEach((user) => expect(user.email.endsWith('@refugiapp.test')).toBe(true));
  });

  it('keeps attachments within the supported lifecycle states', () => {
    ATTACHMENT_FIXTURES.forEach((attachment) =>
      expect(ATTACHMENT_STATUSES.has(attachment.status)).toBe(true)
    );
    ANIMAL_EVENT_FIXTURES.forEach((event) => expect(event.id.length).toBeGreaterThan(0));
  });

  it('does not depend on external services', () => {
    const serialized = JSON.stringify({
      ANIMAL_EVENT_FIXTURES,
      ANIMAL_FIXTURES,
      ATTACHMENT_FIXTURES,
      AUDIT_LOG_FIXTURES,
      CARE_TASK_FIXTURES,
      EXPENSE_FIXTURES,
      MEDICAL_RECORD_FIXTURES,
      USER_FIXTURES,
      VETERINARIAN_FIXTURES,
    });
    expect(serialized).not.toContain('http');
  });
});
