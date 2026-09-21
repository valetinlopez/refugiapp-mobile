import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const sourcePath = resolve(projectRoot, 'openapi/auth.openapi.json');
const outputPath = resolve(projectRoot, 'src/core/api/generated/openapi.ts');
const document = JSON.parse(readFileSync(sourcePath, 'utf8'));

function referenceName(reference) {
  return reference.split('/').at(-1);
}

function schemaToType(schema) {
  if (schema.$ref) {
    return `components['schemas']['${referenceName(schema.$ref)}']`;
  }
  if (schema.oneOf) {
    return schema.oneOf.map(schemaToType).join(' | ');
  }
  if (schema.enum) {
    return schema.enum.map((value) => JSON.stringify(value)).join(' | ');
  }
  if (schema.type === 'array') {
    return `(${schemaToType(schema.items)})[]`;
  }
  if (schema.type === 'object' || schema.properties) {
    return objectSchemaToType(schema);
  }
  if (schema.type === 'integer' || schema.type === 'number') {
    return 'number';
  }
  if (schema.type === 'boolean') {
    return 'boolean';
  }
  return 'string';
}

function objectSchemaToType(schema) {
  const required = new Set(schema.required ?? []);
  const properties = Object.entries(schema.properties ?? {}).map(
    ([name, property]) =>
      `      ${JSON.stringify(name)}${required.has(name) ? '' : '?'}: ${schemaToType(property)};`
  );
  return properties.length === 0 ? 'Record<string, unknown>' : `{\n${properties.join('\n')}\n    }`;
}

const schemaLines = Object.entries(document.components.schemas).map(
  ([name, schema]) => `    ${JSON.stringify(name)}: ${schemaToType(schema)};`
);

const output = `/**
 * Archivo generado. No editar manualmente.
 * Fuente: openapi/auth.openapi.json
 * Ejecutar: npm run api:generate
 */

export interface components {
  schemas: {
${schemaLines.join('\n')}
  };
}
`;

writeFileSync(outputPath, output, 'utf8');
