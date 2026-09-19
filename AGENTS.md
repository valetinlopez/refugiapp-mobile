# Reglas del proyecto Refugiapp Mobile

## Expo
Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Idioma
- El codigo, nombres de componentes, hooks, variables, commits tecnicos y errores internos deben estar en ingles.
- La documentacion para humanos debe estar en espanol.

## Arquitectura
- Leer `architecture.md` del backend (`@backend-architecture`) antes de implementar endpoints.
- El frontend vive bajo la arquitectura feature-based con Expo Router.
- Cada feature organiza: components, hooks, api, types.
- El shared contiene componentes reutilizables entre features.
- El core contiene infraestructura: cliente API, storage, config.

## API
- Consumir la API del backend bajo el prefijo `/api/v1`.
- Los tipos TypeScript deben derivar del `openapi.json` del backend.
- Usar JWT para autenticacion; el token se almacena en secure storage.
- Los endpoints y sus permisos estan documentados en `architecture.md` del backend.

## Datos
- Los IDs principales son UUID.
- Los estados de animales siguen el enum `animal_status` del backend.
- Los datos monetarios se manejan en centavos (`amountCents`).

## Seguridad
- Nunca almacenar tokens en AsyncStorage; usar expo-secure-store o keychain.
- Nunca exponer tokens en logs o errores.
- Implementar PKCE para OAuth2 si aplica.
- Usar HTTPS exclusivamente.

## Testing
- Unit tests para logica de negocio y hooks.
- Component tests con React Native Testing Library.
- E2E solo para flujos criticos (login, flujo principal).
