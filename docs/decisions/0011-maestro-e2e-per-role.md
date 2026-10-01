# ADR-0011: E2E móvil por rol con Maestro

- Estado: aceptado
- Fecha: 2026-09-30
- Ticket: RFG-85 (épica RFG-54)

## Contexto

RFG-85 exige cubrir `login → dashboard → detalle de animal → completar tarea`
para cada rol (`admin`, `shelter_manager`, `veterinarian`), más alta de animal y
registro médico para roles con permiso, negativa clínica para
`shelter_manager`, y logout más expiración básica. La ejecución debe correr en
CI con Maestro o herramienta equivalente.

El repo no tenía infra E2E: sin carpeta `maestro/`, sin `testID` estables en
formularios críticos y con CI limitado a `api:generate + format + lint +
typecheck + jest`. La base sí es sólida: sesión real con refresh single-flight,
matriz central `ROLE_CAPABILITIES` en `src/application/authorization`, rutas
delgadas Expo Router y `accessibilityLabel` en español en casi toda la UI.

RFG-60 (backend, cerrada) ya cubre dashboard, care-tasks y rotación concurrente
en servidor. RFG-86 cubre expiración y rotación a fondo en dispositivo. Para no
duplicar, RFG-85 se acota a logout más sesión expirada básica; la concurrencia
y el single-flight quedan en RFG-86.

## Alternativas consideradas

1. **Maestro (elegida).** Flows YAML declarativos, selectores por `testID` o
   texto accesible, sin eject ni código nativo, corre sobre build Expo de
   staging en emulador de CI. Mantenimiento bajo y curva corta para tres roles.
2. **Detox.** Más control (sincronización gris, mocks nativos), pero exige
   builds nativos por sabor, más flakiness en Expo Go y mayor costo de
   mantenimiento para 5 story points.
3. **Playwright sobre expo-web.** Rápido y barato, pero no valida iOS/Android
   reales (Secure Store, DateTimePicker nativo, permisos de cámara) y dejaría
   fuera el criterio "en CI con Maestro o equivalente" en dispositivo.

## Decisión

- Adoptar **Maestro** como runner E2E con suites en `maestro/`: helpers
  `login`/`logout`/`reset` más `admin.yaml`, `shelter-manager.yaml`,
  `veterinarian.yaml`, `clinical-denied.yaml` y `session-expired.yaml`.
- Estrategia dual de selectores: `accessibilityLabel` en español (humano,
  accesible, estable para SEO/web) más `testID` en inglés kebab-case (máquina,
  estable para Maestro). Los `testID` no contienen PII, tokens ni UUID reales.
- Entorno: staging con seeds (`admin`, `shelter_manager`, `veterinarian` más un
  animal con una tarea `pending`). Credenciales solo por variables de entorno
  y secrets de CI, nunca en YAML ni logs.
- Alcance RFG-85: recorridos por rol, negativa clínica de `shelter_manager`,
  logout y access expirado con refresh válido/inválido. Sin binarios
  (foto/PDF) en E2E; esos caminos quedan en unit/component con transporte
  falso.
- CI nuevo `mobile-e2e.yml` (Android emulator + Maestro CLI + app staging) sin
  bloquear `mobile-ci.yml` el día uno; artefactos JUnit más screenshots solo en
  fallo.

## Consecuencias positivas

- Tres roles cubiertos con flows legibles y reejecutables en local y CI.
- Selectores estables ante cambios de copy en español.
- Sin secretos en repo ni payloads clínicos en logs (`toApiErrorMessage` como
  fallback seguro).
- Base reutilizable para RFG-86 (expiración/rotación), RFG-87 (offline) y
  RFG-88 (accesibilidad).

## Costes y riesgos

- Requiere staging con seeds estables; sin seeds los flows son flaky. Mitiga
  con datos fijos y `retry` acotado de Maestro.
- Maestro no controla concurrencia fina de refresh; por eso ese caso vive en
  RFG-86 con unit tests del cliente HTTP.
- Los `testID` agregan superficie de API pública de testeo: cambiarlos exige
  actualizar YAML y documentar en el `AGENTS.md` local.

## Criterios de revisión

- Si el backend publica `type`/responsable en care-tasks, ampliar el flow de
  alta sin romper los selectores existentes.
- Si aparece paginación UI de historial/clínica, agregar scroll/assert
  paginado en el mismo flow.
- Si Maestro queda corto (mocks nativos, biometría), reevaluar Detox en un ADR
  nuevo sin reescribir este.
