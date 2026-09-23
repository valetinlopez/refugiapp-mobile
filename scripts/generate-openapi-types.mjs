import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const sourcePath = resolve(projectRoot, 'openapi/mobile.openapi.json');
const outputPath = resolve(projectRoot, 'src/core/api/generated/openapi.ts');
const document = JSON.parse(readFileSync(sourcePath, 'utf8'));

function referenceName(reference) {
  return reference.split('/').at(-1);
}

function schemaToType(schema) {
  if (schema.$ref) {
    return withNullable(schema, `components['schemas']['${referenceName(schema.$ref)}']`);
  }
  if (schema.oneOf) {
    return withNullable(schema, schema.oneOf.map(schemaToType).join(' | '));
  }
  if (schema.enum) {
    return withNullable(schema, schema.enum.map((value) => JSON.stringify(value)).join(' | '));
  }
  if (schema.type === 'array') {
    return withNullable(schema, `(${schemaToType(schema.items)})[]`);
  }
  if (schema.type === 'object' || schema.properties) {
    return withNullable(schema, objectSchemaToType(schema));
  }
  if (schema.type === 'integer' || schema.type === 'number') {
    return withNullable(schema, 'number');
  }
  if (schema.type === 'boolean') {
    return withNullable(schema, 'boolean');
  }
  if (schema.type === 'null') {
    return 'null';
  }
  return withNullable(schema, 'string');
}

function withNullable(schema, type) {
  return schema.nullable === true ? `${type} | null` : type;
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
 * Fuente: openapi/mobile.openapi.json
 * Ejecutar: npm run api:generate
 */

export interface components {
  schemas: {
${schemaLines.join('\n')}
  };
}
`;

writeFileSync(outputPath, output, 'utf8');
