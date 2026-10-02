# Runbook de builds internos y publicación

> Estado: la configuración del repositorio está implementada. La ejecución en EAS requiere una sesión autorizada, el proyecto vinculado, una URL real de staging y credenciales de firma. Ningún build se declara exitoso hasta que EAS entregue el artefacto y se complete el smoke test en dispositivo.

## Alcance

El perfil `staging` de `eas.json` produce artefactos de distribución interna con identidad separada de producción:

| Plataforma | Artefacto | Identidad                      | Requisito de instalación                                        |
| ---------- | --------- | ------------------------------ | --------------------------------------------------------------- |
| Android    | APK       | `app.refugiapp.mobile.staging` | Abrir el enlace interno e instalar el APK                       |
| iOS        | Ad hoc    | `app.refugiapp.mobile.staging` | Registrar previamente el dispositivo en el provisioning profile |

EAS usa el ambiente `preview`, mientras la aplicación recibe `EXPO_PUBLIC_ENV=staging`. La separación es intencional: `preview` es el nombre del ambiente EAS y `staging` es el contrato de configuración de Refugiapp.

## Preparación inicial

1. Iniciar sesión y comprobar la cuenta:

   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest whoami
   ```

2. Vincular el repositorio una sola vez si `extra.eas.projectId` todavía no existe:

   ```bash
   npx eas-cli@latest init
   ```

   Revisar y versionar únicamente el `projectId` que agregue la CLI. No copiar tokens ni credenciales al repositorio.

3. Crear o actualizar la configuración pública de staging. Reemplazar la URL por el backend real; debe usar HTTPS y terminar en `/api/v1`:

   ```bash
   npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_ENV --value staging --visibility plaintext
   npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://HOST-REAL/api/v1 --visibility plaintext
   npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_TIMEOUT_MS --value 10000 --visibility plaintext
   npx eas-cli@latest env:list --environment preview
   ```

   Si una variable ya existe, usar `eas env:update`. Las variables `EXPO_PUBLIC_*` son visibles dentro del binario; nunca deben contener passwords, tokens, claves privadas ni credenciales de servicios.

4. Verificar la URL desde una red externa al equipo de desarrollo:

   ```bash
   curl -I https://HOST-REAL/api/v1/health
   ```

   Si el backend no expone `/health`, comprobar un endpoint público documentado. No continuar con un host de ejemplo o que no resuelva DNS.

## Verificación previa

Descargar temporalmente las variables `preview`, exportar los bundles y ejecutar el escaneo de patrones de secretos:

```bash
npx eas-cli@latest env:exec --environment preview "npm run release:verify"
npm run format:check
npm run lint
npm run typecheck
npm test -- --runInBand
```

El escaneo cubre claves privadas, access keys de AWS, tokens de GitHub/Expo y JWT completos en los archivos exportados. Es una defensa adicional, no reemplaza la revisión de variables y permisos.

## Crear y distribuir los builds

### Android

```bash
npx eas-cli@latest build --platform android --profile staging
```

El perfil fuerza `buildType=apk`, por lo que el enlace de EAS entrega un archivo instalable. Compartir solo el enlace de distribución interna con testers autorizados.

### iOS

Registrar cada iPhone/iPad antes de compilar:

```bash
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile staging
```

El build ad hoc solo abre en dispositivos incluidos en el provisioning profile. Si se agrega un dispositivo después, regenerar el build o el perfil según indique EAS.

## Versionado y release notes

- `expo.version` es la versión visible y sigue SemVer. Se actualiza deliberadamente antes de una release funcional.
- `ios.buildNumber` y `android.versionCode` parten de `1`; EAS es la fuente remota y `autoIncrement` evita reutilizar números.
- Cada candidata debe tener notas en `docs/releases/<version>-<canal>.md` con ticket, cambios, riesgos, instrucciones de prueba y resultado de los builds.
- No reutilizar una versión ya publicada en stores. Un rebuild sin cambio funcional conserva la versión visible pero incrementa el número nativo.

La candidata inicial está documentada en [`releases/1.0.0-staging.md`](releases/1.0.0-staging.md).

## Checklist de seguridad

- [ ] `EXPO_PUBLIC_*` contiene solo configuración pública.
- [ ] `npm run release:verify` termina sin hallazgos.
- [ ] No existen `.env`, keystores, provisioning profiles, certificados ni tokens versionados.
- [ ] Access y refresh tokens continúan almacenándose con `src/core/storage/tokenStorage.ts` mediante Expo SecureStore en Android/iOS.
- [ ] La URL de staging usa HTTPS y termina en `/api/v1`.
- [ ] Logs, capturas y release notes no incluyen credenciales ni datos clínicos.
- [ ] Las credenciales de firma se administran con EAS Credentials o el gestor seguro aprobado, no en Git.
- [ ] Se revisó certificate pinning según la decisión vigente.

### Revisión de certificate pinning

No se incorpora pinning en esta entrega. React Native usa la validación TLS de la plataforma y staging/production ya exigen HTTPS. El pinning agrega riesgo operativo durante renovación o rotación de certificados y exige un módulo nativo, pins de respaldo y un procedimiento de recuperación. Se reevalúa antes de una publicación externa si el modelo de amenazas, cumplimiento o una auditoría lo exige; la decisión y sus criterios viven en [ADR-0013](decisions/0013-eas-internal-distribution.md).

## Checklist de publicación interna

- [ ] Versión visible y números nativos revisados.
- [ ] Release notes actualizadas.
- [ ] Variables EAS `preview` verificadas sin imprimir secretos.
- [ ] Gates y escaneo de bundle en verde.
- [ ] Build Android finalizado e instalado.
- [ ] Dispositivos iOS de prueba registrados.
- [ ] Build iOS finalizado e instalado.
- [ ] Smoke test completado en ambos sistemas.
- [ ] Enlaces internos compartidos únicamente con testers autorizados.
- [ ] IDs/URLs de builds y resultados asentados en las release notes.

## Smoke test manual

1. Confirmar que el launcher muestra **Refugiapp (Staging)** y que puede convivir con producción.
2. Abrir la app desde cero y comprobar que llega al login sin errores de configuración.
3. Iniciar sesión con un usuario de staging; nunca usar credenciales de producción.
4. Confirmar carga de Inicio, Animales y Tareas.
5. Abrir un animal y verificar resumen, historial e imágenes.
6. Enviar la app a background, volver y confirmar que la sesión se restaura.
7. Cerrar sesión, volver a abrir y comprobar que no queda acceso a rutas protegidas.
8. Revisar logs del dispositivo: no deben aparecer tokens, passwords ni payloads clínicos completos.
9. Repetir en al menos un Android y un iPhone/iPad registrados.

## Registro de evidencia

Para cada plataforma guardar en las release notes:

- URL e ID del build EAS.
- versión visible y número nativo.
- commit y fecha.
- dispositivo/SO del smoke test.
- resultado y defectos encontrados.

Los artefactos y credenciales no se copian al repositorio.
