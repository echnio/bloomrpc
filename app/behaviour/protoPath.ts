import * as path from 'path';
import isURL from 'validator/lib/isURL';

export function isReflectionTarget(value: string): boolean {
  if (
    value.toLowerCase().endsWith('.proto') ||
    path.isAbsolute(value) ||
    path.win32.isAbsolute(value)
  ) {
    return false;
  }

  return isURL(value, {
    require_tld: false,
    require_protocol: false,
    require_host: false,
    require_valid_protocol: false,
  });
}
