import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { pvkDokumentasjonBehandlingsenLivslopUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  risikoscenarioList: IRisikoscenario[]
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
  isRisikoeier: boolean
}

const EtterleverPVKKnapper: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  risikoscenarioList,
  behandlingsLivslop,
  pvkDokument,
  isRisikoeier,
}) => {
  const showBehandlingsLivslopReadOnlyButton =
    etterlevelseDokumentasjon.status ===
      EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER ||
    (pvkDokument &&
      [EPvkDokumentStatus.SENDT_TIL_PVO, EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING].includes(
        pvkDokument.status
      ))

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          variant='secondary-neutral'
          icon={<ChevronDownIcon aria-hidden />}
          iconPosition='right'
        >
          PVK
        </Button>
      </ActionMenu.Trigger>
      {/* <ActionMenu.Content> */}
      {/* {behandlingsLivslop ? 'Rediger behandlinges livsløp' : 'Tegn behandlingens livsløp'} */}
      <ActionMenu.Content>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenLivslopUrl(
            etterlevelseDokumentasjon.id,
            behandlingsLivslop ? behandlingsLivslop.id : 'ny'
          )}
        >
          {showBehandlingsLivslopReadOnlyButton
            ? 'Tegn behandlingens livsløp'
            : 'Se behandlingens livsløp'}
        </ActionMenu.Item>
      </ActionMenu.Content>
      {/* <EtterleverPVKKnapper
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      behandlingsLivslop={behandlingsLivslop}
      pvkDokument={pvkDokument}
      risikoscenarioList={risikoscenarioList}
      isRisikoeier={isRisikoeier}
    /> */}
      {/* <ActionMenu.Item
        as='a'
        href={pvkDokumentasjonBehandlingsenLivslopUrl(
          etterlevelseDokumentasjon.id,
          behandlingsLivslop ? behandlingsLivslop.id : 'ny'
        )}
      >
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Group label=''>
        {pvkDokument && pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE && (
          <ActionMenu.Item
            as='a'
            href={pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1)}
          >
            {getPvkButtonText(pvkDokument, risikoscenarioList, isRisikoeier)}
          </ActionMenu.Item>
        )}
        {!etterlevelseDokumentasjon.irrelevansFor.some(
          (irrelevans) => irrelevans.code === 'PERSONOPPLYSNINGER'
        ) && (
          <ActionMenu.Item
            as='a'
            href={pvkDokumentasjonPvkBehovUrl(
              etterlevelseDokumentasjon.id,
              pvkDokument ? pvkDokument.id : 'ny'
            )}
          >
            {isPvkDokumentVurdert(pvkDokument) ? 'Revurder behov for PVK' : 'Vurder behov for PVK'}
          </ActionMenu.Item>
        )}
      </ActionMenu.Group>
    </ActionMenu.Content> */}
    </ActionMenu>
  )
}

export default EtterleverPVKKnapper
