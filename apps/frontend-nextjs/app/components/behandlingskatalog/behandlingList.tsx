import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { behandlingName, getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { BodyLong, Label } from '@navikt/ds-react'
import { ExternalLink } from '../common/externalLink/externalLink'

interface IProps {
  behandlingIds: string[]
  behandlinger?: IBehandling[]
}

export const BehandlingList = (props: IProps) => {
  const { behandlingIds, behandlinger } = props

  return (
    <div className='flex gap-2 mb-2.5'>
      <div>
        <Label size='medium'>Behandlinger:</Label>
      </div>
      <div>
        {behandlingIds?.length >= 1 &&
          behandlingIds.map((behandlingId, index) => (
            <div key={'behandling_link_' + index}>
              {behandlinger && behandlinger[index].navn && (
                <ExternalLink
                  className='text-medium'
                  href={`${getPollyBaseUrl()}process/${behandlingId}`}
                >
                  {behandlinger?.length > 0
                    ? `${behandlingName(behandlinger[index])}`
                    : 'Ingen data'}
                </ExternalLink>
              )}

              {behandlinger && !behandlinger[index].navn && (
                <BodyLong size='medium'>Ingen data</BodyLong>
              )}
            </div>
          ))}

        {behandlingIds?.length === 0 && (
          <BodyLong size='medium'>Husk å legge til behandling fra behandlingskatalogen</BodyLong>
        )}
      </div>
    </div>
  )
}
