import { ApiError } from '@/core/api';
import { UploadCancelledError } from '@/core/media';

export type CreateMedicalRecordPhase = 'attachment' | 'create';
export type UpdateMedicalRecordPhase = 'attachment' | 'update';

export class CreateMedicalRecordError extends Error {
  readonly phase: CreateMedicalRecordPhase;
  readonly rootError: unknown;

  constructor(phase: CreateMedicalRecordPhase, rootError: unknown) {
    super('No pudimos registrar la consulta clínica.');
    this.name = 'CreateMedicalRecordError';
    this.phase = phase;
    this.rootError = rootError;
  }
}

export class UpdateMedicalRecordError extends Error {
  readonly phase: UpdateMedicalRecordPhase;
  readonly rootError: unknown;

  constructor(phase: UpdateMedicalRecordPhase, rootError: unknown) {
    super('No pudimos guardar los cambios del registro clínico.');
    this.name = 'UpdateMedicalRecordError';
    this.phase = phase;
    this.rootError = rootError;
  }
}

function unwrapCreate(error: unknown): { phase: CreateMedicalRecordPhase; root: unknown } {
  if (error instanceof CreateMedicalRecordError) {
    return { phase: error.phase, root: error.rootError };
  }
  return { phase: 'create', root: error };
}

function unwrapUpdate(error: unknown): { phase: UpdateMedicalRecordPhase; root: unknown } {
  if (error instanceof UpdateMedicalRecordError) {
    return { phase: error.phase, root: error.rootError };
  }
  return { phase: 'update', root: error };
}

export function toCreateMedicalRecordErrorMessage(error: unknown): string {
  const { phase, root } = unwrapCreate(error);

  if (root instanceof UploadCancelledError) {
    return 'La subida fue cancelada. Los archivos huérfanos ya subidos se eliminaron.';
  }

  if (root instanceof ApiError) {
    if (root.status === 400 || root.status === 422) {
      if (phase === 'attachment') {
        return 'Un adjunto no es válido. Elige archivos de hasta 10 MB e inténtalo de nuevo.';
      }
      if (root.code === 'OCCURRED_AT_IN_FUTURE') {
        return 'La fecha y hora no puede ser futura.';
      }
      if (root.code === 'OCCURRED_AT_BEFORE_INTAKE') {
        return 'La fecha y hora no puede ser anterior al ingreso del animal.';
      }
      return 'Revisa los datos del registro clínico e inténtalo de nuevo.';
    }

    switch (root.status) {
      case 403:
        return 'Tu rol no tiene permiso para registrar datos clínicos.';
      case 404:
        return 'El animal, el veterinario o un adjunto ya no están disponibles.';
      case 409:
        return root.code === 'VETERINARIAN_INACTIVE'
          ? 'El veterinario seleccionado ya no está activo. Elige otro e inténtalo de nuevo.'
          : 'Un adjunto ya está vinculado a otro registro. Elige otro archivo e inténtalo de nuevo.';
      default:
        return root.message;
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function toUpdateMedicalRecordErrorMessage(error: unknown): string {
  const { phase, root } = unwrapUpdate(error);

  if (root instanceof UploadCancelledError) {
    return 'La subida fue cancelada. No se guardaron adjuntos incompletos.';
  }

  if (root instanceof ApiError) {
    if (root.status === 400 || root.status === 422) {
      if (phase === 'attachment') {
        return 'Un adjunto no es válido. Elige archivos de hasta 10 MB e inténtalo de nuevo.';
      }
      if (root.code === 'OCCURRED_AT_IN_FUTURE') {
        return 'La fecha y hora no puede ser futura.';
      }
      if (root.code === 'OCCURRED_AT_BEFORE_INTAKE') {
        return 'La fecha y hora no puede ser anterior al ingreso del animal.';
      }
      return 'Revisa los datos del registro clínico e inténtalo de nuevo.';
    }

    switch (root.status) {
      case 403:
        return 'Tu rol no tiene permiso para editar datos clínicos.';
      case 404:
        return 'El registro clínico ya no está disponible.';
      case 409:
        return root.code === 'VETERINARIAN_INACTIVE'
          ? 'El veterinario seleccionado ya no está activo. Elige otro e inténtalo de nuevo.'
          : root.message;
      default:
        return root.message;
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
