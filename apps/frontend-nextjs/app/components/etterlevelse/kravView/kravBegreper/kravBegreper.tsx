import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { IBegrep } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { TKravViewProps } from '@/constants/krav/kravConstants'
import { termUrl } from '@/util/config/config'
import { BodyShort } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

export const KravBegreper: FunctionComponent<TKravViewProps> = ({ krav, header }) => (
  <LabelWrapper>
    <LabelAboveContent header={header} title='Begreper'>
      {krav.begreper &&
        krav.begreper.length !== 0 &&
        krav.begreper.map((begrep, index) => (
          <BegrepView key={`begrep_${index}`} begrep={begrep} />
        ))}
    </LabelAboveContent>
  </LabelWrapper>
)

type TProps = {
  begrep: IBegrep
}

const BegrepView: FunctionComponent<TProps> = ({ begrep }) => (
  <div className='max-w-2xl'>
    <BodyShort className='break-words'>
      <ExternalLink href={termUrl(begrep.id)}>{begrep.navn}</ExternalLink>
      {/* {' '}
      - {begrep.beskrivelse} */}
    </BodyShort>
  </div>
)
