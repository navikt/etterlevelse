'use client'

import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import EndringerGjortSidenSisteInnsending from '@/components/pvoTilbakemelding/common/EndringerGjortSidenSisteInnsending'
import { IPageResponse } from '@/constants/commonConstants'
import {
  EEtterlevelseStatus,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { behandlingskatalogenProcessUrl } from '@/routes/behandlingskatalog/behandlingskatalogRoutes'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { etterlevelseDokumentasjonPvkTabUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { behandlingName, getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { Alert, BodyLong, BodyShort, Button, Heading, Link, List, ReadMore } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useMemo } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
  isChangesMadeSinceLastSubmission?: boolean
}

export const TilhorendeDokumentasjonContent: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkKrav,
  isPvkKravLoading,
  isChangesMadeSinceLastSubmission,
}) => {
  const router: AppRouterInstance = useRouter()

  const { antallPvkKrav, antallFerdigPvkKrav } = useMemo(() => {
    if (isPvkKravLoading || !pvkKrav?.krav) {
      return { antallPvkKrav: 0, antallFerdigPvkKrav: 0 }
    }

    const pvkEtterlevelser: TEtterlevelseQL[] = pvkKrav.krav.content.flatMap(
      (krav: TKravQL) => krav.etterlevelser
    )

    return {
      antallPvkKrav: pvkKrav.krav.totalElements,
      antallFerdigPvkKrav: pvkEtterlevelser.filter(
        (etterlevelse: TEtterlevelseQL) =>
          etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ).length,
    }
  }, [isPvkKravLoading, pvkKrav])

  return (
    <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
      <div className='flex justify-center'>
        <div className='max-w-[75ch]'>
          <Heading level='1' size='medium' className='mb-5'>
            Tilhørende dokumentasjon
          </Heading>

          {isChangesMadeSinceLastSubmission && <EndringerGjortSidenSisteInnsending />}

          <Heading level='2' size='small' className='mb-3'>
            Behandlinger i Behandlingskatalogen
          </Heading>

          <BodyLong>
            Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:
          </BodyLong>
          {etterlevelseDokumentasjon.behandlinger &&
            etterlevelseDokumentasjon.behandlinger.length !== 0 && (
              <List as='ul'>
                {etterlevelseDokumentasjon.behandlinger.map((behandling) => (
                  <List.Item key={behandling.id}>
                    <ExternalLink
                      className='text-medium'
                      href={behandlingskatalogenProcessUrl(getPollyBaseUrl(), behandling.id)}
                    >
                      {behandlingName(behandling)}
                    </ExternalLink>
                  </List.Item>
                ))}
              </List>
            )}
          {etterlevelseDokumentasjon.behandlinger?.length === 0 && (
            <Alert variant='warning' id='behandling-error' className='my-5'>
              Dere må legge inn minst 1 behandling fra Behandlingskatalogen. Dette kan dere gjøre
              under{' '}
              <Link
                href={`${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}#behandling`}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='redigere etterlevelsesdokumentasjon'
              >
                Rediger dokumentegenskaper (åpner i en ny fane)
              </Link>
            </Alert>
          )}

          {etterlevelseDokumentasjon.behandlinger?.length !== 0 && (
            <BodyShort className='inline-block my-3 max-w-[75ch]'>
              Dere kan redigere hvilke behandlinger som gjelder i{' '}
              <Link
                href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='redigere etterlevelsesdokumentasjon'
              >
                Rediger dokumentegenskaper (åpner i en ny fane).
              </Link>
            </BodyShort>
          )}

          <Heading level='2' size='small' className='mb-3 mt-5'>
            PVK-relaterte etterlevelseskrav
          </Heading>

          <BodyLong>
            Personvernkonsekvensvurdering forutsetter at dere har dokumentert etterlevelse ved alle
            personvernkrav. Så langt har dere:
          </BodyLong>

          {!isPvkKravLoading && (
            <List as='ul' className='mb-1'>
              <List.Item>
                {antallFerdigPvkKrav} av {antallPvkKrav} krav er ferdig utfylt.
              </List.Item>
            </List>
          )}

          {isPvkKravLoading && <CenteredLoader />}

          {antallFerdigPvkKrav !== antallPvkKrav && (
            <Alert variant='warning'>
              Dere må fullføre dokumentering av personvernkrav før dere kan sende inn PVK.
            </Alert>
          )}

          <Button
            variant='secondary'
            type='button'
            className='my-5'
            onClick={() => {
              if (etterlevelseDokumentasjon)
                router.push(etterlevelseDokumentasjonPvkTabUrl(etterlevelseDokumentasjon.id))
            }}
          >
            Gå til PVK-relaterte krav
          </Button>

          <Heading level='2' size='small' className='mb-3 mt-5'>
            Risiko- og sårbarhetsvurdering (ROS)
          </Heading>

          <BodyLong className='inline-block mb-5'>
            Dersom dere har gjennomført en eller flere ROS, skal disse legges ved
            etterlevelsesdokumentasjonen.
          </BodyLong>

          {etterlevelseDokumentasjon.risikovurderinger &&
            etterlevelseDokumentasjon.risikovurderinger.length !== 0 && (
              <div>
                <BodyLong>Dere har koblet følgende dokumenter på dette dokumentet:</BodyLong>

                <List>
                  {etterlevelseDokumentasjon.risikovurderinger.map((ros: string) => {
                    const rosReg: RegExp = /\[(.+)]\((.+)\)/i
                    const rosParts: RegExpMatchArray | null = ros.match(rosReg)
                    if (rosParts)
                      return (
                        <List.Item key={ros}>
                          <ExternalLink href={rosParts[2]}>{rosParts[1]}</ExternalLink>
                        </List.Item>
                      )
                    return (
                      <span className='flex' key={ros}>
                        {ros}
                      </span>
                    )
                  })}
                </List>

                <BodyLong className='mt-3 inline-block max-w-[75ch]'>
                  Dere kan redigere hvilke risikovurderinger og dokumenter som gjelder i{' '}
                  <Link
                    href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='redigere etterlevelsesdokumentasjon'
                  >
                    Rediger dokumentegenskaper (åpner i en ny fane).
                  </Link>
                </BodyLong>
              </div>
            )}

          <ReadMore
            className='mt-3'
            header='Må vi dokumentere samme risikoscenarioer i PVK som vi gjør i ROS?'
          >
            ROS skal identifisere risiko og sårbarhet knyttet til virksomheten og gjøres ofte på
            systemnivå, mens PVK er risiko knyttet til personvern for den/de vi behandler
            personopplysninger om. Overlapp vil da kunne skje når det gjelder risiko knyttet til
            personopplysningssikkerhet. Det vil da holde å legge inn disse scenariene i ROS og så
            legge inn lenke til ROS i eget felt for dette i etterlevelses-/PVK-dokumentasjonen. PVO
            vil også se på ROS ved vurdering av PVK.
          </ReadMore>

          {etterlevelseDokumentasjon.risikovurderinger?.length === 0 && (
            <Alert variant='info' className='my-5'>
              <BodyLong>
                Dere har ikke lagt ved noen tilhørende dokumenter. Dette kan dere gjøre under{' '}
                <Link
                  href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='redigere etterlevelsesdokumentasjon'
                >
                  Rediger dokumentegenskaper (åpner i en ny fane).
                </Link>
              </BodyLong>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
