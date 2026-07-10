import { InformationSquareIcon } from '@navikt/aksel-icons'
import { InfoCard } from '@navikt/ds-react'

export const EndringerGjortSidenSisteInnsending = () => (
  <InfoCard data-color='meta-purple' className='mb-6'>
    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
      <b>Innhold på denne siden er endret av etterlever siden siste innsending til PVO.</b>
    </InfoCard.Message>
  </InfoCard>
)

export default EndringerGjortSidenSisteInnsending
