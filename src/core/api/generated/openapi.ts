/**
 * Archivo generado. No editar manualmente.
 * Fuente: openapi/auth.openapi.json
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
