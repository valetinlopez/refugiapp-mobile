# ADR-0013: Distribución interna con EAS y seguridad de release

- Estado: aceptado
- Fecha: 2026-10-01
- Ticket: RFG-90 (épica RFG-54)

## Contexto

El móvil necesita artefactos instalables de staging para Android e iOS sin mezclar identidad, API ni numeración con producción. También necesita un proceso repetible que evite incluir secretos en el bundle y deje explícita la revisión de certificate pinning.

Las variables `EXPO_PUBLIC_*` se inyectan en el código cliente y son recuperables desde el binario. EAS ofrece ambientes separados, distribución interna, credenciales administradas y versionado remoto. En iOS, la distribución ad hoc requiere registrar los dispositivos permitidos.

## Alternativas consideradas

1. **EAS Build con perfil interno y ambiente `preview` (elegida).** Mantiene configuración declarativa, firma administrada, enlaces internos y builds reproducibles para ambas plataformas.
2. **Builds locales manuales.** Evitan depender del servicio cloud, pero trasladan certificados y toolchains a cada estación, dificultan auditoría y requieren macOS para iOS.
3. **Publicar staging en los stores.** Simplifica instalación posterior, pero agrega revisión/canales externos antes de que la candidata esté validada.
4. **Certificate pinning inmediato.** Reduce ciertos ataques con una CA o dispositivo comprometido, pero exige integración nativa, pins de respaldo y coordinación estricta con la rotación del certificado. Sin un requisito de cumplimiento o modelo de amenazas que lo justifique, el riesgo de indisponibilidad supera el beneficio actual.

## Decisión

- Usar `eas.json` con perfil `staging`, `distribution=internal` y ambiente EAS `preview`.
- Producir APK en Android y distribución ad hoc en iOS; los dispositivos Apple se registran antes del build.
- Mantener la versión visible en `app.json` y usar EAS como fuente remota de `versionCode`/`buildNumber` con autoincremento.
- Configurar `EXPO_PUBLIC_ENV=staging` y la URL HTTPS real en EAS. Ninguna variable `EXPO_PUBLIC_*` puede ser secreta.
- Exportar y escanear el bundle antes de distribuirlo, además de revisar variables, archivos versionados y logs.
- Mantener tokens de sesión en Expo SecureStore en plataformas nativas.
- No implementar certificate pinning en esta entrega. Conservar HTTPS y la validación TLS de la plataforma, y reabrir la decisión si cambia el modelo de amenazas o aparece un requisito regulatorio.

## Consecuencias

- Staging se instala junto a producción por tener identificadores separados.
- Los builds dependen de acceso al proyecto Expo, variables EAS válidas y credenciales de firma.
- Agregar dispositivos iOS puede exigir regenerar el provisioning profile y el build.
- El escaneo reduce errores conocidos, pero no demuestra por sí solo ausencia total de secretos.
- Una futura adopción de pinning necesita pins de respaldo, estrategia de rotación, observabilidad y recuperación antes de activarse.

## Criterios de revisión

- Reconsiderar el pinning ante una auditoría, obligación regulatoria, tráfico de mayor sensibilidad o evidencia de un atacante con control de CA/dispositivo.
- Reevaluar el canal ad hoc cuando el grupo iOS crezca o TestFlight resulte operativo.
- Revisar los patrones del escáner cuando se integren SDKs con nuevas clases de credenciales.
