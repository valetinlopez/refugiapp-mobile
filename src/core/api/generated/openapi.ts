/**
 * Archivo generado. No editar manualmente.
 * Fuente: openapi/mobile.openapi.json
 * Ejecutar: npm run api:generate
 */

export interface components {
  schemas: {
    LoginDto: {
      email: string;
      password: string;
    };
    RefreshTokenDto: {
      refreshToken: string;
    };
    AuthResponseDto: {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresIn: string;
      refreshExpiresIn: string;
    };
    AuthenticatedUser: {
      id: string;
      email: string;
      roles: ('admin' | 'shelter_manager' | 'veterinarian')[];
    };
    CreateAnimalDto: {
      name: string;
      species: string;
      breed?: string | null;
      sex?: 'female' | 'male' | 'unknown';
      status?: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      intakeDate: string;
      birthDate?: string | null;
      profilePhotoMediaId?: string;
    };
    AnimalResponseDto: {
      id: string;
      name: string;
      species: string;
      breed?: Record<string, unknown> | null;
      sex: 'female' | 'male' | 'unknown';
      status: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      intakeDate: string;
      birthDate?: string | null;
      notes?: Record<string, unknown> | null;
      profilePhotoMediaId?: Record<string, unknown> | null;
    };
    UpdateAnimalDto: {
      name?: string;
      species?: string;
      breed?: string | null;
      sex?: 'female' | 'male' | 'unknown';
      intakeDate?: string;
      birthDate?: string | null;
      profilePhotoMediaId?: string | null;
    };
    ChangeAnimalStatusDto: {
      status: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      occurredAt?: string;
    };
    PaginatedAnimalsResponseDto: {
      items: components['schemas']['AnimalResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    CreateAnimalHistoryEventDto: {
      eventType: 'general_note' | 'behavior_note' | 'transfer';
      description: string;
      occurredAt?: string;
    };
    AnimalHistoryEventResponseDto: {
      id: string;
      animalId: string;
      eventType:
        'intake' | 'transfer' | 'status_change' | 'behavior_note' | 'adoption' | 'general_note';
      description: string;
      occurredAt: string;
      createdByUserId?: string | null;
      metadata?: Record<string, unknown>;
    };
    PaginatedAnimalHistoryEventsResponseDto: {
      items: components['schemas']['AnimalHistoryEventResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    CreateCareTaskDto: {
      animalId: string;
      title: string;
      description?: string | null;
      dueAt?: string | null;
    };
    UpdateCareTaskDto: {
      title?: string;
      description?: string | null;
      dueAt?: string | null;
    };
    CareTaskResponseDto: {
      id: string;
      animalId: string;
      title: string;
      description?: string | null;
      status: 'pending' | 'completed' | 'cancelled';
      dueAt?: string | null;
      completedAt?: string | null;
      createdByUserId?: string | null;
      createdAt: string;
      updatedAt: string;
    };
    PaginatedCareTasksResponseDto: {
      items: components['schemas']['CareTaskResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    UploadMediaAssetBodyDto: {
      ownerType?: 'animal' | 'expense_ticket' | 'medical_record' | 'user' | 'veterinarian';
      ownerId?: string;
    };
    MediaAssetResponseDto: {
      id: string;
      ownerType?: 'animal' | 'expense_ticket' | 'medical_record' | 'user' | 'veterinarian' | null;
      ownerId?: Record<string, unknown> | null;
      resourceType: 'image' | 'video' | 'raw';
      publicId: string;
      secureUrl: string;
      bytes?: number;
      format?: string;
      uploadedByUserId?: string;
      metadata?: Record<string, unknown>;
    };
    CreateExpenseDto: {
      animalId: string;
      category: 'food' | 'medicine' | 'veterinary' | 'supplies' | 'transport' | 'other';
      amountCents: number;
      currency: string;
      description: string;
      incurredAt: string;
      ticketMediaId?: string;
    };
    ExpenseResponseDto: {
      id: string;
      animalId: string;
      category: 'food' | 'medicine' | 'veterinary' | 'supplies' | 'transport' | 'other';
      amountCents: number;
      currency: string;
      description: string;
      ticketMediaId?: Record<string, unknown> | null;
      createdByUserId?: Record<string, unknown> | null;
      incurredAt: string;
      createdAt: string;
      updatedAt: string;
    };
    PaginatedExpensesResponseDto: {
      items: components['schemas']['ExpenseResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    CreateMedicalRecordDto: {
      animalId: string;
      veterinarianId?: string;
      recordType:
        | 'consultation'
        | 'vaccination'
        | 'deworming'
        | 'surgery'
        | 'lab_result'
        | 'treatment'
        | 'other';
      title: string;
      occurredAt: string;
      diagnosis?: string;
      treatment?: string;
      notes?: string;
      attachmentMediaIds?: string[];
    };
    UpdateMedicalRecordDto: {
      recordType?:
        | 'consultation'
        | 'vaccination'
        | 'deworming'
        | 'surgery'
        | 'lab_result'
        | 'treatment'
        | 'other';
      title?: string;
      occurredAt?: string;
      veterinarianId?: string | null;
      diagnosis?: string | null;
      treatment?: string | null;
      notes?: string | null;
    };
    MedicalRecordResponseDto: {
      id: string;
      animalId: string;
      veterinarianId?: string | null;
      recordType:
        | 'consultation'
        | 'vaccination'
        | 'deworming'
        | 'surgery'
        | 'lab_result'
        | 'treatment'
        | 'other';
      title: string;
      diagnosis?: string | null;
      treatment?: string | null;
      notes?: string | null;
      occurredAt: string;
      createdAt: string;
      updatedAt: string;
    };
    PaginatedMedicalRecordsResponseDto: {
      items: components['schemas']['MedicalRecordResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    VeterinarianResponseDto: {
      id: string;
      userId?: string | null;
      firstName: string;
      lastName: string;
      licenseNumber: string;
      email?: string | null;
      phone?: string | null;
      notes?: string | null;
      isActive: boolean;
      createdAt?: string;
      updatedAt?: string;
    };
    PaginatedVeterinariansResponseDto: {
      items: components['schemas']['VeterinarianResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    PaginatedMediaAssetsResponseDto: {
      items: components['schemas']['MediaAssetResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    ErrorResponseDto: {
      statusCode: number;
      code: string;
      message: string | string[];
      error: string;
      timestamp: string;
      path: string;
      requestId?: string;
    };
    SpeciesResponseDto: {
      id: string;
      slug: string;
      labelEs: string;
    };
    SpeciesListResponseDto: {
      items: components['schemas']['SpeciesResponseDto'][];
    };
    BreedResponseDto: {
      id: string;
      speciesId: string;
      slug: string;
      labelEs: string;
    };
    BreedListResponseDto: {
      items: components['schemas']['BreedResponseDto'][];
    };
  };
}
