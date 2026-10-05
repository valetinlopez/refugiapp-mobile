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
    AuthResponseDto: {
      accessToken: string;
      tokenType: string;
      expiresIn: string;
      refreshToken: string;
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
    RefreshTokenDto: {
      refreshToken: string;
    };
    ChangePasswordDto: {
      currentPassword: string;
      newPassword: string;
    };
    RequestPasswordResetDto: {
      email: string;
    };
    PasswordResetRequestedDto: {
      message: string;
    };
    ConfirmPasswordResetDto: {
      token: string;
      newPassword: string;
    };
    CreateUserDto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      roles?: ('admin' | 'shelter_manager' | 'veterinarian')[];
    };
    UserResponseDto: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: ('admin' | 'shelter_manager' | 'veterinarian')[];
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    PaginatedUsersResponseDto: {
      items: components['schemas']['UserResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    UpdateUserDto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      roles?: ('admin' | 'shelter_manager' | 'veterinarian')[];
    };
    Object: Record<string, unknown>;
    AuditActorDto: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    AuditLogResponseDto: {
      id: string;
      actorUserId?: string | null;
      action:
        | 'user.create'
        | 'user.deactivate'
        | 'user.activate'
        | 'user.role_assign'
        | 'medical_record.create'
        | 'medical_record.update'
        | 'medical_record.soft_delete'
        | 'medical_record.restore'
        | 'expense.create'
        | 'expense.soft_delete'
        | 'care_task.create'
        | 'care_task.update'
        | 'care_task.complete'
        | 'care_task.cancel'
        | 'auth.login_success'
        | 'auth.login_failure'
        | 'auth.refresh_success'
        | 'auth.refresh_failure'
        | 'auth.password_change'
        | 'auth.password_reset_requested'
        | 'auth.password_reset_completed'
        | 'auth.password_reset_failed'
        | 'access.denied'
        | 'push.device_register'
        | 'push.device_remove'
        | 'push.preferences_update'
        | 'push.dispatch_completed'
        | 'push.token_invalid';
      resourceType:
        | 'user'
        | 'medical_record'
        | 'expense'
        | 'care_task'
        | 'auth_session'
        | 'authorization'
        | 'notification';
      resourceId?: string | null;
      metadata: Record<string, unknown>;
      occurredAt: string;
      createdAt: string;
      actor?: components['schemas']['AuditActorDto'] | null;
    };
    PaginatedAuditLogsResponseDto: {
      items: components['schemas']['AuditLogResponseDto'][];
      page: number;
      limit: number;
      total: number;
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
      breed?: string | null;
      sex: 'female' | 'male' | 'unknown';
      status: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      intakeDate: string;
      birthDate?: string | null;
      notes?: string | null;
      profilePhotoMediaId?: string | null;
    };
    PaginatedAnimalsResponseDto: {
      items: components['schemas']['AnimalResponseDto'][];
      page: number;
      limit: number;
      total: number;
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
    UploadMediaAssetBodyDto: {
      ownerType?: 'animal' | 'expense_ticket' | 'medical_record' | 'user' | 'veterinarian';
      ownerId?: string;
    };
    MediaAssetResponseDto: {
      id: string;
      ownerType?: 'animal' | 'expense_ticket' | 'medical_record' | 'user' | 'veterinarian' | null;
      ownerId?: string | null;
      resourceType: 'image' | 'video' | 'raw';
      publicId: string;
      secureUrl: string;
      bytes?: number;
      format?: string;
      uploadedByUserId?: string;
      metadata?: Record<string, unknown>;
    };
    PaginatedMediaAssetsResponseDto: {
      items: components['schemas']['MediaAssetResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    CreateVeterinarianUserDto: {
      email?: string;
      password: string;
      firstName?: string;
      lastName?: string;
    };
    CreateVeterinarianDto: {
      firstName: string;
      lastName: string;
      licenseNumber: string;
      email?: string;
      phone?: string;
      userId?: string | null;
      createUser?: components['schemas']['CreateVeterinarianUserDto'];
      notes?: string | null;
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
      user?: components['schemas']['UserResponseDto'] | null;
    };
    PaginatedVeterinariansResponseDto: {
      items: components['schemas']['VeterinarianResponseDto'][];
      page: number;
      limit: number;
      total: number;
    };
    UpdateVeterinarianDto: {
      firstName?: string;
      lastName?: string;
      licenseNumber?: string;
      userId?: string | null;
      email?: string | null;
      phone?: string | null;
      notes?: string | null;
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
      ticketMediaId?: string | null;
      createdByUserId?: string | null;
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
    ChangeActorDto: {
      id: string;
      firstName: string;
      lastName: string;
    };
    MedicalRecordChangeResponseDto: {
      id: string;
      medicalRecordId: string;
      changedByUserId?: string | null;
      changeType: 'update' | 'soft_delete' | 'restore';
      changedFields: string[];
      previousValues: Record<string, unknown>;
      changedAt: string;
      changedBy?: components['schemas']['ChangeActorDto'] | null;
    };
    PaginatedMedicalRecordChangesResponseDto: {
      items: components['schemas']['MedicalRecordChangeResponseDto'][];
      page: number;
      limit: number;
      total: number;
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
    CreateCareTaskDto: {
      animalId: string;
      title: string;
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
    UpdateCareTaskDto: {
      title?: string;
      description?: string | null;
      dueAt?: string | null;
    };
    DashboardTotalsDto: {
      animals: number;
      byStatus: Record<string, unknown>;
    };
    DashboardAnimalDto: {
      id: string;
      name: string;
      species: string;
      status: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      profilePhotoMediaId?: string | null;
    };
    DashboardOverviewResponseDto: {
      totals: components['schemas']['DashboardTotalsDto'];
      recentAnimals: components['schemas']['DashboardAnimalDto'][];
    };
    RegisterDeviceDto: {
      expoPushToken: string;
      platform: 'ios' | 'android';
      timezone: string;
      appVersion?: string;
    };
    DeviceSubscriptionResponseDto: {
      id: string;
      platform: string;
      timezone: string;
      appVersion?: string | null;
      tokenSuffix: string;
      isActive: boolean;
      lastSeenAt: string;
    };
    NotificationPreferenceResponseDto: {
      overdueEnabled: boolean;
      upcomingEnabled: boolean;
      upcomingWindowMinutes: number;
      quietStart: string | null;
      quietEnd: string | null;
      timezone: string;
    };
    UpdatePreferencesDto: {
      overdueEnabled?: boolean;
      upcomingEnabled?: boolean;
      upcomingWindowMinutes?: number;
      quietStart?: string | null;
      quietEnd?: string | null;
      timezone?: string;
    };
    NotificationDeliveryResponseDto: {
      id: string;
      dedupKey: string;
      careTaskId: string;
      kind: string;
      status: string;
      lastErrorCode: string | null;
      attemptCount: number;
      createdAt: string;
    };
  };
}
