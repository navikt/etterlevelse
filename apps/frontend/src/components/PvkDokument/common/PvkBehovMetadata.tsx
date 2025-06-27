import { BodyShort, Heading, Label, Link, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { behandlingName } from '../../../api/BehandlingApi'
import { IBehandling, IEtterlevelseDokumentasjon } from '../../../constants'
import { user } from '../../../services/User'
import { getPollyBaseUrl } from '../../behandling/utils/pollyUrlUtils'
import { ExternalLink } from '../../common/RouteLink'
import { etterlevelsesDokumentasjonEditUrl } from '../../common/RouteLinkEtterlevelsesdokumentasjon'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}

export const PvkBehovMetadata: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => (
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
    {!etterlevelseDokumentasjon.behandlinger && (
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
        Dere kan redigere hvilke behandinger og dokumenter som er tilknyttet i{' '}
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

export default PvkBehovMetadata
