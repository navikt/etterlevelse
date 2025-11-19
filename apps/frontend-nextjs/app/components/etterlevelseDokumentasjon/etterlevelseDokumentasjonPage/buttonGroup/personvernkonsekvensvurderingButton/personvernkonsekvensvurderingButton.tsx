import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
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
import Link from 'next/link'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  risikoscenarioList: IRisikoscenario[]
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

export const PersonvernkonsekvensvurderingButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  behandlingsLivslop,
  pvkDokument,
  risikoscenarioList,
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
      <Link
        href={pvkDokumentasjonBehandlingsenLivslopUrl(
          etterlevelseDokumentasjon.id,
          behandlingsLivslop ? behandlingsLivslop.id : 'ny'
        )}
      >
        {/* {behandlingsLivslop ? 'Rediger behandlinges livsløp' : 'Tegn behandlingens livsløp'} */}
        <ActionMenu.Item as='a'>Tegn behandlingens livsløp</ActionMenu.Item>
      </Link>
      <ActionMenu.Group label=''>
        {pvkDokument && pvkDokument.skalUtforePvk && (
          <Link href={pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1)}>
            <ActionMenu.Item as='a'>
              {getPvkButtonText(pvkDokument, risikoscenarioList)}
            </ActionMenu.Item>
          </Link>
        )}
        <Link
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
          passHref
        >
          <ActionMenu.Item as='a'>
            {isPvkDokumentVurdert(pvkDokument) ? 'Revurder behov for PVK' : 'Vurder behov for PVK'}
          </ActionMenu.Item>
        </Link>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
