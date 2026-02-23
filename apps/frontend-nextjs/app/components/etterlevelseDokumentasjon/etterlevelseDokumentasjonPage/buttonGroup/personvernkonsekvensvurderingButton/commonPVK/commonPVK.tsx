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

export const PvkIkkePabegyntActionMenuVariant = () => (
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
          Se Behandlingens livsløp (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Se Art og omfang (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item as='a' href=''>
          Se Behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkPabegyntActionMenuVariant = () => (
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
          Se Behandlingens livsløp (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Se Art og omfang (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item as='a' href=''>
          Les PVK (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Se Behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkOppdatertEtterNyVersjonActionMenuVariant = () => (
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
          Se Behandlingens livsløp (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Se Art og omfang (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item as='a' href=''>
          Vurderer PVK (read-only, ny versjon)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Se Behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkIkkeVurdertActionMenuVariant: FunctionComponent<TProps> = ({
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
          Vurder behov for PVK
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkUnderArbeidActionMenuVariant: FunctionComponent<TProps> = ({
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
          Fullfør PVK
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
        >
          Les om behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkSendtTilPvoEllerRisikoeierActionMenuVariant: FunctionComponent<TProps> = ({
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
          Se Behandlingens livsløp (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
            etterlevelseDokumentasjon.id,
            behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'
          )}
        >
          Se Art og omfang (read-only)
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
          Les PVK (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
        >
          Les om behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkHarFattTilbakemeldingFraPvoActionMenuVariant: FunctionComponent<TProps> = ({
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
          Se Art og omfang (read-only)
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
          Les PVOs tilbakemelding
        </ActionMenu.Item>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
        >
          Les om behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
