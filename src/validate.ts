import { Snapshot } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSnapshot(snapshot: Snapshot): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!snapshot.name || snapshot.name.trim() === '') {
    errors.push('Snapshot name is required');
  } else if (!/^[a-zA-Z0-9_\-\.]+$/.test(snapshot.name)) {
    errors.push('Snapshot name must only contain alphanumeric characters, dashes, underscores, or dots');
  }

  if (!snapshot.env || typeof snapshot.env !== 'object') {
    errors.push('Snapshot env must be a valid object');
  } else {
    for (const [key, value] of Object.entries(snapshot.env)) {
      if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
        warnings.push(`Key "${key}" does not follow conventional env var naming`);
      }
      if (value === null || value === undefined) {
        errors.push(`Key "${key}" has a null or undefined value`);
      }
      if (typeof value === 'string' && value.length > 32768) {
        warnings.push(`Key "${key}" has an unusually long value (>32KB)`);
      }
    }
  }

  if (!snapshot.createdAt) {
    warnings.push('Snapshot is missing a createdAt timestamp');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateEnvObject(env: Record<string, string>): ValidationResult {
  return validateSnapshot({ name: 'temp', env, createdAt: new Date().toISOString() });
}
