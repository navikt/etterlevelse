type TProps = { kravVersjon: number; kravNummer: number }

export const kravNummerView = ({ kravNummer, kravVersjon }: TProps): string => {
  return `K${kravNummer}.${kravVersjon}`
}
