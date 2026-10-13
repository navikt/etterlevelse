import { InformationSquareIcon } from '@navikt/aksel-icons'
import { InfoCard } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  tilRisikoeier?: boolean
}

const EndringerGjortSidenSisteInnsending: FunctionComponent<TProps> = ({ tilRisikoeier }) => (
  <InfoCard data-color='meta-purple' className='mb-6'>
    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
      <b>
        {tilRisikoeier
          ? 'Innhold på denne siden er endret av etterlever siden siste godkjenning fra risikoeier.'
          : 'Innhold på denne siden er endret av etterlever siden siste innsending til PVO.'}
      </b>
    </InfoCard.Message>
  </InfoCard>
)

export default EndringerGjortSidenSisteInnsending
