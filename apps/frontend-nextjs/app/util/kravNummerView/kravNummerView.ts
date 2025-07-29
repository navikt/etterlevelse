type TProps = { kravVersjon: number; kravNummer: number }

export const kravNummerView = (props: TProps): string => {
  const { kravNummer, kravVersjon } = props

  return `K${kravNummer}.${kravVersjon}`
}
