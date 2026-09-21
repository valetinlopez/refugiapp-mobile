# Arquitectura de Refugiapp Mobile

> Estado: vigente. Este documento describe el estado real del frontend móvil y separa explícitamente lo implementado de lo planificado.

## 1. Propósito

Este documento es la fuente de verdad para la arquitectura del frontend móvil de Refugiapp. Define:

- Las fronteras entre rutas, features, infraestructura y UI compartida.
- La dirección permitida de dependencias.
- La integración con la API de Refugiapp.
- Las reglas de seguridad, navegación, estado, testing y documentación.
- El estado implementado y la deuda conocida.

Los detalles visuales viven en `docs/design.md`. Los contratos del servidor y permisos viven en `../refugiapp/architecture.md` y en el OpenAPI del backend. Los `AGENTS.md` locales detallan reglas de cada área.

## 2. Contexto tecnológico

| Área                | Tecnología                          | Decisión                                                              |
| ------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Runtime             | Node.js 22.13+                      | Mínimo requerido por Expo SDK 57                                      |
| Framework           | Expo SDK 57                         | Runtime y tooling móvil                                               |
| UI                  | React Native 0.86 + React 19.2      | Base multiplataforma                                                  |
| Lenguaje            | TypeScript estricto                 | `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`   |
| Navegación          | Expo Router                         | Rutas basadas en archivos                                             |
| Red                 | Axios                               | Cliente HTTP central con interceptores                                |
| Estado servidor     | TanStack Query                      | Dependencia instalada; integración de providers y hooks aún pendiente |
| Persistencia segura | Expo Secure Store                   | Tokens JWT y datos secretos pequeños                                  |
| Diseño              | Tokens propios + Expo Symbols       | Sistema compartido documentado en `docs/design.md`                    |
| Testing             | Jest + React Native Testing Library | Unit y component tests                                                |
| Calidad             | ESLint + Prettier + TypeScript      | Gates locales obligatorios                                            |

## 3. Principios arquitectónicos

### 3.1 Organización por feature

Cada capacidad de producto vive en `src/features/<feature>`. Una feature puede contener:

```text
feature/
  api/          # Funciones HTTP de la feature
  components/   # UI específica del dominio
  hooks/        # Orquestación de estado y casos de uso de UI
  types/        # Tipos de vista y aliases derivados del contrato generado
  utils/        # Transformaciones puras exclusivas de la feature, si hacen falta
  AGENTS.md     # Responsabilidad, contratos, permisos, invariantes y tests
```

No se crean carpetas vacías. La estructura crece cuando existe una responsabilidad real.

### 3.2 Rutas delgadas

`app/` es la capa de composición. Una ruta puede:

1. Leer parámetros de navegación.
2. Componer providers y componentes de una feature.
3. Definir opciones de navegación.
4. Resolver redirecciones de alto nivel según sesión o permisos.

Una ruta no debe contener llamadas directas a Axios, persistencia, transformaciones de dominio ni componentes visuales complejos reutilizables.

### 3.3 Infraestructura aislada

`src/core` centraliza integración con entorno y plataforma:

- `api`: cliente HTTP, headers transversales, normalización de errores y renovación de sesión.
- `config`: lectura y validación de variables de entorno.
- `storage`: adaptadores seguros de persistencia.

`core` no conoce componentes, pantallas ni reglas específicas de animales, gastos o tareas.

### 3.4 UI compartida sin dominio

`src/components` contiene primitivas, feedback, navegación y patrones reutilizables. `src/theme` contiene tokens y el provider visual. Estas capas no importan `src/features` ni realizan llamadas de red.

Un patrón puede representar una estructura recurrente —por ejemplo, una fila de tarea—, pero la traducción desde un DTO de API debe ocurrir en la feature que consume el patrón.

## 4. Dirección de dependencias

```text
app
 ├─> features
 ├─> components
 ├─> theme
 └─> core (solo bootstrap/configuración transversal)

features
 ├─> core
 ├─> components
 ├─> theme
 └─> contratos API generados

components ─> theme
theme ─> React Native
core ─> librerías de infraestructura
```

Reglas:

- `core`, `components` y `theme` nunca importan features.
- Una feature no importa archivos internos de otra feature.
- `app` no exporta lógica reutilizable hacia `src`.
- Los aliases `@/*` apuntan a `src/*` y `@app/*` a `app/*`.
- Los ciclos de dependencias no están permitidos.

## 5. Estructura actual

```text
app/
  (auth)/                  # Rutas públicas de autenticación
  (app)/
    (tabs)/                # Área autenticada con navegación inferior
  _layout.tsx              # Providers y stack raíz
  design-system.tsx        # Catálogo interno
src/
  components/
    primitives/
    feedback/
    navigation/
    patterns/
  core/
    api/
    config/
    storage/
  features/
    auth/
    animals/
  theme/
  types/
docs/
  design.md
  documentation-governance.md
  decisions/
  templates/
```

Cada frontera relevante contiene un `AGENTS.md`. La regla efectiva para un archivo es la combinación del `AGENTS.md` raíz y el más cercano en su árbol.

## 6. Navegación

Expo Router es la fuente de verdad de navegación:

- `(auth)` agrupa pantallas públicas.
- `(app)` agrupa el área autenticada.
- `(tabs)` define la navegación principal.
- `design-system` es una ruta interna de validación visual; no es una pantalla de producción.
- `_layout.tsx` raíz carga fuentes, safe areas, tema y navegación global.

La protección real de sesión y roles todavía no está implementada. Cuando se agregue, debe resolverse en layouts o providers de aplicación, no repetirse en cada pantalla.

## 7. Integración con la API

### 7.1 Base URL

`src/core/config/env.ts` valida el ambiente y una URL absoluta que termina en `/api/v1`. HTTP solo se permite para hosts locales en development; staging y production requieren HTTPS.

### 7.2 Cliente HTTP

`src/core/api/client.ts` configura Axios y adjunta el access token. La renovación de tokens existe de forma inicial, pero aún debe consolidarse para usar exclusivamente `tokenStorage`, tipar los errores y evitar solicitudes de refresh concurrentes.

Las features exponen funciones HTTP en su carpeta `api`. Los componentes y rutas no llaman al cliente directamente.

### 7.3 Contratos

El OpenAPI del backend debe convertirse en la fuente de tipos de red. Flujo objetivo:

```text
openapi.json del backend
  -> generación de tipos versionada/reproducible
  -> cliente o aliases de red
  -> mapper de feature
  -> modelo de vista
  -> componente
```

Los tipos manuales existentes en `auth` y `animals` son scaffolding y presentan divergencias conocidas. No deben ampliarse sin reconciliarlos primero con OpenAPI.

### 7.4 Errores

La infraestructura debe normalizar errores técnicos a una forma segura. Las features traducen códigos de aplicación a mensajes y acciones de UI. Nunca se muestra al usuario un stack trace, token, URL sensible o payload clínico completo.

## 8. Estado y flujo de datos

- TanStack Query será responsable de cache, deduplicación, reintentos controlados e invalidaciones de datos remotos.
- Estado efímero de formulario o presentación permanece local cuando no necesita compartirse.
- No duplicar respuestas completas del servidor en un store global.
- Las derivaciones visuales se calculan de forma pura y testeable; por ejemplo, `overdue` no se persiste.
- Las actualizaciones optimistas solo se incorporan cuando exista una estrategia explícita de rollback.

El provider de TanStack Query y los hooks de features todavía están pendientes.

## 9. Autenticación y autorización

Roles válidos:

- `admin`
- `shelter_manager`
- `veterinarian`

Los access y refresh tokens se almacenan con Expo Secure Store. La aplicación no debe inferir permisos únicamente desde la presencia de un botón: el backend sigue siendo autoridad final.

El contrato actual del backend implementa login, refresh y logout. La pantalla y función de registro del scaffolding no deben considerarse funcionalidad soportada hasta que el backend publique ese endpoint.

El flujo objetivo de sesión es:

```text
inicio
  -> leer sesión segura
  -> validar/renovar si corresponde
  -> área autenticada o login
  -> ante logout o refresh inválido, limpiar tokens y cache sensible
```

## 10. Dominios y permisos relevantes

La matriz completa vive en la arquitectura del backend. Para el frontend:

- Los tres roles pueden consultar animales.
- Solo `admin` y `shelter_manager` crean o editan la ficha general y cambian estado.
- Solo `admin` y `veterinarian` acceden a historia clínica.
- Todos los roles gestionan tareas, con restricciones al completar tareas clínicas.
- `shelter_manager` no recibe actividad clínica reciente en dashboard.
- Solo `admin` consulta auditoría y administra usuarios.

La UI por rol se deriva de esta matriz y debe actualizarse cuando cambie el backend.

## 11. Datos e invariantes

- IDs principales: UUID.
- Fechas de API: strings ISO 8601; parsear en el límite y formatear para la locale de UI.
- Dinero: enteros `amountCents`; no usar flotantes para lógica monetaria.
- Animal: `admitted | under_treatment | available_for_adoption | adopted | deceased`.
- Tarea persistida: `pending | completed | cancelled`.
- `overdue`: tarea `pending` con `dueAt < now`.
- `upcoming`: tarea `pending` dentro de la ventana definida por producto.
- `clinical`: característica del tipo, no estado.
- En presentación de tareas pendientes prevalece `overdue`, luego `upcoming`, luego `clinical`.

## 12. Sistema de diseño

`src/theme` es la fuente ejecutable de color, tipografía, espacio, radios, tamaños y sombras. `docs/design.md` es la explicación humana. Ambos deben cambiar juntos.

Los componentes compartidos se dividen en:

- `primitives`: bloques atómicos.
- `feedback`: carga, vacío, error y offline.
- `navigation`: navegación reutilizable.
- `patterns`: composiciones sin acceso a red.

No se incorpora `react-native-svg` mientras las formas nativas y `expo-symbols` resuelvan el caso.

## 13. Testing

Pirámide prevista:

1. Unit tests para configuración, transformaciones, permisos derivados y hooks puros.
2. Component tests para interacción, accesibilidad y estados.
3. Integration tests para hooks de feature con red simulada en el límite HTTP.
4. E2E solo para login, recuperación de sesión y flujo principal.

Una feature nueva debe cubrir al menos lógica no trivial, estados de error y las restricciones de rol que representa.

## 14. Documentación viva

La documentación es parte de la definición de terminado. La jerarquía es:

1. Backend OpenAPI y `../refugiapp/architecture.md`: contrato del servidor.
2. `architecture.md`: fronteras y estado técnico del móvil.
3. `AGENTS.md` raíz: reglas globales de trabajo.
4. `AGENTS.md` locales: reglas específicas por área.
5. `docs/design.md`: sistema visual.
6. `docs/decisions/`: decisiones y trade-offs históricos.
7. `README.md`: entrada operativa para instalar y ejecutar.

La matriz de actualización está en `docs/documentation-governance.md`.

## 15. Flujo para agregar una feature

1. Confirmar endpoint, permisos y tipos en backend/OpenAPI.
2. Crear `src/features/<feature>/AGENTS.md` desde la plantilla.
3. Agregar solo las carpetas necesarias.
4. Implementar tipos de red derivados, API y mapper.
5. Implementar hooks y estados de UI.
6. Componer la pantalla desde `app/`.
7. Agregar tests proporcionales al riesgo.
8. Actualizar este documento si cambian fronteras o flujos.
9. Actualizar README, diseño o ADR según la matriz documental.
10. Ejecutar los gates de calidad.

## 16. Estado implementado

- Expo SDK 57, TypeScript estricto y Expo Router.
- Configuración validada para development, staging y production.
- Cliente Axios con token y renovación inicial.
- Storage seguro de access y refresh tokens.
- Scaffolding de APIs de auth y animals.
- Sistema de diseño, componentes compartidos y catálogo interno.
- Tests unitarios y de componentes.
- ESLint, Prettier, typecheck y export web verificados.
- Jerarquía de documentación y reglas locales por frontera.

## 17. Pendientes y deuda conocida

- Generar tipos TypeScript desde `openapi.json` y eliminar contratos manuales divergentes.
- Corregir `auth/types.ts`: contiene roles que no existen en el backend.
- Retirar o bloquear el registro público hasta que exista contrato de backend.
- Corregir `animals/types.ts`: contiene estados ajenos al enum real y campos provisionales.
- Retirar el `DELETE /animals/:id` provisional; el backend actual no documenta ese endpoint.
- Centralizar todo acceso a tokens mediante `tokenStorage`.
- Resolver concurrencia y tipado en refresh de sesión.
- Incorporar QueryClientProvider y hooks de TanStack Query.
- Implementar guards de sesión y roles en navegación.
- Agregar tests E2E de flujos críticos.
- Validar el sistema visual en dispositivos iOS y Android reales.

Los pendientes no se consideran implementados hasta que exista código, contrato y tests cuando corresponda.

## 18. Comandos de verificación

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npx expo export --platform web --output-dir dist
```
