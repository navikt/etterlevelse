'use client'

import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { etterlevelseDokumentasjonPvkTabUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent } from 'react'

type TProps = {
  stylingHeading: string
  etterlevelseDokumentasjonId: string
  risikoscenarioList: IRisikoscenario[]
}

export const IdentifiseringAvRisikoscenarioerOgTiltakContent: FunctionComponent<TProps> = ({
  stylingHeading,
  etterlevelseDokumentasjonId,
  risikoscenarioList,
}) => {
  const router = useRouter()

  return (
    <div className='w-4/5'>
      <Heading level='1' size='medium' className={stylingHeading}>
        Identifisering av risikoscenarioer og tiltak
      </Heading>

      <BodyLong>
        I en PVK må dere vurdere sannsynligheten for at personvern ikke ivaretas på tilstrekkelig
        vis, og konsekvensene det vil føre til. Hvor dette risikoscenarioet er av betydning, må dere
        identifisere forebyggende tiltak som reduserer risiko.
      </BodyLong>

      <Alert variant='info' inline className='mt-5'>
        <strong>Godt å vite:</strong> risikoscenarioer og tiltak som dere dokumenterer, kan dere
        finne og gjenbruke andre steder hvor det er aktuelt.
      </Alert>

      <Heading spacing size='small' level='2' className='mb-5 mt-10'>
        Legg til risikoscenarioer og tiltak med en tilknytning til etterlevelseskrav
      </Heading>

      <BodyLong className='mb-5'>
        Disse vil nok utgjøre hovedparten av deres PVK. Slike risikoscenarioer, samt motvirkende
        tiltak, beskriver dere på den aktuelle kravsiden.
      </BodyLong>

      <Button
        variant='secondary'
        type='button'
        onClick={() => {
          if (etterlevelseDokumentasjonId)
            router.push(etterlevelseDokumentasjonPvkTabUrl(etterlevelseDokumentasjonId))
        }}
      >
        Vurder risikoscenarioer ved PVK-relaterte krav
      </Button>

      <Heading level='2' size='small' className='mb-5 mt-10'>
        Legg til øvrige risikoscenarioer
      </Heading>

      <BodyLong>
        Noen risikoscenarioer vil ikke har en direkte tilknytning til etterlevelseskrav. Disse, samt
        motvirkende tiltak, legger dere inn på denne siden. Vi anbefaler at dette gjøres etter at
        dere har vurderert kravspesifikke risikoscenarioer.
      </BodyLong>

      {risikoscenarioList.length === 0 && (
        <Alert variant='info' className='my-5 w-fit'>
          Dere har ikke lagt inn noen øvrige risikoscenarioer.
        </Alert>
      )}
    </div>
  )
}
