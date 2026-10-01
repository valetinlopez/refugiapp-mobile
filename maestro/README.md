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

| Flow                   | Rol             | Qué verifica                                    |
| ---------------------- | --------------- | ----------------------------------------------- |
| `admin.yaml`           | admin           | dashboard → detalle → completar tarea → clínica |
| `shelter-manager.yaml` | shelter_manager | operativo sin clínica                           |
| `veterinarian.yaml`    | veterinarian    | lectura + clínica, sin escritura                |
| `clinical-denied.yaml` | shelter_manager | ausencia de `clinical-history`                  |
| `session-expired.yaml` | admin           | logout + sin restauración de sesión             |
| `session-restore.yaml` | admin           | sesión persistida se restaura tras el relaunch  |

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
correr `helpers/` como flows standalone.
