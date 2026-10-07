# Reglas para `src/application/management`

## Responsabilidad

- Declara los destinos de la sección "Gestión" y la capacidad requerida por cada uno.
- Filtra el registro mediante la autorización central, sin conocer componentes ni detalles visuales.
- Mantiene la coordinación entre veterinarios, usuarios y auditoría fuera de cualquier feature de dominio.

## Dependencias

- Puede importar `src/application/authorization`.
- No importar features, componentes, tema ni Expo Router.
- Las rutas son strings de aplicación; la capa `app/` las adapta al tipo de navegación de Expo Router.

## Invariantes

- `veterinarians` está disponible para cualquier sesión autenticada.
- `users` requiere `canManageUsers`.
- `audit` requiere `canReadAudit`.
- Agregar un destino exige definir su capacidad aquí y su presentación accesible en la ruta consumidora.

## Testing

- Cubrir el registro y el orden para `admin`, `shelter_manager`, `veterinarian` y ausencia de capacidades.
- Cubrir la pérdida de permisos para evitar que queden destinos privilegiados visibles.
- La matriz D11 debe comprobar, para cada rol, tanto destinos visibles como destinos bloqueados; una regresion no puede aprobar solo por encontrar el caso positivo de admin.
