# Reglas para `adoptions`

## Responsabilidad

- Gestiona la carga de adoptantes, las postulaciones por animal, su aprobación y el historial de adopciones.
- No cambia el estado del animal directamente: la aprobación transaccional pertenece al backend.

## Contratos

- `POST /adopters` y `GET /adopters/:id` para datos de contacto.
- `POST /animals/:animalId/adoption-applications` y `GET /animals/:animalId/adoption-applications` para postulaciones.
- `POST /adoption-applications/:id/approve` para completar una adopción.
- `GET /animals/:animalId/adoptions` para el historial.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.
- Estados de postulación: `pending`, `approved` y `rejected`.

## Permisos

- `admin` y `shelter_manager` pueden crear adoptantes, registrar/listar postulaciones, consultar sus datos y aprobarlas.
- `veterinarian` solo puede consultar el historial de adopciones, que no expone datos de contacto.
- La autorización visual mejora la experiencia; el backend vuelve a validar cada operación.

## Estructura

- `api/`: consumo de los cinco endpoints de adopciones.
- `components/`: formulario y presentación del proceso por animal.
- `hooks/`: queries, mutations, paginación e invalidaciones internas.
- `types.ts`: aliases derivados del OpenAPI generado.
- `utils/`: validación, presentación y mensajes de error.

## Seguridad y privacidad

- Nombre, email, teléfono y domicilio del adoptante son datos personales: no se persisten fuera de la caché en memoria ni se incluyen en logs o errores visibles.
- El historial disponible para veterinarios no consulta perfiles de adoptantes.
- No se realizan actualizaciones optimistas al aprobar: el estado cambia solo con la respuesta confirmada del servidor.

## Testing

- Unit tests para esquema, presentación y traducción segura de errores.
- Hook tests para invalidaciones y aprobación.
- Component tests para permisos, estados, confirmación y accesibilidad.

## Estado

### Implementado

- Alta de adoptante seguida del registro de una postulación para un animal disponible.
- Listado paginado de postulaciones para roles gestores, con datos de contacto protegidos.
- Aprobación confirmada de postulaciones pendientes.
- Historial paginado de adopciones visible para los tres roles.

### Pendiente o deuda conocida

- El backend no publica búsqueda de adoptantes existentes; un email ya registrado se informa como conflicto y no puede reutilizarse desde la aplicación hasta que exista ese contrato.
