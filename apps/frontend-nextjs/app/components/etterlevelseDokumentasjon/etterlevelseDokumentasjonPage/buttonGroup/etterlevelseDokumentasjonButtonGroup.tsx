'use client'

import { getPvoTilbakemeldingByPvkDokumentId } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { env } from '@/util/env/env'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import TillatGjenbrukModal from '../gjenbruk/TillatGjenbrukModal'
import { EtterlevelseButton } from './etterlevelseButton/etterlevelseButton'
import GjenbrukButton from './gjenbrukButton/gjenbrukButton'
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
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
      <>
        {etterlevelseDokumentasjon.forGjenbruk &&
          etterlevelseDokumentasjon.hasCurrentUserAccess && (
            <TillatGjenbrukModal
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
            />
          )}
      </>

      {(user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) && (
        <EtterlevelseButton etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
      )}
      {behandlerPersonopplysninger && (
        <PersonvernkonsekvensvurderingButton
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
          pvoTilbakemelding={pvoTilbakemelding}
        />
      )}

      {/** KUN synlig i dev da den ikke er klar til å bli prodsatt ennå  */}
      {env.isDev &&
        etterlevelseDokumentasjon.forGjenbruk &&
        (user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) && (
          <GjenbrukButton
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
          />
        )}
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
