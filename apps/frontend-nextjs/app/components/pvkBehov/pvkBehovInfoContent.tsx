import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonBehandlingsenLivslopUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { Alert, BodyLong, BodyShort, Heading, Label, List } from '@navikt/ds-react'
import Link from 'next/link'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  profilering: boolean | null
  automatiskBehandling: boolean | null
  opplysningstyperMangler: boolean
  saerligKategorier: boolean
  behandlingensLivslop?: IBehandlingensLivslop
}

export const PvkBehovInfoContent: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  behandlingensLivslop,
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
        <Heading level='2' size='small' className='mb-5'>
          Egenskaper som gjelder for behandlingene deres
        </Heading>
      )}

      {(!etterlevelseDokumentasjon.behandlinger ||
        etterlevelseDokumentasjon.behandlinger.length === 0) && (
        <div>
          {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
            <Alert variant='info' className='mb-5'>
              Dere har ikke ennå lagt til behandlinger under{' '}
              <ExternalLink
                className='text-medium'
                href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
              >
                Dokumentegenskaper
              </ExternalLink>
              . Det anbefales at dere gjør dette før dere vurderer behov for PVK.
            </Alert>
          )}

          {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && (
            <Alert variant='info' className='mb-5'>
              Det har ikke blitt lagt til behandlinger under dokumentegenskaper.
            </Alert>
          )}
        </div>
      )}

      {etterlevelseDokumentasjon &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <BodyShort>
            Disse egenskapene blir enklere å vurdere hvis{' '}
            <Link
              href={pvkDokumentasjonBehandlingsenLivslopUrl(
                etterlevelseDokumentasjon.id,
                behandlingensLivslop?.id ? behandlingensLivslop.id : 'ny'
              )}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='redigere etterlevelsesdokumentasjon'
              className='inline'
            >
              dere har tegnet behandlingens livsløp (åpner i en ny fane).
            </Link>
          </BodyShort>
        )}

      <List className='py-5'>
        <div className='pb-3'>
          <Label>Følgende egenskaper er hentet fra Behandlingskatalogen:</Label>
        </div>
        {profilering !== null && (
          <List.Item>
            <strong>Det {profilering ? 'gjelder' : 'gjelder ikke'}</strong> profilering
          </List.Item>
        )}

        {automatiskBehandling !== null && (
          <List.Item>
            <strong>Det {automatiskBehandling ? 'gjelder' : 'gjelder ikke'}</strong> automatisert
            behandling
          </List.Item>
        )}

        {!opplysningstyperMangler && (
          <List.Item>
            <strong>Det {saerligKategorier ? 'gjelder' : 'gjelder ikke'}</strong> særlige kategorier
            av personopplysninger
          </List.Item>
        )}
      </List>

      {(profilering === null || automatiskBehandling === null || opplysningstyperMangler) && (
        <Alert variant='warning'>
          Dere har ikke vurdert følgende egenskaper i Behandlingskatalogen:
          <List>
            {profilering === null && <List.Item>Profilering</List.Item>}
            {automatiskBehandling === null && <List.Item>Automatisert behandling</List.Item>}
            {opplysningstyperMangler && (
              <List.Item>Særlige kategorier av personopplysninger</List.Item>
            )}
          </List>
          Dere bør fullføre dokumentasjon av behandlingene deres i{' '}
          <ExternalLink className='text-medium' href={`${getPollyBaseUrl()}`}>
            Behandlingskatalogen
          </ExternalLink>{' '}
          før dere vurderer behov for PVK.
        </Alert>
      )}
    </>
  )
}

export default PvkBehovInfoContent
