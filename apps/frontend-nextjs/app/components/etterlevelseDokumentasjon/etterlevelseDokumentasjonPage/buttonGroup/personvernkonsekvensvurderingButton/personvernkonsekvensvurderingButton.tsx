import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import {
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import {
  getPvkButtonText,
  isPvkDokumentVurdert,
} from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
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

export const PersonvernkonsekvensvurderingButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  behandlingsLivslop,
  pvkDokument,
  risikoscenarioList,
  isRisikoeier,
}) => (
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
    <ActionMenu.Content>
      {/* {behandlingsLivslop ? 'Rediger behandlinges livsløp' : 'Tegn behandlingens livsløp'} */}
      <ActionMenu.Item
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
    </ActionMenu.Content>
  </ActionMenu>
)
