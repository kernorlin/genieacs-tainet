export function parseProductClasses(value: string): string[] {
  return [...new Set(value.split(";").map((part) => part.trim()).filter(Boolean))];
}

export function productClassesMatch(
  configured: string,
  requested: Iterable<string>,
): boolean {
  const allowed = parseProductClasses(configured);
  if (!allowed.length) return true;
  const classes = [...requested];
  return classes.length > 0 && classes.every((name) => allowed.includes(name));
}
