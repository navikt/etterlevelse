'use client'

import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { env } from '@/util/env/env'
import { getVariantForBAOButton } from '@/util/etterlevelseDokumentasjon/behandlingensArtOgOmfang/behandlingensArtOgOmfangUtils'
import { getVariantForBLLButton } from '@/util/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopUtils'
import {
  getPvkButtonText,
  getVariantForPVKBehovButton,
  getVariantForPVKButton,
  isPvkDokumentVurdert,
} from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Button } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useContext } from 'react'
import TillatGjenbrukModal from '../gjenbruk/TillatGjenbrukModal'
import { EtterlevelseButton } from './etterlevelseButton/etterlevelseButton'
import GjenbrukButton from './gjenbrukButton/gjenbrukButton'
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  risikoscenarioList: IRisikoscenario[]
  artOgOmfang: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  risikoscenarioList,
  artOgOmfang,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
  pvkDokument,
}) => {
  const router = useRouter()
  const user = useContext(UserContext)
  const isRisikoeier: boolean = etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())
  const behandlerPersonopplysninger: boolean = !etterlevelseDokumentasjon.irrelevansFor.some(
    (irrelevans) =>
      irrelevans.code === 'PERSONOPPLYSNINGER' ||
      irrelevans.shortName === 'Behandler personopplysninger'
  )

  return (
    <>
      {/** satt knappene tilbake slik at vi kan prodsette ting */}
      <>
        {(user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) && (
          <Button
            onClick={() => {
              router.push(etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id))
            }}
            size='small'
            variant='tertiary'
            className='whitespace-nowrap w-full justify-center'
          >
            Rediger dokumentegenskaper
          </Button>
        )}
        {etterlevelseDokumentasjon.forGjenbruk && !env.isDev && (
          <TillatGjenbrukModal
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
          />
        )}

        {behandlerPersonopplysninger && (
          <Button
            onClick={() => {
              router.push(
                pvkDokumentasjonBehandlingsenLivslopUrl(
                  etterlevelseDokumentasjon.id,
                  behandlingsLivslop ? behandlingsLivslop.id : 'ny'
                )
              )
            }}
            size='small'
            variant={getVariantForBLLButton(behandlingsLivslop)}
            className='whitespace-nowrap'
          >
            {/* {behandligensLivslop ? 'Rediger behandlinges livsløp' : 'Tegn behandlingens livsløp'} */}
            Tegn behandlingens livsløp
          </Button>
        )}

        {behandlerPersonopplysninger && (
          <Button
            onClick={() => {
              router.push(
                pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
                  etterlevelseDokumentasjon.id,
                  artOgOmfang.id ? artOgOmfang.id : 'ny'
                )
              )
            }}
            size='small'
            variant={getVariantForBAOButton(artOgOmfang)}
            className='whitespace-nowrap'
          >
            Beskriv art og omfang
          </Button>
        )}

        {behandlerPersonopplysninger &&
          pvkDokument &&
          pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE && (
            <Button
              onClick={() => {
                router.push(
                  pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1)
                )
              }}
              size='small'
              variant={getVariantForPVKButton(pvkDokument, behandlingsLivslop)}
              className='whitespace-nowrap'
            >
              {getPvkButtonText(pvkDokument, risikoscenarioList, isRisikoeier)}
            </Button>
          )}

        {behandlerPersonopplysninger && (
          <Button
            onClick={() => {
              router.push(
                pvkDokumentasjonPvkBehovUrl(
                  etterlevelseDokumentasjon.id,
                  pvkDokument ? pvkDokument.id : 'ny'
                )
              )
            }}
            size='small'
            variant={getVariantForPVKBehovButton(pvkDokument, behandlingsLivslop)}
            className='whitespace-nowrap'
          >
            {isPvkDokumentVurdert(pvkDokument) ? 'Revurder behov for PVK' : 'Vurder behov for PVK'}
          </Button>
        )}
      </>

      {/** KUN synlig i dev da den ikke er klar til å bli prodsatt ennå  */}
      {env.isDev && (user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) && (
        <EtterlevelseButton etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
      )}
      {env.isDev && behandlerPersonopplysninger && (
        <PersonvernkonsekvensvurderingButton
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )}
      {env.isDev && etterlevelseDokumentasjon.forGjenbruk && (
        <GjenbrukButton
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )}
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
