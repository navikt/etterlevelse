'use client'

import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { IKravReference } from '@/constants/krav/kravConstants'
import {
  pvkDokumentasjonCopyUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoDokumentasjonTemaKravNummerVersjonUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '@/util/risikoscenario/risikoscenarioUtils'
import { LinkIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, CopyButton, List, ReadMore } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import RisikoscenarioTag from './risikoscenarioTag'

type TProps = {
  risikoscenario: IRisikoscenario
  etterlevelseDokumentasjonId: string
  stepUrl: string
  noCopyButton?: boolean
  markdownCopyLinkButton?: boolean
}

export const RisikoscenarioView: FunctionComponent<TProps> = ({
  risikoscenario,
  etterlevelseDokumentasjonId,
  stepUrl,
  noCopyButton,
  markdownCopyLinkButton,
}) => {
  const splittedUrl: string[] = window.location.href.split('?')
  const queryUrl: string = splittedUrl[1]

  return (
    <div>
      {!noCopyButton && (
        <CopyButton
          variant='action'
          copyText={pvkDokumentasjonCopyUrl(
            window.location.origin,
            etterlevelseDokumentasjonId,
            risikoscenario.pvkDokumentId,
            stepUrl,
            queryUrl
          )}
          text='Kopiér scenariolenke'
          activeText='Lenken er kopiert'
          icon={<LinkIcon aria-hidden />}
        />
      )}
      {markdownCopyLinkButton && (
        <CopyButton
          variant='action'
          copyText={`[${risikoscenario.navn}](${window.location.origin}${pvkDokumentasjonStepUrl(etterlevelseDokumentasjonId, risikoscenario.pvkDokumentId, stepUrl, `?${queryUrl}`)})`}
          text='Kopiér scenario riktekstfelt lenke med titel'
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
        <ReadMore
          header='Vis etterlevelseskrav hvor risikoscenarioet inntreffer'
          className='mt-5'
          defaultOpen={!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0}
        >
          <List as='ul'>
            {risikoscenario.relevanteKravNummer.map(
              (relevantKrav: IKravReference, index: number) => {
                const kravHref: string = risikoDokumentasjonTemaKravNummerVersjonUrl(
                  etterlevelseDokumentasjonId,
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

      {(!risikoscenario.sannsynlighetsNivaaBegrunnelse ||
        risikoscenario.sannsynlighetsNivaa === 0) && (
        <Alert inline className='mt-5' variant='warning'>
          {risikoscenario.sannsynlighetsNivaa === 0 &&
            !risikoscenario.sannsynlighetsNivaaBegrunnelse &&
            'Dere må gjøre sannsynlighetsvurdering'}
          {!risikoscenario.sannsynlighetsNivaaBegrunnelse &&
            risikoscenario.sannsynlighetsNivaa !== 0 &&
            'Dere må begrunne sannsynlighetsvurderingen'}
          {risikoscenario.sannsynlighetsNivaaBegrunnelse &&
            risikoscenario.sannsynlighetsNivaa === 0 &&
            'Dere må velge sannsynlighetsnivå'}
        </Alert>
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

      {(!risikoscenario.konsekvensNivaaBegrunnelse || risikoscenario.konsekvensNivaa === 0) && (
        <Alert inline className='mt-5' variant='warning'>
          {risikoscenario.konsekvensNivaa === 0 &&
            !risikoscenario.konsekvensNivaaBegrunnelse &&
            'Dere må gjøre konsekvensvurdering'}
          {!risikoscenario.konsekvensNivaaBegrunnelse &&
            risikoscenario.konsekvensNivaa !== 0 &&
            'Dere må begrunne konsekvensvurderingen'}
          {risikoscenario.konsekvensNivaaBegrunnelse &&
            risikoscenario.konsekvensNivaa === 0 &&
            'Dere må velge konsekensnivå'}
        </Alert>
      )}
      {risikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className='mt-5'>{risikoscenario.konsekvensNivaaBegrunnelse}</BodyLong>
      )}
    </div>
  )
}

export default RisikoscenarioView
