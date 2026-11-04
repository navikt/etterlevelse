import { Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { ISuksesskriterie } from '@/constants/krav/kravConstants'

type TProps = {
  suksesskriterie: ISuksesskriterie
  sammenlignMed?: ISuksesskriterie[]
  versjon: 'gjeldende' | 'forrige'
}

const erEndret = (a: ISuksesskriterie, b: ISuksesskriterie): boolean =>
  a.navn.trim() !== b.navn.trim() ||
  (a.beskrivelse ?? '').trim() !== (b.beskrivelse ?? '').trim() ||
  a.behovForBegrunnelse !== b.behovForBegrunnelse

export const SuksesskriterieEndringTag: FunctionComponent<TProps> = ({
  suksesskriterie,
  sammenlignMed,
  versjon,
}) => {
  if (!sammenlignMed) return null

  const motpart = sammenlignMed.find((kriterie) => kriterie.id === suksesskriterie.id)

  if (!motpart) {
    return versjon === 'gjeldende' ? (
      <Tag size='small' variant='outline' data-color='info'>
        Nytt suksesskriterium
      </Tag>
    ) : (
      <Tag size='small' variant='outline' data-color='neutral'>
        Utgått suksesskriterium
      </Tag>
    )
  }

  if (erEndret(suksesskriterie, motpart)) {
    return (
      <Tag size='small' variant='outline' data-color='warning'>
        Endringer i suksesskriterium
      </Tag>
    )
  }

  return null
}

export default SuksesskriterieEndringTag
