import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { Markdown } from '@/components/common/markdown/markdown'
import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { behandlingskatalogenProcessUrl } from '@/routes/behandlingskatalog/behandlingskatalogRoutes'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { behandlingName, getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { BodyShort, Heading, Label, List } from '@navikt/ds-react'
import Link from 'next/link'
import { FunctionComponent } from 'react'

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
