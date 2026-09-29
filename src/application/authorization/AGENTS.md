# Reglas para `src/application/authorization`

## Responsabilidad

- Centraliza el registro de capacidades que refleja la matriz publicada por el backend.
- Expone transformaciones puras desde roles autenticados hacia capacidades de aplicación.
- Filtra destinos declarativos mediante `requiredCapability`, sin conocer componentes ni rutas concretas.

## Dependencias

- Los roles se derivan directamente del OpenAPI generado.
- No importar features, componentes, tema ni Expo Router.
- Los hooks que conectan estas funciones con la sesión viven en `src/features/auth`.

## Seguridad

- La ausencia de rol o una capacidad no reconocida deniega acceso por defecto.
- Esta matriz controla presentación y navegación; el backend sigue siendo la autoridad final.
- Cualquier cambio debe contrastarse con `../refugiapp/src/common/authorization/role-capabilities.ts`.

## Testing

- Cubrir cada combinación rol/capacidad, roles múltiples, ausencia de roles y filtrado de destinos.
