'use client'

import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
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
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  risikoscenarioList: IRisikoscenario[]
  artOgOmfang: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  risikoscenarioList,
  artOgOmfang,
  behandlingsLivslop,
  pvkDokument,
}) => {
  const router = useRouter()
  const user = useContext(UserContext)
  const isRisikoeier: boolean = etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())

  return (
    <>
      {etterlevelseDokumentasjon.forGjenbruk && (
        <TillatGjenbrukModal
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )}

      {/** satt knappene tilbake slik at vi kan prodsette ting */}
      <>
        <Button
          onClick={() => {
            router.push(etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id))
          }}
          size='small'
          variant='tertiary'
          className='whitespace-nowrap'
        >
          Rediger dokumentegenskaper
        </Button>
        {etterlevelseDokumentasjon.forGjenbruk && (
          <TillatGjenbrukModal
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
          />
        )}
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

        {pvkDokument && pvkDokument.skalUtforePvk && (
          <Button
            onClick={() => {
              router.push(pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1))
            }}
            size='small'
            variant={getVariantForPVKButton(pvkDokument, behandlingsLivslop)}
            className='whitespace-nowrap'
          >
            {getPvkButtonText(pvkDokument, risikoscenarioList, isRisikoeier)}
          </Button>
        )}
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
      </>

      {/** KUN synlig i dev da den ikke er klar til å bli prodsatt ennå  */}
      {env.isDev && <EtterlevelseButton etterlevelseDokumentasjon={etterlevelseDokumentasjon} />}
      {env.isDev && (
        <PersonvernkonsekvensvurderingButton
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          risikoscenarioList={risikoscenarioList}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
          isRisikoeier={isRisikoeier}
        />
      )}
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
