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

La rotación concurrente queda en RFG-86. Sin binarios en E2E.

## CI

El workflow `mobile-e2e.yml` valida los flows en cada PR (~1 min) y levanta el
emulador solo cuando cambia `maestro/**`, en push a `develop` o con dispatch
manual. Para forzar el emulador en un PR que no toca `maestro/`, agregar el
label `e2e`. El job pesado usa cachés de Gradle, AVD y Maestro CLI.
