// XML 1.0 Name validation (subset — safe ASCII)
// Valid Name: starts with letter or _, then letters/digits/-/_/. — must not start with "xml" (case-insensitive)
const NAME_RE = /^[A-Za-z_][A-Za-z0-9._-]*$/;

export const isValidXmlName = (id: string): boolean => {
  if (!id) return false;
  if (!NAME_RE.test(id)) return false;
  if (id.toLowerCase().startsWith('xml')) return false;
  return true;
};

export const xmlNameError = (id: string): string | null => {
  if (!id) return 'ID is required.';
  if (!/^[A-Za-z_]/.test(id)) return 'ID must start with a letter or underscore.';
  if (id.toLowerCase().startsWith('xml')) return 'ID cannot start with "xml" (reserved).';
  if (!NAME_RE.test(id)) return 'ID may only contain letters, digits, ".", "-", "_".';
  return null;
};
