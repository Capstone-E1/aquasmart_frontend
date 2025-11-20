/**
 * Utility function to conditionally join classNames
 * Simple alternative to clsx + tailwind-merge
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
