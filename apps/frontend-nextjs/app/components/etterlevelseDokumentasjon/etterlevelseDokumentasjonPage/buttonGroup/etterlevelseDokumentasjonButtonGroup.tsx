'use client'

import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
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

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  risikoscenarioList: IRisikoscenario[]
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  risikoscenarioList,
  behandlingsLivslop,
  pvkDokument,
}) => {
  const router = useRouter()
  const user = useContext(UserContext)
  const isRisikoeier = etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())

  return (
    <>
      <Button
        onClick={() => {
          router.push(etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id))
        }}
        size='small'
        variant='tertiary'
        className='whitespace-nowrap'
      >
        Redigér dokumentegenskaper
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
        {isPvkDokumentVurdert(pvkDokument) ? 'Revurdér behov for PVK' : 'Vurdér behov for PVK'}
      </Button>
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
