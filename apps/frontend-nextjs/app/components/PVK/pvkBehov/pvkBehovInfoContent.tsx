import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import {
  harBehandlinger,
  harKunDpBehandlinger,
} from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Heading, InfoCard, Label, List } from '@navikt/ds-react'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  profilering: boolean | null
  automatiskBehandling: boolean | null
  opplysningstyperMangler: boolean
  saerligKategorier: boolean
}

export const PvkBehovInfoContent: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  profilering,
  opplysningstyperMangler,
  saerligKategorier,
  automatiskBehandling,
}) => {
  const user = useContext(UserContext)
  return (
    <>
      <BodyLong>
        En PVK skal gjennomføres når vi ønsker å starte eller endre en behandling av
        personopplysninger som sannsynligvis vil medføre høy risiko for den registrertes rettigheter
        og friheter.
      </BodyLong>

      {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
        <Heading level='2' size='medium' className='mb-5'>
          Egenskaper som gjelder for behandlingene deres
        </Heading>
      )}

      {!harBehandlinger(etterlevelseDokumentasjon) &&
        !harKunDpBehandlinger(etterlevelseDokumentasjon) && (
          <div>
            {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
              <InfoCard data-color='warning' className='mb-5'>
                <InfoCard.Message icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                  Dere har ikke ennå lagt til behandlinger under{' '}
                  <ExternalLink
                    className='text-medium'
                    href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                  >
                    Dokumentegenskaper
                  </ExternalLink>
                  . Det må legges til behandlinger før dere vurderer behov for PVK.
                </InfoCard.Message>
              </InfoCard>
            )}

            {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && (
              <InfoCard data-color='warning' className='mb-5'>
                <InfoCard.Message icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                  Det har ikke blitt lagt til behandlinger under dokumentegenskaper.
                </InfoCard.Message>
              </InfoCard>
            )}
          </div>
        )}

      {harBehandlinger(etterlevelseDokumentasjon) && (
        <>
          <div>
            <Heading level='3' size='small' spacing>
              Følgende informasjon er hentet fra Behandlingskatalogen:
            </Heading>
            <DataTextWrapper>
              {(profilering === true ||
                automatiskBehandling === true ||
                saerligKategorier === true) && (
                <div className='pb-3'>
                  <Label as='p'>Gjeldende egenskaper:</Label>
                  <List className='ml-6'>
                    {profilering === true && <List.Item>profilering</List.Item>}
                    {automatiskBehandling === true && (
                      <List.Item>helautomatisert behandling</List.Item>
                    )}
                    {!opplysningstyperMangler && saerligKategorier === true && (
                      <List.Item>særlige kategorier av personopplysninger</List.Item>
                    )}
                  </List>
                </div>
              )}

              {(profilering === false ||
                automatiskBehandling === false ||
                (!opplysningstyperMangler && saerligKategorier === false)) && (
                <div>
                  <Label as='p'>Disse egenskapene gjelder ikke:</Label>
                  <List className='ml-6'>
                    {profilering === false && <List.Item>profilering</List.Item>}
                    {automatiskBehandling === false && (
                      <List.Item>helautomatisert behandling</List.Item>
                    )}
                    {!opplysningstyperMangler && saerligKategorier === false && (
                      <List.Item>særlige kategorier av personopplysninger</List.Item>
                    )}
                  </List>
                </div>
              )}

              {profilering === null && automatiskBehandling === null && opplysningstyperMangler && (
                <BodyShort>Ingen egenskaper gjelder</BodyShort>
              )}
            </DataTextWrapper>
          </div>

          {(profilering === null || automatiskBehandling === null || opplysningstyperMangler) && (
            <InfoCard data-color='warning'>
              <InfoCard.Message icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                Dere har ikke vurdert følgende egenskaper i Behandlingskatalogen:
                <List>
                  {profilering === null && <List.Item>Profilering</List.Item>}
                  {automatiskBehandling === null && (
                    <List.Item>Helautomatisert behandling</List.Item>
                  )}
                  {opplysningstyperMangler && (
                    <List.Item>Særlige kategorier av personopplysninger</List.Item>
                  )}
                </List>
                Dere bør fullføre dokumentasjon av behandlingene deres i{' '}
                <ExternalLink className='text-medium' href={`${getPollyBaseUrl()}`}>
                  Behandlingskatalogen
                </ExternalLink>{' '}
                før dere vurderer behov for PVK.
              </InfoCard.Message>
            </InfoCard>
          )}
        </>
      )}

      {harKunDpBehandlinger(etterlevelseDokumentasjon) && (
        <div>
          <Heading level='3' size='small' spacing>
            Følgende informasjon er hentet fra Behandlingskatalogen:
          </Heading>
          <DataTextWrapper>
            <List>
              <List.Item>
                <strong>
                  Det{' '}
                  {etterlevelseDokumentasjon.dpBehandlinger &&
                  etterlevelseDokumentasjon.dpBehandlinger.some((dp) => dp.art9)
                    ? 'gjelder'
                    : 'gjelder ikke'}
                </strong>{' '}
                særlige kategorier av personopplysninger
              </List.Item>
            </List>
          </DataTextWrapper>
        </div>
      )}
    </>
  )
}

export default PvkBehovInfoContent
