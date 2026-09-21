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
      breed?: string;
      sex?: 'female' | 'male' | 'unknown';
      status?: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      intakeDate: string;
      birthDate?: string;
      profilePhotoMediaId?: string;
    };
    AnimalResponseDto: {
      id: string;
      name: string;
      species: string;
      breed?: Record<string, unknown>;
      sex: 'female' | 'male' | 'unknown';
      status: 'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';
      intakeDate: string;
      birthDate?: string;
      notes?: Record<string, unknown>;
      profilePhotoMediaId?: Record<string, unknown>;
    };
    PaginatedAnimalsResponseDto: {
      items: components['schemas']['AnimalResponseDto'][];
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
      ownerType?: 'animal' | 'expense_ticket' | 'medical_record' | 'user' | 'veterinarian';
      ownerId?: Record<string, unknown>;
      resourceType: 'image' | 'video' | 'raw';
      publicId: string;
      secureUrl: string;
      bytes?: number;
      format?: string;
      uploadedByUserId?: string;
      metadata?: Record<string, unknown>;
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
  };
}
