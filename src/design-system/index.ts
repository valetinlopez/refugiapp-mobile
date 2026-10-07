export { ReferenceValidationSection } from './components/ReferenceValidationSection';
export { ReferenceCaseCard } from './components/ReferenceCaseCard';
export type { ReferenceCaseCardProps } from './components/ReferenceCaseCard';
export { ReferencePreview } from './referencePreviews';
export {
  REFERENCE_CASES,
  REFERENCE_GROUPS,
  getReferenceCase,
  referenceCasesByGroup,
} from './referenceCases';
export type { ReferenceGroup } from './referenceCases';
export { REFERENCE_VIEWPORTS } from './viewports';
export type { ReferenceViewport, ReferenceViewportId } from './viewports';
export { DESIGN_SYSTEM_NOW, FIXTURE_UUIDS } from './fixtures';
export type {
  AnimalEventFixture,
  AnimalFixture,
  AuditLogFixture,
  CareTaskFixture,
  ExpenseFixture,
  MedicalRecordFixture,
  UserFixture,
  VeterinarianFixture,
} from './fixtures';
export { DIVERGENCE_KINDS, REFERENCE_STATES } from './types';
export type {
  DivergenceKind,
  ReferenceCase,
  ReferenceDivergence,
  ReferenceGroupId,
  ReferenceStateId,
} from './types';
