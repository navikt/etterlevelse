import { IDpBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { dpBehandlingName, getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { BodyLong, Label, List } from '@navikt/ds-react'
import { ExternalLink } from '../common/externalLink/externalLink'

interface IProps {
  dpBehandlingIds: string[]
  dpBehandlinger?: IDpBehandling[]
}

export const DpBehandlingList = (props: IProps) => {
  const { dpBehandlingIds, dpBehandlinger } = props

  return (
    <div className='flex gap-2 mb-2.5'>
      <div>
        <Label size='medium'>Behandlinger der Nav er databehandler:</Label>
      </div>
      <List>
        {dpBehandlingIds?.length >= 1 &&
          dpBehandlingIds.map((dpBehandlingId, index) => (
            <List.Item key={'dp_behandling_link_' + index}>
              {dpBehandlinger && dpBehandlinger[index].navn && (
                <ExternalLink
                  className='text-medium'
                  href={`${getPollyBaseUrl()}dpprocess/${dpBehandlingId}`}
                >
                  {dpBehandlinger?.length > 0
                    ? `${dpBehandlingName(dpBehandlinger[index])}`
                    : 'Ingen data'}
                </ExternalLink>
              )}

              {dpBehandlinger && !dpBehandlinger[index].navn && (
                <BodyLong size='medium'>Ingen data</BodyLong>
              )}
            </List.Item>
          ))}
      </List>
    </div>
  )
}
