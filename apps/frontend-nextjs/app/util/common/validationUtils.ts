export const isMissingText = (value?: string | null): boolean => {
  return value === null || value === undefined || value === ''
}

export const isEmptyArray = <T>(value?: T[] | null): boolean => {
  return !value || value.length === 0
}
