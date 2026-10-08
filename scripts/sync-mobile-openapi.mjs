import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_PREFIX = '/api/v1';

// Endpoints the mobile app calls but the backend does not publish yet.
// They are skipped (with a warning) instead of failing, and must never be
// treated as a real contract.
const UNPUBLISHED_MOBILE_PATHS = new Set(['/auth/logout']);

const MOBILE_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/change-password',
  '/auth/password-recovery/request',
  '/auth/password-recovery/confirm',
  '/users',
  '/users/{id}/deactivate',
  '/users/{id}/activate',
  '/users/{id}',
  '/users/me',
  '/animals',
  '/animals/{id}',
  '/animals/{id}/status',
  '/animals/{animalId}/events',
  '/adopters',
  '/adopters/{id}',
  '/animals/{animalId}/adoption-applications',
  '/adoption-applications/{id}/approve',
  '/animals/{animalId}/adoptions',
  '/care-tasks',
  '/care-tasks/{id}',
  '/care-tasks/{id}/complete',
  '/care-tasks/{id}/cancel',
  '/media/upload',
  '/expenses',
  '/expenses/{id}',
  '/media/{id}',
  '/veterinarians',
  '/veterinarians/{id}',
  '/veterinarians/{id}/deactivate',
  '/veterinarians/{id}/reactivate',
  '/media',
  '/medical-records',
  '/medical-records/{id}',
  '/medical-records/{id}/changes',
  '/animals/{animalId}/medical-records',
  '/audit-logs',
  '/audit-logs/{id}',
  '/dashboard/overview',
  '/notifications/devices',
  '/notifications/devices/me',
  '/notifications/devices/{id}',
  '/notifications/preferences/me',
  '/notifications/deliveries',
];

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const backendPath = resolve(projectRoot, process.argv[2] ?? '../refugiapp/docs/openapi.json');
const outputPath = resolve(projectRoot, 'openapi/mobile.openapi.json');

const backend = JSON.parse(readFileSync(backendPath, 'utf8'));

function referenceName(reference) {
  return reference.split('/').at(-1);
}

/**
 * NestJS Swagger emits a TypeScript `string | null` property as
 * `{ type: 'object', nullable: true }` because the reflection metadata is
 * `Object`. The runtime contract is a nullable string (or uuid string), so the
 * snapshot normalizes exactly that shape. Genuine objects (with `properties`,
 * `additionalProperties` or a composition) are left untouched.
 */
function normalizeNullableStringArtifact(schema) {
  if (Array.isArray(schema)) {
    return schema.map(normalizeNullableStringArtifact);
  }
  if (schema === null || typeof schema !== 'object') {
    return schema;
  }
  const normalized = {};
  for (const [key, value] of Object.entries(schema)) {
    normalized[key] = normalizeNullableStringArtifact(value);
  }
  if (
    normalized.type === 'object' &&
    normalized.nullable === true &&
    normalized.allOf === undefined &&
    normalized.oneOf === undefined &&
    normalized.properties === undefined &&
    normalized.additionalProperties === undefined
  ) {
    normalized.type = 'string';
  }
  return normalized;
}

function collectReferences(value, collected) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectReferences(item, collected);
    }
    return;
  }
  if (value !== null && typeof value === 'object') {
    if (typeof value.$ref === 'string') {
      collected.add(referenceName(value.$ref));
    }
    for (const nested of Object.values(value)) {
      collectReferences(nested, collected);
    }
  }
}

const paths = {};
for (const mobilePath of MOBILE_PATHS) {
  const backendPath = `${API_PREFIX}${mobilePath}`;
  const operation = backend.paths[backendPath];
  if (operation === undefined) {
    if (UNPUBLISHED_MOBILE_PATHS.has(mobilePath)) {
      console.warn(`Skipping unpublished path "${backendPath}" (not in the backend document).`);
      continue;
    }
    throw new Error(`Path "${backendPath}" is not present in the backend document.`);
  }
  paths[mobilePath] = operation;
}

const referencedSchemas = new Set();
collectReferences(paths, referencedSchemas);

const schemas = {};
const queue = [...referencedSchemas];
while (queue.length > 0) {
  const name = queue.pop();
  const schema = backend.components.schemas[name];
  if (schema === undefined) {
    throw new Error(`Schema "${name}" is referenced but missing in the backend document.`);
  }
  if (schemas[name] !== undefined) {
    continue;
  }
  schemas[name] = schema;
  const nested = new Set();
  collectReferences(schema, nested);
  for (const reference of nested) {
    if (schemas[reference] === undefined) {
      queue.push(reference);
    }
  }
}

const orderedSchemas = {};
for (const name of Object.keys(backend.components.schemas)) {
  if (schemas[name] !== undefined) {
    orderedSchemas[name] = normalizeNullableStringArtifact(schemas[name]);
  }
}

const document = {
  openapi: backend.openapi,
  info: {
    title: 'Refugiapp API - mobile consumed subset',
    version: '1.0.0',
    description:
      'Snapshot parcial del OpenAPI del backend para los endpoints consumidos por el movil: autenticacion, usuarios, animales, adopciones, dashboard, eventos generales, tareas de cuidado, gastos, registros medicos, veterinarios, media y notificaciones push.',
  },
  servers: [{ url: API_PREFIX }],
  paths,
  components: {
    schemas: orderedSchemas,
  },
};

writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

console.info(
  `Mobile OpenAPI synced from ${backendPath}: ${Object.keys(paths).length} paths and ${Object.keys(orderedSchemas).length} schemas.`
);
