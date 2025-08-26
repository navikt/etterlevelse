import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { IKrav, TKravViewInfoProps } from '@/constants/krav/kravConstants'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { BodyShort } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

export const KravViewRelasjonerTilAndreKrav: FunctionComponent<TKravViewInfoProps> = ({ krav }) => (
  <LabelWrapper>
    <LabelAboveContent header title='Relasjoner til andre krav'>
      {krav.kravRelasjoner.map((kravRelasjon: IKrav, index: number) => (
        <KravRelasjonView key={`kravRelasjon${index}`} kravRelasjon={kravRelasjon} />
      ))}
    </LabelAboveContent>
  </LabelWrapper>
)

type TProps = {
  kravRelasjon: Partial<IKrav>
}

const KravRelasjonView: FunctionComponent<TProps> = ({ kravRelasjon }) => (
  <div className='max-w-2xl'>
    <BodyShort className='break-words'>
      <ExternalLink
        href={`${kravUrl}/${kravRelasjon.kravId}`}
      >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>{' '}
      - {kravRelasjon.navn}
    </BodyShort>
  </div>
)
