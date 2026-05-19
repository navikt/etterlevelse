import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { harKunDpBehandlinger } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { BodyShort, Label, Link, List } from '@navikt/ds-react'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  behandlingensLivslop?: IBehandlingensLivslop
  artOgOmfangId?: string
}

export const PvkBehovInfoContent: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  behandlingensLivslop,
  artOgOmfangId,
}) => {
  const user = useContext(UserContext)
  return (
    <>
      {etterlevelseDokumentasjon &&
        harKunDpBehandlinger(etterlevelseDokumentasjon) &&
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
              dere har tegnet behandlingens livsløp (åpner i en ny fane)
            </Link>{' '}
            og{' '}
            <Link
              href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
                etterlevelseDokumentasjon.id,
                artOgOmfangId || 'ny'
              )}
              target='_blank'
              rel='noopener noreferrer'
              className='inline'
            >
              vurdert behandlingens art og omfang (åpner i en ny fane).
            </Link>
          </BodyShort>
        )}

      {harKunDpBehandlinger(etterlevelseDokumentasjon) && (
        <>
          <List className='py-5'>
            <div className='pb-3'>
              <Label>Følgende egenskaper er hentet fra Behandlingskatalogen:</Label>
            </div>
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
        </>
      )}
    </>
  )
}

export default PvkBehovInfoContent
