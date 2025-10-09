import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { IKravReference } from '@/constants/krav/kravConstants'
import { risikoDokumentasjonTemaKravNummerVersjonUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '@/util/risikoscenario/risikoscenarioUtils'
import { LinkIcon } from '@navikt/aksel-icons'
import { BodyLong, CopyButton, List, ReadMore } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { FunctionComponent } from 'react'
import RisikoscenarioTag from '../common/risikoscenarioTag'

type TProps = {
  risikoscenario: IRisikoscenario
  noCopyButton?: boolean
}

export const RisikoscenarioViewReadOnly: FunctionComponent<TProps> = ({
  risikoscenario,
  noCopyButton,
}) => {
  const params: Readonly<
    Partial<{
      id?: string
    }>
  > = useParams<{ id?: string }>()

  return (
    <div>
      {!noCopyButton && (
        <CopyButton
          variant='action'
          copyText={window.location.href}
          text='Kopiér scenariolenke'
          activeText='Lenken er kopiert'
          icon={<LinkIcon aria-hidden />}
        />
      )}
      <BodyLong className='mt-5'>{risikoscenario.beskrivelse}</BodyLong>

      {risikoscenario.generelScenario && (
        <BodyLong className='mt-8'>
          Dette risikoscenarioet er ikke tilknyttet spesifikke etterlevelseskrav.
        </BodyLong>
      )}

      {!risikoscenario.generelScenario && (
        <ReadMore header='Vis etterlevelseskrav hvor risikoscenarioet inntreffer' className='mt-5'>
          <List as='ul'>
            {risikoscenario.relevanteKravNummer.map(
              (relevantKrav: IKravReference, index: number) => {
                const kravHref: string = risikoDokumentasjonTemaKravNummerVersjonUrl(
                  params.id,
                  relevantKrav.temaCode || 'PVK',
                  relevantKrav.kravNummer,
                  relevantKrav.kravVersjon
                )

                return (
                  <List.Item className='max-w-[75ch]' key={`${relevantKrav.kravNummer}_${index}`}>
                    <ExternalLink href={kravHref}>
                      K{relevantKrav.kravNummer}.{relevantKrav.kravVersjon} {relevantKrav.navn}
                    </ExternalLink>
                  </List.Item>
                )
              }
            )}
          </List>
        </ReadMore>
      )}

      {risikoscenario.sannsynlighetsNivaa !== 0 && (
        <div className='mt-12'>
          <RisikoscenarioTag
            level={risikoscenario.sannsynlighetsNivaa}
            text={getSannsynlighetsnivaaText(risikoscenario.sannsynlighetsNivaa)}
          />
        </div>
      )}

      {risikoscenario.sannsynlighetsNivaaBegrunnelse && (
        <BodyLong className='mt-5'>{risikoscenario.sannsynlighetsNivaaBegrunnelse}</BodyLong>
      )}

      {risikoscenario.konsekvensNivaa !== 0 && (
        <div className='mt-12'>
          <RisikoscenarioTag
            level={risikoscenario.konsekvensNivaa}
            text={getKonsekvenssnivaaText(risikoscenario.konsekvensNivaa)}
          />
        </div>
      )}

      {risikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className='mt-5'>{risikoscenario.konsekvensNivaaBegrunnelse}</BodyLong>
      )}
    </div>
  )
}

export default RisikoscenarioViewReadOnly
