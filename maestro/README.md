# E2E con Maestro (RFG-85)

Suites por rol sobre staging con seeds. Las credenciales llegan por entorno,
nunca se versionan.

## Requisitos

- Maestro CLI instalado (`curl -Ls "https://get.maestro.mobile.dev" | bash`).
- App staging instalada en el emulador (`APP_ID` según `app.config.ts`).
- Variables: `APP_ID`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`,
  `E2E_MANAGER_EMAIL`, `E2E_MANAGER_PASSWORD`, `E2E_VET_EMAIL`,
  `E2E_VET_PASSWORD`.

## Ejecución local

```bash
npm run e2e
# o un flow puntual:
maestro test maestro/admin.yaml --env APP_ID=app.refugiapp.mobile.staging
```

## Flows

| Flow                   | Rol             | Qué verifica                                                   |
| ---------------------- | --------------- | -------------------------------------------------------------- |
| `admin.yaml`           | admin           | dashboard → detalle → completar tarea → clínica                |
| `shelter-manager.yaml` | shelter_manager | operativo sin clínica                                          |
| `veterinarian.yaml`    | veterinarian    | lectura + clínica, sin escritura                               |
| `clinical-denied.yaml` | shelter_manager | ausencia de `clinical-history`                                 |
| `session-expired.yaml` | admin           | logout + sin restauración de sesión                            |
| `session-restore.yaml` | admin           | sesión persistida se restaura tras el relaunch                 |
| `offline.yaml`         | admin           | sin red: cache visible + `OfflineState` con reintento          |
| `online-restore.yaml`  | admin           | al volver la red: reintento carga y sesión válida sin login    |
| `medical-history.yaml` | admin           | registro → historial → paginación → actor + diff campo a campo |
| `audit.yaml`           | admin           | lista → detalle → filtro por acción → resultados legibles      |

### Seeds para RFG-132 (historial médico y auditoría)

Ambos flows requieren datos deterministas en staging:

- **`medical-history.yaml`**: un animal con un registro médico (`consultation`) que tenga
  **más de 20 cambios** en `medical_record_changes` (fuerza 2+ páginas de 20). El cambio
  **más reciente** debe ser un `update` que modifica `diagnosis`, autorizado por el usuario
  E2E admin cuyo `displayName` es `E2E Admin`. Así el primer cambio de la lista presenta el
  badge `Actualización`, el actor `E2E Admin` y el diff del campo `Diagnóstico` en español.
- **`audit.yaml`**: al menos un evento `user.create` con `actor` enriquecido (nombre + email,
  RFG-128) para poder filtrar por la acción "Usuario creado" y abrir un detalle con actor
  por nombre.

La rotación concurrente y el single-flight (RFG-86) se cubren con unit tests del
cliente HTTP (`src/core/api/client.test.ts`) y con los E2E de rotación del
backend (Testcontainers); `session-expired.yaml` y `session-restore.yaml` actúan
como proxy en dispositivo porque staging no expone TTL corto ni inyección de
tokens vencidos. Sin binarios en E2E.

## CI

El workflow `mobile-e2e.yml` valida los flows en cada PR (~1 min) y levanta el
emulador solo cuando cambia `maestro/**`, en push a `develop` o con dispatch
manual. Para forzar el emulador en un PR que no toca `maestro/`, agregar el
label `e2e`. El job pesado usa cachés de Gradle, AVD y Maestro CLI. CI ejecuta la lista
explícita de flows (ver `mobile-e2e.yml`), no `maestro test maestro`, para no
correr `helpers/` como flows standalone. Los flows `offline.yaml` y
`online-restore.yaml` corren con la red cortada y rehabilitada vía
`adb shell svc wifi/data`; `offline.yaml` exige una sesión admin vigente del
flow anterior (sin relaunch, para conservar la cache en memoria).
