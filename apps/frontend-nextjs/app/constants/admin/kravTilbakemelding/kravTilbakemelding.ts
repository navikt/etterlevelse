import { ReactNode } from 'react'

export type TSporsmaalOgSvarKrav = {
  kravNavn: string
  tidForSporsmaal: string
  tidForSvar?: string
  melderNavn: ReactNode
  tema?: string
}
