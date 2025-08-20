import { BodyShort, Heading, Label, Link, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { behandlingName } from '../../api/BehandlingApi'
import { IBehandling, IEtterlevelseDokumentasjon } from '../../constants'
import { getPollyBaseUrl } from '../behandling/utils/pollyUrlUtils'
import { Markdown } from '../common/Markdown'
import { ExternalLink } from '../common/RouteLink'
import { behandlingskatalogenProcessUrl } from '../common/RouteLinkBehandlingskatalogen'
import { etterlevelsesDokumentasjonEditUrl } from '../common/RouteLinkEtterlevelsesdokumentasjon'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}
export const BehandlingensLivsLopSidePanel: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => (
  <div>
    <Heading level='2' size='small' className='mb-5'>
      Hentet fra deres etterlevelsesdokumentasjon
    </Heading>

    <Label>Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:</Label>
    {etterlevelseDokumentasjon.behandlinger && (
      <>
        <List>
          {etterlevelseDokumentasjon.behandlinger.map((behandling: IBehandling) => (
            <List.Item key={behandling.nummer}>
              <ExternalLink
                className='text-medium'
                href={behandlingskatalogenProcessUrl(getPollyBaseUrl(), behandling.id)}
              >
                {behandlingName(behandling)}
              </ExternalLink>
            </List.Item>
          ))}
        </List>
      </>
    )}

    {etterlevelseDokumentasjon.behandlinger?.length === 0 && (
      <BodyShort className='my-5'>Ingen behandling er valgt.</BodyShort>
    )}

    <Label>Dere har koblet følgende dokumenter på denne etterlevelsesdokumentasjonen:</Label>

    {etterlevelseDokumentasjon.risikovurderinger &&
      etterlevelseDokumentasjon.risikovurderinger.length > 0 && (
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
      )}

    {etterlevelseDokumentasjon.risikovurderinger?.length === 0 && (
      <BodyShort className='my-5'>Det er ikke koblet noen dokumenter.</BodyShort>
    )}

    <BodyShort className='inline-block mb-5'>
      Dere kan redigere hvilke behandinger og risikovurderinger som gjelder i{' '}
      <Link
        href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='redigere etterlevelsesdokumentasjon'
      >
        Dokumentegenskaper (åpner i en ny fane).
      </Link>
    </BodyShort>

    <div>
      <Label>Deres beskrivelse av etterlevelsen</Label>

      {etterlevelseDokumentasjon.beskrivelse && (
        <div className='mt-3'>
          <Markdown source={etterlevelseDokumentasjon.beskrivelse} />
        </div>
      )}
      {!etterlevelseDokumentasjon.beskrivelse && (
        <BodyShort className='mt-3'>Det er ikke skrevet en beskrivelse på etterlevelsen</BodyShort>
      )}
    </div>
  </div>
)

export default BehandlingensLivsLopSidePanel
