import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { behandlingName, getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { BodyShort, Heading, Label, List } from '@navikt/ds-react'
import Link from 'next/link'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}

export const PvkBehovMetadata: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  const user = useContext(UserContext)
  return (
    <>
      <Heading level='2' size='small' className='mb-5'>
        Hentet fra deres etterlevelsesdokumentasjon
      </Heading>

      <Label>Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:</Label>
      {etterlevelseDokumentasjon.behandlinger && (
        <List>
          {etterlevelseDokumentasjon.behandlinger.map((behandling: IBehandling) => (
            <List.Item key={behandling.nummer}>
              <ExternalLink
                className='text-medium'
                href={`${getPollyBaseUrl()}process/${behandling.id}`}
              >
                {behandlingName(behandling)}
              </ExternalLink>
            </List.Item>
          ))}
        </List>
      )}
      {etterlevelseDokumentasjon.behandlinger?.length === 0 && (
        <BodyShort className='my-5'>Ingen behandling er valgt.</BodyShort>
      )}

      <Label>Dere har koblet følgende dokumenter på denne etterlevelsesdokumentasjonen:</Label>

      {etterlevelseDokumentasjon.risikovurderinger.length > 0 ? (
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
      ) : (
        <BodyShort className='my-5'> Ingen dokumenter valgt.</BodyShort>
      )}

      {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
        <BodyShort className='inline-block'>
          Dere kan redigere hvilke behandlinger og dokumenter som er tilknyttet i{' '}
          <Link
            href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='redigere etterlevelsesdokumentasjon'
          >
            Dokumentegenskaper (åpner i en ny fane).
          </Link>
        </BodyShort>
      )}
    </>
  )
}

export default PvkBehovMetadata
