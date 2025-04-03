import { BodyShort, Heading, Label, Link, List } from '@navikt/ds-react'
import { behandlingName } from '../../../api/BehandlingApi'
import { IBehandling, IEtterlevelseDokumentasjon } from '../../../constants'
import { user } from '../../../services/User'
import { env } from '../../../util/env'
import { ExternalLink } from '../../common/RouteLink'
import { pvkEditUrl } from '../../common/RouteLinkPvk'

interface IProps {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}

export const PvkBehovMetadata = (props: IProps) => {
  const { etterlevelseDokumentasjon } = props
  return (
    <>
      <Heading level='2' size='small' className='mb-5'>
        Hentet fra deres etterlevelsesdokumentasjon
      </Heading>

      <Label>Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:</Label>
      {etterlevelseDokumentasjon.behandlinger ? (
        <List>
          {etterlevelseDokumentasjon.behandlinger.map((behandling: IBehandling) => (
            <List.Item key={behandling.nummer}>
              <ExternalLink
                className='text-medium'
                href={`${env.pollyBaseUrl}process/${behandling.id}`}
              >
                {behandlingName(behandling)}
              </ExternalLink>
            </List.Item>
          ))}
        </List>
      ) : (
        <BodyShort className='my-5'>Ingen behandling er valgt.</BodyShort>
      )}

      <Label>Dere har koblet følgende dokumenter på denne etterlevelsesdokumentasjonen:</Label>

      {etterlevelseDokumentasjon.risikovurderinger.length > 0 ? (
        <List>
          {etterlevelseDokumentasjon.risikovurderinger.map((ros) => {
            const rosReg = /\[(.+)]\((.+)\)/i
            const rosParts = ros.match(rosReg)
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
            href={pvkEditUrl(etterlevelseDokumentasjon.id)}
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
