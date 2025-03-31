import { BodyLong, Label } from '@navikt/ds-react'
import { behandlingName } from '../../api/BehandlingApi'
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
    <div className="flex gap-2 mb-2.5">
      <Label size="medium">Behandlinger:</Label>
      <div>
        {behandlingIds?.length >= 1 &&
          behandlerPersonopplysninger &&
          behandlingIds.map((behandlingId, index) => (
            <div key={'behandling_link_' + index}>
              {behandlinger && behandlinger[index].navn && (
                <ExternalLink
                  className="text-medium"
                  href={`${env.pollyBaseUrl}process/${behandlingId}`}
                >
                  {behandlinger?.length > 0
                    ? `${behandlingName(behandlinger[index])}`
                    : 'Ingen data'}
                </ExternalLink>
              )}

              {behandlinger && !behandlinger[index].navn && (
                <BodyLong size="medium">Ingen data</BodyLong>
              )}
            </div>
          ))}

        {behandlingIds?.length === 0 && (
          <BodyLong size="medium">Husk å legge til behandling fra behandlingskatalogen</BodyLong>
        )}
      </div>
    </div>
  )
}
