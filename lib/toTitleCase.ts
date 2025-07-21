export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((part) =>
      part
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-'),
    )
    .join(' ');
}
