import { spawn } from 'node:child_process';
import { createSocket } from 'node:dgram';
import { existsSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');

const API_BASE_PATH = '/api/v1';
const BACKEND_PORT = 3000;
const BACKEND_PROBE_TIMEOUT_MS = 2000;

function isPrivateIpv4(hostname) {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) {
    return false;
  }
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => octet < 0 || octet > 255)) {
    return false;
  }
  const [first, second] = octets;
  return (
    first === 10 ||
    (first === 172 && second !== undefined && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function detectRouteAddress() {
  return new Promise((resolvePromise) => {
    const socket = createSocket('udp4');
    const finish = (address) => {
      socket.close();
      resolvePromise(address);
    };
    const timer = setTimeout(() => finish(null), BACKEND_PROBE_TIMEOUT_MS);
    socket.on('error', () => {
      clearTimeout(timer);
      finish(null);
    });
    // UDP connect no envia paquetes: solo revela la IP local de la ruta activa.
    socket.connect(53, '8.8.8.8', () => {
      clearTimeout(timer);
      const address = socket.address().address;
      finish(isPrivateIpv4(address) ? address : null);
    });
  });
}

function detectInterfaceAddress() {
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      const isIpv4 = entry.family === 'IPv4' || entry.family === 4;
      if (isIpv4 && !entry.internal && isPrivateIpv4(entry.address)) {
        return entry.address;
      }
    }
  }
  return null;
}

async function resolveLanUrl() {
  const address = (await detectRouteAddress()) ?? detectInterfaceAddress();
  if (address === null) {
    return null;
  }
  return `http://${address}:${BACKEND_PORT}${API_BASE_PATH}`;
}

async function probeBackend(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(BACKEND_PROBE_TIMEOUT_MS) });
    return true;
  } catch {
    // Cualquier error de red aqui significa que no hay backend escuchando.
    return false;
  }
}

async function resolveApiUrl() {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitUrl !== undefined && explicitUrl !== '') {
    console.log(`[start-dev] EXPO_PUBLIC_API_URL explicita: ${explicitUrl}`);
    return explicitUrl;
  }

  const lanUrl = await resolveLanUrl();
  if (lanUrl === null) {
    console.warn(
      '[start-dev] No se detecto una IP LAN privada. Se usara el fallback de src/core/config/env.ts.'
    );
    return undefined;
  }

  const isListening = await probeBackend(lanUrl);
  if (!isListening) {
    console.warn(
      `[start-dev] Aviso: no se detecto backend escuchando en ${lanUrl}.` +
        '\n[start-dev] Revisa que el backend este corriendo y que el firewall permita el puerto.'
    );
  }
  console.log(`[start-dev] API resuelta a la IP LAN: ${lanUrl}`);
  return lanUrl;
}

async function main() {
  const extraArgs = process.argv.slice(2);
  const apiUrl = await resolveApiUrl();

  const expoCliPath = resolve(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
  if (!existsSync(expoCliPath)) {
    console.error('[start-dev] No se encontro el CLI de Expo. Ejecuta "npm ci" primero.');
    process.exit(1);
  }

  const env = { ...process.env };
  if (apiUrl !== undefined) {
    env.EXPO_PUBLIC_API_URL = apiUrl;
  }

  console.log('[start-dev] Arrancando Expo con:');
  console.log(`[start-dev]   EXPO_PUBLIC_API_URL=${env.EXPO_PUBLIC_API_URL ?? '(fallback local)'}`);
  console.log(`[start-dev]   argumentos=${extraArgs.join(' ') || '(ninguno)'}`);

  const child = spawn(process.execPath, [expoCliPath, 'start', ...extraArgs], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });

  const forward = (signal) => {
    if (child.exitCode === null) {
      child.kill(signal);
    }
  };
  process.on('SIGINT', () => forward('SIGINT'));
  process.on('SIGTERM', () => forward('SIGTERM'));

  child.on('exit', (code, signal) => {
    process.exit(signal ? 1 : (code ?? 0));
  });
}

main().catch((error) => {
  console.error(`[start-dev] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
