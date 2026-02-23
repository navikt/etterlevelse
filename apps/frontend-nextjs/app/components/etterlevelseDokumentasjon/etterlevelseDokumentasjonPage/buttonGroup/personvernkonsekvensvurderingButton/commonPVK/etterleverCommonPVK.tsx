import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument?: IPvkDokument
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
}

export const EtterleverSkalIkkeUtforePvkActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
}) => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Personvernkonsekvensvurdering (PVK)
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Group label='Forstå behandlingen'>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenLivslopUrl(
            etterlevelseDokumentasjon.id,
            behandlingsLivslop ? behandlingsLivslop.id : 'ny'
          )}
        >
          Tegn behandlingens livsløp
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
            etterlevelseDokumentasjon.id,
            behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'
          )}
        >
          Beskriv art og omfang
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
        >
          Revurder behov for PVK
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
}) => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Personvernkonsekvensvurdering (PVK)
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Group label='Forstå behandlingen'>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenLivslopUrl(
            etterlevelseDokumentasjon.id,
            behandlingsLivslop ? behandlingsLivslop.id : 'ny'
          )}
        >
          Tegn Behandlingens livsløp
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
            etterlevelseDokumentasjon.id,
            behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'
          )}
        >
          Beskriv Art og omfang
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonStepUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny',
            1
          )}
        >
          Påbegynn PVK
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
        >
          Revurder Behov for PVK
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkGodkjentAvRisikoeierActionMenuVariant = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Personvernkonsekvensvurdering (PVK)
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Group label='Forstå behandlingen'>
        <ActionMenu.Item as='a' href=''>
          Tegn behandlingens livsløp
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Beskriv art og omfang
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item as='a' href=''>
          Les PVK (read-only, godkjent versjon) og Oppdater PVK (åpner neste versjon)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Les om behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
