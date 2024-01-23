import { BodyShort } from '@navikt/ds-react'
import { IBehandling } from '../../constants'
import { env } from '../../util/env'
import { ExternalLink } from '../common/RouteLink'

interface IProps {
  behandlingIds: string[]
  behandlerPersonopplysninger: boolean
  behandlinger?: IBehandling[]
}

export const BehandlingList = (props: IProps) => {
  const { behandlingIds, behandlinger, behandlerPersonopplysninger } = props

  return (
    <div className="flex gap-2 flex-wrap items-center mb-2.5">
      <BodyShort size="small">Behandling:</BodyShort>
      {behandlingIds?.length >= 1 &&
        behandlerPersonopplysninger &&
        behandlingIds.map((behandlingId, index) => (
          <div key={'behandling_link_' + index}>
            {behandlinger && behandlinger[index].navn && (
              <ExternalLink
                className="text-medium"
                href={`${env.pollyBaseUrl}process/${behandlingId}`}
              >
                {behandlinger?.length > 0 ? `${behandlinger[index].navn}` : 'Ingen data'}
              </ExternalLink>
            )}

            {behandlinger && !behandlinger[index].navn && (
              <BodyShort size="small">
                {behandlinger ? behandlinger[index].navn : 'Ingen data'}
              </BodyShort>
            )}
          </div>
        ))}

      {behandlingIds?.length === 0 && (
        <BodyShort size="small">Husk å legge til behandling fra behandlingskatalogen</BodyShort>
      )}
    </div>
  )
}
