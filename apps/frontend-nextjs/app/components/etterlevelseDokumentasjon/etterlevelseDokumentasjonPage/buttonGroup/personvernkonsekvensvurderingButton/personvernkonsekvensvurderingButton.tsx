import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { FunctionComponent } from 'react'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import PersonvernombudRolle from './personvernombudRolle/personvernombudRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  risikoscenarioList: IRisikoscenario[]
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
  isRisikoeier: boolean
}

const test: string = 'Etterlever'

export const PersonvernkonsekvensvurderingButton: FunctionComponent<TProps> = (
  {
    // etterlevelseDokumentasjon,
    // behandlingsLivslop,
    // pvkDokument,
    // risikoscenarioList,
    // isRisikoeier,
  }
) => {
  switch (test) {
    case 'Etterlever':
      return (
        <EtterleverRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case 'Personvernombud':
      return (
        <PersonvernombudRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case 'Risikoeier':
      return (
        <EtterleverRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case 'Admin med alle andre roller ogsa skrudd pa':
      return (
        <EtterleverRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    default:
      return <></>
  }

  // return (
  // <>
  //   {test === 'Etterlever' && (
  //     <EtterleverRolle
  //     etterlevelseDokumentasjon={etterlevelseDokumentasjon}
  //     risikoscenarioList={risikoscenarioList}
  //     behandlingsLivslop={behandlingsLivslop}
  //     pvkDokument={pvkDokument}
  //     isRisikoeier={isRisikoeier}
  //     />
  //   )}

  {
    /* <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          variant='secondary-neutral'
          icon={<ChevronDownIcon aria-hidden />}
          iconPosition='right'
        >
          PVK
        </Button>
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        {/* {behandlingsLivslop ? 'Rediger behandlinges livsløp' : 'Tegn behandlingens livsløp'} */
  }
  {
    /* <ActionMenu.Item
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
              {isPvkDokumentVurdert(pvkDokument)
                ? 'Revurder behov for PVK'
                : 'Vurder behov for PVK'}
            </ActionMenu.Item>
          )}
        </ActionMenu.Group>
      </ActionMenu.Content>
    </ActionMenu> */
  }
  //   </>
  // )
}
