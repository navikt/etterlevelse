import { InformationSquareIcon } from '@navikt/aksel-icons'
import { InfoCard } from '@navikt/ds-react'

export const EndringerGjortSidenSisteInnsending = () => (
  <InfoCard data-color='info' className='mb-6'>
    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
      Innhold på denne siden er endret av etterlever siden siste innsending til PVO.
    </InfoCard.Message>
  </InfoCard>
)

export default EndringerGjortSidenSisteInnsending
