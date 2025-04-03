export const kravUrl = (currentPath: string, nextKravPath: string): string =>
  `${currentPath}/krav${nextKravPath}`

export const kravNummerVersjonUrl = (kravNummer: number, kravVersjon: number): string =>
  `/krav/${kravNummer}/${kravVersjon}`
