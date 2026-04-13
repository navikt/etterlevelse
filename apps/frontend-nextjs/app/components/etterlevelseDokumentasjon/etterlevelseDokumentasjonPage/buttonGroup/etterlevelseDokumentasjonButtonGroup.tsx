'use client'

import { getPvoTilbakemeldingByPvkDokumentId } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IDocumentRelationWithEtterlevelseDokumetajson } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { env } from '@/util/env/env'
import { Loader } from '@navikt/ds-react'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { EtterlevelseButton } from './etterlevelseButton/etterlevelseButton'
import GjenbrukButton from './gjenbrukButton/gjenbrukButton'
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  relasjonLoading: boolean
  morDokumentRelasjon?: IDocumentRelationWithEtterlevelseDokumetajson
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  relasjonLoading,
  morDokumentRelasjon,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
  pvkDokument,
}) => {
  const user = useContext(UserContext)
  const [pvoTilbakemelding, setPvoTilbakemelding] = useState<IPvoTilbakemelding>()
  const behandlerPersonopplysninger: boolean = !etterlevelseDokumentasjon.irrelevansFor.some(
    (irrelevans) =>
      irrelevans.code === 'PERSONOPPLYSNINGER' ||
      irrelevans.shortName === 'Behandler personopplysninger'
  )

  useEffect(() => {
    ;(async () => {
      if (pvkDokument) {
        await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
          .then((resp) => {
            if (resp) {
              setPvoTilbakemelding(resp)
            }
          })
          .catch(() => null)
      }
    })()
  }, [pvkDokument])

  return (
    <>
      <EtterlevelseButton etterlevelseDokumentasjon={etterlevelseDokumentasjon} user={user} />

      {behandlerPersonopplysninger && (
        <PersonvernkonsekvensvurderingButton
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
          pvoTilbakemelding={pvoTilbakemelding}
          user={user}
        />
      )}

      {env.isDev &&
        (user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) &&
        relasjonLoading && <Loader />}

      {(user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) &&
        !relasjonLoading &&
        !morDokumentRelasjon && (
          <GjenbrukButton
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
            user={user}
          />
        )}
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
