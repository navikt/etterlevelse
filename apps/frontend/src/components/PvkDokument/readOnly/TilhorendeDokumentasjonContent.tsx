import { Alert, BodyLong, BodyShort, Button, Heading, Link, List, Loader } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { behandlingName } from '../../../api/BehandlingApi'
import {
  EEtterlevelseStatus,
  IPageResponse,
  TEtterlevelseDokumentasjonQL,
  TEtterlevelseQL,
  TKravQL,
} from '../../../constants'
import { getPollyBaseUrl } from '../../behandling/utils/pollyUrlUtils'
import { ExternalLink } from '../../common/RouteLink'
import { behandlingskatalogenProcessUrl } from '../../common/RouteLinkBehandlingskatalogen'
import { etterlevelsesDokumentasjonEditUrl } from '../../common/RouteLinkEtterlevelsesdokumentasjon'
import { etterlevelseDokumentasjonPvkTabUrl } from '../../common/RouteLinkPvk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
}

export const TilhorendeDokumentasjonContent: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkKrav,
  isPvkKravLoading,
}) => {
  const [antallPvkKrav, setAntallPvkKrav] = useState<number>(0)
  const [antallFerdigPvkKrav, setAntallFerdigPvkKrav] = useState<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPvkKravLoading && pvkKrav && pvkKrav.krav) {
      setAntallPvkKrav(pvkKrav.krav.totalElements)

      const pvkEtterlevelser: TEtterlevelseQL[] = []

      pvkKrav.krav.content.forEach((krav) => {
        pvkEtterlevelser.push(...krav.etterlevelser)
      })

      setAntallFerdigPvkKrav(
        pvkEtterlevelser.filter(
          (etterlevelse) => etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
        ).length
      )
    }
  }, [isPvkKravLoading])

  return (
    <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
      <div className='flex justify-center'>
        <div>
          <Heading level='1' size='medium' className='mb-5'>
            Tilhørende dokumentasjon
          </Heading>

          <Heading level='2' size='small' className='mb-3'>
            Behandlinger i Behandlingskatalogen
          </Heading>

          <BodyLong>
            Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:
          </BodyLong>
          {etterlevelseDokumentasjon.behandlinger && (
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
            <BodyLong>Ingen behandlinger knyttet til denne dokumentasjonen.</BodyLong>
          )}

          <BodyShort className='inline-block mb-5 max-w-[75ch]'>
            Dere kan redigere hvilke behandlinger som gjelder i{' '}
            <Link
              href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='redigere etterlevelsesdokumentasjon'
            >
              Redigér dokumentegenskaper (åpner i en ny fane).
            </Link>
          </BodyShort>

          <Heading level='2' size='small' className='mb-3 mt-5'>
            PVK-relaterte etterlevelseskrav
          </Heading>

          <BodyLong>
            Personvernkonsekvensvurdering forutsetter at dere har dokumentert etterlevelse ved alle
            personvernkrav. Så langt har dere:
          </BodyLong>

          {!isPvkKravLoading && (
            <List as='ul'>
              <List.Item>
                {antallFerdigPvkKrav} av {antallPvkKrav} krav er ferdig utfylt.
              </List.Item>
            </List>
          )}

          {isPvkKravLoading && <Loader />}

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
                navigate(etterlevelseDokumentasjonPvkTabUrl(etterlevelseDokumentasjon.id))
            }}
          >
            Gå til PVK-relaterte krav
          </Button>

          <Heading level='2' size='small' className='mb-3 mt-5'>
            Risiko- og sårbarhetsvurdering (ROS)
          </Heading>

          <BodyLong className='inline-block mb-5'>
            Dersom dere har gjennomført en eller flere risikovurderinger, skal disse legges ved
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

                <BodyLong className='inline-block max-w-[75ch]'>
                  Dere kan redigere hvilke risikovurderinger og dokumenter som gjelder i{' '}
                  <Link
                    href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='redigere etterlevelsesdokumentasjon'
                  >
                    Redigér dokumentegenskaper (åpner i en ny fane).
                  </Link>
                </BodyLong>
              </div>
            )}

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
                  Redigér dokumentegenskaper (åpner i en ny fane).
                </Link>
              </BodyLong>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
