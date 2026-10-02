import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_BUNDLE_DIRECTORY = 'dist/release';
const MAX_SCANNABLE_FILE_BYTES = 25 * 1024 * 1024;
const SCANNABLE_EXTENSIONS = new Set(['.bundle', '.hbc', '.html', '.js', '.json', '.map', '.txt']);

const SECRET_PATTERNS = [
  {
    name: 'private key',
    pattern: /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/g,
  },
  {
    name: 'AWS access key',
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  },
  {
    name: 'GitHub token',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{30,255}\b/g,
  },
  {
    name: 'Expo access token',
    pattern: /\bexpo_[A-Za-z0-9_-]{30,255}\b/g,
  },
  {
    name: 'JSON Web Token',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
];

async function collectScannableFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectScannableFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && SCANNABLE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files;
}

async function scanFile(filePath) {
  const fileStat = await stat(filePath);
  if (fileStat.size > MAX_SCANNABLE_FILE_BYTES) {
    throw new Error(`Refusing to scan oversized client bundle file: ${filePath}`);
  }

  // Latin-1 preserves every byte and therefore keeps ASCII credential patterns
  // searchable inside both JavaScript text and Hermes bytecode (.hbc).
  const contents = (await readFile(filePath)).toString('latin1');
  return SECRET_PATTERNS.flatMap(({ name, pattern }) => {
    pattern.lastIndex = 0;
    return pattern.test(contents) ? [{ filePath, name }] : [];
  });
}

async function main() {
  const targetDirectory = path.resolve(process.argv[2] ?? DEFAULT_BUNDLE_DIRECTORY);
  const files = await collectScannableFiles(targetDirectory);

  if (files.length === 0) {
    throw new Error(`No client bundle files found in ${targetDirectory}`);
  }

  const findings = (await Promise.all(files.map(scanFile))).flat();
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`Potential ${finding.name} found in ${finding.filePath}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Client bundle secret scan passed (${files.length} files checked).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Client bundle secret scan failed.');
  process.exitCode = 1;
});
