import type { Program } from '@/types/sales';

const PROGRAM_ACRONYMS = new Set([
  'cpns',
  'sd',
  'sma',
  'smp',
  'snbt',
  'utbk',
]);

export function formatLegacyProgramLabel(value?: string | null): string {
  if (!value) {
    return '-';
  }

  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => {
      const normalized = part.toLowerCase();

      if (PROGRAM_ACRONYMS.has(normalized)) {
        return normalized.toUpperCase();
      }

      return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
    })
    .join(' ');
}

export function getProgramLevelLabel(program: Program): string {
  return program.program_level?.name || formatLegacyProgramLabel(program.level);
}

export function getProgramTypeLabel(program: Program): string {
  return program.program_type?.name || formatLegacyProgramLabel(program.type);
}

export function getProgramTypeCode(program: Program): string {
  return program.program_type?.code || program.type || '';
}
